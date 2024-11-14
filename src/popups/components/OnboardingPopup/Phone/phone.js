import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { OTP_METHODS } from "constants/otp-methods";
import LottieAnimation from "components/LottieAnimation";
import { GeneralService } from "services/GeneralService";

import TextOnlyButton from "components/text_only_button";
import TextInput from "components/forms/textInput";
import Button from "components/button";
import Api from "api/requests";

import styles from "./phone.module.scss";
import IdentificationAnimation from "animations/identification.json";
import useTranslate from "hooks/useTranslate";
import LocalStorageService from "../../../../services/LocalStorageService";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import EmarsysService from "utils/analyticsService/EmarsysService";

const defaultOptions = {
	loop: false,
	autoplay: true,
	animation: IdentificationAnimation,
};

function Phone(props) {
	const [phone, setPhone] = useState("");
	const [isMobilePhone, setIsMobilePhone] = useState(false);
	const [isHomePhone, setIsHomePhone] = useState(false);
	const [isFirstTry, setIsFirstTry] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const translate = useTranslate();
	const generalData = useSelector((store) => store.generalData);
	const hasValidPhoneNum = isHomePhone || isMobilePhone;
	const { inOnBoarding = true } = props;

	function handleOnChange(e) {
		const { value } = e.target;
		setPhone(value);
		validatePhoneNum(value);
	}

	function validatePhoneNum(phoneValue) {
		if (isHomePhoneFunc(phoneValue)) {
			setIsHomePhone(true);
		} else if (isMobilePhoneFunc(phoneValue)) {
			setIsMobilePhone(true);
		} else {
			setIsHomePhone(false);
			setIsMobilePhone(false);
		}
	}

	function isHomePhoneFunc(number) {
		return /^(?:(0(?:2|3|4|8|9|7|72|73|74|76|77|78)[-]?[0-9]{7}))$/.test(number);
	}

	function isMobilePhoneFunc(number) {
		return /^(?:(0(?:50|51|52|53|54|55|58|72|73|74|76|77|78)[-]?[0-9]{7}))$/.test(
			number,
		);
	}

	const getRecipientOverride = () =>
		LocalStorageService.getItem("recipientOverride") || undefined;

	function onSubmitPhoneNum(method) {
		setIsFirstTry(false);
		const isHomePhone = isHomePhoneFunc(phone, true);
		const isMobilePhone = isMobilePhoneFunc(phone, true);
		if (!isMobilePhone && !isHomePhone) {
			setIsHomePhone(isHomePhone);
			setIsMobilePhone(isMobilePhone);
			const isMobileStart = isMobilePhoneFunc(phone, false);
			setErrorMessage(
				translate(
					isMobileStart
						? "onboarding_mobile_phone_error"
						: "onboarding_home_phone_error",
				),
			);
			return;
		}
		const payload = {
			otpMethod: method,
			customerId: phone,
			language: generalData.lang,
		};

		if (parseInt(process.env.NEXT_PUBLIC_SHOW_RECIPIENT)) {
			const recipientOverride = getRecipientOverride();
			payload["recipientOverride"] = recipientOverride;
		}
		GeneralService.setPhoneNumber(phone);

		function onSuccess() {
			props.navigateToOTP(isMobilePhone, isHomePhone, phone, method);
		}
		Api.sendOtp({ payload, onSuccess });
		if (!inOnBoarding) {
			AnalyticsService.signupPhone("phone number");
		}
	}

	function showError() {
		return !isFirstTry && !isMobilePhone && !isHomePhone;
	}

	function onKeyDown(e) {
		if (e.key === "Enter") {
			onSubmitPhoneNum(
				isMobilePhone ? OTP_METHODS.TEXT : OTP_METHODS.VOICE_MESSAGE,
			);
		}
	}

	return (
		<div className={styles["phone"]}>
			<div
				className={styles["image-wrapper"]}
				role={"group"}>
				<LottieAnimation {...defaultOptions} />
			</div>
			<h1
				className={styles["subtitle-label"]}
				tabIndex={0}>
				{props.title}
			</h1>
			<h2
				className={styles["title-label"]}
				aria-labelledby={props.subtitle}
				aria-live={"polite"}
				tabIndex={0}>
				{props.subtitle}{" "}
			</h2>
			<TextInput
				className={styles["phone-input"]}
				name={"phone"}
				onChange={handleOnChange}
				required
				centerInput
				type="tel"
				value={phone}
				placeholder={translate("otp_phone_placeholder_label")}
				showClearIcon
				ariaLabel={translate("accessibility_ariaLabel_enterPhone")}
				errorMessage={errorMessage}
				showError={showError()}
				maxLength={10}
				onKeyDown={onKeyDown}
				extraStyles={styles}
			/>
			{!phone && (
				<span
					className={styles["suggestion"]}
					tabIndex={0}>
					{translate("otp_home_phone_msg")}
				</span>
			)}

			{hasValidPhoneNum &&
				(isMobilePhone ? (
					<Button
						className={styles["phone-submit-btn"]}
						text={translate("otp_send_sms_btn_label")}
						onClick={() => onSubmitPhoneNum(OTP_METHODS.TEXT)}
					/>
				) : (
					<Button
						className={`${styles["phone-submit-btn"]} ${styles["phone-submit-btn-voicemessage"]}`}
						text={translate("otp_send_voicemail_btn_label")}
						onClick={() => onSubmitPhoneNum(OTP_METHODS.VOICE_MESSAGE)}
					/>
				))}
			{!hasValidPhoneNum && (
				<TextOnlyButton
					className={styles["switched-phone-btn"]}
					text={translate("otp_switched_phone_num_btn")}
					onClick={() => props.navigateToChat()}
				/>
			)}
			{!hasValidPhoneNum && inOnBoarding && (
				<TextOnlyButton
					className={styles["next-btn"]}
					text={translate("onboarding_otp_end_next_text")}
					onClick={props.navigateToKosher}
				/>
			)}
			{isMobilePhone && (
				<TextOnlyButton
					className={styles["opt_send_voicemail_btn"]}
					text={translate("otp_send_voicemail_btn_label")}
					onClick={() => onSubmitPhoneNum(OTP_METHODS.VOICE_MESSAGE)}
				/>
			)}
		</div>
	);
}

export default Phone;
