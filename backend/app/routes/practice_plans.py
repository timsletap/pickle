import datetime
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
import sqlite3


router = APIRouter()
DB_NAME = "pickle.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

class AddDrillRequest(BaseModel):
    order_number: int

class FavoriteRequest(BaseModel):
    user_id: int


@router.post("")
def create_practice_plan(
    user_id: int,
    name: str,
):
    """Create a new practice plan"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """INSERT INTO practice_plans (user_id, name, created_at)
           VALUES (?, ?, ?)""",
        (user_id, name, datetime.datetime.now().isoformat())
    )
    conn.commit()
    plan_id = cursor.lastrowid
    conn.close()

    return {"id": plan_id, "message": "Practice plan created"}

@router.post("/{plan_id}/drills/{drill_id}")
def add_drill_to_plan(
    plan_id: int,
    drill_id: int,
    request: AddDrillRequest
):
    """Add a drill to a practice plan"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """INSERT INTO practice_plan_drills (practice_plan_id, drill_id, order_number)
           VALUES (?, ?, ?)""",
        (plan_id, drill_id, request.order_number)
    )
    conn.commit()
    conn.close()
    return {"message": "Drill added to practice plan"}


@router.get("/user/{user_id}")
def get_user_practice_plans(user_id: int):
    """Get all practice plans for a specific user"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM practice_plans WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    )
    plans = cursor.fetchall()
    conn.close()

    return [
        {
            "id": plan[0],
            "user_id": plan[1],
            "name": plan[2],
            "created_at": plan[3]
        }
        for plan in plans
    ]


@router.get("/favorites")
def get_favorite_practice_plans(user_id: int = Query(...)):
    """Get all practice plans favorited by a user"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT p.* FROM practice_plans p
           JOIN practice_plan_favorites pf ON p.id = pf.practice_plan_id
           WHERE pf.user_id = ?
           ORDER BY p.created_at DESC""",
        (user_id,)
    )
    plans = cursor.fetchall()
    conn.close()

    return [
        {
            "id": p[0],
            "user_id": p[1],
            "name": p[2],
            "created_at": p[3]
        }
        for p in plans
    ]


@router.get("/{plan_id}")
def get_practice_plan(plan_id: int):
    """Get a practice plan with all its drills"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM practice_plans WHERE id = ?",
        (plan_id,)
    )
    plan = cursor.fetchone()

    if not plan:
        conn.close()
        raise HTTPException(status_code=404, detail="Practice plan not found")

    cursor.execute(
        """SELECT d.* FROM drills d
           JOIN practice_plan_drills ppd ON d.id = ppd.drill_id
           WHERE ppd.practice_plan_id = ?
           ORDER BY ppd.order_number""",
        (plan_id,)
    )
    drills = cursor.fetchall()
    conn.close()

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


@router.post("/{plan_id}/favorite")
def favorite_practice_plan(plan_id: int, request: FavoriteRequest):
    """Add a practice plan to user's favorites"""
    if plan_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid practice plan ID")

    if request.user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if plan exists
        cursor.execute("SELECT id FROM practice_plans WHERE id = ?", (plan_id,))
        plan = cursor.fetchone()
        if not plan:
            conn.close()
            raise HTTPException(status_code=404, detail="Practice plan not found")

        try:
            cursor.execute(
                """INSERT INTO practice_plan_favorites (user_id, practice_plan_id, created_at)
                   VALUES (?, ?, ?)""",
                (request.user_id, plan_id, datetime.datetime.now().isoformat())
            )
            conn.commit()
            conn.close()
            return {"message": "Practice plan favorited"}
        except sqlite3.IntegrityError:
            conn.close()
            raise HTTPException(status_code=400, detail="Practice plan already favorited")
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{plan_id}/favorite")
def unfavorite_practice_plan(plan_id: int, user_id: int):
    """Remove a practice plan from user's favorites"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """DELETE FROM practice_plan_favorites
           WHERE user_id = ? AND practice_plan_id = ?""",
        (user_id, plan_id)
    )
    conn.commit()
    conn.close()
    return {"message": "Practice plan removed from favorites"}
