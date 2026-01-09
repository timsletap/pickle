from fastapi import APIRouter, HTTPException
import sqlite3
from datetime import datetime
import os
import httpx
from typing import Optional

router = APIRouter()
DB_NAME = "pickle.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)  
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/equipment")
def list_equipment():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM equipment ORDER BY created_at DESC")
        equipment = cursor.fetchall()
        conn.close()

        return [dict(e) for e in equipment]
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/equipment")
def create_equipment(
    name: str,
    description: str,
    link: str,
    price: float,
    where_to_buy: str,
    image_url: Optional[str] = None,
    rating: Optional[float] = None
):
    # Input validation
    if not name or len(name.strip()) == 0:
        raise HTTPException(status_code=400, detail="Equipment name is required")

    if len(name) > 255:
        raise HTTPException(status_code=400, detail="Equipment name too long (max 255 characters)")

    if len(description) > 1000:
        raise HTTPException(status_code=400, detail="Description too long (max 1000 characters)")

    if price < 0:
        raise HTTPException(status_code=400, detail="Price must be non-negative")

    if rating is not None and (rating < 0 or rating > 5):
        raise HTTPException(status_code=400, detail="Rating must be between 0 and 5")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO equipment (name, description, link, price, where_to_buy, image_url, rating, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (name.strip(), description, link, price, where_to_buy, image_url, rating, datetime.now().isoformat())
        )
        conn.commit()
        equipment_id = cursor.lastrowid
        conn.close()

        return {"message": "Equipment added", "id": equipment_id}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/equipment/search/web")
async def search_equipment_web(query: str):
    """Search the web for baseball equipment using Google Custom Search API"""
    if not query or len(query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Search query is required")

    if len(query) > 200:
        raise HTTPException(status_code=400, detail="Search query too long (max 200 characters)")

    api_key = os.getenv("GOOGLE_API_KEY")
    search_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")

    if not api_key or not search_engine_id:
        raise HTTPException(
            status_code=500,
            detail="Google Custom Search API not configured. Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables."
        )

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                "https://www.googleapis.com/customsearch/v1",
                params={
                    "key": api_key,
                    "cx": search_engine_id,
                    "q": f"{query.strip()} baseball equipment",
                    "num": 10
                }
            )

            if response.status_code == 403:
                raise HTTPException(status_code=403, detail="Google Search API quota exceeded or invalid API key")
            elif response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Google Search API error")

            data = response.json()

            if not data.get("items"):
                return []

            return [
                {
                    "title": item.get("title", "Untitled")[:255],
                    "description": item.get("snippet", "")[:1000],
                    "link": item.get("link", ""),
                    "display_link": item.get("displayLink", "")[:255],
                    "image_url": item.get("pagemap", {}).get("cse_image", [{}])[0].get("src") if item.get("pagemap") else None
                }
                for item in data.get("items", [])
            ]
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Search request timed out")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to Google Search API: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/equipment/{equipment_id}/favorite")
def favorite_equipment(equipment_id: int, user_id: int):
    """Add equipment to user's favorites"""
    if equipment_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid equipment ID")

    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if equipment exists
        cursor.execute("SELECT id FROM equipment WHERE id = ?", (equipment_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Equipment not found")

        try:
            cursor.execute(
                "INSERT INTO equipment_favorites (user_id, equipment_id, created_at) VALUES (?, ?, ?)",
                (user_id, equipment_id, datetime.now().isoformat())
            )
            conn.commit()
            conn.close()
            return {"message": "Equipment favorited"}
        except sqlite3.IntegrityError:
            conn.close()
            raise HTTPException(status_code=400, detail="Equipment already favorited")
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/equipment/{equipment_id}/favorite")
def unfavorite_equipment(equipment_id: int, user_id: int):
    """Remove equipment from user's favorites"""
    if equipment_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid equipment ID")

    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM equipment_favorites WHERE user_id = ? AND equipment_id = ?",
            (user_id, equipment_id)
        )
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()

        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="Favorite not found")

        return {"message": "Equipment removed from favorites"}
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/equipment/favorites")
def get_favorite_equipment(user_id: int):
    """Get all equipment favorited by a user"""
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """SELECT e.* FROM equipment e
               JOIN equipment_favorites ef ON e.id = ef.equipment_id
               WHERE ef.user_id = ?
               ORDER BY ef.created_at DESC""",
            (user_id,)
        )
        equipment = cursor.fetchall()
        conn.close()

        return [dict(e) for e in equipment]
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")