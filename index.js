const { React, ReactDOM } = Spicetify;
const { useState, useEffect } = React;

function Digit({ value, onChange, decimal = false, disabled = false }) {
    const [hover, setHover] = useState(false);

    let increment, decrement;

    if (decimal) {
        increment = () => onChange((value + 1) % 6);
        decrement = () => onChange((value + 5) % 6);
    }
    else {
        increment = () => onChange((value + 1) % 10);
        decrement = () => onChange((value + 9) % 10);
    }
    return React.createElement(
        "div",
        {
            className: disabled ? "gp-digit gp-digit--disabled" : "gp-digit",
            onMouseEnter: () => !disabled && setHover(true),
            onMouseLeave: () => setHover(false),
        },
        React.createElement("button", { onClick: increment, className: `gp-arrow${disabled || !hover ? " gp-arrow--hidden" : ""}`, disabled: disabled }, "▲"),
        React.createElement("span", { className: "gp-digit-value" }, value),
        React.createElement("button", { onClick: decrement, className: `gp-arrow${disabled || !hover ? " gp-arrow--hidden" : ""}`, disabled: disabled }, "▼")
    );
}

function PomodoroApp() {
    // Initialize digits: 25:00
    const [digits, setDigits] = useState(() => {
        if (window.GPClock && window.GPClock.isRunning()) {
            const seconds = window.GPClock.getRemainingSeconds();
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return [
                Math.floor(minutes / 10),
                minutes % 10,
                Math.floor(secs / 10),
                secs % 10
            ];
        }
        return [2, 5, 0, 0];
    });
    const [pomodoroDigits, setPomodoroDigits] = useState([2, 5, 0, 0]);
    const [shortBreakDigits, setShortBreakDigits] = useState([0, 5, 0, 0]);
    const [longBreakDigits, setLongBreakDigits] = useState([1, 5, 0, 0]);
    const [pomodoroAmount, setPomodoroAmount] = useState(4);
    const [viewMode, setViewMode] = useState("timer");
    const [phase, setPhase] = useState("work");
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // Convert digits to total seconds
    const secondsLeft = digits[0] * 600 + digits[1] * 60 + digits[2] * 10 + digits[3];

    const normalizedPomodoroAmount = Math.max(1, pomodoroAmount);

    useEffect(() => {
        function syncFromClock() {
            const seconds = window.GPClock.getRemainingSeconds();

            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;

            setDigits([
                Math.floor(minutes / 10),
                minutes % 10,
                Math.floor(secs / 10),
                secs % 10
            ]);
        }

        function onFinished() {
            if (phase === "work") {
                const nextCompleted = completedPomodoros + 1;
                if (nextCompleted >= normalizedPomodoroAmount) {
                    setPhase("longBreak");
                    setCompletedPomodoros(0);
                    setDigits([...longBreakDigits]);
                    window.GPClock.start(longBreakDigits[0] * 600 +
                        longBreakDigits[1] * 60 +
                        longBreakDigits[2] * 10 +
                        longBreakDigits[3]);
                } else {
                    setPhase("shortBreak");
                    setCompletedPomodoros(nextCompleted);
                    setDigits([...shortBreakDigits]);
                    window.GPClock.start(shortBreakDigits[0] * 600 +
                        shortBreakDigits[1] * 60 +
                        shortBreakDigits[2] * 10 +
                        shortBreakDigits[3]);
                }
            }
            else {
                setPhase("work");
                setDigits([...pomodoroDigits]);
                window.GPClock.start(pomodoroDigits[0] * 600 +
                    pomodoroDigits[1] * 60 +
                    pomodoroDigits[2] * 10 +
                    pomodoroDigits[3]);

            }

        }
        window.addEventListener("gp-pomodoro-tick", syncFromClock);
        window.addEventListener("gp-pomodoro-finished", onFinished);

        syncFromClock();

        return () => {
            window.removeEventListener("gp-pomodoro-tick", syncFromClock);
            window.removeEventListener("gp-pomodoro-finished", onFinished);
        };
    }, [
        phase,
        completedPomodoros,
        normalizedPomodoroAmount,
        pomodoroDigits,
        shortBreakDigits,
        longBreakDigits
    ])

    function toggleRunning() {
        if (isRunning) {
            window.GPClock.stop();
            setIsRunning(false);
        }
        else {
            window.GPClock.start(secondsLeft);
            setIsRunning(true);
        }
    }

    function resetTimer() {
        window.GPClock.stop();
        setDigits([...pomodoroDigits]);
        setPhase("work");
        setCompletedPomodoros(0);
        setIsRunning(false);
    }

    function toggleViewMode() {
        setViewMode(prev => {
            if (prev === "timer") return "longBreak";
            if (prev === "longBreak") return "shortBreak";
            if (prev === "shortBreak") return "pomodoroAmount";
            return "timer";
        });
    }

    const viewLabel = (() => {
        if (isRunning) {
            if (phase === "work") return "Work";
            if (phase === "shortBreak") return "Short Break";
            if (phase === "longBreak") return "Long Break";
        }
        if (viewMode === "timer") return "Timer";
        if (viewMode === "longBreak") return "Long Break";
        if (viewMode === "shortBreak") return "Short Break";
        return "Pomodoro Cycles";
    })();

    const renderTimeDigits = (timeDigits, setTimeDigits, disabled) => ([
        React.createElement(Digit, {
            key: "t0",
            value: timeDigits[0],
            onChange: val => setTimeDigits([val, timeDigits[1], timeDigits[2], timeDigits[3]]),
            disabled,
        }),
        React.createElement(Digit, {
            key: "t1",
            value: timeDigits[1],
            onChange: val => setTimeDigits([timeDigits[0], val, timeDigits[2], timeDigits[3]]),
            disabled,
        }),
        React.createElement("span", { key: "colon", className: "gp-colon" }, ":"),
        React.createElement(Digit, {
            key: "t2",
            value: timeDigits[2],
            onChange: val => setTimeDigits([timeDigits[0], timeDigits[1], val, timeDigits[3]]),
            decimal: true,
            disabled,
        }),
        React.createElement(Digit, {
            key: "t3",
            value: timeDigits[3],
            onChange: val => setTimeDigits([timeDigits[0], timeDigits[1], timeDigits[2], val]),
            disabled,
        }),
    ]);

    const renderAmountDigits = (disabled) => {
        const tens = Math.floor(pomodoroAmount / 10);
        const ones = pomodoroAmount % 10;

        return [
            React.createElement(Digit, {
                key: "a0",
                value: tens,
                onChange: val => setPomodoroAmount((val * 10) + ones),
                disabled,
            }),
            React.createElement(Digit, {
                key: "a1",
                value: ones,
                onChange: val => setPomodoroAmount((tens * 10) + val),
                disabled,
            })
        ];
    };

    const renderViewDigits = () => {
        if (viewMode === "timer") {
            return renderTimeDigits(digits, setDigits, isRunning);
        }

        if (viewMode === "longBreak") {
            return renderTimeDigits(longBreakDigits, setLongBreakDigits, isRunning);
        }

        if (viewMode === "shortBreak") {
            return renderTimeDigits(shortBreakDigits, setShortBreakDigits, isRunning);
        }

        return renderAmountDigits(isRunning);
    };

    const appClassName = `gp-app${isRunning ? " gp-running" : ""} gp-phase-${phase}`;

    const whiteCircle = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2"/>
</svg>
`);
    const playIcon = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
  <path d="M8 5v14l11-7z"/>
</svg>
`);
    const pauseIcon = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
</svg>
`);
    const resetIcon = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
</svg>
`); return React.createElement(
        "div",
        { className: appClassName },
        // View Label
        React.createElement("div", { className: "gp-view-label gp-animate", key: `label-${viewMode}` }, viewLabel),

        // Timer + toggle button container
        React.createElement("div", { className: "gp-timer-container gp-animate", key: viewMode },
            React.createElement("div", { className: "gp-timer" }, renderViewDigits()),
            React.createElement("img", { src: `data:image/svg+xml,${whiteCircle}`, onClick: toggleViewMode, className: "gp-toggle-view-btn", title: "Toggle View", alt: "Toggle View" })
        ),
        isRunning && viewMode !== "timer" && React.createElement("div", { className: "gp-view-note" }, "Settings locked while running"),
        React.createElement("div", { className: "gp-controls" },
            React.createElement("img", { 
                src: `data:image/svg+xml,${isRunning ? pauseIcon : playIcon}`, 
                onClick: toggleRunning, 
                className: "gp-icon-button gp-button--spaced",
                title: isRunning ? "Pause" : "Start",
                alt: isRunning ? "Pause" : "Start"
            }),
            React.createElement("img", { 
                src: `data:image/svg+xml,${resetIcon}`, 
                onClick: resetTimer, 
                className: "gp-icon-button gp-button--spaced",
                title: "Reset",
                alt: "Reset"
            }),
        )
    );
}


// Required by Spicetify
function render() {
    return React.createElement(PomodoroApp);
}
