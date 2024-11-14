import React from "react";
import basic from "./index.module.scss";
import ToolTipOption from "../ToolTipOption";
import clsx from "clsx";

export default function OptionsToolTip(props) {
	const {
		className = "",
		tipClassName = "",
		optionsContainerClassName = "",
		options = [],
		isVisible = false,
		tipLeft = true,
		stepIndex,
		extraStyles = {},
	} = props;

	function styles(className) {
		return (basic[className] || "") + " " + (extraStyles[className] || "");
	}

	if (!isVisible) {
		return <div />;
	}

	return (
		<div className={clsx(styles("options-tooltip-wrapper"), className)}>
			<div className={clsx(styles("options-tooltip-container"))}>
				{tipLeft && (
					<div className={clsx(styles("tooltip-triangle"), tipClassName)} />
				)}
				<div className={clsx(styles("options-wrapper"), optionsContainerClassName)}>
					{options.map((option, index) => {
						return (
							<ToolTipOption
								key={`option-${option.id}`}
								id={option.id}
								optionImg={option.img}
								optionText={option.text}
								optionOnPress={() => option.onPress()}
								canChange={option.canChange}
								extraData={option.extraData}
								stepIndex={stepIndex}
								extraStyles={extraStyles}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}
