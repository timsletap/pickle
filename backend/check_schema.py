import sqlite3

conn = sqlite3.connect("pickle.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(drills)")
columns = cursor.fetchall()

print("Drills table schema:")
for col in columns:
    print(f"  {col[0]}: {col[1]} ({col[2]})")

conn.close()
