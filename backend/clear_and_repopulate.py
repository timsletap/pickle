"""
Script to clear and repopulate the database with correct mock data
"""
import sqlite3
from datetime import datetime

DB_NAME = "pickle.db"

def clear_and_repopulate():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print("Clearing existing data...")

    # Clear all tables
    cursor.execute("DELETE FROM practice_plan_drills")
    cursor.execute("DELETE FROM drill_favorites")
    cursor.execute("DELETE FROM equipment_favorites")
    cursor.execute("DELETE FROM drills")
    cursor.execute("DELETE FROM equipment")
    cursor.execute("DELETE FROM practice_plans")

    conn.commit()
    print("[OK] Cleared all data")

    print("Populating database with mock data...")

    # Create mock drills with CORRECT column order: title, description, skill_focus, video_url, created_by
    # Using real baseball drill videos from YouTube
    drills = [
        ("Tee Work Fundamentals", "Basic hitting drill focusing on proper swing mechanics using a batting tee", "hitting", "https://www.youtube.com/watch?v=HKqGyY_F_zk", 1),
        ("Soft Toss Inside Pitches", "Practice hitting inside pitches with soft toss drills", "hitting", "https://www.youtube.com/watch?v=qcNe3pN9s6k", 1),
        ("Ground Ball Fielding", "Practice fielding ground balls with proper footwork and glove positioning", "fielding", "https://www.youtube.com/watch?v=RQqXm2VNEhQ", 1),
        ("Double Play Turns", "Work on quick transitions and accurate throws for double plays", "fielding", "https://www.youtube.com/watch?v=x4lPwNLRb5s", 1),
        ("Fastball Command", "Develop control and accuracy with fastball pitches", "pitching", "https://www.youtube.com/watch?v=3mEu_uW4hAI", 1),
        ("Changeup Mechanics", "Learn proper grip and arm action for an effective changeup", "pitching", "https://www.youtube.com/watch?v=qOXEu7PH93g", 1),
        ("Base Stealing Leads", "Practice taking leads and reading pitchers for stolen bases", "baserunning", "https://www.youtube.com/watch?v=bVGfRjWgK9E", 1),
        ("First to Third Reads", "Work on reading fly balls and making aggressive baserunning decisions", "baserunning", "https://www.youtube.com/watch?v=l_4xZp6W9H8", 1),
        ("Two-Strike Approach", "Hitting drill focused on protecting the plate with two strikes", "hitting", "https://www.youtube.com/watch?v=KQWPIl9_-Yw", 1),
        ("Outfield Fly Ball Tracking", "Practice tracking and catching fly balls in the outfield", "fielding", "https://www.youtube.com/watch?v=4nW7jN4AEYY", 1),
    ]

    for drill in drills:
        cursor.execute(
            """INSERT INTO drills (title, description, skill_focus, video_url, created_by)
               VALUES (?, ?, ?, ?, ?)""",
            drill
        )

    print(f"[OK] Created {len(drills)} mock drills")

    # Create mock equipment
    equipment_items = [
        ("Rawlings Pro Preferred Glove", "Premium leather baseball glove for infielders", "https://rawlings.com/glove", 299.99, "Rawlings.com", "https://example.com/glove.jpg", 4.8),
        ("Louisville Slugger Select Bat", "High-performance aluminum baseball bat, 31 inch", "https://slugger.com/bat", 149.99, "Louisville Slugger", None, 4.5),
        ("Diamond Bucket of Baseballs", "Bucket containing 30 practice baseballs", "https://diamond.com/balls", 59.99, "Diamond Sports", None, 4.2),
        ("Easton Batting Helmet", "Protective batting helmet with dual ear flaps", "https://easton.com/helmet", 39.99, "Easton", None, 4.6),
        ("Wilson A2000 Catcher's Mitt", "Professional grade catcher's mitt with deep pocket", "https://wilson.com/mitt", 349.99, "Wilson Sporting Goods", "https://example.com/mitt.jpg", 4.9),
        ("Mizuno 9-Spike Cleats", "Metal cleats for superior traction on the diamond", "https://mizuno.com/cleats", 89.99, "Mizuno", None, 4.4),
        ("Franklin Batting Gloves", "Pair of professional batting gloves with grip palm", "https://franklin.com/gloves", 29.99, "Franklin Sports", None, 4.3),
        ("SKLZ Hit-A-Way", "Portable batting training system for solo practice", "https://sklz.com/hitaway", 79.99, "SKLZ", None, 4.1),
    ]

    for item in equipment_items:
        cursor.execute(
            """INSERT INTO equipment (name, description, link, price, where_to_buy, image_url, rating)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            item
        )

    print(f"[OK] Created {len(equipment_items)} mock equipment items")

    # Create mock practice plans
    practice_plans = [
        (1, "Hitting Fundamentals Day"),
        (1, "Infield Defense Practice"),
        (1, "Complete Team Workout"),
    ]

    for plan in practice_plans:
        cursor.execute(
            """INSERT INTO practice_plans (user_id, name)
               VALUES (?, ?)""",
            plan
        )

    print(f"[OK] Created {len(practice_plans)} mock practice plans")

    # Add drills to practice plans
    plan_drills = [
        (1, 1, 1),  # Tee Work
        (1, 2, 2),  # Soft Toss
        (1, 9, 3),  # Two-Strike Approach
        (2, 3, 1),  # Ground Ball Fielding
        (2, 4, 2),  # Double Play Turns
        (2, 10, 3), # Outfield Fly Balls
        (3, 1, 1),  # Complete workout - hitting
        (3, 3, 2),  # fielding
        (3, 5, 3),  # pitching
        (3, 7, 4),  # baserunning
    ]

    for drill in plan_drills:
        cursor.execute(
            """INSERT INTO practice_plan_drills (practice_plan_id, drill_id, order_number)
               VALUES (?, ?, ?)""",
            drill
        )

    print(f"[OK] Added drills to practice plans")

    # Add some favorites for user 1
    favorites = [(1, 1), (1, 2), (1, 5)]
    for fav in favorites:
        cursor.execute(
            """INSERT INTO drill_favorites (user_id, drill_id)
               VALUES (?, ?)""",
            fav
        )
    print(f"[OK] Added {len(favorites)} favorite drills for user 1")

    eq_favorites = [(1, 1), (1, 5)]
    for fav in eq_favorites:
        cursor.execute(
            """INSERT INTO equipment_favorites (user_id, equipment_id)
               VALUES (?, ?)""",
            fav
        )
    print(f"[OK] Added {len(eq_favorites)} favorite equipment items for user 1")

    conn.commit()
    conn.close()

    print("\n[OK] Database repopulated successfully!")

if __name__ == "__main__":
    clear_and_repopulate()
