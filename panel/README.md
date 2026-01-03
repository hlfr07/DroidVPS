# UserLAnd Dashboard

A complete web-based monitoring and control dashboard for your UserLAnd (Ubuntu on Android) environment.

## Overview

This application provides a beautiful, real-time dashboard for monitoring and managing your UserLAnd system through any web browser on your local network. No root required.

## Features

### System Monitoring
- Real-time CPU usage and core count
- Memory (RAM) usage with detailed breakdown
- Disk usage and available space
- Swap usage monitoring
- System load averages (1m, 5m, 15m)
- Temperature sensors (when available)
- System uptime and information

### Process Management
- View top running processes
- CPU and memory usage per process
- Full command line for each process
- Process details (PID, user, state)

### Network Monitoring
- List all open ports
- View listening services
- Protocol information (TCP/UDP)
- Local addresses

### Web Terminal
- Full interactive terminal in your browser
- Execute any command available in UserLAnd
- Real-time command output
- Tab completion support
- Command history with arrow keys
- Fullscreen mode
- Secure WebSocket connection

### Security
- Token-based authentication
- Secure WebSocket communication
- No root access required
- Local network only (by design)

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- WebSocket for real-time updates
- Lucide React for icons

### Backend
- Node.js with Express
- WebSocket (ws) for real-time communication
- node-pty for terminal emulation
- CORS enabled for cross-origin requests

## Quick Start

### 1. Install Backend in UserLAnd

Copy the `server` folder to your UserLAnd environment and follow these steps:

```bash
cd server
npm install
npm start
```

The server will start on port 3001.

### 2. Access the Dashboard

Find your device IP:
```bash
hostname -I
```

Open your browser and navigate to:
```
http://[your-device-ip]:3001
```

### 3. Login

Use any username and password to login (authentication is simplified for local use).

## Detailed Installation

See [INSTALLATION.md](INSTALLATION.md) for complete installation instructions, troubleshooting, and configuration options.

## Project Structure

```
userland-dashboard/
├── src/                      # Frontend source
│   ├── components/          # React components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Login.tsx       # Login screen
│   │   ├── SystemResources.tsx  # CPU, RAM, disk stats
│   │   ├── ProcessList.tsx # Process and port viewer
│   │   └── Terminal.tsx    # Web terminal
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts     # Authentication logic
│   │   └── useWebSocket.ts # WebSocket connection
│   ├── types/              # TypeScript definitions
│   │   └── system.ts      # System data types
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
│
├── server/                 # Backend (copy to UserLAnd)
│   ├── server.js          # Main server
│   ├── system-monitor.js  # System stats collector
│   ├── terminal-handler.js # Terminal management
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
│
├── INSTALLATION.md         # Complete setup guide
└── README.md              # This file
```

## Screenshots

### Login Screen
Clean and modern login interface with server URL configuration.

### System Overview
Real-time dashboard showing CPU, memory, disk, and system load.

### Processes & Ports
Monitor running processes and open network ports.

### Web Terminal
Full-featured terminal accessible from any browser.

## Security Considerations

This dashboard is designed for **local network use only**:

- Basic authentication for local access
- HTTP (not HTTPS) for simplicity on local network
- WebSocket connections are authenticated
- No root privileges used or required
- Only accesses data your user can already access
- Firewall-friendly (single port)

**Do NOT expose this to the public internet without additional security measures.**

## Performance

- Updates system data every 2 seconds
- Lightweight backend with minimal CPU usage
- Responsive design works on mobile and desktop
- WebSocket reduces bandwidth compared to polling
- Built with Vite for optimal frontend performance

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Requirements

- UserLAnd with Ubuntu
- Node.js 18+ (install via `pkg install nodejs`)
- 100MB disk space for dependencies
- WiFi network for browser access

## Common Issues

### Can't connect to server
- Verify server is running: `ps aux | grep node`
- Check IP address: `hostname -I`
- Ensure devices are on same WiFi network
- Try a different port if 3001 is in use

### Terminal not working
- Check node-pty installation: `npm list node-pty`
- Restart the server
- Check browser console for errors

### No temperature data
- Normal in many Android environments
- Requires accessible thermal sensors
- Dashboard shows "N/A" when unavailable

## Development

### Frontend Development
```bash
npm install
npm run dev
```

### Build Production
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

## License

MIT License - Free to use and modify

## Contributing

This is a standalone project. Feel free to fork and customize for your needs.

## Acknowledgments

Built with modern web technologies:
- React team for the amazing framework
- Vite for blazing fast builds
- Tailwind CSS for beautiful styling
- Lucide for crisp icons
- node-pty for terminal emulation

---

Made with care for the UserLAnd community. Enjoy monitoring your mobile Linux environment!
