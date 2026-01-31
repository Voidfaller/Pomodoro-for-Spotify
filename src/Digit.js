function Digit({ value, onChange, decimal = false, disabled = false, inputRef, onInputComplete }) {
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

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        if (inputValue === '') {
            onChange(0);
        } else {
            let num = parseInt(inputValue, 10);
            if (isNaN(num)) return;
            
            if (decimal) {
                num = Math.max(0, Math.min(5, num));
            } else {
                num = Math.max(0, Math.min(9, num));
            }
            onChange(num);
        }
        // Reset input to display the digit value
        e.target.value = '';
        // Trigger focus on next input
        if (onInputComplete) {
            onInputComplete();
        }
    };

    return React.createElement(
        "div",
        {
            className: disabled ? "gp-digit gp-digit--disabled" : "gp-digit",
            onMouseEnter: () => !disabled && setHover(true),
            onMouseLeave: () => setHover(false),
        },
        React.createElement("button", { onClick: increment, className: `gp-arrow${disabled || !hover ? " gp-arrow--hidden" : ""}`, disabled: disabled }, "▲"),
        React.createElement("input", { 
            ref: inputRef,
            type: "text", 
            className: "gp-digit-input",
            maxLength: "1",
            placeholder: String(value),
            onChange: handleInputChange,
            disabled: disabled,
            onKeyDown: (e) => {
                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                    e.preventDefault();
                }
            }
        }),
        React.createElement("button", { onClick: decrement, className: `gp-arrow${disabled || !hover ? " gp-arrow--hidden" : ""}`, disabled: disabled }, "▼")
    );
}
