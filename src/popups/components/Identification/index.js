import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as identificationTypes from "constants/identification-types";
import * as onboardinTypes from "constants/onboarding-types";
import * as popupTypes from "constants/popup-types";

import Back from "/public/assets/icons/back.svg";

import Phone from "../OnboardingPopup/Phone/phone";
import OTP from "../OnboardingPopup/otp";

import LanguageDirectionService from "services/LanguageDirectionService";

import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";

import styles from "./index.module.scss";
import RegisterPopup from "../Register";
import SuccessPopup from "../Register/SuccessPopup";
import SlidePopup from "../../Presets/SlidePopup";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import useEntryBenefit from "hooks/useEntreyBenefit";
import WelcomeCouponRegister from "containers/WelcomeCouponRegister/WelcomeCoupon";
import SlideAnimation from "components/SlideAnimation/SlideAnimation";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { USER_PROPERTIES } from "constants/user-properties";
import Chat from "../OnboardingPopup/Chat/chat";
import { useRouter } from "next/router";
import Actions from "redux/actions";
import Kosher from "../OnboardingPopup/Kosher/Kosher";
import { GeneralService } from "services/GeneralService";
import useKosher from "hooks/useKosher";

function IdentificationPopup(props) {
	const isrtl = LanguageDirectionService.isRTL();
	const siteDirection = isrtl === true ? styles["rtl"] : styles["ltr"];
	const { onSuccess } = props.payload;
	const ref = useRef();
	const isKosher = useKosher();
	const deviceState = useSelector((store) => store.deviceState);
	const stackState = useSelector(
		(store) => store.stackState[STACK_TYPES.IDENTIFICATION],
	);
	const { justOTP, isFromDrawer = false } = props.payload;

	const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.IDENTIFICATION);
	const user = useSelector((store) => store.userData);
	const translate = useTranslate();
	const entrey = useEntryBenefit();
	const dispatch = useDispatch();

	const verifiedOTP = user.verifiedOTP;

	useEffect(() => {
		if (verifiedOTP) {
			navigateToRegister();
		} else {
			navigateToPhone();
		}
	}, []);

	function onBackClick(e) {
		e.stopPropagation();
		goBack();
	}

	const navigateToPhone = () => {
		setStack({
			type: identificationTypes.PHONE,
			params: {},
		});
	};

	const navigateToOTP = (isMobilePhone, isHomePhone, phone, method) => {
		setStack({
			type: identificationTypes.OTP,
			params: {
				isMobilePhone,
				isHomePhone,
				phone,
				method,
			},
			header: {
				title: translate("onboarding_otp_header"),
			},
		});
	};

	function navigateToRegister() {
		setStack({
			type: identificationTypes.REGISTER,
			params: {},
		});
	}

	function handleClosePopuponSuccess(client) {
		if (!client?.email && isFromDrawer) {
			setStack({ type: identificationTypes.KOSHER, params: {} });
		} else {
			ref.current?.animateOut();
			typeof onSuccess === "function" && onSuccess();
		}
	}

	function onOTPSend(client = null) {
		const { justOTP } = props.payload;
		if (client.approvedTerms || justOTP) {
			handleClosePopuponSuccess(client);
			AnalyticsService.setUserProperties({
				[USER_PROPERTIES.REGISTERED]: USER_PROPERTIES.values.YES,
			});
		} else {
			navigateToRegister();
		}
	}

	const navigateToSuccess = (user) => {
		if (entrey) {
			setStack({
				type: identificationTypes.COUPON,
				params: {},
				headers: {},
			});
		} else {
			goToSuccess();
		}
	};

	function onOnboardingDone() {
		GeneralService.setDidOnBoarding();
		AnalyticsService.onboardingFinish(isKosher ? "kosher" : "");
		ref.current?.animateOut();
	}

	function goToSuccess() {
		if (user.type === "new") {
			setStack({
				type: identificationTypes.SUCCESS,
			});
		} else {
			handleClosePopuponSuccess();
		}
	}
	const navigateToChat = () => {
		setStack({
			type: identificationTypes.CHAT,
			params: {},
		});
	};

	function onKosherBtnsClickHandler(isKosher) {
		const value = isKosher ? "1" : "0";
		GeneralService.setKosherPreference(value);
		onOnboardingDone();
	}

	function RenderPopup() {
		let component = null;

		switch (currentScreen.type) {
			case identificationTypes.PHONE:
				component = (
					<Phone
						navigateToChat={navigateToChat}
						key={currentScreen.type}
						params={currentScreen.params}
						navigateToOTP={navigateToOTP}
						inOnBoarding={false}
						title={
							justOTP
								? translate("otp_title_label")
								: translate("registerPopup_phone_title")
						}
						subtitle={
							justOTP
								? translate("otp_subtitle_label")
								: translate("registerPopup_phone_subtitle")
						}
					/>
				);
				break;
			case identificationTypes.OTP:
				component = (
					<OTP
						key={currentScreen.type}
						params={currentScreen.params}
						onOTPSend={onOTPSend}
						inOnBoarding={false}
					/>
				);
				break;
			case identificationTypes.REGISTER:
				component = <RegisterPopup navigateToSuccess={navigateToSuccess} />;
				break;
			case identificationTypes.COUPON:
				component = <WelcomeCouponRegister onSuccess={goToSuccess} />;
				break;
			case identificationTypes.SUCCESS:
				component = <SuccessPopup animateOut={handleClosePopuponSuccess} />;
				break;
			case identificationTypes.KOSHER:
				component = (
					<Kosher
						onBtnClickHandler={onKosherBtnsClickHandler}
						animateOut={ref.current?.animateOut}
					/>
				);
				break;
			case identificationTypes.CHAT:
				component = (
					<Chat
						navigateToPhone={navigateToPhone}
						key={currentScreen.type}
					/>
				);
				break;
			default:
				component = (
					<div
						className={"visually-hidden"}
						tabIndex={0}
					/>
				); // required for focus trap
		}

		return component;
	}

	function getBackButton() {
		return (
			<div className={styles["back-wrapper"]}>
				{stackState.length > 1 && (
					<div
						className={styles["icon-wrapper"]}
						onClick={onBackClick}>
						<img
							src={Back.src}
							alt="חזור"
						/>
					</div>
				)}
			</div>
		);
	}

	const header = () => {
		return (
			<div className={clsx(styles["header"], siteDirection)}>
				{getBackButton()}
				<div className={styles["title-wrapper"]}>
					{currentScreen?.headers?.title && (
						<h3
							className={styles["title"]}
							tabIndex={0}>
							{currentScreen.headers.title}
						</h3>
					)}
					{currentScreen?.headers?.subtitle && (
						<h4
							className={styles["subtitle"]}
							tabIndex={0}>
							{currentScreen.headers.subtitle}
						</h4>
					)}
				</div>
				<div className={styles["empty"]}></div>
			</div>
		);
	};

	const handleAnimateOut = () => {
		ref.current.animateOut();
	};

	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			header={deviceState.isMobile && currentScreen.headers ? header : undefined}
			className={clsx(styles["identification"], currentScreen.type)}
			animateOutCallback={() => handleAnimateOut()}
			showCloseIcon>
			<SlideAnimation stack={STACK_TYPES.IDENTIFICATION}>
				{RenderPopup()}
			</SlideAnimation>
		</SlidePopup>
	);
}

export default IdentificationPopup;
