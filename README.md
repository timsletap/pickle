# Pickle - Baseball Team Management App

A comprehensive React Native app for managing baseball teams, lineups, drills, practice plans, and equipment.

## 🚀 Quick Start for Team Members

📖 **See [SETUP.md](SETUP.md) for detailed setup instructions**

### Setup in 5 Steps

1. **Install dependencies**
   ```bash
   npm install
   cd backend && pip install -r requirements.txt && cd ..
   ```

2. **Configure environment**
   ```bash
   copy .env.example .env
   # Edit .env with your machine's IP address (find it with: ipconfig)
   ```

3. **Start backend** (Terminal 1)
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Start app** (Terminal 2)
   ```bash
   npx expo start
   ```

5. **Test connection**
   - Look for green "API" indicator in Dugout tab
   - If red, see [SETUP.md](SETUP.md) troubleshooting

## ✨ Features

- **Lineups**: Create optimized batting orders with visual field management
- **Drills**: Browse and add baseball drills with YouTube integration
- **Practice Plans**: Organize training sessions with custom drill sequences
- **Equipment**: Search and save baseball equipment recommendations
- **Teams & Players**: Manage rosters with stats tracking

## 🛠️ Tech Stack

- Frontend: React Native + Expo
- Backend: Python FastAPI
- Database: SQLite
- Auth: Firebase

## 📡 Connection Status

The app shows a connection indicator in the Dugout tab:
- 🟢 **Green "API"** = Connected to backend
- 🔴 **Red "OFFLINE"** = Cannot reach backend
- 🟠 **Orange "CHECKING"** = Testing connection

Tap the indicator to recheck the connection.

## 🐛 Troubleshooting

### "Failed to load" or Red indicator

1. **Is backend running?**
   ```bash
   curl http://localhost:8000/api/teams/
   # Should return: []
   ```

2. **Check your .env file**
   - Must have your computer's IP (not localhost)
   - Find IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

3. **Same network?**
   - Computer and phone must be on same WiFi

4. **Firewall blocking port 8000?**
   - Windows: Allow port 8000 through firewall
   - Test from phone browser: `http://YOUR_IP:8000/api/teams/`

See [SETUP.md](SETUP.md) for complete troubleshooting guide.

## 📁 Project Structure

```
pickle/
├── app/                    # React Native screens
│   ├── (tabs)/            # Main tabs (Dugout, Lineups, etc.)
│   ├── DugoutFolder/      # Drills, Equipment, Practice Plans
│   └── Lineups/           # Lineup management
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── main.py       # API entry point
│   │   ├── db.py         # Database config
│   │   └── routes/       # API endpoints
│   └── pickle.db         # SQLite database
├── config/               # App configuration
│   ├── api.ts           # API URL setup
│   └── FirebaseConfig.ts # Firebase config
├── .env.example          # Environment template
└── SETUP.md             # Detailed setup guide
```

## 🔌 API Endpoints

Backend API (docs at `http://localhost:8000/docs`):
- `/api/teams/` - Team management
- `/api/players/` - Player management
- `/api/lineups/` - Lineup creation
- `/api/drills/` - Drill library
- `/api/practice-plans/` - Practice plans
- `/api/equipment/` - Equipment recommendations

## 💡 Tips for Team Development

1. **Each person needs their own .env** with their machine's IP
2. **Everyone runs backend locally** (or share one backend server)
3. **Clear Expo cache** if having issues: `npx expo start -c`
4. **Check connection indicator** in app to verify backend connectivity
5. **Port 8000 must be open** on your firewall

## 📝 License

[Your License Here]
