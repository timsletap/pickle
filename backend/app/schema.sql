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
CREATE TABLE IF NOT EXISTS drills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    skill_focus TEXT NOT NULL,
    video_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS drill_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    drill_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (drill_id) REFERENCES drills(id),
    UNIQUE(user_id, drill_id)  
);

CREATE TABLE IF NOT EXISTS practice_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS practice_plan_drills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    practice_plan_id INTEGER NOT NULL,
    drill_id INTEGER NOT NULL,
    order_number INTEGER,  
    FOREIGN KEY (practice_plan_id) REFERENCES practice_plans(id),
    FOREIGN KEY (drill_id) REFERENCES drills(id)
);

CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    link TEXT,
    price REAL,
    where_to_buy TEXT,
    image_url TEXT,
    rating REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    equipment_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    UNIQUE(user_id, equipment_id)
);
