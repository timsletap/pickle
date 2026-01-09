import datetime
from app.db import db
from fastapi import APIRouter,  HTTPException
import sqlite3
from app.db import get_db


router = APIRouter()
DB_NAME = "pickle.db"


@router.post("/practice-plans")
def create_practice_plan(
    user_id: int,
    name: str,
):
    """Create a new practice plan"""
    db.execute(
        """INSERT INTO practice_plans (user_id, name, created_at)
           VALUES (?, ?, ?)""",
        (user_id, name, datetime.now().isoformat())
    )
    db.commit()
    
    new_plan = db.execute("SELECT last_insert_rowid()").fetchone()
    return {"id": new_plan[0], "message": "Practice plan created"}

@router.post("/practice-plans/{plan_id}/drills/{drill_id}")
def add_drill_to_plan(
    plan_id: int,
    drill_id: int,
    order_number: int, 
):
    """Add a drill to a practice plan"""
    db.execute(
        """INSERT INTO practice_plan_drills (practice_plan_id, drill_id, order_number)
           VALUES (?, ?, ?)""",
        (plan_id, drill_id, order_number)
    )
    db.commit()
    return {"message": "Drill added to practice plan"}


@router.get("/practice-plans/user/{user_id}")
def get_user_practice_plans(user_id: int):
    """Get all practice plans for a specific user"""
    plans = db.execute(
        "SELECT * FROM practice_plans WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()

    return [
        {
            "id": plan[0],
            "user_id": plan[1],
            "name": plan[2],
            "created_at": plan[3]
        }
        for plan in plans
    ]


@router.get("/practice-plans/{plan_id}")
def get_practice_plan(plan_id: int):
    """Get a practice plan with all its drills"""
    plan = db.execute(
        "SELECT * FROM practice_plans WHERE id = ?",
        (plan_id,)
    ).fetchone()

    if not plan:
        raise HTTPException(status_code=404, detail="Practice plan not found")

    drills = db.execute(
        """SELECT d.* FROM drills d
           JOIN practice_plan_drills ppd ON d.id = ppd.drill_id
           WHERE ppd.practice_plan_id = ?
           ORDER BY ppd.order_number""",
        (plan_id,)
    ).fetchall()

    return {
        "id": plan[0],
        "user_id": plan[1],
        "name": plan[2],
        "created_at": plan[3],
        "drills": [
            {
                "id": d[0],
                "title": d[1],
                "description": d[2],
                "skill_focus": d[3]
            }
            for d in drills
        ]
    }