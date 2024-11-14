import React from "react";

import { useSelector } from "react-redux";

import PizzaBox from "/public/assets/icons/pizza-box-hearts.svg";
import styles from "./Free.module.scss";
import Button from "components/button";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";
function Free(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const { onClick = () => {}, hasGiftCards = false } = props;
	const translate = useTranslate();

	function onClickHandler() {
		typeof onClick === "function" && onClick();
	}

	const buttonText = deviceState.isDesktop
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
				{translate("shoppingCart_payment_free_title")}
			</h2>

			<h1
				className={styles["free-subtitle"]}
				aria-live={"polite"}>
				{translate("shoppingCart_payment_free_subtitle")}
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
				/>
			</div>
		</div>
	);
}

export default Free;
