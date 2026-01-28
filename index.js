const { React, ReactDOM } = Spicetify;
const { useState, useEffect } = React;

function Digit({ value, onChange, decimal = false }) {
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
            style: { position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", margin: "0 2px" },
            onMouseEnter: () => setHover(true),
            onMouseLeave: () => setHover(false),
        },
        hover && React.createElement("button", { onClick: increment, style: arrowStyle }, "▲"),
        React.createElement("span", { style: { fontSize: "48px", width: "36px", textAlign: "center" } }, value),
        hover && React.createElement("button", { onClick: decrement, style: arrowStyle }, "▼")
    );
}

const arrowStyle = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: "1",
    padding: "0",
    margin: "0",
};

function PomodoroApp() {
    // Initialize digits: 25:00
    const [digits, setDigits] = useState([2, 5, 0, 0]);
    const [isRunning, setIsRunning] = useState(false);

    // Convert digits to total seconds
    const secondsLeft = digits[0] * 600 + digits[1] * 60 + digits[2] * 10 + digits[3];

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            if (secondsLeft <= 0) {
                clearInterval(interval);
                setIsRunning(false);
                return;
            }
            let newSeconds = secondsLeft - 1;
            setDigits([
                Math.floor(newSeconds / 600),
                Math.floor((newSeconds % 600) / 60),
                Math.floor((newSeconds % 60) / 10),
                newSeconds % 10,
            ]);
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, digits]);

    function toggleRunning() {
        setIsRunning(!isRunning);
    }

    function resetTimer() {
        setDigits([2, 5, 0, 0]);
        setIsRunning(false);
    }

    return React.createElement(
        "div",
        { style: { textAlign: "center", padding: "20px", height: "100vh", width: "100vw" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", height: "20vh" } },
            React.createElement(Digit, { value: digits[0], onChange: val => setDigits([val, digits[1], digits[2], digits[3]]) }),
            React.createElement(Digit, { value: digits[1], onChange: val => setDigits([digits[0], val, digits[2], digits[3]]) }),
            React.createElement("span", { style: { fontSize: "48px", margin: "0 4px" } }, ":"),
            React.createElement(Digit, { value: digits[2], onChange: val => setDigits([digits[0], digits[1], val, digits[3]]), decimal: true }),
            React.createElement(Digit, { value: digits[3], onChange: val => setDigits([digits[0], digits[1], digits[2], val]) }),
        ),
        React.createElement("div", { style: { marginTop: "20px" } },
            React.createElement("button", { onClick: toggleRunning, style: { marginRight: "10px" } }, isRunning ? "Pause" : "Start"),
            React.createElement("button", { onClick: resetTimer }, "Reset")
        )
    );
}

// Required by Spicetify
function render() {
    return React.createElement(PomodoroApp);
}
