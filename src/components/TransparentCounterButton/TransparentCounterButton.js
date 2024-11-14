import clsx from "clsx";
import React from "react";
import basic from "./TransparentCounterButton.module.scss";
import useTranslate from "../../hooks/useTranslate";
import { createAccessibilityText } from "../accessibility/acfunctions";

const TransparentCounterButton = (props) => {
	const {
		ariaTitle = "",
		value,
		min = 1,
		max = 10,
		className = "",
		disabled = false,
		disabledPlus = false,
		disabledMinus = false,
		onChange = () => {},
		extraStyles = {},
		baseAriaLabel = "",
	} = props;
	const translate = useTranslate();
	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};
	const decrease = (e) => {
		e.stopPropagation();
		onChange(value - 1);
	};

	const increase = (e) => {
		e.stopPropagation();
		onChange(value + 1);
	};

	const disabledClass = disabled ? styles("disabled") : "";
	const srTextPlus = createAccessibilityText(
		baseAriaLabel,
		ariaTitle,
		translate("accessibility_counterCurrent").replace("{quantity}", value),
		translate("accessibility_addCount"),
	);
	const srTextMinus = createAccessibilityText(
		baseAriaLabel,
		ariaTitle,
		translate("accessibility_counterCurrent").replace("{quantity}", value),
		translate("accessibility_reduceCount"),
	);
	return (
		<div
			className={clsx(
				styles("transparent-counter-button-wrapper"),
				className,
				disabledClass,
			)}>
			<button
				className={styles("action-btn")}
				onClick={increase}
				aria-label={srTextPlus}
				disabled={disabled || disabledPlus || value >= max}
				aria-disabled={disabled || disabledPlus}>
				+
			</button>
			<span className={styles("value")}>{value}</span>
			<button
				className={styles("action-btn")}
				onClick={decrease}
				disabled={disabled || disabledMinus || value <= min}
				aria-label={srTextMinus}
				aria-disabled={disabled || disabledMinus}>
				-
			</button>
		</div>
	);
};

export default TransparentCounterButton;
