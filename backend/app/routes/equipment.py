from fastapi import APIRouter
import sqlite3
from datetime import datetime

router = APIRouter()
DB_NAME = "pickle.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)  
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/equipment")
def list_equipment():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM equipment")
    equipment = cursor.fetchall()
    conn.close()
    
    return [dict(e) for e in equipment]

@router.post("/equipment")
def create_equipment(name: str, description: str, link: str, price: float, where_to_buy: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO equipment (name, description, link, price, where_to_buy, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (name, description, link, price, where_to_buy, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    return {"message": "Equipment added"}