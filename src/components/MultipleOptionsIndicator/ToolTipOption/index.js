import React from "react";
import basic from "./index.module.scss";
import { useSelector } from "react-redux";
import { handleKeyPress } from "../../accessibility/keyboardsEvents";
import clsx from "clsx";

export default function ToolTipOption(props) {
	const {
		className = "",
		optionImg = null,
		optionText = "",
		canChange = false,
		extraData,
		stepIndex,
		optionOnPress = () => {},
		extraStyles = {},
	} = props;

	function styles(className) {
		return (basic[className] || "") + " " + (extraStyles[className] || "");
	}

	const specialRequests = useSelector(
		(store) => store.builder.pizzaSpecialRequests?.[stepIndex],
	);
	const hasChanges = Array.isArray(specialRequests)
		? specialRequests.length > 0
		: false;
	const changesCount = Array.isArray(specialRequests)
		? specialRequests.length
		: null;

	const handleOptionOnPress = () => {
		typeof optionOnPress === "function" && optionOnPress();
	};

	return (
		<button
			onClick={handleOptionOnPress}
			className={clsx(
				styles("tool-tip-option-wrapper"),
				hasChanges && canChange ? styles("has-changes") : "",
				className,
			)}
			aria-label={optionText}
			onKeyDown={(event) => handleKeyPress(event, () => handleOptionOnPress())}>
			<div className={styles("option-wrapper")}>
				{optionImg && (
					<img
						src={optionImg.src}
						className={styles("option-img")}
						aria-hidden={true}
					/>
				)}
				<span className={styles("option-text")}>{optionText}</span>
				{hasChanges && canChange && (
					<span
						className={styles("option-changes-text")}>{`(${changesCount})`}</span>
				)}

				{/* {extraData ? (
					<span className={styles("extra-data")}>{extraData}</span>
				) : null} */}
			</div>
		</button>
	);
}
