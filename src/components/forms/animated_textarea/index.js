import React, {useEffect, useRef, useState} from "react";
import {generateUniqueId} from "utils/functions";
import ClearIcon from "/public/assets/icons/clear-text-icon.svg";
import clsx from "clsx";

import styles from "./index.module.scss";

/**
 *
 ## Animated input
 ## Input with animated place holder
 ##    parameters:
 ###      showError    - true / false, true = showing the error message
 ###      errorMessage - If input is wrong, show this text message
 ###      placeholder  - the animated string inside the input
 ###      onChange     - Needed to change the value
 ###      className    - Adding new class
 ###      autocomplete - true / false
 ###      value        - input value
 ###      name         - input name
 ###      type         - input type

 **/

function AnimatedTextArea(props) {
    const ref = useRef(null);

    /*
          Props
      */
    const {
        errorMsg = "Please fill out this field",
        id = generateUniqueId(16),
        placeholder = "",
        value = "",
        className,
        showError,
        type,
        name,
        onFocus = null,
        onBlur = null,
        showCloseIcon = false,
        shouldGrow = false,
    } = props;
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (ref.current && shouldGrow && ref.current.scrollHeight) {
            ref.current.style.height = "inherit";
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [value, ref.current]);

    /*
          Text stay animated when input is not undefined
      */
    const animatedPlaceholder = (e) => {
        props.onChange(e);
    };

    const isAnimated = value !== "";

    function onFocusHandler() {
        setIsFocused(true);
        typeof onFocus === "function" && onFocus();
    }

    function onBlurHandler() {
        setTimeout(() => {
            setIsFocused(false);
        }, 100);
        typeof onBlur === "function" && onBlur();
    }

    function clearText() {
        const e = {
            target: {
                value: "",
                name,
            },
        };
        props.onChange(e);
    }

    return (
        /*
                Text area wrapper
            */
        <div className={clsx(styles["animated-textarea-wrapper"], className)}>
            {/*
            Text area
          */}
            <textarea
                rows={1}
                onChange={(e) => animatedPlaceholder(e)}
                className={styles["textarea"]}
                value={value}
                name={name}
                type={type}
                id={id}
                onFocus={onFocusHandler}
                onBlur={onBlurHandler}
                ref={ref}
            />

            <label
                htmlFor={id}
                className={clsx(
                    styles["placeholder"],
                    !isAnimated ? "" : styles["animated"]
                )}
            >
                {placeholder}
            </label>

            {/*
            Placeholder
          */}

            {showCloseIcon && isFocused && value !== "" && (
                <button onClick={clearText} tabIndex={-1}>
                    <img
                        className={styles["clear-icon"]}
                        src={ClearIcon.src}
                        alt={''}
                    />
                </button>
            )}

            {/*
            Error message
          */}
            {showError && <span className={styles["error-text"]}>{errorMsg}</span>}
        </div>
    );
}

export default AnimatedTextArea;
