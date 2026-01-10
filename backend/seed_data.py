import sqlite3
from datetime import datetime

DB_NAME = "pickle.db"

def seed_database():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Read and execute schema
    with open('app/schema.sql', 'r') as f:
        schema = f.read()
        cursor.executescript(schema)

    # Clear existing data
    try:
        cursor.execute("DELETE FROM drill_favorites")
        cursor.execute("DELETE FROM practice_plan_drills")
        cursor.execute("DELETE FROM practice_plan_favorites")
        cursor.execute("DELETE FROM drills")
        cursor.execute("DELETE FROM practice_plans")
        cursor.execute("DELETE FROM equipment_favorites")
        cursor.execute("DELETE FROM equipment")
        cursor.execute("DELETE FROM users WHERE id = 1")
    except sqlite3.OperationalError:
        pass  # Tables don't exist yet

    # Insert a test user
    cursor.execute("""
        INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, created_at)
        VALUES (1, 'test@example.com', 'hash', 'Test', 'User', 'coach', ?)
    """, (datetime.now().isoformat(),))

    # Insert mock drills with real baseball YouTube videos
    drills = [
        ("Tee Work Fundamentals", "Practice hitting off a tee focusing on proper swing mechanics", "hitting", "https://youtube.com/watch?v=8XlXmCk8RGo"),
        ("Ground Ball Drills", "Fielding practice for infield ground balls", "fielding", "https://youtube.com/watch?v=ep8L0JbXCH4"),
        ("Pitching Mechanics", "Learn proper pitching form and delivery", "pitching", "https://youtube.com/watch?v=7Z_O8OWt29g"),
        ("Base Running Techniques", "Speed and agility drills for base running", "baserunning", "https://youtube.com/watch?v=ZXQMf3_6E8o"),
        ("Fly Ball Practice", "Outfield drills for catching fly balls", "fielding", "https://youtube.com/watch?v=gP0y38hHRBE"),
        ("Batting Practice", "Live batting practice with various pitches", "hitting", "https://youtube.com/watch?v=mGK2HHaDQZE"),
        ("Double Play Drill", "Infield coordination for turning double plays", "fielding", "https://youtube.com/watch?v=Tq5cZQxZXGE"),
        ("Changeup Technique", "Master the changeup pitch", "pitching", "https://youtube.com/watch?v=E8wfv8q0AjU"),
    ]

    for title, desc, skill, video in drills:
        cursor.execute("""
            INSERT INTO drills (title, description, skill_focus, video_url, created_by, created_at)
            VALUES (?, ?, ?, ?, 1, ?)
        """, (title, desc, skill, video, datetime.now().isoformat()))

    # Insert mock practice plans
    plans = [
        "Spring Training Week 1",
        "Pre-Game Warm-up Routine",
        "Advanced Hitting Session",
        "Defensive Fundamentals"
    ]

    for plan_name in plans:
        cursor.execute("""
            INSERT INTO practice_plans (user_id, name, created_at)
            VALUES (1, ?, ?)
        """, (plan_name, datetime.now().isoformat()))

    # Insert mock equipment
    equipment = [
        ("Louisville Slugger Bat", "High-quality aluminum bat for youth baseball", "https://example.com/bat", 89.99, "Amazon", "https://example.com/bat.jpg", 4.5),
        ("Wilson A2000 Glove", "Professional-grade baseball glove", "https://example.com/glove", 299.99, "Dick's Sporting Goods", "https://example.com/glove.jpg", 4.8),
        ("Rawlings Baseball Helmet", "Protective batting helmet", "https://example.com/helmet", 45.00, "Academy Sports", "https://example.com/helmet.jpg", 4.3),
        ("Under Armour Batting Gloves", "Premium batting gloves with excellent grip", "https://example.com/gloves", 39.99, "Under Armour Store", "https://example.com/gloves.jpg", 4.6),
        ("Baseball Training Net", "Portable pitching and hitting net", "https://example.com/net", 79.99, "Amazon", "https://example.com/net.jpg", 4.4),
    ]

    for name, desc, link, price, where, img, rating in equipment:
        cursor.execute("""
            INSERT INTO equipment (name, description, link, price, where_to_buy, image_url, rating, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, desc, link, price, where, img, rating, datetime.now().isoformat()))

    conn.commit()
    conn.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
