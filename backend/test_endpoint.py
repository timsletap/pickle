from app.db import db

# Test query
drills = db.execute("SELECT * FROM drills LIMIT 1").fetchall()

for d in drills:
    result = {
        "id": d[0],
        "title": d[1],
        "description": d[2],
        "skill_focus": d[3],
        "video_url": d[4] if len(d) > 4 else None,
        "created_at": d[5] if len(d) > 5 else None,
        "created_by": d[6] if len(d) > 6 else None
    }
    print("Result:", result)
