-- 玩家 PvP 檔案
CREATE TABLE IF NOT EXISTS pvp_users (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    elo INTEGER DEFAULT 1200,          -- Elo 評分
    total_battles INTEGER DEFAULT 0,   -- 總戰鬥場數
    wins INTEGER DEFAULT 0,            -- 勝場
    losses INTEGER DEFAULT 0,          -- 敗場
    favorite_pokemon_id TEXT,          -- 最常使用的寶可夢
    last_played DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 單局詳細對戰紀錄
CREATE TABLE IF NOT EXISTS battle_records (
    match_id TEXT PRIMARY KEY,
    winner_id TEXT,
    loser_id TEXT,
    rounds_played INTEGER,
    p1_vocab_db_id TEXT,               -- 玩家 1 所選詞庫
    p2_vocab_db_id TEXT,               -- 玩家 2 所選詞庫
    p1_damage_dealt INTEGER,
    p2_damage_dealt INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
