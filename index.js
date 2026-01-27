const { React, ReactDOM } = Spicetify;
const { useState, useEffect } = React;

const defaultSettings = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4
};
function SettingsPanel({ settings, onChange }) {
    return React.createElement("div", { className: "settings-panel" },
        React.createElement("h2", null, "Pomodoro Settings"),
        React.createElement("label", null, "Work Duration (minutes):",
            React.createElement("input", {
                type: "number",
                value: settings.work,
                onChange: e => onChange({ ...settings, work: Number(e.target.value) }),
                min: 1
            })
        ),
        React.createElement("label", null, "Short Break (minutes):",
            React.createElement("input", {
                type: "number",
                value: settings.shortBreak,
                onChange: e => onChange({ ...settings, shortBreak: Number(e.target.value) }),
                min: 1
            })
        ),
        React.createElement("label", null, "Long Break (minutes):",
            React.createElement("input", {
                type: "number",
                value: settings.longBreak,
                onChange: e => onChange({ ...settings, longBreak: Number(e.target.value) }),
                min: 1
            })
        ),
        React.createElement("label", null, "Sessions Before Long Break:",
            React.createElement("input", {
                type: "number",
                value: settings.sessionsBeforeLongBreak,
                onChange: e => onChange({ ...settings, sessionsBeforeLongBreak: Number(e.target.value) }),
                min: 1
            })
        )
    );
}
function PomodoroApp() {
    const savedSettings = JSON.parse(localStorage.getItem("pomodoroSettings")) || defaultSettings;
    const [settings, setSettings] = useState(savedSettings);

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
    }, [settings]);
    const WORK_DURATION = settings.work * 60;      // 25 minutes
    const SHORT_BREAK = settings.shortBreak * 60;         // 5 minutes
    const LONG_BREAK = settings.longBreak * 60;         // 15 minutes

    const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState("work"); // work, short, long

    // Countdown effect
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleTimerEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    const [sessionCount, setSessionCount] = useState(0);

    function handleTimerEnd() {
        if (mode === "work") {
            const nextMode = (sessionCount + 1) % settings.sessionsBeforeLongBreak === 0
                ? "long"
                : "short";
            setMode(nextMode);
            setSecondsLeft(nextMode === "short" ? SHORT_BREAK : LONG_BREAK);
            setSessionCount(sessionCount + 1);
        } else {
            setMode("work");
            setSecondsLeft(WORK_DURATION);
        }
        setIsRunning(false);
    }


    function toggleRunning() {
        setIsRunning(!isRunning);
    }

    function resetTimer() {
        setSecondsLeft(mode === "work" ? WORK_DURATION : SHORT_BREAK);
        setIsRunning(false);
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    return React.createElement("div", { style: { textAlign: "center", padding: "20px" } },
        React.createElement("h1", null, "Pomodoro Timer"),
        React.createElement("h2", null, mode.charAt(0).toUpperCase() + mode.slice(1)),
        React.createElement("h1", { style: { fontSize: "48px" } }, formatTime(secondsLeft)),
        React.createElement("button", { onClick: toggleRunning, style: { marginRight: "10px", backgroundColor: "transparent" } },
            isRunning ? "Pause" : "Start"
        ),
        React.createElement("button", { onClick: resetTimer }, "Reset"),
        React.createElement(SettingsPanel, {
            settings,
            onChange: setSettings
        })
    );
}

// Main render function required by Spicetify custom apps
function render() {
    return React.createElement(PomodoroApp);
}
