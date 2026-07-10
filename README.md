# Places to Go (Date Ideas)

This is a small web app I built for my girlfriend and me to collect, plan, and track date ideas together.
The goal was to create something fun, visual, and meaningful, while still applying good software engineering practices.

The app allows us to save date ideas, optionally assign a date, mark them as completed, and keep a shared history of moments we’ve already enjoyed.
##
### Features

🔐 Authentication with Firebase <br>
Secure login system <br>
Passwords stored using hashing for safety <br>

📝 Create date ideas <br>
Add a place/activity name <br>
Optionally include a date (or leave it open) <br>

✅ Mark as completed <br>
Completed dates move to a separate Completed tab <br>
Completed items appear visually faded for clear distinction <br>

👥 Multi-user awareness <br>
Each idea shows who added it (based on the logged-in user) <br>

🎨 Playful UI <br>
Custom background with watermark-style illustrations <br>
Animated GIFs for a cozy, fun vibe <br>

🗑️ Delete ideas when needed <br>

🚪 Logout option <br>
##
📸 Screenshots <br>

This repository includes: <br>
Main screen – adding and managing date ideas <br>
Login screen – secure authentication entry point <br>
Completed screen – finished dates displayed with a faded style <br>

## Setup & Deployment

### Local development

1. Copy the example config and fill in your real Firebase values:
   ```bash
   cp firebase-config.example.js firebase-config.js
   ```
2. Edit `firebase-config.js` with your project's credentials (this file is `.gitignore`d and will never be committed).
3. Open `index.html` directly in a browser or serve it with any static server.

### GitHub Actions / GitHub Pages deployment

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) generates `firebase-config.js` at deploy time from **GitHub Secrets**, so no credentials are ever stored in the repository.

Add the following secrets to your repository (**Settings → Secrets and variables → Actions → New repository secret**):

| Secret name | Value |
|---|---|
| `FIREBASE_API_KEY` | Your Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | e.g. `your-project.firebaseapp.com` |
| `FIREBASE_DATABASE_URL` | e.g. `https://your-project-default-rtdb.firebaseio.com` |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | e.g. `your-project.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Your messaging sender ID |
| `FIREBASE_APP_ID` | Your Firebase app ID |

Then push to `main` — the workflow will build and deploy automatically.

> **Important:** The real `firebase-config.js` is in `.gitignore`. If you previously committed it, purge it from history (see [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-repo`).

##
<img src = "https://github.com/Guicastellani/places-to-go/blob/main/assets/main-page.png" width="800">
<p float="left">
<img src = "https://github.com/Guicastellani/places-to-go/blob/main/assets/login-screen.png" width="400">
<img src = "https://github.com/Guicastellani/places-to-go/blob/main/assets/completed-filter.png" width="400">
</p>
