CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sport TEXT,
    age_group TEXT,
    coach_id INTEGER,
    FOREIGN KEY (coach_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    first_name TEXT,
    last_name TEXT,
    jersey_number INTEGER,
    position TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS lineups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    game_date TEXT,
    is_optimal INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS lineup_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lineup_id INTEGER,
    player_id INTEGER,
    batting_order INTEGER,
    field_position TEXT,
    FOREIGN KEY (lineup_id) REFERENCES lineups(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);
