import React from "react";

import LottieAnimation from "components/LottieAnimation";

import Button from "components/button";
import CouponAnimation from "animations/coupon.json";

import styles from "./WelcomeCoupon.module.scss";
import useEntryBenefit from "hooks/useEntreyBenefit";
import { useDispatch, useSelector } from "react-redux";

import Api from "api/requests";
import useTranslate from "hooks/useTranslate";
import SRContent from "components/accessibility/srcontent";
import { TRIGGER } from "constants/trigger-enum";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

function WelcoomeCoupon(props) {
	const { onSuccess } = props;

	const userData = useSelector((store) => store.userData);
	const benefit = useEntryBenefit(true);
	const translate = useTranslate();

	function accept() {
		function onSuccessCB() {
			typeof onSuccess === "function" && onSuccess();
			AnalyticsService.onboardingCoupon("use now");
		}
		const payload = {
			item: {
				quantity: 1,
				productId: benefit.productID,
				triggeredBy: TRIGGER.BENEFIT,
			},
		};
		Api.addBasketItem({ payload, onSuccess: onSuccessCB });
	}

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
					translate("onboarding_coupon_text")
				}
			/>
			<h3 className={styles["subtitle"]}>
				{translate("hi_greeting").replace("{user}", userData.firstName)}
			</h3>
			<h2 className={styles["title"]}>{translate("onboarding_coupon_title")}</h2>
			<div className={styles["lottie-wrapper"]}>
				<LottieAnimation {...defaultOptions} />
			</div>
			<h1 className={styles["text"]}> {translate("onboarding_coupon_text")}</h1>
			<div className={styles["actions"]}>
				<Button
					text={translate("on_boarding_coupon_btn_accept")}
					onClick={accept}
					className={styles["accept"]}
				/>
			</div>
		</div>
	);
}

export default WelcoomeCoupon;
