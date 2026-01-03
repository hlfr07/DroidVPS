# Quick Start Guide

Get your UserLAnd Dashboard running in 5 minutes!

## Step 1: Prerequisites

Make sure you have Node.js installed in UserLAnd:

```bash
pkg install nodejs
```

## Step 2: Copy Files

Transfer the `server` folder to your UserLAnd device. Place it anywhere, for example:

```bash
mkdir -p ~/dashboard
cd ~/dashboard
```

## Step 3: Install & Start

Navigate to the server directory and run:

```bash
cd server
chmod +x start.sh
./start.sh
```

Or manually:

```bash
npm install
npm start
```

## Step 4: Find Your IP

The start script will show your IP, or run:

```bash
hostname -I
```

Example output: `192.168.1.100`

## Step 5: Open Browser

On any device connected to the same WiFi network, open:

```
http://192.168.1.100:3001
```

Replace `192.168.1.100` with your actual IP address.

## Step 6: Login

On the login screen:
- Server URL: `http://192.168.1.100:3001` (your IP)
- Username: Your UserLAnd username (any value works)
- Password: Any password

Click "Connect"

## Done!

You now have access to:
- Real-time system monitoring
- Process and port viewer
- Web-based terminal

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

### Can't access from browser?
- Make sure both devices are on the same WiFi
- Check if the server is running
- Try `http://localhost:3001` from UserLAnd's browser

### Port already in use?
Change the port:
```bash
PORT=8080 npm start
```

### Server crashes?
Check the error message and make sure all dependencies are installed:
```bash
rm -rf node_modules
npm install
```

## Need More Help?

See the full [INSTALLATION.md](INSTALLATION.md) guide for detailed instructions and troubleshooting.
