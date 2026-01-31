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
    const [digits, setDigits] = useState([2, 5, 0, 0]);
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

    const viewLabel = viewMode === "timer"
        ? "Timer"
        : viewMode === "longBreak"
            ? "Long Break"
            : viewMode === "shortBreak"
                ? "Short Break"
                : "Pomodoro Cycles";

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

    return React.createElement(
        "div",
        { className: appClassName },
        React.createElement("div", { className: "gp-view-label gp-animate", key: `label-${viewMode}` }, viewLabel),
        React.createElement("div", { className: "gp-timer gp-animate", key: viewMode }, renderViewDigits()),
        isRunning && viewMode !== "timer" && React.createElement("div", { className: "gp-view-note" }, "Settings locked while running"),
        React.createElement("div", { className: "gp-controls" },
            React.createElement("button", { onClick: toggleRunning, className: "gp-button gp-button--spaced" }, isRunning ? "Pause" : "Start"),
            React.createElement("button", { onClick: resetTimer, className: "gp-button gp-button--spaced" }, "Reset"),
            React.createElement("button", { onClick: toggleViewMode, className: "gp-button" }, "Toggle View")
        )
    );
}


// Required by Spicetify
function render() {
    return React.createElement(PomodoroApp);
}
