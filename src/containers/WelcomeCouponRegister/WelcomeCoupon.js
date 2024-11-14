import React, { useEffect } from "react";

import LottieAnimation from "components/LottieAnimation";

import Button from "components/button";
import CouponAnimation from "animations/coupon.json";

import styles from "./WelcomeCoupon.module.scss";
import useEntryBenefit from "hooks/useEntreyBenefit";
import { useSelector } from "react-redux";

import Api from "api/requests";
import useTranslate from "hooks/useTranslate";
import SRContent from "components/accessibility/srcontent";
import { TRIGGER } from "constants/trigger-enum";

function WelcomeCouponRegister(props) {
	const { onSuccess } = props;

	const userData = useSelector((store) => store.userData);
	const benefit = useEntryBenefit();
	const translate = useTranslate();

	const cart = useSelector((store) => store.cartData);

	useEffect(() => {
		if (benefit) {
			const payload = {
				item: {
					quantity: 1,
					productId: benefit.productID,
					triggeredBy: TRIGGER.BENEFIT,
				},
			};
			Api.addBasketItem({ payload });
		}
	}, [benefit]);

	function accept() {
		typeof onSuccess === "function" && onSuccess();
	}

	const btnLabel = cart?.showTotalBeforeDiscount
		? "register_coupon_btn_text"
		: "register_coupon_btn_text_no_discount";
	const btnText = translate(btnLabel)
		.replace("{total}", cart?.total)
		.replace("{totalBeforeDiscount}", cart?.totalBeforeDiscount);

	const defaultOptions = {
		loop: false,
		autoplay: true,
		animation: CouponAnimation,
	};

	return (
		<div className={styles["welcome-coupon"]}>
			<button
				id={"btn"}
				aria-hidden={true}
			/>{" "}
			{/*For accessibility reasons, so focus-visible wont be triggered*/}
			<SRContent
				message={
					translate("hi_greeting").replace("{user}", userData.firstName) +
					" " +
					translate("onboarding_coupon_title") +
					" " +
					translate("register_coupon_title")
				}
			/>
			<h3
				className={styles["subtitle"]}
				tabIndex={0}>
				{translate("hi_greeting").replace("{user}", userData.firstName)}
			</h3>
			<h2
				className={styles["title"]}
				tabIndex={0}>
				{translate("register_coupon_title")}
			</h2>
			<div className={styles["lottie-wrapper"]}>
				<LottieAnimation {...defaultOptions} />
			</div>
			<h1
				className={styles["text"]}
				tabIndex={0}>
				{" "}
				{translate("onboarding_coupon_text")}
			</h1>
			<div className={styles["actions"]}>
				<Button
					text={btnText}
					animated
					onClick={accept}
					className={styles["accept"]}
				/>
			</div>
		</div>
	);
}

export default WelcomeCouponRegister;
