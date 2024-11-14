"use client";

import React, { useRef } from "react";

import styles from "./WelcomeCouponPopup.module.scss";
import SlidePopup from "popups/Presets/SlidePopup";
import WelcoomeCoupon from "../OnboardingPopup/WelcomeCoupon/WelcomeCoupon";

function WelcomeCouponPopup(props) {
	const ref = useRef();

	const { onSuccess, onDecline } = props.payload;

	function onSuccessHandler() {
		ref.current.animateOut();
		typeof onSuccess === "function" && onSuccess();
	}

	function onDeclineHandler() {
		ref.current.animateOut();
		typeof onDecline === "function" && onDecline();
	}

	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={styles["welcome-coupon"]}
			enableClickOutside={false}>
			<WelcoomeCoupon
				onSuccess={onSuccessHandler}
				onDecline={onDeclineHandler}
			/>
		</SlidePopup>
	);
}

export default WelcomeCouponPopup;
