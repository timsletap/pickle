from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, teams, players, lineups, lineup_players, drills, practice_plans, equipment
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Pickle API")

# Enable CORS - required for frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users")
app.include_router(teams.router, prefix="/api/teams")
app.include_router(players.router, prefix="/api/players")
app.include_router(lineups.router, prefix="/api/lineups")
app.include_router(lineup_players.router, prefix="/api/lineup_players")
app.include_router(drills.router, prefix="/api/drills")
app.include_router(practice_plans.router, prefix="/api/practice-plans")
app.include_router(equipment.router, prefix="/api/equipment")