import sqlite3

# Add new columns to equipment table and create equipment_favorites table
conn = sqlite3.connect("pickle.db")
cursor = conn.cursor()

try:
    # Check if image_url column exists
    cursor.execute("PRAGMA table_info(equipment)")
    columns = [column[1] for column in cursor.fetchall()]

    if "image_url" not in columns:
        print("Adding image_url column to equipment table...")
        cursor.execute("ALTER TABLE equipment ADD COLUMN image_url TEXT")

    if "rating" not in columns:
        print("Adding rating column to equipment table...")
        cursor.execute("ALTER TABLE equipment ADD COLUMN rating REAL")

    # Create equipment_favorites table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS equipment_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            equipment_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (equipment_id) REFERENCES equipment(id),
            UNIQUE(user_id, equipment_id)
        )
    """)
    print("Created equipment_favorites table...")

    conn.commit()
    print("Migration completed successfully!")

except Exception as e:
    print(f"Error during migration: {e}")
    conn.rollback()
finally:
    conn.close()
