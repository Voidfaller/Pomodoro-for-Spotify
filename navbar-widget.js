// navbar-widget.js
(function navbarWidget() {
    if (!Spicetify.React || !Spicetify.ReactDOM) {
        setTimeout(navbarWidget, 100);
        return;
    }

    if (window.__POMODORO_NAVBAR_WIDGET__) return;
    window.__POMODORO_NAVBAR_WIDGET__ = true;

    const React = Spicetify.React;
    const { useState, useEffect } = React;

    function NavbarTimer() {
        const [seconds, setSeconds] = useState(0);
        const [isRunning, setIsRunning] = useState(false);
        const [isOnPomodoroPage, setIsOnPomodoroPage] = useState(false);
        const [phase, setPhase] = useState("work");

        useEffect(() => {
            function syncTimer() {
                if (window.GPClock) {
                    setSeconds(window.GPClock.getRemainingSeconds());
                    setIsRunning(window.GPClock.isRunning());
                    setPhase(window.GPClock.getPhase());
                }
            }

            function checkLocation() {
                const isOnPage = window.location.pathname.includes('/gio-pomodoro');
                setIsOnPomodoroPage(isOnPage);
            }

            // Initial sync
            syncTimer();
            checkLocation();

            // Listen for updates
            window.addEventListener("gp-pomodoro-tick", syncTimer);
            window.addEventListener("gp-pomodoro-finished", syncTimer);
            
            // Listen for navigation changes
            const intervalCheck = setInterval(checkLocation, 500);

            return () => {
                window.removeEventListener("gp-pomodoro-tick", syncTimer);
                window.removeEventListener("gp-pomodoro-finished", syncTimer);
                clearInterval(intervalCheck);
            };
        }, []);

        if (!isRunning || isOnPomodoroPage) {
            return null;
        }

        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        // Icons for each phase
        const workIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>`;
        const breakIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5z"/></svg>`;
        
        const phaseConfig = {
            work: { icon: workIcon, label: "Work" },
            shortBreak: { icon: breakIcon, label: "Short Break" },
            longBreak: { icon: breakIcon, label: "Long Break" }
        };

        const currentPhase = phaseConfig[phase] || phaseConfig.work;

        return React.createElement(
            "div",
            { className: "gp-navbar-timer" },
            React.createElement("span", { 
                className: "gp-navbar-timer-icon",
                dangerouslySetInnerHTML: { __html: currentPhase.icon }
            }),
            React.createElement(
                "div",
                { className: "gp-navbar-timer-info" },
                React.createElement(
                    "div",
                    { className: "gp-navbar-timer-label" },
                    currentPhase.label
                ),
                React.createElement(
                    "div",
                    { className: "gp-navbar-timer-display" },
                    timeStr
                )
            )
        );
    }

    // Wait for the navbar to be ready
    function injectWidget() {
        const searchContainer = document.querySelector(".main-globalNav-searchInputSection");
        
        if (!searchContainer) {
            setTimeout(injectWidget, 100);
            return;
        }

        // Create container for the widget
        const container = document.createElement("div");
        container.className = "gp-navbar-widget-container";
        
        // Insert after the search container's parent
        const parent = searchContainer.parentElement;
        parent.insertBefore(container, searchContainer.nextSibling);

        // Render the timer component
        Spicetify.ReactDOM.createRoot(container).render(
            React.createElement(NavbarTimer)
        );
    }

    injectWidget();
})();
