# Pickle App - Team Setup Guide

## Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- Expo Go app on your phone (for testing on device)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
copy .env.example .env

# Edit .env and set your machine's IP address
# Find your IP:
#   Windows: ipconfig (look for IPv4 Address)
#   Mac: ifconfig | grep "inet " | grep -v 127.0.0.1
#   Linux: hostname -I

# Update EXPO_PUBLIC_API_URL in .env with your IP
# Example: EXPO_PUBLIC_API_URL=http://192.168.1.137:8000
```

### 3. Start the Backend Server

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend should start at `http://0.0.0.0:8000`
- API docs available at: `http://localhost:8000/docs`

### 4. Start the Frontend

In a new terminal:

```bash
# Start Expo development server
npx expo start

# Options:
# Press 'w' - Open in web browser
# Press 'a' - Open in Android emulator
# Press 'i' - Open in iOS simulator
# Scan QR code with Expo Go app on phone
```

## Troubleshooting

### Backend Connection Issues

If you see "Failed to load" errors:

1. **Check backend is running:**
   ```bash
   curl http://localhost:8000/api/teams/
   ```
   Should return: `[]`

2. **Check your IP address is correct:**
   - The IP in `.env` must match your computer's local network IP
   - Both your computer and phone/emulator must be on the same network

3. **Firewall issues:**
   - Make sure port 8000 is allowed through your firewall
   - Windows: `netsh advfirewall firewall add rule name="Pickle Backend" dir=in action=allow protocol=TCP localport=8000`

4. **Test from your phone:**
   - Open browser on phone
   - Go to `http://YOUR_IP:8000/api/teams/`
   - Should see `[]`

### "Only works for me" Issues

Common reasons the app works for one person but not others:

1. **Different IP addresses** - Each person needs their own IP in `.env`
2. **Backend not running** - Teammates need to run the backend locally
3. **Wrong network** - Computer and phone must be on same WiFi
4. **Environment variables not loaded** - Run `npx expo start -c` to clear cache

### Database Issues

If you get database errors:

```bash
cd backend
# Check database exists
dir pickle.db

# If missing, initialize it
python migrations/init_db.py

# Populate with test data (optional)
python seed_data.py
```

## Network Configuration

### Option 1: Each Developer Runs Backend Locally (Current Setup)
- Each person runs their own backend on their machine
- Each person sets their own IP in `.env`
- **Pros:** Simple, no shared database conflicts
- **Cons:** Each person needs Python installed

### Option 2: Shared Development Backend (Recommended for Teams)
- One person hosts the backend on a server or always-on machine
- Everyone uses the same API URL
- **Pros:** Consistent data, no backend setup needed for most team members
- **Cons:** Requires one always-available machine

To use Option 2:
1. One person runs backend on a machine with static IP or ngrok
2. Everyone else sets `EXPO_PUBLIC_API_URL` to that shared URL

## Testing on Different Platforms

### Web Browser
```bash
npx expo start
# Press 'w'
```

### Physical Device (Recommended)
1. Install "Expo Go" app from App Store/Play Store
2. Make sure phone is on same WiFi as computer
3. Scan QR code from terminal

### Android Emulator
```bash
npx expo start
# Press 'a'
```

### iOS Simulator (Mac only)
```bash
npx expo start
# Press 'i'
```

## API Endpoints

Backend provides these endpoints:
- `/api/teams/` - Team management
- `/api/players/` - Player management
- `/api/lineups/` - Lineup management
- `/api/drills/` - Drills and training
- `/api/practice-plans/` - Practice plan management
- `/api/equipment/` - Equipment recommendations

View full API docs at: `http://localhost:8000/docs`

## Common Commands

```bash
# Clear Expo cache
npx expo start -c

# Reset project
npm run reset-project

# Lint code
npm run lint

# Backend - run tests
cd backend && pytest

# Backend - check database
cd backend && python check_data.py
```

## Getting Help

If you're still stuck:
1. Check the backend is running: `curl http://localhost:8000/api/teams/`
2. Check your `.env` file has correct IP address
3. Verify you're on the same network as your computer
4. Try clearing Expo cache: `npx expo start -c`
5. Check firewall isn't blocking port 8000
