import React, { forwardRef, useEffect, useState } from "react";
import ClearIcon from "/public/assets/icons/clear-text-icon.svg";

import basic from "./index.module.scss";
import clsx from "clsx";
import useTranslate from "../../../hooks/useTranslate";
import LanguageDirectionService from "services/LanguageDirectionService";

const TextInputRef = (props, ref) => {
	const {
		id = "",
		centerInput = false,
		required = false,
		maxLength = undefined,
		type,
		name,
		className = "",
		placeholder = "",
		label = "",
		value = "",
		onChange,
		onClearText = null,
		inputClassName = "",
		showError,
		errorMessage = "empty or undefined errorMessage prop",
		pattern,
		tabIndex = 0,
		clearClassName = "",
		showClearIcon = false,
		disabled = false,
		autoFocus = false,
		autoComplete = true,
		extraStyles = {},
		ariaLabel = "",
		ariaDescribedBy = "",
		ariaInvalid = false,
		ariaAutoComplete = "",
		role = "",
		onFocus = () => {},
		onBlur = () => {},
		onKeyDown = () => {},
	} = props;

	const isRTl = LanguageDirectionService.isRTL();

	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};
	const translate = useTranslate();
	const centerClassName = centerInput
		? clsx(inputClassName, styles("centered"))
		: inputClassName;
	const [isFocus, setIsFocus] = useState(false);

	useEffect(() => {
		const elem = getElement();

		const multi = isRTl ? -1 : 1;

		if (elem) {
			elem.scrollLeft = multi * elem.scrollWidth;
		}
	}, [value]);

	function onChangeHandler(e) {
		if (
			maxLength === undefined ||
			(maxLength !== undefined && e.target.value.length <= maxLength)
		) {
			onChange(e);
		} else {
			e.target.value = value;
			onChange(e);
		}
		if (e.target.value.length === 0 || value.length - e.target.value.length > 1) {
			clearText();
			onChange(e);
		}
	}

	function getElement() {
		if (ref?.current) {
			return ref.current;
		} else if (id) {
			return document.getElementById(id);
		}
	}

	function onFocusHandler(e) {
		setIsFocus(true);
		onFocus(e);
	}

	function onBlurHandler(e) {
		onBlur(e);
		// const elem = getElement();

		// const currentElem = e.nativeEvent.target;

		// if (currentElem !== elem) {
		// 	setTimeout(() => {
		// 		setIsFocus(false);
		// 		onBlur(e);
		// 	}, 200);
		// }
	}

	function clearText() {
		const e = {
			target: {
				value: "",
				name,
			},
		};
		onChange(e);
		typeof onClearText === "function" && onClearText();

		const elem = getElement();

		if (elem) {
			elem.focus();
		}
	}

	let inputMode = undefined;
	let inputPattern = pattern || ".{0,}";
	if (type === "number") {
		inputPattern = "\\d*";
		inputMode = "decimal";
	} else if (type === "tel") {
		inputPattern = "[0-9-]+";
		inputMode = "tel";
	}

	return (
		<div
			className={clsx(
				styles("input_wrapper"),
				className,
				showError ? styles("error") : "",
				isFocus ? styles("focus") : "",
				showClearIcon ? styles("has-clear-icon") : "",
			)}>
			{label !== "" && <label> {label}:</label>}
			<input
				inputMode={inputMode}
				type={type}
				name={name}
				placeholder={placeholder}
				value={value}
				onChange={onChangeHandler}
				tabIndex={tabIndex}
				className={centerClassName}
				required={required}
				maxLength={maxLength}
				ref={ref}
				pattern={inputPattern}
				onFocus={onFocusHandler}
				onBlur={onBlurHandler}
				onWheel={(e) => {
					e.target.blur();
				}}
				disabled={disabled}
				autoFocus={autoFocus}
				autoComplete={autoComplete ? "" : "new-password"}
				aria-label={ariaLabel}
				aria-describedby={ariaDescribedBy}
				aria-autocomplete={ariaAutoComplete}
				role={role}
				aria-invalid={ariaInvalid}
				id={id}
				onKeyDown={onKeyDown}
			/>
			{showClearIcon && value !== "" && (
				<button
					onClick={clearText}
					aria-label={translate("accessibility_imageAlt_deleteField")}
					className={styles("clear-icon-wrapper")}>
					<img
						className={clsx(styles("clear-icon"), clearClassName)}
						src={ClearIcon.src}
						aria-hidden={true}
					/>
				</button>
			)}
			{showError && (
				<div className={clsx(styles("error_text"))}>{errorMessage}</div>
			)}
		</div>
	);
};

const TextInput = forwardRef(TextInputRef);

export default TextInput;
