const { React, ReactDOM } = Spicetify;
const { useState, useEffect } = React;

function PomodoroApp() {
    const WORK_DURATION = 25 * 60;      // 25 minutes
    const SHORT_BREAK = 5 * 60;         // 5 minutes
    const LONG_BREAK = 15 * 60;         // 15 minutes

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

    function handleTimerEnd() {
        if (mode === "work") setMode("short");
        else if (mode === "short") setMode("work");
        else setMode("work");

        setSecondsLeft(mode === "work" ? SHORT_BREAK : WORK_DURATION);
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
        React.createElement("button", { onClick: resetTimer }, "Reset")
    );
}

// Main render function required by Spicetify custom apps
function render() {
    return React.createElement(PomodoroApp);
}
