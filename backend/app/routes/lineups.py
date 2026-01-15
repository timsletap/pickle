from fastapi import APIRouter
import sqlite3
from app.db import DB_NAME

router = APIRouter()

@router.post("/")
def create_lineup(team_id: int, game_date: str, is_optimal: int = 0):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO lineups (team_id, game_date, is_optimal) VALUES (?, ?, ?)",
        (team_id, game_date, is_optimal)
    )
    conn.commit()
    lineup_id = cursor.lastrowid
    conn.close()
    return {"id": lineup_id, "team_id": team_id, "game_date": game_date, "is_optimal": is_optimal}

@router.get("/")
def list_lineups(team_id: int = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    if team_id:
        cursor.execute("SELECT id, team_id, game_date, is_optimal, created_at FROM lineups WHERE team_id = ?", (team_id,))
    else:
        cursor.execute("SELECT id, team_id, game_date, is_optimal, created_at FROM lineups")
    lineups = [
        {"id": row[0], "team_id": row[1], "game_date": row[2], "is_optimal": row[3], "created_at": row[4]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return lineups
