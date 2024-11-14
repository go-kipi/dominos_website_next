import React, { useRef } from "react";
import styles from "./index.module.scss";

import BlurPopup from "../../Presets/BlurPopup";
import clsx from "clsx";
import { Pizza } from "../builder/Pizza";

import useTranslate from "hooks/useTranslate";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";

export default function ChooseQuarterPopup(props) {
	const ref = useRef();
	const translate = useTranslate();

	const { payload = {} } = props;
	const { coverages, isSquare, selectedToppingId, pizzaId } = payload;
	const topping = useMenus(selectedToppingId, ActionTypes.PRODUCT);
	const { nameUseCases } = topping;
	const isSquarePizza =
		typeof isSquare === "string" && !["classic", "", "spelt"].includes(isSquare);
	const handleOnCoverageAdd = (quarter) => {
		const res = { q1: 0, q2: 0, q3: 0, q4: 0 };
		res[quarter] = 1;
		const { onAdd } = props.payload;
		return ref.current.animateOut(onAdd(res));
	};

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			showCloseIcon
			className={styles["choose-quarter-popup"]}>
			<div className={styles["choose-quarter-right-side"]}>
				<span className={styles["topping-name"]}>{nameUseCases?.Title}</span>
				<h2
					className={styles["title"]}
					aria-live={"polite"}
					tabIndex={0}>
					{translate("chooseQuarterModal_title")}
				</h2>
			</div>
			<div className={styles["choose-quarter-left-side"]}>
				<Pizza
					styles={styles}
					coverages={coverages}
					pizzaId={pizzaId}
				/>
				<button
					className={clsx(
						styles["overlay"],
						styles["overlay-quarter-top-left"],
						isSquarePizza ? styles["square"] : "",
					)}
					onClick={handleOnCoverageAdd.bind(this, "q4")}
					aria-label={`${translate("accessibility_label_toppingsCoverage_QUARTER")} 
                                  ${translate(
																																			"accessibility_label_toppingsCoverage_top",
																																		)}
                                  ${translate(
																																			"accessibility_label_toppingsCoverage_left",
																																		)}
                               `}
				/>
				<button
					className={clsx(
						styles["overlay"],
						styles["overlay-quarter-top-right"],
						isSquarePizza ? styles["square"] : "",
					)}
					onClick={handleOnCoverageAdd.bind(this, "q1")}
					aria-label={`${translate("accessibility_label_toppingsCoverage_QUARTER")} 
                                  ${translate(
																																			"accessibility_label_toppingsCoverage_top",
																																		)}
                                  ${translate(
																																			"accessibility_label_toppingsCoverage_right",
																																		)}
                               `}
				/>
				<button
					className={clsx(
						styles["overlay"],
						styles["overlay-quarter-bottom-left"],
						isSquarePizza ? styles["square"] : "",
					)}
					onClick={handleOnCoverageAdd.bind(this, "q3")}
					aria-label={`${translate("accessibility_label_toppingsCoverage_QUARTER")} 
                                  ${translate(
																																			"accessibility_label_toppingsCoverage_bottom",
																																		)}
                                  ${translate(
																																			"accessibility_label_toppingsCoverage_left",
																																		)}
                               `}
				/>
				<button
					className={clsx(
						styles["overlay"],
						styles["overlay-quarter-bottom-right"],
						isSquarePizza ? styles["square"] : "",
					)}
					onClick={handleOnCoverageAdd.bind(this, "q2")}
					aria-label={`${translate("accessibility_label_toppingsCoverage_QUARTER")} 
                                  ${translate(
																																			"accessibility_label_toppingsCoverage_bottom",
																																		)}
                                  ${translate(
																																			"accessibility_label_toppingsCoverage_right",
																																		)}
                               `}
				/>
			</div>
		</BlurPopup>
	);
}
