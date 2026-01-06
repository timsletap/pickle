from fastapi import FastAPI
from app.routes import users, teams, players, lineups, lineup_players

app = FastAPI(title="Pickle API")

app.include_router(users.router, prefix="/users")
app.include_router(teams.router, prefix="/teams")
app.include_router(players.router, prefix="/players")
app.include_router(lineups.router, prefix="/lineups")
app.include_router(lineup_players.router, prefix="/lineup_players")
