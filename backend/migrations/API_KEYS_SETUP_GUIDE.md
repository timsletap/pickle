# API Keys Setup Guide

Follow these steps to get your API keys for YouTube and Google Search functionality.

---

## 1. YouTube Data API v3 Key

### Steps:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a Project (if you don't have one):**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it something like "Pickle Baseball App"
   - Click "Create"

3. **Enable YouTube Data API v3:**
   - In the search bar at the top, type "YouTube Data API v3"
   - Click on "YouTube Data API v3"
   - Click the blue "Enable" button

4. **Create API Credentials:**
   - Click "Create Credentials" button
   - Select "API key"
   - Copy the API key that appears
   - (Optional) Click "Restrict Key" to add restrictions for security

5. **Add to .env file:**
   - Open `backend/.env`
   - Paste your key after `YOUTUBE_API_KEY=`
   - Example: `YOUTUBE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

---

## 2. Google Custom Search API

### Part A: Get Google API Key

1. **Same Google Cloud Console:**
   - If not already there, go to: https://console.cloud.google.com/

2. **Enable Custom Search API:**
   - In the search bar, type "Custom Search API"
   - Click on "Custom Search API"
   - Click the blue "Enable" button

3. **Create API Key (if you don't have one already):**
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API key"
   - Copy this key
   - You can use the same key as YouTube or create a separate one

4. **Add to .env file:**
   - Open `backend/.env`
   - Paste your key after `GOOGLE_API_KEY=`
   - Example: `GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

### Part B: Create Custom Search Engine

1. **Go to Programmable Search Engine:**
   - Visit: https://programmablesearchengine.google.com/

2. **Create a Search Engine:**
   - Click "Add" or "Get Started"
   - Under "Sites to search", enter: `www.amazon.com, www.dickssportinggoods.com, www.baseballmonkey.com`
   - Name it: "Baseball Equipment Search"
   - Click "Create"

3. **Configure for Web Search:**
   - After creation, click on your new search engine
   - Click "Edit search engine"
   - Turn ON "Search the entire web"
   - (Optional) You can remove the specific sites you added earlier if you want to search the whole web
   - Click "Update"

4. **Get Your Search Engine ID:**
   - On the Overview page, you'll see "Search engine ID"
   - It looks like: `a1b2c3d4e5f6g7h8i`
   - Copy this ID

5. **Add to .env file:**
   - Open `backend/.env`
   - Paste your ID after `GOOGLE_SEARCH_ENGINE_ID=`
   - Example: `GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i`

---

## 3. Final .env File Should Look Like:

```
YOUTUBE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
```

(Replace with your actual keys - these are examples!)

---

## 4. Test Your Setup

1. **Restart your backend server** if it's running
2. **Open the app** and navigate to Dugout
3. **Try adding a drill from YouTube** - click the "Add Drill" button
4. **Try finding equipment** - click the "Find Equipment" button

---

## Important Notes:

- **Free Tier Limits:**
  - YouTube API: 10,000 quota units per day (about 1,000 searches)
  - Google Custom Search: 100 queries per day (free tier)

- **Keep your keys secret!** Never commit the `.env` file to GitHub

- **If you get quota errors**, you've hit your daily limit - wait until tomorrow or upgrade

---

## Troubleshooting:

**"YouTube API key not configured" error:**
- Make sure you enabled the YouTube Data API v3 in Google Cloud Console
- Check that your key is properly pasted in the `.env` file with no extra spaces
- Restart your backend server

**"Google Search API not configured" error:**
- Make sure you enabled the Custom Search API in Google Cloud Console
- Check that both GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID are in `.env`
- Restart your backend server

**"403 Forbidden" or "API key not valid":**
- Your API key might have restrictions - go to Google Cloud Console → Credentials → Edit your key
- Make sure HTTP restrictions allow your localhost

---

Need help? Check that:
1. The `.env` file is in the `backend` folder
2. There are no extra spaces around the `=` signs
3. Your backend server was restarted after adding the keys
