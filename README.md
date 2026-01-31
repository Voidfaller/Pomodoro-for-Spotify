# Gio's Pomodoro Timer

A fully-featured Pomodoro timer custom app for Spicetify that integrates seamlessly with Spotify. Stay productive while enjoying your music with automatic queue filling and customizable work/break intervals.

## Features

### Core Timer Functionality
- **Pomodoro Technique**: Work sessions, short breaks, and long breaks with customizable durations
- **Typable Timer Inputs**: Click on any digit to quickly type your desired time
- **Increment/Decrement Controls**: Fine-tune your timer settings with intuitive up/down arrows
- **Visual State Indicators**: Clear distinction between work, short break, and long break modes

### Spotify Integration
- **Automatic Queue Filling**: Automatically fills your Spotify queue with your top 50 tracks when you start a timer
- **Seamless Playback**: Works alongside Spotify's existing playback controls

### Notifications
- **Visual Notifications**: Get notified when your timer completes with Spicetify's native notification system
- **Audio Notifications**: Optional gentle two-tone chime when timer phases complete
- **Phase-Specific Messages**: Different notification messages for work sessions and break times

### Customizable Settings
- **Adjustable Durations**: Set custom lengths for work sessions (default: 25 min), short breaks (default: 5 min), and long breaks (default: 15 min)
- **Pomodoro Cycles**: Configure how many work sessions before a long break (default: 4)
- **Continuous Timer Mode**: Option to automatically start the next phase when one completes
- **Audio Toggle**: Enable or disable notification sounds
- **Persistent Settings**: All preferences are saved automatically via localStorage

### User Experience
- **Navbar Widget**: See your timer countdown in the Spotify navbar without switching to the app
- **Pause/Resume**: Full control over your timer with reliable state synchronization
- **Reset Function**: Quickly reset to your configured timer duration
- **Responsive UI**: Clean, centered interface with hover effects and smooth interactions

## Installation

### Prerequisites
- [Spicetify](https://spicetify.app/) installed
- Spotify Desktop App

### Setup Steps

1. **Navigate to your Spicetify CustomApps folder**:
   ```powershell
   cd "$env:APPDATA\spicetify\CustomApps"
   ```

2. **Clone or download this repository**:
   ```powershell
   git clone https://github.com/<your-username>/Pomodoro-for-Spotify gio-pomodoro
   ```
   Or manually create a `gio-pomodoro` folder and copy all files into it.

3. **Apply the custom app**:
   ```powershell
   spicetify config custom_apps gio-pomodoro
   spicetify apply
   ```

4. **Restart Spotify** and look for "Gio's Pomodoro" in your app sidebar.

## Usage

### Starting a Session

1. Open the Pomodoro app from your Spotify sidebar
2. Adjust the timer duration if needed (click on digits to type, or use increment/decrement arrows)
3. Click the **Play button** to start your work session
4. Your Spotify queue will automatically fill with your favorite tracks
5. Watch the countdown in the app or in the navbar widget

### Configuring Settings

1. Click the **Settings icon** (gear) in the top-right corner
2. Adjust your preferences:
   - **Work Duration**: Length of focused work sessions
   - **Short Break**: Quick break between work sessions
   - **Long Break**: Extended break after completing a cycle
   - **Pomodoros Until Long Break**: Number of work sessions before a long break
   - **Continuous Timer**: Auto-start next phase when current one completes
   - **Audio Notifications**: Toggle notification sounds on/off
3. Settings are saved automatically

### During a Session

- **Pause/Resume**: Click the pause/play button to control the timer
- **Reset**: Click the reset icon to return to your configured duration
- **Monitor Progress**: Check the navbar widget without leaving your current view
- **Get Notified**: Receive visual and/or audio notifications when phases complete

## Project Structure

```
Pomodoro-for-Spotify/
├── manifest.json                 # App configuration and metadata
├── index.js                      # Entry point
├── style.css                     # Styling for the app and modal
├── clock.js                      # Global timer logic with localStorage sync
├── navbar-widget.js              # Timer widget for Spotify navbar
├── src/
│   ├── settingsManager.js        # Settings persistence (load/save)
│   ├── icons.js                  # SVG icon definitions
│   ├── audioNotification.js      # Web Audio API notification sound
│   ├── Digit.js                  # Timer digit component with inputs
│   ├── SettingsModal.js          # Settings popup interface
│   └── PomodoroApp.js           # Main app component and logic
└── README.md                     # This file
```

## Technical Details

### Technologies Used
- **React**: Component-based UI with hooks (useState, useEffect, useRef)
- **Spicetify API**: Player controls, CosmosAsync for Spotify API calls, notifications
- **Spotify Web API**: Fetching user's top tracks for queue filling
- **Web Audio API**: Generating notification sounds programmatically
- **localStorage**: Persisting user settings and timer state

### Custom Events
- `gp-pomodoro-tick`: Fired every second during timer countdown
- `gp-pomodoro-finished`: Fired when a timer phase completes

### Global API
The app exposes `window.GPClock` with the following methods:
- `start()`: Start the timer
- `stop()`: Stop the timer
- `isRunning()`: Check if timer is active
- `getRemainingSeconds()`: Get current countdown value
- `getPhase()`: Get current phase ("work", "shortBreak", or "longBreak")
- `setPhase(phase)`: Change the current phase

## Development

### Building
The app uses Spicetify's subfiles system to concatenate multiple source files. Files are loaded in order as specified in `manifest.json`:

1. settingsManager.js
2. icons.js
3. audioNotification.js
4. Digit.js
5. SettingsModal.js
6. PomodoroApp.js

Plus extensions: clock.js and navbar-widget.js

### Making Changes
1. Edit source files in the `src/` directory
2. Run `spicetify apply` to rebuild and reload
3. Refresh Spotify to see changes

## License

MIT License - See [LICENSE](LICENSE) file for details

## Credits

Built for the Spicetify community
