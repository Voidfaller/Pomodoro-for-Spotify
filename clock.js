// clock.js
(function clock() {
    // Wait for Spicetify to be ready
    if (!Spicetify.Player || !Spicetify.Platform) {
        setTimeout(clock, 100);
        return;
    }

    if (window.__POMODORO_CLOCK__) return;
    window.__POMODORO_CLOCK__ = true;

    const STORAGE_KEY = "gp_pomodoro_remaining";
    const RUNNING_KEY = "gp_pomodoro_running";

    let remaining = 0;

    function getRemainingSeconds() {
        return remaining;
    }

    function start(seconds) {
      remaining = seconds;
      localStorage.setItem(STORAGE_KEY, remaining);
      localStorage.setItem(RUNNING_KEY, "1");
    }

    function stop() {
        localStorage.removeItem(RUNNING_KEY);
    }

    function isRunning() {
        return localStorage.getItem(RUNNING_KEY) === "1";
    }

    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (saved > 0) remaining = saved;

    // Global tick (never dies)
    setInterval(() => {
        if (!isRunning()) return;

        remaining -= 1;
        localStorage.setItem(STORAGE_KEY, remaining);

        if (remaining <= 0) {
            remaining = 0;
            stop();
            window.dispatchEvent(new Event("gp-pomodoro-finished"));
        }
        window.dispatchEvent(new Event("gp-pomodoro-tick"));
    }, 1000);

    window.GPClock = {
        start,
        stop,
        isRunning,
        getRemainingSeconds
    };

})();