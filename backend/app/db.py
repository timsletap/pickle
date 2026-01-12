import sqlite3

DB_NAME = "pickle.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# Global connection for routes that use it
db = sqlite3.connect(DB_NAME, check_same_thread=False)
db.row_factory = sqlite3.Row
