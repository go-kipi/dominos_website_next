import React, {useRef, useState} from "react";

import basic from "./TextAreaBox.module.scss";
import clsx from "clsx";
import {generateUniqueId} from "utils/functions";

function TextAreaBox(props) {
    const {
        id = generateUniqueId(16),

        placeholder = "",
        errorMsg,
        value = "",
        className,
        ariaLabel,
        showError,
        type,
        name,
        onFocus = null,
        onBlur = null,
        extraStyles = {},
        ariaRequired = false,
    } = props;
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef();

    function styles(className) {
        return (basic[className] || "") + " " + (extraStyles[className] || "");
    }

    function onFocusHandler() {
        setIsFocused(true);
        typeof onFocus === "function" && onFocus();
    }

    function onBlurHandler(e) {
        setTimeout(() => {
            setIsFocused(false);
        }, 100);
        typeof onBlur === "function" && onBlur(e);
    }

    function onChangeHandler(e) {
        typeof props.onChange === "function" && props.onChange(e);
    }

    function onOuterClick() {
        ref.current.focus();
    }

    return (
        <div
            className={clsx(
                styles("text-area-wrapper"),
                showError ? styles("error") : "",
                isFocused ? styles("focus") : "",
                className
            )}
            onClick={onOuterClick}
        >
      <span
          className={clsx(
              styles("placeholder"),
              isFocused ? styles("focus") : "",
              isFocused || value ? styles("has-value") : ""
          )}
      >
        {placeholder}
      </span>

            <textarea
                rows={4}
                onChange={onChangeHandler}
                className={styles("textarea")}
                value={value}
                name={name}
                type={type}
                id={id}
                onFocus={onFocusHandler}
                onBlur={onBlurHandler}
                ref={ref}
                aria-required={ariaRequired}
                aria-invalid={showError}
                aria-label={ariaLabel}
            />

            {showError && (
                <span className={clsx(styles("error-text"))}>{errorMsg}</span>
            )}
        </div>
    );
}

export default TextAreaBox;
