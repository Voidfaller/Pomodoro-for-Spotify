function PomodoroApp() {
    // Load saved settings or use defaults
    const savedSettings = loadSettings();
    
    const [pomodoroDigits, setPomodoroDigits] = useState(savedSettings?.pomodoroDigits || [2, 5, 0, 0]);
    const [shortBreakDigits, setShortBreakDigits] = useState(savedSettings?.shortBreakDigits || [0, 5, 0, 0]);
    const [longBreakDigits, setLongBreakDigits] = useState(savedSettings?.longBreakDigits || [1, 5, 0, 0]);
    const [pomodoroAmount, setPomodoroAmount] = useState(savedSettings?.pomodoroAmount || 4);
    
    // Initialize phase from clock
    const [phase, setPhase] = useState(() => {
        return (window.GPClock && window.GPClock.getPhase) ? window.GPClock.getPhase() : "work";
    });
    
    // Initialize digits based on current phase
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
        // Load digits based on current phase
        const currentPhase = (window.GPClock && window.GPClock.getPhase) ? window.GPClock.getPhase() : "work";
        if (currentPhase === "longBreak") {
            return [...(savedSettings?.longBreakDigits || [1, 5, 0, 0])];
        } else if (currentPhase === "shortBreak") {
            return [...(savedSettings?.shortBreakDigits || [0, 5, 0, 0])];
        }
        return [...(savedSettings?.pomodoroDigits || [2, 5, 0, 0])];
    });
    const [viewMode, setViewMode] = useState("timer");
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [continuousTimer, setContinuousTimer] = useState(savedSettings?.continuousTimer || false);

    // Create refs for digit inputs
    const digitRefs = React.useRef([]);

    // Convert digits to total seconds
    const secondsLeft = digits[0] * 600 + digits[1] * 60 + digits[2] * 10 + digits[3];

    const normalizedPomodoroAmount = Math.max(1, pomodoroAmount);

    // Save settings whenever they change
    useEffect(() => {
        saveSettings({
            pomodoroDigits,
            shortBreakDigits,
            longBreakDigits,
            pomodoroAmount,
            continuousTimer
        });
    }, [pomodoroDigits, shortBreakDigits, longBreakDigits, pomodoroAmount, continuousTimer]);

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
            // Reload settings to get the latest user-configured values
            const currentSettings = loadSettings();
            const currentPomodoroDigits = currentSettings?.pomodoroDigits || [2, 5, 0, 0];
            const currentShortBreakDigits = currentSettings?.shortBreakDigits || [0, 5, 0, 0];
            const currentLongBreakDigits = currentSettings?.longBreakDigits || [1, 5, 0, 0];
            const isContinuous = currentSettings?.continuousTimer || false;
            
            // Stop and immediately restart with the appropriate phase (if continuous) or just stop
            if (phase === "work") {
                const nextCompleted = completedPomodoros + 1;
                if (nextCompleted >= normalizedPomodoroAmount) {
                    const nextSeconds = currentLongBreakDigits[0] * 600 +
                        currentLongBreakDigits[1] * 60 +
                        currentLongBreakDigits[2] * 10 +
                        currentLongBreakDigits[3];
                    setPhase("longBreak");
                    window.GPClock.setPhase("longBreak");
                    setCompletedPomodoros(0);
                    setDigits([...currentLongBreakDigits]);
                    if (isContinuous) {
                        window.GPClock.start(nextSeconds);
                        setIsRunning(true);
                    } else {
                        setIsRunning(false);
                    }
                } else {
                    const nextSeconds = currentShortBreakDigits[0] * 600 +
                        currentShortBreakDigits[1] * 60 +
                        currentShortBreakDigits[2] * 10 +
                        currentShortBreakDigits[3];
                    setPhase("shortBreak");
                    window.GPClock.setPhase("shortBreak");
                    setCompletedPomodoros(nextCompleted);
                    setDigits([...currentShortBreakDigits]);
                    if (isContinuous) {
                        window.GPClock.start(nextSeconds);
                        setIsRunning(true);
                    } else {
                        setIsRunning(false);
                    }
                }
            }
            else {
                const nextSeconds = currentPomodoroDigits[0] * 600 +
                    currentPomodoroDigits[1] * 60 +
                    currentPomodoroDigits[2] * 10 +
                    currentPomodoroDigits[3];
                setPhase("work");
                window.GPClock.setPhase("work");
                setDigits([...currentPomodoroDigits]);
                if (isContinuous) {
                    window.GPClock.start(nextSeconds);
                    setIsRunning(true);
                } else {
                    setIsRunning(false);
                }
            }

        }
        
        // Sync running state from clock to ensure UI matches actual timer state
        if (window.GPClock && window.GPClock.isRunning()) {
            setIsRunning(true);
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
        // Check actual clock state instead of relying on local state
        const clockIsRunning = window.GPClock && window.GPClock.isRunning();
        
        if (clockIsRunning) {
            window.GPClock.stop();
            setIsRunning(false);
        }
        else {
            // Use pomodoroDigits when starting from stopped state
            const startSeconds = pomodoroDigits[0] * 600 + pomodoroDigits[1] * 60 + pomodoroDigits[2] * 10 + pomodoroDigits[3];
            setDigits([...pomodoroDigits]);
            window.GPClock.setPhase(phase);
            window.GPClock.start(startSeconds);
            setIsRunning(true);
        }
    }

    function resetTimer() {
        window.GPClock.stop();
        window.GPClock.setPhase("work");
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
            inputRef: el => digitRefs.current[0] = el,
            onInputComplete: () => digitRefs.current[1]?.focus(),
        }),
        React.createElement(Digit, {
            key: "t1",
            value: timeDigits[1],
            onChange: val => setTimeDigits([timeDigits[0], val, timeDigits[2], timeDigits[3]]),
            disabled,
            inputRef: el => digitRefs.current[1] = el,
            onInputComplete: () => digitRefs.current[2]?.focus(),
        }),
        React.createElement("span", { key: "colon", className: "gp-colon" }, ":"),
        React.createElement(Digit, {
            key: "t2",
            value: timeDigits[2],
            onChange: val => setTimeDigits([timeDigits[0], timeDigits[1], val, timeDigits[3]]),
            decimal: true,
            disabled,
            inputRef: el => digitRefs.current[2] = el,
            onInputComplete: () => digitRefs.current[3]?.focus(),
        }),
        React.createElement(Digit, {
            key: "t3",
            value: timeDigits[3],
            onChange: val => setTimeDigits([timeDigits[0], timeDigits[1], timeDigits[2], val]),
            disabled,
            inputRef: el => digitRefs.current[3] = el,
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
                inputRef: el => digitRefs.current[0] = el,
                onInputComplete: () => digitRefs.current[1]?.focus(),
            }),
            React.createElement(Digit, {
                key: "a1",
                value: ones,
                onChange: val => setPomodoroAmount((tens * 10) + val),
                disabled,
                inputRef: el => digitRefs.current[1] = el,
            })
        ];
    };

    const renderViewDigits = () => {
        if (viewMode === "timer") {
            // When in timer mode and not running, edit pomodoroDigits directly
            if (!isRunning) {
                const updatePomodoroDigits = (newDigits) => {
                    setPomodoroDigits(newDigits);
                    setDigits(newDigits);
                };
                return renderTimeDigits(pomodoroDigits, updatePomodoroDigits, isRunning);
            }
            // When running, just display the current digits
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
        // Settings modal
        React.createElement(SettingsModal, {
            isOpen: showSettings,
            onClose: () => setShowSettings(false),
            continuousTimer,
            onContinuousTimerChange: setContinuousTimer
        }),
        // View Label
        React.createElement("div", { className: "gp-view-label gp-animate", key: `label-${viewMode}` }, viewLabel),

        // Timer + toggle button container
        React.createElement("div", { className: "gp-timer-container gp-animate", key: viewMode },
            React.createElement("div", { className: "gp-timer" }, renderViewDigits()),
            React.createElement("img", { src: `data:image/svg+xml,${ICONS.whiteCircle}`, onClick: toggleViewMode, className: "gp-toggle-view-btn", title: "Toggle View", alt: "Toggle View" })
        ),
        isRunning && viewMode !== "timer" && React.createElement("div", { className: "gp-view-note" }, "Settings locked while running"),
        React.createElement("div", { className: "gp-controls" },
            React.createElement("img", { 
                src: `data:image/svg+xml,${isRunning ? ICONS.pauseIcon : ICONS.playIcon}`, 
                onClick: toggleRunning, 
                className: "gp-icon-button gp-button--spaced",
                title: isRunning ? "Pause" : "Start",
                alt: isRunning ? "Pause" : "Start"
            }),
            React.createElement("img", { 
                src: `data:image/svg+xml,${ICONS.resetIcon}`, 
                onClick: resetTimer, 
                className: "gp-icon-button gp-button--spaced",
                title: "Reset",
                alt: "Reset"
            }),
            React.createElement("img", { 
                src: `data:image/svg+xml,${ICONS.settingsIcon}`, 
                onClick: () => setShowSettings(true), 
                className: "gp-icon-button gp-button--spaced",
                title: "Settings",
                alt: "Settings"
            }),
        )
    );
}
