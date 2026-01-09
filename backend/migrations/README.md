# Migrations & Setup Files

This folder contains database migration scripts and setup documentation for the Pickle baseball app.

## Files

### Database Initialization
- **`init_db.py`** - Initial database schema creation script
  - Run this first to create all tables
  - Creates: users, teams, players, lineups, drills, equipment, practice plans, etc.

### Migration Scripts
Run these in order if you're updating an existing database:

1. **`migrate_add_video_url.py`** - Adds `video_url` column to drills table
   - Allows drills to link to YouTube training videos

2. **`migrate_equipment_updates.py`** - Adds equipment features
   - Adds `image_url` and `rating` columns to equipment table
   - Creates `equipment_favorites` table for users to save favorite deals

### Documentation
- **`API_KEYS_SETUP_GUIDE.md`** - Instructions for setting up API keys
  - YouTube Data API v3 setup
  - Google Custom Search API setup
  - Environment variable configuration

## Usage

### First Time Setup
```bash
# 1. Create the database
python migrations/init_db.py

# 2. Set up your API keys (follow the guide)
# Edit backend/.env with your keys

# 3. Start the server
uvicorn app.main:app --reload
```

### Updating Existing Database
```bash
# Run migration scripts in order
python migrations/migrate_add_video_url.py
python migrations/migrate_equipment_updates.py
```

## Notes
- Migration scripts are idempotent - safe to run multiple times
- Always backup your database before running migrations
- API keys are optional but required for YouTube search and equipment web search features
