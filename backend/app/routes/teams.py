from fastapi import APIRouter
import sqlite3

router = APIRouter()
DB_NAME = "pickle.db"

@router.post("/")
def create_team(name: str, sport: str = None, age_group: str = None, coach_id: int = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO teams (name, sport, age_group, coach_id) VALUES (?, ?, ?, ?)",
        (name, sport, age_group, coach_id)
    )
    conn.commit()
    team_id = cursor.lastrowid
    conn.close()
    return {"id": team_id, "name": name, "sport": sport, "age_group": age_group, "coach_id": coach_id}

@router.get("/")
def list_teams():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, sport, age_group, coach_id FROM teams")
    teams = [
        {"id": row[0], "name": row[1], "sport": row[2], "age_group": row[3], "coach_id": row[4]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return teams
