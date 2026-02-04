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

        cursor.execute("SELECT id, name as title, link, created_at FROM equipment ORDER BY created_at DESC")
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
            "INSERT INTO equipment (name, link, created_at) VALUES (?, ?, ?)",
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
    """Search reputable sports equipment sites for baseball gear using Google Custom Search"""
    if not query or len(query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Search query is required")

    if len(query) > 200:
        raise HTTPException(status_code=400, detail="Search query too long (max 200 characters)")

    search_term = query.strip()
    results = []

    # Google Custom Search API configuration
    api_key = os.getenv("GOOGLE_API_KEY")
    search_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")

    # Whitelist of reputable sports equipment sites
    trusted_sites = [
        "dickssportinggoods.com",
        "academy.com",
        "baseballexpress.com",
        "justbats.com",
        "baseballmonkey.com",
        "amazon.com",
        "walmart.com",
        "target.com",
        "baseballsavings.com",
        "eastbay.com",
        "slugger.com",
        "rawlings.com",
        "wilson.com",
        "easton.com",
        "marucci.com",
        "demarini.com",
        "sportsunlimited.com",
        "scheels.com",
        "hibbett.com",
        "bigfivestore.com"
    ]

    if api_key and search_engine_id:
        # Use Google Custom Search API for better results
        try:
            # Build site restriction query to search only trusted sites
            site_query = " OR ".join([f"site:{site}" for site in trusted_sites])
            full_query = f"{search_term} baseball ({site_query})"

            async with httpx.AsyncClient(timeout=15.0) as client:
                # Make two API calls to get up to 20 results
                for start_index in [1, 11]:
                    try:
                        response = await client.get(
                            "https://www.googleapis.com/customsearch/v1",
                            params={
                                "key": api_key,
                                "cx": search_engine_id,
                                "q": full_query,
                                "num": 10,
                                "start": start_index
                            }
                        )

                        if response.status_code == 200:
                            data = response.json()
                            items = data.get("items", [])

                            for item in items:
                                # Extract domain from link
                                link = item.get("link", "")
                                display_link = item.get("displayLink", "")

                                # Verify the result is from a trusted site
                                is_trusted = any(trusted in display_link.lower() for trusted in trusted_sites)
                                if not is_trusted:
                                    continue

                                results.append({
                                    "title": item.get("title", ""),
                                    "description": item.get("snippet", ""),
                                    "link": link,
                                    "display_link": display_link,
                                    "image_url": item.get("pagemap", {}).get("cse_image", [{}])[0].get("src") if item.get("pagemap") else None
                                })
                        elif response.status_code == 429:
                            # Rate limited, break out of pagination loop
                            break
                    except Exception:
                        continue

                # If Google API returned results, return them
                if results:
                    return results

        except Exception:
            # Fall through to fallback method if Google API fails
            pass

    # Fallback: Generate direct links to trusted retailer search pages
    fallback_sites = [
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
            "name": "Amazon Baseball",
            "url": f"https://www.amazon.com/s?k={search_term.replace(' ', '+')}+baseball",
            "domain": "amazon.com"
        },
        {
            "name": "Walmart Sports",
            "url": f"https://www.walmart.com/search?q={search_term.replace(' ', '+')}+baseball",
            "domain": "walmart.com"
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
        },
        {
            "name": "Rawlings Official",
            "url": f"https://www.rawlings.com/search?q={search_term.replace(' ', '+')}",
            "domain": "rawlings.com"
        },
        {
            "name": "Wilson Sporting Goods",
            "url": f"https://www.wilson.com/en-us/search?q={search_term.replace(' ', '+')}",
            "domain": "wilson.com"
        },
        {
            "name": "Easton Baseball",
            "url": f"https://www.easton.com/search?q={search_term.replace(' ', '+')}",
            "domain": "easton.com"
        },
        {
            "name": "Marucci Sports",
            "url": f"https://www.marucci.com/search?q={search_term.replace(' ', '+')}",
            "domain": "marucci.com"
        },
        {
            "name": "Louisville Slugger",
            "url": f"https://www.slugger.com/en-us/search?q={search_term.replace(' ', '+')}",
            "domain": "slugger.com"
        }
    ]

    # Return all fallback sites directly without checking availability
    # This ensures users always get results to click through
    for site in fallback_sites:
        results.append({
            "title": f"{search_term} at {site['name']}",
            "description": f"Search results for {search_term} on {site['name']} - Click to view deals and pricing",
            "link": site["url"],
            "display_link": site["domain"],
            "image_url": None
        })

    return results


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


@router.delete("/{equipment_id}")
def delete_equipment(equipment_id: int):
    """Delete an equipment item permanently"""
    if equipment_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid equipment ID")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if equipment exists
        cursor.execute("SELECT id FROM equipment WHERE id = ?", (equipment_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Equipment not found")

        # Delete any favorites for this equipment first
        cursor.execute("DELETE FROM equipment_favorites WHERE equipment_id = ?", (equipment_id,))

        # Delete the equipment
        cursor.execute("DELETE FROM equipment WHERE id = ?", (equipment_id,))
        conn.commit()
        conn.close()

        return {"message": "Equipment deleted successfully"}
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")