import React, { forwardRef, useState } from "react";
import { generateUniqueId } from "utils/functions";
import ClearIcon from "/public/assets/icons/clear-text-icon.svg";
import { TAB_INDEX_HIDDEN } from "../../../constants/accessibility-types";
import useTranslate from "../../../hooks/useTranslate";
import basic from "./index.module.scss";
import clsx from "clsx";
import SRContent from "../../accessibility/srcontent";

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

const AnimatedInput = forwardRef((props, ref) => {
	/*
          Props
      */
	const {
		id = generateUniqueId(16),
		autocomplete = true,
		placeholder = "",
		errorMsg,
		value = "",
		className,
		errorClassName = "",
		showError,
		type,
		name,
		onFocus = null,
		onBlur = null,
		showCloseIcon = false,
		placeHolderClass = "",
		focusPlaceHolderClass = "",
		maxLength,
		persistFocus = false,
		wrapperFocusClass = "",
		extraStyles = {},
		ariaRequired = false,
		required = "",
		ariaDescribedBy = "",
		ariaLabel = "",
		disabled = false,
		ariaHidden = false,
	} = props;

	const [isFocused, setIsFocused] = useState(false);
	const [isFocusedClose, setIsFocusedClose] = useState(false);
	const translate = useTranslate();
	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};

	/*
          Text stay animated when input is not undefined
      */
	const animatedPlaceholder = (e) => {
		if (maxLength) {
			if (e.target.value.length <= maxLength) {
				props.onChange(e);
			}
		} else {
			props.onChange(e);
		}
	};

	function clearText() {
		const e = {
			target: {
				value: "",
				name,
			},
		};
		typeof props.onChange === "function" && props.onChange(e);
		typeof props.onBlur === "function" && props.onBlur(e);
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

	function onFocusCloseIcon() {
		setIsFocusedClose(true);
	}

	function onBlurCloseIcon() {
		setIsFocusedClose(false);
	}

	const isAnimated = value !== "" || isFocused;

	const shouldRemainFocused = persistFocus && value.length > 0;
	const wrapperFocus = shouldRemainFocused || isFocused ? wrapperFocusClass : "";
	let pattern = ".{0,}";
	if (type === "number") {
		pattern = "\\d*";
	} else if (type === "tel") {
		pattern = "/[0-9-]+/v";
	}
	return (
		// Input wrapper
		<div
			aria-hidden={ariaHidden}
			className={clsx(
				styles("animated-input-wrapper"),
				className,
				wrapperFocus,
				showError ? styles("error") : "",
			)}>
			{/* Input */}
			<input
				ref={ref}
				onChange={(e) => animatedPlaceholder(e)}
				autoComplete={autocomplete ? "" : "new-password"}
				className={styles("input")}
				value={value}
				type={type}
				pattern={pattern}
				name={name}
				id={id}
				onFocus={onFocusHandler}
				onBlur={onBlurHandler}
				maxLength={maxLength}
				aria-required={ariaRequired}
				aria-invalid={showError}
				required={required}
				aria-describedby={ariaDescribedBy}
				aria-label={ariaLabel}
				disabled={disabled}
			/>
			{/* Placeholder */}
			<label
				aria-hidden={true}
				htmlFor={id}
				className={clsx(
					styles("placeholder"),
					!isAnimated ? "" : styles("animated"),
					placeHolderClass,
					isFocused || shouldRemainFocused ? " " + focusPlaceHolderClass : "",
				)}>
				{showError && errorMsg ? (
					<SRContent message={translate("accessibility_errorMsg") + errorMsg} />
				) : null}
				{placeholder}
			</label>

			{showCloseIcon &&
				(isFocused || shouldRemainFocused || isFocusedClose) &&
				value !== "" && (
					<button
						onClick={clearText}
						className={styles("clear-icon")}
						onFocus={onFocusCloseIcon}
						onBlur={onBlurCloseIcon}
						aria-label={translate("accessibility_animatedInput_clearInput")}>
						<img src={ClearIcon.src} alt={""} />
					</button>
				)}

			{/* Error message */}
			{showError && (
				<span className={clsx(styles("error-text"), errorClassName)}>
					{errorMsg}
				</span>
			)}
		</div>
	);
});
AnimatedInput.displayName = "AnimatedInput";
export default AnimatedInput;
