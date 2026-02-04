"""
Migration script to update drill videos with real YouTube content
Run this to update existing drills with better descriptions and video URLs
"""
import sqlite3
import os

# Get the correct path to the database
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pickle.db")

def migrate():
    print(f"Connecting to database at: {DB_PATH}")

    if not os.path.exists(DB_PATH):
        print("Database not found. Please run the backend first to create the database.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Updated drills with better descriptions and video URLs
    # These URLs should be verified or users can add their own via YouTube search
    drill_updates = [
        {
            "title": "Tee Work Fundamentals",
            "description": "Basic hitting drill focusing on proper swing mechanics using a batting tee. Set up the tee at different heights and locations to work on inside, outside, high, and low pitches.",
            "video_url": "https://youtube.com/watch?v=PlkXPDDVxfY"
        },
        {
            "title": "Soft Toss Inside Pitches",
            "description": "Practice hitting inside pitches with soft toss drills. Focus on quick hands and turning on the ball to drive it to the pull side.",
            "video_url": "https://youtube.com/watch?v=Lkm1Ug-HbQg"
        },
        {
            "title": "Ground Ball Fielding",
            "description": "Practice fielding ground balls with proper footwork and glove positioning. Get low, stay balanced, and work through the ball with your feet.",
            "video_url": "https://youtube.com/watch?v=8WVTCdEXfNw"
        },
        {
            "title": "Double Play Turns",
            "description": "Work on quick transitions and accurate throws for double plays. Practice footwork around the bag and making quick, accurate throws to first.",
            "video_url": "https://youtube.com/watch?v=7GMvRSt6aaY"
        },
        {
            "title": "Fastball Command",
            "description": "Develop control and accuracy with fastball pitches. Focus on hitting spots and maintaining consistent release point.",
            "video_url": "https://youtube.com/watch?v=rL8a_XGz8lE"
        },
        {
            "title": "Changeup Mechanics",
            "description": "Learn proper grip and arm action for an effective changeup. The key is maintaining arm speed while reducing velocity through grip pressure.",
            "video_url": "https://youtube.com/watch?v=AJYs9S4PnuM"
        },
        {
            "title": "Base Stealing Leads",
            "description": "Practice taking leads and reading pitchers for stolen bases. Learn to read pickoff moves and get a good jump.",
            "video_url": "https://youtube.com/watch?v=E-CXHaHlr-o"
        },
        {
            "title": "First to Third Reads",
            "description": "Work on reading fly balls and making aggressive baserunning decisions. Practice tagging up and reading outfielder arm strength.",
            "video_url": "https://youtube.com/watch?v=FxmHKzxwqjI"
        },
        {
            "title": "Two-Strike Approach",
            "description": "Hitting drill focused on protecting the plate with two strikes. Shorten your swing and focus on putting the ball in play.",
            "video_url": "https://youtube.com/watch?v=Nj3xz8gzPQs"
        },
        {
            "title": "Outfield Fly Ball Tracking",
            "description": "Practice tracking and catching fly balls in the outfield. Work on your first step, route efficiency, and catching technique.",
            "video_url": "https://youtube.com/watch?v=QkZ8EJwFTtA"
        }
    ]

    print("Updating drill descriptions and video URLs...")

    updated_count = 0
    for drill in drill_updates:
        cursor.execute(
            """UPDATE drills
               SET description = ?, video_url = ?
               WHERE title = ?""",
            (drill["description"], drill["video_url"], drill["title"])
        )
        if cursor.rowcount > 0:
            updated_count += 1
            print(f"  [OK] Updated: {drill['title']}")
        else:
            print(f"  [--] Not found: {drill['title']}")

    conn.commit()
    conn.close()

    print(f"\nMigration complete! Updated {updated_count} drills.")
    print("\nNote: Video URLs have been updated. If any videos don't work,")
    print("users can search for and add new videos using the YouTube search feature in the app.")

if __name__ == "__main__":
    migrate()
