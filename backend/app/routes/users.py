from fastapi import APIRouter
import sqlite3
from app.db import DB_NAME

router = APIRouter()

@router.post("/")
def create_user(email: str, password_hash: str, first_name: str = None, last_name: str = None, role: str = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
        (email, password_hash, first_name, last_name, role)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return {"id": user_id, "email": email, "first_name": first_name, "last_name": last_name, "role": role}

@router.get("/")
def list_users():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, first_name, last_name, role, created_at FROM users")
    users = [
        {"id": row[0], "email": row[1], "first_name": row[2], "last_name": row[3], "role": row[4], "created_at": row[5]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return users
