# UserLAnd Dashboard - Installation Guide

Complete dashboard for monitoring and controlling your UserLAnd environment via web browser.

## Features

- Real-time system resource monitoring (CPU, RAM, Disk, Swap, Load)
- Process listing with resource usage
- Open ports scanning
- Web-based terminal with full shell access
- Temperature monitoring (when available)
- Secure authentication
- Responsive design for mobile and desktop

## Installation Steps

### Step 1: Install Node.js in UserLAnd

Open your UserLAnd Ubuntu environment and run:

```bash
pkg update
pkg install nodejs
```

Verify installation:
```bash
node --version
npm --version
```

### Step 2: Copy the Server Files

1. Transfer the entire `server` folder from this project to your UserLAnd environment
2. You can use any file transfer method:
   - USB cable with file manager
   - Cloud storage (Dropbox, Google Drive)
   - SSH/SCP if you have it configured
   - Termux-API file picker

Place the server folder in your home directory, for example:
```
/home/[your-username]/userland-dashboard/server/
```

### Step 3: Install Server Dependencies

Navigate to the server directory:
```bash
cd ~/userland-dashboard/server
```

Install dependencies:
```bash
npm install
```

This will install:
- Express (web server)
- WebSocket (real-time communication)
- node-pty (terminal emulation)
- CORS (cross-origin support)

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
UserLAnd Dashboard Server running on http://0.0.0.0:3001
WebSocket server available at ws://0.0.0.0:3001/ws

Access the dashboard from your browser at http://[your-device-ip]:3001
```

### Step 5: Find Your Device IP

In a new terminal tab/window:
```bash
hostname -I
```

This will show your IP address, for example: `192.168.1.100`

### Step 6: Access the Dashboard

1. Open a web browser on any device connected to the same WiFi network
2. Navigate to: `http://[your-device-ip]:3001`
3. You'll see the login page

### Step 7: Login

On the login page:
- **Server URL**: `http://[your-device-ip]:3001`
- **Username**: Your UserLAnd username (usually same as Android username)
- **Password**: Any password (the server accepts any credentials for now)

Click "Connect" and you're in!

## Usage

### Overview Tab
View real-time system resources:
- CPU usage and core count
- Memory usage and available RAM
- Disk usage and free space
- Swap usage (if available)
- System load (1min, 5min, 15min averages)
- Temperature (if sensors are available)
- System information (hostname, platform, architecture, uptime)

### Processes & Ports Tab
Monitor running processes and network activity:
- Top 15 processes sorted by memory usage
- CPU and memory usage per process
- List of open ports and listening services
- Protocol types (TCP/UDP)

### Terminal Tab
Full web-based terminal:
- Execute any command available in your UserLAnd environment
- Real-time command output
- Tab completion support
- Command history with arrow keys
- Fullscreen mode
- Secure connection via WebSocket

## Configuration

### Change Server Port

Edit the server startup command or set environment variable:
```bash
PORT=8080 npm start
```

Or modify `server/server.js` line 9:
```javascript
const PORT = process.env.PORT || 3001;
```

### Auto-start on Boot (Optional)

To make the server start automatically when UserLAnd starts:

1. Create a startup script:
```bash
nano ~/start-dashboard.sh
```

2. Add:
```bash
#!/bin/bash
cd ~/userland-dashboard/server
npm start
```

3. Make it executable:
```bash
chmod +x ~/start-dashboard.sh
```

4. Add to your `.bashrc` or `.profile`:
```bash
echo "~/start-dashboard.sh &" >> ~/.bashrc
```

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use: `netstat -tuln | grep 3001`
- Try a different port: `PORT=8080 npm start`
- Check Node.js installation: `node --version`

### Can't access from browser
- Verify server is running
- Check your device IP: `hostname -I`
- Make sure your phone/tablet is on the same WiFi network
- Check firewall settings in UserLAnd (usually not needed)

### Terminal not working
- The terminal uses node-pty which should work in UserLAnd
- If it fails, check console for errors
- Try restarting the server

### No temperature data
- This is normal in many Android/UserLAnd environments
- Hardware sensors are often not accessible without root
- The dashboard will show "N/A" for unavailable data

### High CPU usage
- The dashboard updates every 2 seconds
- Reduce update frequency by modifying `server/server.js` line 157:
  ```javascript
  systemDataInterval = setInterval(sendSystemData, 5000); // 5 seconds
  ```

## Security Notes

- This dashboard is designed for local network use only
- Do NOT expose it to the public internet without proper security measures
- The current authentication is basic and meant for local use
- All communication happens over HTTP (not HTTPS) for simplicity
- No root access is required or used
- The terminal runs with your user privileges only

## Performance Tips

- Close browser tabs you're not using
- Use the mobile view for better performance on phones
- The terminal view uses more resources than other views
- Consider increasing update interval for lower-end devices

## Uninstallation

To remove the dashboard:

```bash
cd ~/userland-dashboard/server
rm -rf node_modules
cd ..
rm -rf userland-dashboard
```

## Support

If you encounter issues:
1. Check the server logs in the terminal where you ran `npm start`
2. Check browser console for frontend errors (F12 in most browsers)
3. Verify all dependencies are installed correctly
4. Try restarting both the server and browser

## Requirements

- UserLAnd Ubuntu environment
- Node.js 18+ (installed via pkg)
- 100MB free disk space for dependencies
- WiFi network for browser access
- Modern web browser (Chrome, Firefox, Safari, Edge)

## What's Next?

You now have a fully functional monitoring dashboard for your UserLAnd environment. Use it to:
- Monitor system performance
- Track resource usage
- Manage processes
- Execute commands remotely
- Check network activity

Enjoy your UserLAnd Dashboard!
