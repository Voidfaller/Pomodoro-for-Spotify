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

        useEffect(() => {
            function syncTimer() {
                if (window.GPClock) {
                    setSeconds(window.GPClock.getRemainingSeconds());
                    setIsRunning(window.GPClock.isRunning());
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

        return React.createElement(
            "div",
            { className: "gp-navbar-timer" },
            React.createElement(
                "div",
                { className: "gp-navbar-timer-display" },
                timeStr
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
