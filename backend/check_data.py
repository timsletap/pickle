import sqlite3

conn = sqlite3.connect("pickle.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM drills LIMIT 2")
drills = cursor.fetchall()

print("Sample drill data:")
for drill in drills:
    print(f"  ID: {drill[0]}")
    print(f"  Title: {drill[1]}")
    print(f"  Description: {drill[2]}")
    print(f"  Skill Focus: {drill[3]}")
    print(f"  Video URL: {drill[4]}")
    print(f"  Created At: {drill[5]}")
    print(f"  Created By: {drill[6]}")
    print()

conn.close()
