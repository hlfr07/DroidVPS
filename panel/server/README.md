# UserLAnd Dashboard Server

Backend server for monitoring and controlling your UserLAnd environment.

## Installation in UserLAnd

1. Install Node.js in UserLAnd:
```bash
pkg install nodejs
```

2. Copy this entire `server` folder to your UserLAnd environment

3. Navigate to the server directory:
```bash
cd server
```

4. Install dependencies:
```bash
npm install
```

5. Start the server:
```bash
npm start
```

The server will start on port 3001 by default.

## Accessing the Dashboard

1. Find your device's IP address:
```bash
hostname -I
```

2. Open a browser on any device in the same network and navigate to:
```
http://[your-device-ip]:3001
```

## Security Notes

- The server runs without root privileges
- Authentication is token-based with 24-hour expiration
- WebSocket connections are authenticated
- Only system commands that don't require root are executed

## Configuration

You can change the port by setting the PORT environment variable:
```bash
PORT=8080 npm start
```

## Troubleshooting

If you get permission errors:
- Make sure you're not trying to access files outside your user directory
- Check that port 3001 (or your chosen port) is not in use

If temperature data is not available:
- This is normal in many Android/UserLAnd environments
- The dashboard will show "N/A" for unavailable data
