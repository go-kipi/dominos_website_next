import React, { useRef } from "react";
import basic from "./index.module.scss";
import { useSelector } from "react-redux";

import ChangesIcon from "/public/assets/icons/multipleOptionsIndicator/blue-circle-icon.svg";
import IndicatorImg from "/public/assets/icons/multipleOptionsIndicator/3-dot-icon.svg";
import OptionsToolTip from "./OptionsToolTip";
import clsx from "clsx";
import { useOutsideClick } from "hooks/useOutsideClick";
import { handleKeyPress } from "../accessibility/keyboardsEvents";
import useTranslate from "../../hooks/useTranslate";

export default function MultipleOptionsIndicator(props) {
	const {
		options = [],
		className = "",
		tipClassName = "",
		optionsContainerClassName = "",
		toolTipClassName = "",
		onDelete,
		stepIndex = 0,
		extraStyles = {},
		tooltipAlt = "",
	} = props;

	const wrapperRef = useRef(null);
	useOutsideClick(wrapperRef, closeToolTip);
	const translate = useTranslate();

	function styles(className) {
		return (basic[className] || "") + " " + (extraStyles[className] || "");
	}

	const [showToolTip, setShowToolTip] = React.useState(false);
	const pizzaSpecialReqs = useSelector(
		(store) => store.builder.pizzaSpecialRequests[stepIndex],
	);
	const hasChanges = Array.isArray(pizzaSpecialReqs)
		? pizzaSpecialReqs.length > 0
		: false;
	const showChangesIcon = hasChanges;

	function toggleTooltip(e) {
		e.stopPropagation();

		setShowToolTip((prev) => !prev);
	}

	function closeToolTip() {
		setShowToolTip(false);
	}

	return (
		<div
			ref={wrapperRef}
			className={clsx(styles("multiple-options-indicator-wrapper"), className)}
			aria-label={translate("accessibility_shoppingCart_itemOptions")}>
			<button
				onClick={(e) => toggleTooltip(e)}
				className={clsx(styles("multiple-options-indicator-wrapper"), className)}
				aria-label={translate("accessibility_shoppingCart_itemOptions")}
				onKeyDown={(event) => handleKeyPress(event, () => toggleTooltip(event))}>
				<img
					className={clsx(styles("multiple-options-indicator-img"), className)}
					src={IndicatorImg.src}
					alt={""}
				/>
			</button>
			{showChangesIcon && (
				<img
					className={styles("multiple-options-changes-img")}
					src={ChangesIcon.src}
					alt={""}
				/>
			)}
			<OptionsToolTip
				optionsContainerClassName={optionsContainerClassName}
				// className={toolTipClassName}
				tipClassName={tipClassName}
				isVisible={showToolTip}
				options={options.map((o) => ({
					...o,
					onPress: () => {
						closeToolTip();
						o.onPress();
					},
				}))}
				onDelete={onDelete}
				stepIndex={stepIndex}
				extraStyles={extraStyles}
			/>
		</div>
	);
}
