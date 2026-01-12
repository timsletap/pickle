from datetime import datetime
from app.db import db
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
import sqlite3
import os
from typing import Optional
import httpx

router = APIRouter()
DB_NAME = "pickle.db"

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

        drills = db.execute(query, params).fetchall()

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


@router.post("/{drill_id}/favorite")
def favorite_drill(drill_id: int, request: FavoriteRequest):
    """Add a drill to user's favorites"""
    if drill_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid drill ID")

    if request.user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        # Check if drill exists
        drill = db.execute("SELECT id FROM drills WHERE id = ?", (drill_id,)).fetchone()
        if not drill:
            raise HTTPException(status_code=404, detail="Drill not found")

        try:
            db.execute(
                """INSERT INTO drill_favorites (user_id, drill_id, created_at)
                   VALUES (?, ?, ?)""",
                (request.user_id, drill_id, datetime.now().isoformat())
            )
            db.commit()
            return {"message": "Drill favorited"}
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Drill already favorited")
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{drill_id}/favorite")
def unfavorite_drill(drill_id: int, user_id: int):
    """Remove a drill from user's favorites"""
    db.execute(
        """DELETE FROM drill_favorites
           WHERE user_id = ? AND drill_id = ?""",
        (user_id, drill_id)
    )
    db.commit()
    return {"message": "Drill removed from favorites"}


@router.post("/create-from-youtube")
async def create_drill_from_youtube(
    video_id: str,
    title: str,
    description: str,
    skill_focus: str,
    user_id: int,
):
    """Create a new drill from a YouTube video"""
    # Input validation
    if not video_id or len(video_id.strip()) == 0:
        raise HTTPException(status_code=400, detail="Video ID is required")

    if not title or len(title.strip()) == 0:
        raise HTTPException(status_code=400, detail="Title is required")

    if len(title) > 255:
        raise HTTPException(status_code=400, detail="Title too long (max 255 characters)")

    if len(description) > 1000:
        raise HTTPException(status_code=400, detail="Description too long (max 1000 characters)")

    valid_skills = ["hitting", "fielding", "pitching", "baserunning"]
    if skill_focus not in valid_skills:
        raise HTTPException(status_code=400, detail=f"Invalid skill focus. Must be one of: {', '.join(valid_skills)}")

    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        db.execute(
            """INSERT INTO drills (title, description, skill_focus, created_by, created_at, video_url)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (title.strip(), description, skill_focus, user_id, datetime.now().isoformat(), f"https://youtube.com/watch?v={video_id.strip()}")
        )
        db.commit()

        new_drill = db.execute("SELECT last_insert_rowid()").fetchone()

        return {"id": new_drill[0], "message": "Drill created successfully from YouTube video"}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# GET /api/drills/{drill_id} - must come last to avoid conflicts
@router.get("/{drill_id}")
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
        "video_url": drill[4] if len(drill) > 4 else None,
        "created_at": drill[5] if len(drill) > 5 else None,
        "created_by": drill[6] if len(drill) > 6 else None
    }
