// Settings modal component
function SettingsModal({ isOpen, onClose, continuousTimer, onContinuousTimerChange, audioNotifications, onAudioNotificationsChange }) {
    if (!isOpen) return null;
    
    return React.createElement(
        "div",
        { className: "gp-modal-overlay", onClick: onClose },
        React.createElement(
            "div",
            { className: "gp-modal", onClick: (e) => e.stopPropagation() },
            React.createElement("h2", { className: "gp-modal-title" }, "Settings"),
            React.createElement(
                "div",
                { className: "gp-settings-item" },
                React.createElement(
                    "label",
                    { className: "gp-setting-label" },
                    React.createElement("input", {
                        type: "checkbox",
                        checked: continuousTimer,
                        onChange: (e) => onContinuousTimerChange(e.target.checked),
                        className: "gp-checkbox"
                    }),
                    React.createElement("span", { className: "gp-label-text" }, "Continuous Timer")
                ),
                React.createElement("p", { className: "gp-setting-description" }, "Automatically start breaks and work sessions without pausing")
            ),
            React.createElement(
                "div",
                { className: "gp-settings-item" },
                React.createElement(
                    "label",
                    { className: "gp-setting-label" },
                    React.createElement("input", {
                        type: "checkbox",
                        checked: audioNotifications,
                        onChange: (e) => onAudioNotificationsChange(e.target.checked),
                        className: "gp-checkbox"
                    }),
                    React.createElement("span", { className: "gp-label-text" }, "Audio Notifications")
                ),
                React.createElement("p", { className: "gp-setting-description" }, "Play a subtle chime sound when timer completes")
            ),
            React.createElement("button", { onClick: onClose, className: "gp-modal-close" }, "Close")
        )
    );
}
