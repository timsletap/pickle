import sqlite3

# Add video_url column to drills table if it doesn't exist
conn = sqlite3.connect("pickle.db")
cursor = conn.cursor()

try:
    # Check if the column already exists
    cursor.execute("PRAGMA table_info(drills)")
    columns = [column[1] for column in cursor.fetchall()]

    if "video_url" not in columns:
        print("Adding video_url column to drills table...")
        cursor.execute("ALTER TABLE drills ADD COLUMN video_url TEXT")
        conn.commit()
        print("Migration completed successfully!")
    else:
        print("video_url column already exists in drills table.")

except Exception as e:
    print(f"Error during migration: {e}")
    conn.rollback()
finally:
    conn.close()
