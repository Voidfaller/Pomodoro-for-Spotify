// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('gp_pomodoro_settings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Save settings to localStorage
function saveSettings(settings) {
    localStorage.setItem('gp_pomodoro_settings', JSON.stringify(settings));
}
