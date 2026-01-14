from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
import sqlite3
from datetime import datetime
import os
import httpx
from typing import Optional
from app.db import DB_NAME

router = APIRouter()

class FavoriteRequest(BaseModel):
    user_id: int

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)  
    conn.row_factory = sqlite3.Row
    return conn

@router.get("")
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

class CreateEquipmentRequest(BaseModel):
    title: str
    link: str

@router.post("")
def create_equipment(equipment: CreateEquipmentRequest):
    # Input validation
    if not equipment.title or len(equipment.title.strip()) == 0:
        raise HTTPException(status_code=400, detail="Equipment title is required")

    if len(equipment.title) > 500:
        raise HTTPException(status_code=400, detail="Equipment title too long (max 500 characters)")

    if not equipment.link or len(equipment.link.strip()) == 0:
        raise HTTPException(status_code=400, detail="Equipment link is required")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO equipment (title, link, created_at) VALUES (?, ?, ?)",
            (equipment.title.strip(), equipment.link.strip(), datetime.now().isoformat())
        )
        conn.commit()
        equipment_id = cursor.lastrowid
        conn.close()

        return {"message": "Equipment added", "id": equipment_id}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/search/web")
async def search_equipment_web(query: str):
    """Search reputable sports equipment sites for baseball deals"""
    if not query or len(query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Search query is required")

    if len(query) > 200:
        raise HTTPException(status_code=400, detail="Search query too long (max 200 characters)")

    search_term = query.strip()
    results = []

    # List of reputable sports equipment retailers
    sites = [
        {
            "name": "Dick's Sporting Goods",
            "url": f"https://www.dickssportinggoods.com/search/SearchDisplay?searchTerm={search_term.replace(' ', '+')}+baseball",
            "domain": "dickssportinggoods.com"
        },
        {
            "name": "Academy Sports + Outdoors",
            "url": f"https://www.academy.com/shop/browse?searchTerm={search_term.replace(' ', '+')}+baseball",
            "domain": "academy.com"
        },
        {
            "name": "Baseball Express",
            "url": f"https://www.baseballexpress.com/catalogsearch/result/?q={search_term.replace(' ', '+')}",
            "domain": "baseballexpress.com"
        },
        {
            "name": "JustBats.com",
            "url": f"https://www.justbats.com/search?keywords={search_term.replace(' ', '+')}",
            "domain": "justbats.com"
        },
        {
            "name": "Baseball Monkey",
            "url": f"https://www.baseballmonkey.com/catalogsearch/result/?q={search_term.replace(' ', '+')}",
            "domain": "baseballmonkey.com"
        }
    ]

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            for site in sites:
                try:
                    # Add user agent to avoid blocking
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    }
                    response = await client.get(site["url"], headers=headers)

                    if response.status_code == 200:
                        results.append({
                            "title": f"{search_term} at {site['name']}",
                            "description": f"Search results for {search_term} on {site['name']} - Click to view deals and pricing",
                            "link": site["url"],
                            "display_link": site["domain"],
                            "image_url": None
                        })
                except Exception:
                    # Skip sites that fail, don't block the whole search
                    continue

        return results
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Search request timed out")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error searching equipment sites: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/favorites")
def get_favorite_equipment(user_id: int = Query(...)):
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


@router.post("/{equipment_id}/favorite")
def favorite_equipment(equipment_id: int, request: FavoriteRequest):
    """Add equipment to user's favorites"""
    if equipment_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid equipment ID")

    if request.user_id <= 0:
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
                (request.user_id, equipment_id, datetime.now().isoformat())
            )
            conn.commit()
            conn.close()
            return {"message": "Equipment favorited"}
        except sqlite3.IntegrityError:
            # Already favorited - return success anyway (idempotent operation)
            conn.close()
            return {"message": "Equipment favorited"}
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{equipment_id}/favorite")
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