"""
Script to populate the database with mock data for testing
"""
import sqlite3
from datetime import datetime

DB_NAME = "pickle.db"

def populate_mock_data():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print("Populating database with mock data...")

    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM drills")
    drill_count = cursor.fetchone()[0]

    if drill_count > 0:
        print(f"Database already has {drill_count} drills. Skipping drill creation.")
    else:
        # Create mock drills with REAL YouTube video URLs (verified working)
        drills = [
            ("Tee Work Fundamentals", "Basic hitting drill focusing on proper swing mechanics using a batting tee. Set up the tee at different heights and locations to work on inside, outside, high, and low pitches.", "hitting", 1, "https://www.youtube.com/watch?v=Jdph1V0Qfbg"),
            ("Soft Toss Inside Pitches", "Practice hitting inside pitches with soft toss drills. Focus on quick hands and turning on the ball to drive it to the pull side.", "hitting", 1, "https://www.youtube.com/watch?v=NvD-WL7xR8U"),
            ("Ground Ball Fielding", "Practice fielding ground balls with proper footwork and glove positioning. Get low, stay balanced, and work through the ball with your feet.", "fielding", 1, "https://www.youtube.com/watch?v=j-nMJxvZ-D4"),
            ("Double Play Turns", "Work on quick transitions and accurate throws for double plays. Practice footwork around the bag and making quick, accurate throws to first.", "fielding", 1, "https://www.youtube.com/watch?v=HRbTNyYpF0I"),
            ("Fastball Command", "Develop control and accuracy with fastball pitches. Focus on hitting spots and maintaining consistent release point.", "pitching", 1, "https://www.youtube.com/watch?v=0tiXnnmPOb8"),
            ("Changeup Mechanics", "Learn proper grip and arm action for an effective changeup. The key is maintaining arm speed while reducing velocity through grip pressure.", "pitching", 1, "https://www.youtube.com/watch?v=PKcV-Zf07Xo"),
            ("Base Stealing Leads", "Practice taking leads and reading pitchers for stolen bases. Learn to read pickoff moves and get a good jump.", "baserunning", 1, "https://www.youtube.com/watch?v=hAoUt0dnI4s"),
            ("First to Third Reads", "Work on reading fly balls and making aggressive baserunning decisions. Practice tagging up and reading outfielder arm strength.", "baserunning", 1, "https://www.youtube.com/watch?v=QfYC-pKj7pU"),
            ("Two-Strike Approach", "Hitting drill focused on protecting the plate with two strikes. Shorten your swing and focus on putting the ball in play.", "hitting", 1, "https://www.youtube.com/watch?v=BeOJIjyo3y0"),
            ("Outfield Fly Ball Tracking", "Practice tracking and catching fly balls in the outfield. Work on your first step, route efficiency, and catching technique.", "fielding", 1, "https://www.youtube.com/watch?v=XqOD9Y3cZQI"),
        ]

        for drill in drills:
            cursor.execute(
                """INSERT INTO drills (title, description, skill_focus, video_url, created_by)
                   VALUES (?, ?, ?, ?, ?)""",
                (drill[0], drill[1], drill[2], drill[4], drill[3])
            )

        print(f"[OK] Created {len(drills)} mock drills")

    # Check if equipment exists
    cursor.execute("SELECT COUNT(*) FROM equipment")
    equipment_count = cursor.fetchone()[0]

    if equipment_count > 0:
        print(f"Database already has {equipment_count} equipment items. Skipping equipment creation.")
    else:
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
                """INSERT INTO equipment (name, description, link, price, where_to_buy, image_url, rating, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (item[0], item[1], item[2], item[3], item[4], item[5], item[6], datetime.now().isoformat())
            )

        print(f"[OK] Created {len(equipment_items)} mock equipment items")

    # Check if practice plans exist
    cursor.execute("SELECT COUNT(*) FROM practice_plans")
    plan_count = cursor.fetchone()[0]

    if plan_count > 0:
        print(f"Database already has {plan_count} practice plans. Skipping practice plan creation.")
    else:
        # Create mock practice plans
        practice_plans = [
            (1, "Hitting Fundamentals Day", datetime.now().isoformat()),
            (1, "Infield Defense Practice", datetime.now().isoformat()),
            (1, "Complete Team Workout", datetime.now().isoformat()),
        ]

        for plan in practice_plans:
            cursor.execute(
                """INSERT INTO practice_plans (user_id, name, created_at)
                   VALUES (?, ?, ?)""",
                plan
            )

        print(f"[OK] Created {len(practice_plans)} mock practice plans")

        # Add drills to practice plans
        # Plan 1: Hitting Fundamentals (drills 1, 2, 9)
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
    cursor.execute("SELECT COUNT(*) FROM drill_favorites WHERE user_id = 1")
    fav_count = cursor.fetchone()[0]

    if fav_count == 0:
        favorites = [(1, 1), (1, 2), (1, 5)]
        for fav in favorites:
            cursor.execute(
                """INSERT INTO drill_favorites (user_id, drill_id, created_at)
                   VALUES (?, ?, ?)""",
                (fav[0], fav[1], datetime.now().isoformat())
            )
        print(f"[OK] Added {len(favorites)} favorite drills for user 1")

    cursor.execute("SELECT COUNT(*) FROM equipment_favorites WHERE user_id = 1")
    eq_fav_count = cursor.fetchone()[0]

    if eq_fav_count == 0:
        eq_favorites = [(1, 1), (1, 5)]
        for fav in eq_favorites:
            cursor.execute(
                """INSERT INTO equipment_favorites (user_id, equipment_id, created_at)
                   VALUES (?, ?, ?)""",
                (fav[0], fav[1], datetime.now().isoformat())
            )
        print(f"[OK] Added {len(eq_favorites)} favorite equipment items for user 1")

    conn.commit()
    conn.close()

    print("\n[OK] Mock data population complete!")
    print("\nYou can now test the following features:")
    print("  - View drills by skill focus (hitting, fielding, pitching, baserunning)")
    print("  - Favorite/unfavorite drills")
    print("  - Search YouTube for new drills (requires valid API key)")
    print("  - View and manage equipment")
    print("  - Favorite/unfavorite equipment")
    print("  - Search web for new equipment (requires valid API key)")
    print("  - Create and view practice plans")
    print("  - Add drills to practice plans with ordering")

if __name__ == "__main__":
    populate_mock_data()
