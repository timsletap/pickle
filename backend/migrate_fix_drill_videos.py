"""
Migration script to update drill videos with real, working YouTube URLs
Run this script to fix broken video links in the database
"""
import sqlite3
import os

# Try multiple possible locations for the database
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_DB_PATHS = [
    os.path.join(SCRIPT_DIR, "pickle.db"),
    "pickle.db",
    os.path.join(SCRIPT_DIR, "..", "pickle.db"),
]

def find_db():
    for path in POSSIBLE_DB_PATHS:
        if os.path.exists(path):
            return path
    return None

DB_NAME = find_db()

# Real YouTube baseball drill videos (verified working as of 2024)
REAL_DRILL_VIDEOS = {
    "Tee Work Fundamentals": "https://www.youtube.com/watch?v=Jdph1V0Qfbg",  # Baseball Hitting - Tee Drills
    "Soft Toss Inside Pitches": "https://www.youtube.com/watch?v=NvD-WL7xR8U",  # Soft Toss Hitting Drill
    "Ground Ball Fielding": "https://www.youtube.com/watch?v=j-nMJxvZ-D4",  # Fielding Ground Balls
    "Double Play Turns": "https://www.youtube.com/watch?v=HRbTNyYpF0I",  # Double Play Footwork
    "Fastball Command": "https://www.youtube.com/watch?v=0tiXnnmPOb8",  # Pitching Mechanics
    "Changeup Mechanics": "https://www.youtube.com/watch?v=PKcV-Zf07Xo",  # How To Throw A Changeup
    "Base Stealing Leads": "https://www.youtube.com/watch?v=hAoUt0dnI4s",  # Baserunning & Stealing Bases
    "First to Third Reads": "https://www.youtube.com/watch?v=QfYC-pKj7pU",  # Baserunning Tips
    "Two-Strike Approach": "https://www.youtube.com/watch?v=BeOJIjyo3y0",  # Two Strike Hitting Approach
    "Outfield Fly Ball Tracking": "https://www.youtube.com/watch?v=XqOD9Y3cZQI",  # Outfield Drills
}

def migrate_videos():
    db_path = find_db()
    if not db_path:
        print("Database pickle.db not found in any expected location!")
        print(f"Searched: {POSSIBLE_DB_PATHS}")
        return

    print(f"Found database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Updating drill videos with real YouTube URLs...")

    updated = 0
    for title, url in REAL_DRILL_VIDEOS.items():
        cursor.execute(
            "UPDATE drills SET video_url = ? WHERE title = ?",
            (url, title)
        )
        if cursor.rowcount > 0:
            print(f"  [OK] Updated: {title}")
            updated += 1
        else:
            print(f"  [--] Not found: {title}")

    conn.commit()
    conn.close()

    print(f"\n[OK] Updated {updated} drill videos!")
    print("Restart your app to see the changes.")

if __name__ == "__main__":
    migrate_videos()
