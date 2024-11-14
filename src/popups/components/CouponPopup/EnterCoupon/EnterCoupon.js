import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Coupon from "animations/cut-coupon.json";
import TextInput from "components/forms/textInput";

import Button from "components/button";

import styles from "./EnterCoupon.module.scss";
import LottieAnimation from "components/LottieAnimation";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

const minNumbers = 1;

function EnterCoupon(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { params = {}, VerifyCoupon } = props;
	const { isValidParams = true } = params;

	const [isValid, setIsValid] = useState(isValidParams);
	const [coupon, setCoupon] = useState("");
	const isBtnDisabled = !coupon || coupon?.length < minNumbers;

	function onChangeText(e) {
		const { _, value } = e.target;
		setCoupon(value);
		if (!isValid) {
			setIsValid((prev) => !prev);
		}
	}

	function onVerifyCoupon() {
		if (typeof VerifyCoupon === "function") {
			VerifyCoupon(coupon);
			AnalyticsService.enterCouponCode("coupon");
		}
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			onVerifyCoupon();
		}
	}
	return (
		<div className={styles["enter-coupon-wrapper"]}>
			<div className={styles["coupon-animation-wrapper"]}>
				<LottieAnimation
					animation={Coupon}
					autoplay={true}
					className={styles["cut-coupon-animation"]}
				/>
			</div>
			<h1
				id={"desc"}
				className={"visually-hidden"}
				tabIndex={0}>
				{" "}
				{translate("accessibility_enterCoupon")}
			</h1>
			<TextInput
				centerInput={true}
				type="text"
				name="coupon"
				autoFocus
				className={styles["coupon-text-input"]}
				placeholder={translate("otp_coupon_placeholder_label")}
				value={coupon}
				onChange={onChangeText}
				showError={!isValid}
				errorMessage={""}
				showClearIcon={true}
				ariaLabel={coupon}
				onKeyDown={handleKeyDown}
				// pattern="[A-Za-z0-9]*"
				required
			/>
			<div className={styles["actions"]}>
				<Button
					isBtnOnForm
					animated={false}
					className={styles["accept-btn"]}
					text={translate("couponPopup_enterCoupon_btn_label")}
					errorText={translate("couponPopup_enterCoupon_errorBtn_label")}
					disabled={isBtnDisabled}
					onClick={onVerifyCoupon}
					isError={!isValid}
				/>
			</div>
			{deviceState.isMobile && (
				<div className={styles["text-wrapper"]}>
					<span
						className={clsx(styles["text"], styles["text-book"])}
						tabIndex={0}>
						{translate("couponPopup_enterCoupon_text")}
						<span className={clsx(styles["text"], styles["text-bold"])}>
							{translate("couponPopup_enterCoupon_sideMenu")}
						</span>
						{translate("couponPopup_enterCoupon_orIn")}
						<span className={clsx(styles["text"], styles["text-bold"])}>
							{translate("couponPopup_enterCoupon_cart")}
						</span>
					</span>
				</div>
			)}
		</div>
	);
}

export default EnterCoupon;
