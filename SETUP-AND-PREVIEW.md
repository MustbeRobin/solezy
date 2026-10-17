# Solezy — updated website and demo preview

## Upload to your existing GitHub repo
Extract this ZIP, then upload the CONTENTS of the solezy folder to the root of MustbeRobin/solezy. Keep the existing folder structure, including web/public/assets. GitHub does not extract uploaded ZIP files automatically.

## Run the demo preview
Install Python 3, open a terminal in this folder and run:

    python run-preview.py

Open http://localhost:3000 in the browser on that same computer.
For a phone on the same Wi-Fi, use http://YOUR-COMPUTER-LAN-IP:3000 if your firewall allows it. Do not expose this demo server to the public internet.

Routes:
- / : homepage
- /dashboard : sample servers
- /dashboard/guild/100000000000000010/antinuke : Anti-Nuke settings
- /commands : full command catalogue

The preview uses fake authentication, mock server data, and in-memory settings. Settings reset when the server restarts. It does not connect to Discord or enforce moderation. Never use run-preview.py as your production server.

## Production backend
The original npm start command runs web/server.js, not the demo server. Install dependencies with npm ci and configure the required environment variables (see web/.env.example) securely. Never upload real tokens, secrets, or private keys to GitHub.

Visual styling and animations are included. Extra feature controls in the demo are supplied by its securitySchema fixtures; production must supply matching, validated settings and bot support before these controls can be used live. These integrations are not production-ready yet. The standalone /commands page also needs a production route (or access via /commands.html).

Demo banners and shortcut buttons are injected only by run-preview.py, not the production website.
