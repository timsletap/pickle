"""
Backend startup script - Initializes database and starts the FastAPI server
Run this script to start the backend with all required setup
"""
import sqlite3
import os
import sys
import subprocess

# Get the backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BACKEND_DIR, "pickle.db")
SCHEMA_PATH = os.path.join(BACKEND_DIR, "app", "schema.sql")

def init_database():
    """Initialize the database with schema if it doesn't exist or is empty"""
    print("[1/3] Checking database...")

    db_exists = os.path.exists(DB_PATH)

    if not db_exists:
        print("      Creating new database...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='drills'")
    tables_exist = cursor.fetchone() is not None

    if not tables_exist:
        print("      Initializing schema...")
        with open(SCHEMA_PATH, 'r') as f:
            schema = f.read()
        conn.executescript(schema)
        conn.commit()
        print("      Schema created successfully!")
    else:
        print("      Database schema already exists.")

    conn.close()
    return not tables_exist  # Returns True if we just created the schema

def populate_mock_data():
    """Populate mock data if database is empty"""
    print("[2/3] Checking for data...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if drills exist
    cursor.execute("SELECT COUNT(*) FROM drills")
    drill_count = cursor.fetchone()[0]

    conn.close()

    if drill_count == 0:
        print("      Populating mock data...")
        # Import and run the populate script
        sys.path.insert(0, BACKEND_DIR)
        from populate_mockdata import populate_mock_data as populate
        populate()
        print("      Mock data populated!")
    else:
        print(f"      Database has {drill_count} drills. Skipping mock data.")

def start_server():
    """Start the FastAPI server"""
    print("[3/3] Starting FastAPI server...")
    print("=" * 50)
    print("Backend running at: http://localhost:8000")
    print("API docs available at: http://localhost:8000/docs")
    print("=" * 50)
    print("")

    # Change to backend directory and start uvicorn
    os.chdir(BACKEND_DIR)

    # Use subprocess to run uvicorn with proper settings
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ])

def main():
    print("")
    print("=" * 50)
    print("  PICKLE BACKEND STARTUP")
    print("=" * 50)
    print("")

    try:
        # Step 1: Initialize database
        is_new_db = init_database()

        # Step 2: Populate mock data if needed
        populate_mock_data()

        # Step 3: Start the server
        start_server()

    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
