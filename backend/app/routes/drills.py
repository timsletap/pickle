from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
import sqlite3
import os
from typing import Optional
import httpx
from app.db import DB_NAME

router = APIRouter()

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

class FavoriteRequest(BaseModel):
    user_id: int

@router.post("/add")
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

# GET /api/drills/favorites - must come before /{drill_id}
@router.get("/favorites")
def get_favorite_drills(user_id: int = Query(...)):
    """Get all drills favorited by a user"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT d.* FROM drills d
           JOIN drill_favorites df ON d.id = df.drill_id
           WHERE df.user_id = ?""",
        (user_id,)
    )
    drills = cursor.fetchall()
    conn.close()

    return [
        {
            "id": d[0],
            "title": d[1],
            "description": d[2],
            "skill_focus": d[3],
            "video_url": d[4] if len(d) > 4 else None,
            "created_at": d[5] if len(d) > 5 else None,
            "created_by": d[6] if len(d) > 6 else None
        }
        for d in drills
    ]


# GET /api/drills/search/youtube - must come before /{drill_id}
@router.get("/search/youtube")
async def search_youtube_drills(query: str, max_results: int = 10):
    """Search YouTube for baseball drills"""
    if not query or len(query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Search query is required")

    if len(query) > 200:
        raise HTTPException(status_code=400, detail="Search query too long (max 200 characters)")

    if max_results < 1 or max_results > 50:
        raise HTTPException(status_code=400, detail="max_results must be between 1 and 50")

    api_key = os.getenv("YOUTUBE_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="YouTube API key not configured. Please set YOUTUBE_API_KEY environment variable."
        )

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": f"{query.strip()} baseball drill",
                    "type": "video",
                    "maxResults": max_results,
                    "key": api_key
                }
            )

            if response.status_code == 403:
                raise HTTPException(status_code=403, detail="YouTube API quota exceeded or invalid API key")
            elif response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="YouTube API error")

            data = response.json()

            if not data.get("items"):
                return []

            return [
                {
                    "video_id": item["id"]["videoId"],
                    "title": item["snippet"]["title"][:255],
                    "description": item["snippet"]["description"][:1000],
                    "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                    "channel_title": item["snippet"]["channelTitle"][:255]
                }
                for item in data.get("items", [])
                if "videoId" in item.get("id", {})
            ]
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="YouTube search request timed out")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to YouTube API: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# GET /api/drills (no param)
@router.get("")
def list_drills(
    skill_focus: str = None,  # Optional filter by skill
):
    """Get all drills, optionally filtered by skill focus"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = "SELECT * FROM drills WHERE 1=1"
        params = []

        if skill_focus:
            # Validate skill_focus
            valid_skills = ["hitting", "fielding", "pitching", "baserunning"]
            if skill_focus.lower() not in valid_skills:
                raise HTTPException(status_code=400, detail=f"Invalid skill focus. Must be one of: {', '.join(valid_skills)}")
            query += " AND skill_focus = ?"
            params.append(skill_focus.lower())

        query += " ORDER BY created_at DESC"

        cursor.execute(query, params)
        drills = cursor.fetchall()
        conn.close()

        return [
            {
                "id": d[0],
                "title": d[1],
                "description": d[2],
                "skill_focus": d[3],
                "video_url": d[4] if len(d) > 4 else None,
                "created_at": d[5] if len(d) > 5 else None,
                "created_by": d[6] if len(d) > 6 else None
            }
            for d in drills
        ]
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/create")
def create_drill(
    title: str,
    description: str,
    skill_focus: str,
    user_id: int,
):
    """Create a new drill"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """INSERT INTO drills (title, description, skill_focus, created_by, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (title, description, skill_focus, user_id, datetime.now().isoformat())
    )
    conn.commit()
    drill_id = cursor.lastrowid
    conn.close()

    return {"id": drill_id, "message": "Drill created successfully"}


@router.post("/{drill_id}/favorite")
def favorite_drill(drill_id: int, request: FavoriteRequest):
    """Add a drill to user's favorites"""
    if drill_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid drill ID")

    if request.user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if drill exists
        cursor.execute("SELECT id FROM drills WHERE id = ?", (drill_id,))
        drill = cursor.fetchone()
        if not drill:
            conn.close()
            raise HTTPException(status_code=404, detail="Drill not found")

        try:
            cursor.execute(
                """INSERT INTO drill_favorites (user_id, drill_id, created_at)
                   VALUES (?, ?, ?)""",
                (request.user_id, drill_id, datetime.now().isoformat())
            )
            conn.commit()
            conn.close()
            return {"message": "Drill favorited"}
        except sqlite3.IntegrityError:
            # Already favorited - return success anyway (idempotent operation)
            conn.close()
            return {"message": "Drill favorited"}
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{drill_id}/favorite")
def unfavorite_drill(drill_id: int, user_id: int):
    """Remove a drill from user's favorites"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """DELETE FROM drill_favorites
           WHERE user_id = ? AND drill_id = ?""",
        (user_id, drill_id)
    )
    conn.commit()
    conn.close()
    return {"message": "Drill removed from favorites"}


@router.delete("/{drill_id}")
def delete_drill(drill_id: int):
    """Delete a drill permanently"""
    if drill_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid drill ID")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if drill exists
        cursor.execute("SELECT id FROM drills WHERE id = ?", (drill_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Drill not found")

        # Delete from practice plan drills first
        cursor.execute("DELETE FROM practice_plan_drills WHERE drill_id = ?", (drill_id,))

        # Delete any favorites for this drill
        cursor.execute("DELETE FROM drill_favorites WHERE drill_id = ?", (drill_id,))

        # Delete the drill
        cursor.execute("DELETE FROM drills WHERE id = ?", (drill_id,))
        conn.commit()
        conn.close()

        return {"message": "Drill deleted successfully"}
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


class CreateDrillRequest(BaseModel):
    video_id: str
    title: str
    description: str
    skill_focus: str
    user_id: int

@router.post("/create-from-youtube")
async def create_drill_from_youtube(drill: CreateDrillRequest):
    """Create a new drill from a YouTube video"""
    # Input validation
    if not drill.video_id or len(drill.video_id.strip()) == 0:
        raise HTTPException(status_code=400, detail="Video ID is required")

    if not drill.title or len(drill.title.strip()) == 0:
        raise HTTPException(status_code=400, detail="Title is required")

    if len(drill.title) > 255:
        raise HTTPException(status_code=400, detail="Title too long (max 255 characters)")

    if len(drill.description) > 1000:
        raise HTTPException(status_code=400, detail="Description too long (max 1000 characters)")

    valid_skills = ["hitting", "fielding", "pitching", "baserunning"]
    if drill.skill_focus not in valid_skills:
        raise HTTPException(status_code=400, detail=f"Invalid skill focus. Must be one of: {', '.join(valid_skills)}")

    if drill.user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """INSERT INTO drills (title, description, skill_focus, created_by, created_at, video_url)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (drill.title.strip(), drill.description, drill.skill_focus, drill.user_id, datetime.now().isoformat(), f"https://youtube.com/watch?v={drill.video_id.strip()}")
        )
        conn.commit()
        drill_id = cursor.lastrowid
        conn.close()

        return {"id": drill_id, "message": "Drill created successfully from YouTube video"}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


class TestRequest(BaseModel):
    test_field: str

@router.post("/test-endpoint")
def test_endpoint(data: TestRequest):
    return {"received": data.test_field}


# GET /api/drills/{drill_id} - must come last to avoid conflicts
@router.get("/{drill_id}")
def get_drill(drill_id: int):
    """Get a single drill by its ID"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM drills WHERE id = ?",
        (drill_id,)
    )
    drill = cursor.fetchone()
    conn.close()

    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")

    return {
        "id": drill[0],
        "title": drill[1],
        "description": drill[2],
        "skill_focus": drill[3],
        "video_url": drill[4] if len(drill) > 4 else None,
        "created_at": drill[5] if len(drill) > 5 else None,
        "created_by": drill[6] if len(drill) > 6 else None
    }
