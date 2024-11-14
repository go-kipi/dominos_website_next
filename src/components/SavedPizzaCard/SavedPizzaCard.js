import React, { useRef, useState } from "react";
import MixInfoIcon from "/public/assets/icons/mix-info-icon.svg";
import styles from "./SavedPizzaCard.module.scss";
import Price from "components/Price";
import * as popups from "../../constants/popup-types";
import { useDispatch } from "react-redux";
import Actions from "../../redux/actions";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { createAccessibilityText } from "../accessibility/acfunctions";
import { getCurrencySign } from "../../utils/functions";
import { TAB_INDEX_HIDDEN } from "../../constants/accessibility-types";

function SavedPizzaCard(props) {
	const {
		title,
		id,
		price,
		oldPrice = undefined,
		showPriceBeforeDiscount = false,
		currency = "shekel",
		product = {},
		isInBuilder = false,
		isEdit = false,
		addInBuilder,
		disabledReason = "",
		stepIndex,
		setStack,
		nextTab,
		isLastTab,

		shouldPopulateStack,
		pizzaBuilderId,
	} = props;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const handleOnClick = (e) => {
		e?.preventDefault();
		e?.stopPropagation();
		if (!disabledReason) {
			dispatch(
				Actions.addPopup({
					type: popups.PIZZA_DETAILS,
					payload: {
						pizzaName: title,
						price,
						oldPrice,
						id,
						product,
						isInBuilder,
						isEdit,
						stepIndex,
						showPriceBeforeDiscount: showPriceBeforeDiscount,
						onAddInBuilder: (payload, dough, possiblePizzas, doughPossiblePizzas) => {
							typeof addInBuilder === "function" &&
								addInBuilder(payload, dough, possiblePizzas, doughPossiblePizzas);
						},
						shouldPopulateStack,
						pizzaBuilderId,
						setStack,
						nextTab,
						isLastTab,
					},
				}),
			);
		} else {
			openPizzaNotInMealPopup(e);
		}
	};

	function openPizzaNotInMealPopup(e) {
		e?.preventDefault();
		e?.stopPropagation();
		dispatch(
			Actions.addPopup({
				type: popups.GENERAL_MESSAGE,
				payload: {
					text: translate("pizzaNotInMealModal_content_label"),
					btnText: translate("pizzaNotInMealModal_button_label"),
				},
			}),
		);
	}
	const srText = createAccessibilityText(
		translate("accessibility_savedPizza").replace("{pizzaName}", title),
		!isInBuilder && `${price}${getCurrencySign(currency)}`,
		showPriceBeforeDiscount &&
			!isInBuilder &&
			`${oldPrice}${getCurrencySign(currency)}`,
		disabledReason && translate("accessibility_savedPizza_unavailable"),
	);
	return (
		<button
			aria-label={srText}
			className={clsx(
				styles["saved-pizza-card-wrapper"],
				disabledReason ? styles["disabled"] : "",
			)}
			onClick={handleOnClick}>
			<span className={styles["saved-pizza-title"]}>{title}</span>

			<div className={styles["saved-pizza-head"]}></div>
			{!isInBuilder && (
				<Price
					value={price}
					currency={currency}
					className={styles["product-price"]}
				/>
			)}
			{showPriceBeforeDiscount && !isInBuilder && (
				<Price
					value={oldPrice}
					currency={currency}
					className={clsx(styles["product-price"], styles["old-price"])}
					extraStyles={styles}
					mark
				/>
			)}
			{disabledReason && (
				<button
					tabIndex={TAB_INDEX_HIDDEN}
					className={styles["product-tool-tip-icon"]}
					onClick={openPizzaNotInMealPopup}>
					<img src={MixInfoIcon.src} />
				</button>
			)}
		</button>
	);
}

export default SavedPizzaCard;
