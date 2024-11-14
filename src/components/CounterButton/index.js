/* eslint-disable jsx-a11y/role-supports-aria-props */
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import basic from "./index.module.scss";
import PlusIcon from "/public/assets/buttons/plus.svg";
import MinusIcon from "/public/assets/buttons/minus.svg";
import useTranslate from "../../hooks/useTranslate";

const CounterButton = (props) => {
	const {
		name,
		value,
		min = 1,
		max = 10,
		className = "",
		disabled = false,
		onChange = () => {},
		onDecrement = () => {},
		onIncrement = () => {},
		onZeroReached = () => {},
		ariaLabelAdd = "",
		ariaLabelRemove = "",
		ariaDescription = "",
		baseAriaLabel = "",
		extraStyles = {},
		focusOnLayout = false,
		btnStyle = {},
	} = props;

	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};
	const translate = useTranslate();
	const pressedButton = useRef();
	const addButtonRef = useRef();
	const removeButtonRef = useRef();
	const [currentCount, setCurrentCount] = useState(value);
	const [debounceDisabled, setDebounceDisabled] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setCurrentCount(value);
		}, 220);
		return () => clearTimeout(timer);
	}, [value]);

	useEffect(() => {
		if (pressedButton.current === "minus") {
			removeButtonRef.current?.focus();
			pressedButton.current = undefined;
		} else if (pressedButton.current === "plus") {
			addButtonRef.current?.focus();
			pressedButton.current = undefined;
		}
	}, [pressedButton.current]);

	useEffect(() => {
		let timeoutId;
		if (debounceDisabled) {
			timeoutId = setTimeout(() => {
				setDebounceDisabled(false);
			}, 500);
		}
		return () => {
			clearTimeout(timeoutId);
		};
	}, [debounceDisabled]);

	useEffect(() => {
		if (focusOnLayout) {
			addButtonRef.current?.focus();
		}
	}, [focusOnLayout]);

	const debounceButtonClick = (type) => {
		setDebounceDisabled(true);
		setTimeout(() => {
			setDebounceDisabled(false);
			pressedButton.current = type;
		}, 200);
	};

	const decrease = (e) => {
		debounceButtonClick("minus");
		onDecrement(e);
		onChange("", parseInt(value) - 1);
		if (parseInt(value) - 1 <= 0) {
			onZeroReached();
			onChange("", 0);
		}
	};

	const increase = (e) => {
		debounceButtonClick("plus");
		onIncrement(e);
		onChange("", parseInt(value) + 1);
	};

	const disabledClass = disabled ? styles("disabled") : "";
	const accessibility_counterCurrent = translate(
		"accessibility_counterCurrent",
	).replace("{quantity}", currentCount);
	return (
		<div
			className={clsx(styles("counter-button-wrapper"), className, disabledClass)}>
			<button
				ref={addButtonRef}
				className={clsx(styles("action-btn"), btnStyle)}
				onClick={(e) => increase(e)}
				disabled={disabled || (max && value >= max) || debounceDisabled}
				aria-label={`${baseAriaLabel} ${accessibility_counterCurrent}${ariaLabelAdd}`}
				aria-selected={true}
				aria-describedby={ariaDescription}>
				<div className={styles("img-container")}>
					<img src={PlusIcon.src} />
				</div>
			</button>
			<input
				type="number"
				pattern="\d*"
				value={currentCount}
				className={styles("value")}
				disabled={true}
			/>
			<button
				ref={removeButtonRef}
				className={clsx(styles("action-btn"), btnStyle)}
				onClick={(e) => decrease(e)}
				disabled={disabled || (min && value <= min) || debounceDisabled}
				aria-label={`${baseAriaLabel} ${accessibility_counterCurrent}${ariaLabelRemove}`}
				aria-selected={true}
				aria-describedby={ariaDescription}>
				<div className={styles("img-container")}>
					<img src={MinusIcon.src} />
				</div>
			</button>
		</div>
	);
};

export default CounterButton;
