export { BattleRoom } from './battleRoom.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Provide CORS headers for local dev and specific domains
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/lobby') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426, headers: corsHeaders });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();

      // We use KV to track online users (simple approach for serverless)
      // Since standard websockets in a worker limit us, for a simple lobby we'll poll or use a specialized DO for the lobby.
      // Better approach for real-time Lobby: Use a "Lobby" Durable Object so we can broadcast!
      // But for simplicity, we can route /lobby to a fixed DO instance.
      const lobbyId = env.BATTLE_ROOM.idFromName("global-lobby");
      const lobbyObj = env.BATTLE_ROOM.get(lobbyId);
      return lobbyObj.fetch(request);
    }

    if (url.pathname.startsWith('/room/')) {
      const roomId = url.pathname.split('/')[2];
      const id = env.BATTLE_ROOM.idFromName(roomId);
      const roomObj = env.BATTLE_ROOM.get(id);
      return roomObj.fetch(request);
    }

    return new Response("ESL-Bee PvP Backend Running", { status: 200, headers: corsHeaders });
  }
};
