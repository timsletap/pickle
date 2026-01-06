from fastapi import APIRouter
import sqlite3

router = APIRouter()
DB_NAME = "pickle.db"

@router.post("/")
def create_player(team_id: int, first_name: str, last_name: str, jersey_number: int = None, position: str = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO players (team_id, first_name, last_name, jersey_number, position) VALUES (?, ?, ?, ?, ?)",
        (team_id, first_name, last_name, jersey_number, position)
    )
    conn.commit()
    player_id = cursor.lastrowid
    conn.close()
    return {"id": player_id, "team_id": team_id, "first_name": first_name, "last_name": last_name, "jersey_number": jersey_number, "position": position}

@router.get("/")
def list_players(team_id: int = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    if team_id:
        cursor.execute("SELECT id, team_id, first_name, last_name, jersey_number, position FROM players WHERE team_id = ?", (team_id,))
    else:
        cursor.execute("SELECT id, team_id, first_name, last_name, jersey_number, position FROM players")
    players = [
        {"id": row[0], "team_id": row[1], "first_name": row[2], "last_name": row[3], "jersey_number": row[4], "position": row[5]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return players
