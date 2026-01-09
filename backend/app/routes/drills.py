from datetime import datetime
from app.db import db
from fastapi import APIRouter, HTTPException
import sqlite3

router = APIRouter()
DB_NAME = "pickle.db"

@router.post("/drills/add")
def add_drill(name: str, description: str = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO drills (title, description)
        VALUES (?, ?)
        """,
        (name, description)
    )

    conn.commit()
    drill_id = cursor.lastrowid
    conn.close()

    return {
        "id": drill_id,
        "name": name,
        "description": description
    }

@router.get("/drills/{drill_id}")
def get_drill(drill_id: int):
    """Get a single drill by its ID"""
    drill = db.execute(
        "SELECT * FROM drills WHERE id = ?", 
        (drill_id,)
    ).fetchone()
    
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")
    
    return {
        "id": drill[0],
        "title": drill[1],
        "description": drill[2],
        "skill_focus": drill[3],
        "created_by": drill[4],
        "created_at": drill[5]
    }
@router.get("/drills")
def list_drills(
    skill_focus: str = None,  # Optional filter by skill
):
    """Get all drills, optionally filtered by skill focus"""
    query = "SELECT * FROM drills WHERE 1=1"
    params = []
    
    if skill_focus:
        query += " AND skill_focus = ?"
        params.append(skill_focus)
    
    drills = db.execute(query, params).fetchall()
    
    return [
        {
            "id": d[0],
            "title": d[1],
            "description": d[2],
            "skill_focus": d[3],
            "created_by": d[4],
            "created_at": d[5]
        }
        for d in drills
    ]


@router.post("/drills/create")
def create_drill(
    title: str,
    description: str,
    skill_focus: str,
    user_id: int,
):
    """Create a new drill"""
    db.execute(
        """INSERT INTO drills (title, description, skill_focus, created_by, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (title, description, skill_focus, user_id, datetime.now().isoformat())
    )
    db.commit()
    
    
    new_drill = db.execute(
        "SELECT last_insert_rowid()"
    ).fetchone()
    
    return {"id": new_drill[0], "message": "Drill created successfully"}


@router.post("/drills/{drill_id}/favorite")
def favorite_drill(drill_id: int, user_id: int):
    """Add a drill to user's favorites"""
    db.execute(
        """INSERT INTO drill_favorites (user_id, drill_id, created_at)
           VALUES (?, ?, ?)""",
        (user_id, drill_id, datetime.now().isoformat())
    )
    db.commit()
    return {"message": "Drill favorited"}


@router.delete("/drills/{drill_id}/favorite")
def unfavorite_drill(drill_id: int, user_id: int):
    """Remove a drill from user's favorites"""
    db.execute(
        """DELETE FROM drill_favorites 
           WHERE user_id = ? AND drill_id = ?""",
        (user_id, drill_id)
    )
    db.commit()
    return {"message": "Drill removed from favorites"}


@router.get("/drills/favorites")
def get_favorite_drills(user_id: int):
    """Get all drills favorited by a user"""
    drills = db.execute(
        """SELECT d.* FROM drills d
           JOIN drill_favorites df ON d.id = df.drill_id
           WHERE df.user_id = ?""",
        (user_id,)
    ).fetchall()
    
    return [
        {
            "id": d[0],
            "title": d[1],
            "description": d[2],
            "skill_focus": d[3],
            "created_by": d[4],
            "created_at": d[5]
        }
        for d in drills
    ]
