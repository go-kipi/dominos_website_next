import React from "react";

import { useSelector } from "react-redux";

import PizzaBox from "/public/assets/icons/pizza-box-hearts.svg";
import styles from "./Free.module.scss";
import Button from "components/button";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";
function Free(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const isDisabledOnEditMode = useSelector(
		(store) => store.isEditGiftCardMode.isEditMode,
	);
	const { onClick = () => {}, hasGiftCards = false, params } = props;
	const translate = useTranslate();

	function onClickHandler() {
		typeof onClick === "function" && onClick();
	}

	const titleText = params?.fromPaid
		? ""
		: translate("shoppingCart_payment_free_title");

	const subtitleText = params?.fromPaid
		? translate("shoppingCart_payment_paid_full_subtitle")
		: translate("shoppingCart_payment_free_subtitle");

	const buttonText = params?.fromPaid
		? translate("shoppingCart_payment_paid_full_send_order")
		: deviceState.isDesktop
		? translate("shoppingCart_payment_freeDesktop_accept")
		: translate("shoppingCart_payment_free_accept");

	return (
		<div
			className={clsx(
				styles["free-wrapper"],
				hasGiftCards ? styles["has-giftcard"] : "",
			)}>
			<div className={styles["pizza-box-hearts-wrapper"]}>
				<img src={PizzaBox.src} />
			</div>

			<h2
				className={styles["free-title"]}
				aria-live={"polite"}>
				{titleText}
			</h2>

			<h1
				className={styles["free-subtitle"]}
				aria-live={"polite"}>
				{subtitleText}
			</h1>
			<div
				className={clsx(
					styles["actions"],
					hasGiftCards ? styles["has-gift-card"] : "",
				)}>
				<Button
					className={styles["button-accept"]}
					text={buttonText}
					onClick={onClickHandler}
					disabled={isDisabledOnEditMode}
				/>
			</div>
		</div>
	);
}

export default Free;
