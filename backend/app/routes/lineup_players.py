import sqlite3
from fastapi import APIRouter
from app.db import DB_NAME

router = APIRouter()

@router.post("/")
def add_player_to_lineup(lineup_id: int, player_id: int, batting_order: int = None, field_position: str = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO lineup_players (lineup_id, player_id, batting_order, field_position)
        VALUES (?, ?, ?, ?)
        """,
        (lineup_id, player_id, batting_order, field_position)
    )

    conn.commit()
    lp_id = cursor.lastrowid
    conn.close()

    return {
        "id": lp_id,
        "lineup_id": lineup_id,
        "player_id": player_id,
        "batting_order": batting_order,
        "field_position": field_position
    }

@router.get("/{lineup_id}")
def get_lineup_players(lineup_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT lp.id, p.first_name, p.last_name, p.jersey_number, lp.field_position, lp.batting_order
        FROM lineup_players lp
        JOIN players p ON lp.player_id = p.id
        WHERE lp.lineup_id = ?
        ORDER BY lp.batting_order
        """,
        (lineup_id,)
    )

    result = [
        {
            "lineup_player_id": row[0],
            "first_name": row[1],
            "last_name": row[2],
            "jersey_number": row[3],
            "field_position": row[4],
            "batting_order": row[5]
        } for row in cursor.fetchall()
    ]

    conn.close()
    return result
