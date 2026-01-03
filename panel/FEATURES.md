# UserLAnd Dashboard - Features

## Overview Dashboard

Monitor your system at a glance with real-time updates every 2 seconds.

### System Metrics

**CPU Monitoring**
- Real-time CPU usage percentage
- Number of CPU cores
- Color-coded progress bar (green < 70%, yellow 70-90%, red > 90%)

**Memory (RAM)**
- Current usage percentage
- Used vs total memory in MB/GB
- Visual progress indicator
- Free memory calculation

**Disk Storage**
- Total disk space
- Used space
- Available space
- Usage percentage with visual indicator

**Swap Memory**
- Swap usage (if configured)
- Total swap space
- Used and free swap
- Automatically hidden if no swap is configured

**System Load**
- 1-minute load average
- 5-minute load average
- 15-minute load average
- Indicates system responsiveness

**Temperature Sensors**
- CPU/system temperature when available
- Displayed in Celsius
- Automatically detects available sensors
- Shows "N/A" if sensors aren't accessible

**System Information**
- Hostname
- Platform (Linux)
- Architecture (ARM, x86, etc.)
- System uptime (formatted as days, hours, minutes)
- CPU core count

## Process Management

View and monitor all running processes with detailed information.

**Process List Features**
- Top 20 processes sorted by memory usage
- Real-time updates
- Process ID (PID)
- Username running the process
- CPU usage percentage (color-coded: red if > 50%)
- Memory usage percentage (yellow if > 10%)
- Virtual memory size (VSZ)
- Resident set size (RSS)
- TTY information
- Process state
- Start time
- CPU time consumed
- Full command line with arguments

**Process Information**
- Scrollable table view
- Hover highlighting
- Sortable columns
- Responsive design for mobile

## Network Monitoring

Track network activity and open ports on your system.

**Open Ports View**
- All listening ports
- TCP and UDP protocols
- Port numbers
- Local addresses (IPv4/IPv6)
- Protocol badges with color coding
- Real-time updates

**Network Features**
- Identifies services by port
- Shows bound addresses
- Detects listening state
- Clean table format

## Web Terminal

Full-featured terminal accessible from any browser.

**Terminal Capabilities**
- Execute any command available in UserLAnd
- Real-time command output
- Proper terminal emulation via node-pty
- ANSI color support
- Line editing
- Tab completion (partial support)
- Command history with arrow keys
- Ctrl+C signal handling
- Process termination
- Environment variable access

**Terminal Interface**
- Fullscreen mode toggle
- Minimize/maximize controls
- Dark theme optimized for readability
- Green text on black background (classic terminal)
- Auto-scroll to latest output
- Input field with command prompt
- Connection status indicator

**Terminal Features**
- Multiple terminal sessions (create new terminals)
- Terminal resize support
- Persistent connection via WebSocket
- Automatic reconnection on disconnect
- Graceful error handling

## Authentication

Simple but secure authentication for local network use.

**Login Features**
- Configurable server URL
- Username/password authentication
- Token-based session (24-hour validity)
- Automatic token storage (localStorage)
- Remember me functionality
- Logout with token cleanup

**Security**
- CORS enabled for cross-origin requests
- WebSocket authentication via token
- Automatic session timeout
- Secure token transmission
- No password storage

## Real-Time Updates

All data updates automatically without page refresh.

**WebSocket Communication**
- Persistent connection to server
- 2-second update interval (configurable)
- Automatic reconnection on disconnect
- Connection status indicator
- Efficient data transfer
- Low latency

**Update Mechanism**
- System metrics: Every 2 seconds
- Process list: Every 2 seconds
- Port scanning: Every 2 seconds
- Terminal: Real-time streaming
- Connection status: Instant feedback

## User Interface

Modern, responsive design that works on all devices.

**Design Features**
- Dark theme optimized for long viewing
- Gradient backgrounds
- Glassmorphism effects
- Smooth animations and transitions
- Responsive grid layouts
- Mobile-first design
- Touch-friendly controls

**Color Scheme**
- Dark slate background (900-800)
- Blue accent colors for primary actions
- Green for success/connected states
- Yellow for warnings
- Red for errors/high usage
- Proper contrast ratios for accessibility

**Layout**
- Sticky header with navigation
- Tab-based navigation
- Scrollable content areas
- Grid-based metric cards
- Table views for data
- Fullscreen modal support

**Icons**
- Lucide React icon library
- Consistent icon style
- Semantic icon usage
- Proper sizing and spacing

## Performance

Optimized for low-resource environments like UserLAnd.

**Frontend Optimization**
- Vite for fast builds
- Code splitting
- Tree shaking
- Minified production builds
- Lazy loading components
- Efficient re-renders with React

**Backend Optimization**
- Efficient command execution
- Cached system information
- WebSocket reduces bandwidth
- Single server process
- Low memory footprint
- Non-blocking I/O

**Resource Usage**
- Frontend: ~170KB JavaScript (gzipped: 52KB)
- Backend: ~50MB memory (Node.js + dependencies)
- CPU: < 1% during updates
- Network: ~10KB/s for real-time updates

## Accessibility

Built with accessibility in mind.

**Keyboard Navigation**
- Tab navigation through all controls
- Enter to submit forms
- Escape to close modals
- Arrow keys in terminal

**Visual Accessibility**
- High contrast text
- Color-coded with text labels
- Large click targets
- Clear focus indicators
- Readable font sizes

**Screen Reader Support**
- Semantic HTML
- ARIA labels where needed
- Proper heading hierarchy
- Table headers for data tables

## Browser Compatibility

Works on all modern browsers and devices.

**Desktop Browsers**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

**Mobile Browsers**
- iOS Safari 14+
- Chrome Mobile 90+
- Firefox Mobile 88+
- Samsung Internet 14+

**Features Used**
- WebSocket API
- Fetch API
- localStorage
- CSS Grid and Flexbox
- CSS Custom Properties
- ES2020+ JavaScript

## Extensibility

Easy to customize and extend.

**Frontend Customization**
- Tailwind CSS for easy styling
- Component-based architecture
- TypeScript for type safety
- Custom hooks for logic reuse
- Easy to add new views

**Backend Customization**
- Modular design
- Easy to add new endpoints
- Configurable update intervals
- Extensible system monitor
- Plugin-ready architecture

**Configuration**
- Environment variables
- Port configuration
- Update interval tuning
- Authentication customization
- CORS configuration

## Error Handling

Graceful error handling throughout the application.

**Frontend Errors**
- Connection loss detection
- Automatic reconnection
- User-friendly error messages
- Fallback UI for missing data
- Loading states

**Backend Errors**
- Command execution errors caught
- Graceful degradation
- Logging for debugging
- Process crash recovery
- WebSocket error handling

## Future Features

Potential additions for future versions:

- System logs viewer
- File browser
- Service manager (systemd)
- Custom commands/shortcuts
- Historical data and charts
- Alert thresholds
- Email/push notifications
- Multi-user support
- HTTPS support
- Authentication providers (OAuth)
- Dark/light theme toggle
- Customizable dashboard widgets
- Export system reports
- Scheduled commands
- Backup and restore

---

This dashboard provides everything you need to monitor and control your UserLAnd environment from any device on your network!
