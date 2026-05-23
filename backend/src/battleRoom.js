export class BattleRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    
    // We will use state.id to distinguish if this is the "global-lobby" or a real "battle-room"
    this.isLobby = false; 

    // For battle room
    this.gameState = {
      players: {}, 
      round: 0,
      isGameOver: false,
      currentTurn: null,
      currentWords: {},
      roundEndTime: 0
    };

    // For lobby
    this.onlinePlayers = {}; 
  }

  async fetch(request) {
    // A trick to identify if this DO is the lobby. We check if the request URL pathname ends in /lobby.
    // If we routed from index.js for /lobby, we can pass a header or query param. 
    // Let's just check the URL.
    const url = new URL(request.url);
    if (url.pathname === '/lobby') {
        this.isLobby = true;
    }

    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    await this.handleSession(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async handleSession(ws) {
    ws.accept();
    this.sessions.push(ws);

    ws.addEventListener("message", async (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (this.isLobby) {
            await this.handleLobbyMessage(ws, data);
        } else {
            await this.handleBattleMessage(ws, data);
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: "ERROR", payload: err.message }));
      }
    });

    ws.addEventListener("close", () => {
      this.sessions = this.sessions.filter(s => s !== ws);
      if (this.isLobby) {
          // Find the player connected with this ws
          let disconnectedId = null;
          for (const [id, p] of Object.entries(this.onlinePlayers)) {
              if (p.ws === ws) {
                  disconnectedId = id;
                  delete this.onlinePlayers[id];
                  break;
              }
          }
          if (disconnectedId) {
              this.broadcastLobbyUpdate();
          }
      } else {
          // Battle room disconnect
          let disconnectedId = null;
          for (const [id, p] of Object.entries(this.gameState.players)) {
              if (p.ws === ws) {
                  disconnectedId = id;
                  p.connected = false;
                  break;
              }
          }
          if (disconnectedId && !this.gameState.isGameOver) {
              this.broadcast({
                  type: "OPPONENT_DISCONNECTED",
                  payload: { playerId: disconnectedId, timeout: 30 }
              });
              
              // 30-second forfeit timer
              setTimeout(() => {
                  if (this.gameState && !this.gameState.isGameOver) {
                      const p = this.gameState.players[disconnectedId];
                      if (p && !p.connected) {
                          // Player failed to reconnect, they forfeit
                          p.hpMain = 0;
                          p.hpSupport = 0;
                          p.active = 'support';
                          
                          // Find opponent
                          const oppId = Object.keys(this.gameState.players).find(id => id !== disconnectedId);
                          
                          this.gameState.isGameOver = true;
                          this.broadcast({
                              type: "ROUND_RESULT",
                              payload: {
                                  gameOver: true,
                                  winner: oppId
                              }
                          });
                      }
                  }
              }, 30000);
          }
      }
    });
  }

  // --- LOBBY LOGIC ---

  async handleLobbyMessage(ws, message) {
      const { type, payload } = message;

      switch(type) {
          case "LOBBY_JOIN":
              this.onlinePlayers[payload.playerId] = {
                  ws: ws,
                  id: payload.playerId,
                  username: payload.username,
                  status: 'online'
              };
              this.broadcastLobbyUpdate();
              break;
          
          case "CHALLENGE_SEND":
              const targetPlayer = this.onlinePlayers[payload.targetId];
              if (targetPlayer && targetPlayer.ws) {
                  targetPlayer.ws.send(JSON.stringify({
                      type: "CHALLENGE_RECEIVE",
                      payload: { 
                          challengerId: payload.challengerId, 
                          challengerName: payload.challengerName,
                          wager: payload.wager || 0 
                      }
                  }));
              }
              break;
              
          case "CHALLENGE_RESPOND":
              const challenger = this.onlinePlayers[payload.challengerId];
              if (challenger && challenger.ws) {
                  challenger.ws.send(JSON.stringify({
                      type: "CHALLENGE_RESPOND",
                      payload: { targetId: payload.targetId, accept: payload.accept, targetName: payload.targetName }
                  }));

                  // If accepted, generate a room ID and tell both
                  if (payload.accept) {
                      const roomId = "room_" + Math.random().toString(36).substring(2, 9);
                      const roomMsg = JSON.stringify({ 
                          type: "ROOM_CREATED", 
                          payload: { roomId: roomId, wager: payload.wager || 0 } 
                      });
                      challenger.ws.send(roomMsg);
                      ws.send(roomMsg);
                  }
              }
              break;
      }
  }

  broadcastLobbyUpdate() {
      const list = Object.values(this.onlinePlayers).map(p => ({id: p.id, username: p.username, status: p.status}));
      const msgStr = JSON.stringify({ type: "LOBBY_UPDATE", payload: { players: list } });
      this.sessions.forEach(s => s.send(msgStr));
  }

  // --- BATTLE LOGIC ---

  async handleBattleMessage(ws, message) {
    const { type, payload } = message;

    switch (type) {
      case "JOIN_ROOM":
        // 檢查是否為斷線重連
        if (this.gameState.players[payload.playerId]) {
            this.gameState.players[payload.playerId].ws = ws;
            this.gameState.players[payload.playerId].connected = true;
        } else {
            // 新玩家初始化進入房間
            this.gameState.players[payload.playerId] = {
              ws: ws,
              id: payload.playerId,
              username: payload.username || 'Player',
              hpMain: 100,
              hpSupport: 100,
              active: 'main', // 'main' or 'support'
              rage: 0,
              vocabDb: payload.vocabDb,
              mainPoke: payload.mainPoke,
              subPoke: payload.subPoke,
              connected: true
            };
        }
        
        // Broadcast joined players update
        const playersInfo = Object.values(this.gameState.players).map(p => ({
            id: p.id, username: p.username, mainPoke: p.mainPoke, subPoke: p.subPoke, active: p.active, hpMain: p.hpMain, hpSupport: p.hpSupport, rage: p.rage, connected: p.connected
        }));
        this.broadcast({ type: "ROOM_UPDATE", payload: { players: playersInfo } });

        // Check if both players joined
        if (Object.keys(this.gameState.players).length === 2 && this.gameState.round === 0) {
          this.broadcast({ type: "BATTLE_START", payload: {} });
          // Give them 3 seconds before first round
          setTimeout(() => this.startRound(), 3000);
        } else if (this.gameState.round > 0) {
          // 若是在戰鬥中重連，補發當前狀態
          const R = this.gameState.round;
          let lMin = 4, lMax = 5;
          if (R >= 5 && R <= 8) { lMin = 5; lMax = 6; }
          else if (R >= 9 && R <= 12) { lMin = 6; lMax = 7; }
          else if (R >= 13 && R <= 16) { lMin = 7; lMax = 8; }
          else if (R >= 17) { lMin = 8; lMax = 15; }
          
          ws.send(JSON.stringify({
            type: "ROUND_START",
            payload: {
              round: R,
              lMin: lMin,
              lMax: lMax,
              timeLimit: Math.max(1, Math.floor((this.gameState.roundEndTime - Date.now())/1000)),
              currentTurn: this.gameState.currentTurn
            }
          }));
        }
        break;

      case "SPELL_SUBMIT":
        this.processAnswer(payload.playerId, payload.word, payload.timeTaken);
        break;
    }
  }

  startRound() {
    if (this.gameState.isGameOver) return;
    
    this.gameState.round += 1;
    if (this.gameState.round > 20) { // 增加為 20 回合因為現在是輪流的 (每人 10 次)
      // 20回合結束，結算
      this.endGameByRounds();
      return;
    }

    const R = this.gameState.round;
    let lMin = 4, lMax = 5;
    if (R >= 5 && R <= 8) { lMin = 5; lMax = 6; }
    else if (R >= 9 && R <= 12) { lMin = 6; lMax = 7; }
    else if (R >= 13 && R <= 16) { lMin = 7; lMax = 8; }
    else if (R >= 17) { lMin = 8; lMax = 15; }
    // 決定回合玩家
    const playerIds = Object.keys(this.gameState.players);
    this.gameState.currentTurn = playerIds[(R - 1) % 2];

    this.broadcast({
      type: "ROUND_START",
      payload: {
        round: R,
        lMin: lMin,
        lMax: lMax,
        timeLimit: 15,
        currentTurn: this.gameState.currentTurn
      }
    });

    this.gameState.currentWords = {}; 
    this.gameState.roundEndTime = Date.now() + 15000;

    // Timeout for the round (15s)
    setTimeout(() => {
        if (this.gameState.round === R && !this.gameState.isGameOver) {
            // 超時未作答，視為答錯
            this.evaluateRound(false, 15000);
        }
    }, 15000);
  }

  processAnswer(playerId, submittedWord, timeTaken) {
    if (this.gameState.isGameOver) return;
    if (playerId !== this.gameState.currentTurn) return;

    // 單方結算
    this.evaluateRound(!!submittedWord, timeTaken);
  }

  evaluateRound(isCorrect, timeTaken) {
    if (this.gameState.isGameOver) return;
    
    const activePlayerId = this.gameState.currentTurn;
    const playerIds = Object.keys(this.gameState.players);
    const opponentId = playerIds.find(id => id !== activePlayerId);
    
    const activePlayer = this.gameState.players[activePlayerId];
    const opponent = this.gameState.players[opponentId];

    let damage = 0;
    let newRage = activePlayer.rage;
    let isCrit = false;

    if (isCorrect) {
        newRage += 1;
        if (newRage >= 3) {
            // 爆擊傷害 15 - 25
            damage = Math.floor(15 + Math.random() * 11);
            newRage = 0;
            isCrit = true;
        } else {
            // 一般傷害 5 - 10
            damage = Math.floor(5 + Math.random() * 6);
        }
        this.applyDamage(opponent, damage);
    }

    activePlayer.rage = newRage;

    const activePlayerResult = {
        id: activePlayer.id,
        isCorrect: isCorrect,
        damageDealt: damage,
        isCrit: isCrit,
        rage: activePlayer.rage,
        activePokemonHp: activePlayer.active === 'main' ? activePlayer.hpMain : activePlayer.hpSupport,
        hpMain: activePlayer.hpMain,
        hpSupport: activePlayer.hpSupport,
        active: activePlayer.active
    };

    const opponentResult = {
        id: opponent.id,
        isCorrect: null, // 非回合玩家沒有作答紀錄
        damageDealt: 0,
        rage: opponent.rage,
        activePokemonHp: opponent.active === 'main' ? opponent.hpMain : opponent.hpSupport,
        hpMain: opponent.hpMain,
        hpSupport: opponent.hpSupport,
        active: opponent.active
    };

    const overCheck = this.checkGameOver();

    // 為了前端相容性，判斷 activePlayer 是 P1 還是 P2 (根據原本的 keys 順序)
    const p1Id = playerIds[0];
    const p2Id = playerIds[1];

    this.broadcast({
        type: "ROUND_RESULT",
        payload: {
            round: this.gameState.round,
            activePlayerId: activePlayerId,
            player1: activePlayerId === p1Id ? activePlayerResult : opponentResult,
            player2: activePlayerId === p2Id ? activePlayerResult : opponentResult,
            gameOver: overCheck.isOver,
            winner: overCheck.winner
        }
    });

    if (overCheck.isOver) {
        this.gameState.isGameOver = true;
    } else {
        setTimeout(() => this.startRound(), 3000);
    }
  }

  applyDamage(target, dmg) {
    if (target.active === 'main') {
      target.hpMain = Math.max(0, target.hpMain - dmg);
      if (target.hpMain === 0) {
        target.active = 'support'; 
      }
    } else {
      target.hpSupport = Math.max(0, target.hpSupport - dmg);
    }
  }

  checkGameOver() {
    const p1 = this.gameState.players[Object.keys(this.gameState.players)[0]];
    const p2 = this.gameState.players[Object.keys(this.gameState.players)[1]];
    
    if (p1.hpSupport <= 0 && p2.hpSupport <= 0) return { isOver: true, winner: 'draw' };
    if (p1.hpSupport <= 0) return { isOver: true, winner: p2.id };
    if (p2.hpSupport <= 0) return { isOver: true, winner: p1.id };
    
    return { isOver: false };
  }

  endGameByRounds() {
    this.gameState.isGameOver = true;
    const p1 = this.gameState.players[Object.keys(this.gameState.players)[0]];
    const p2 = this.gameState.players[Object.keys(this.gameState.players)[1]];

    const p1TotalHp = p1.hpMain + p1.hpSupport;
    const p2TotalHp = p2.hpMain + p2.hpSupport;

    let winner = 'draw';
    if (p1TotalHp > p2TotalHp) winner = p1.id;
    else if (p2TotalHp > p1TotalHp) winner = p2.id;

    this.broadcast({
        type: "ROUND_RESULT",
        payload: {
            round: this.gameState.round,
            gameOver: true,
            winner: winner,
            reason: "回合結束"
        }
    });
  }

  broadcast(msgObj) {
    const jsonStr = JSON.stringify(msgObj);
    this.sessions.forEach(s => s.send(jsonStr));
  }
}
