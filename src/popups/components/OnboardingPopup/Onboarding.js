import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as popups from "constants/popup-types";

import Actions from "redux/actions";

import * as onboardinTypes from "constants/onboarding-types";

import styles from "./Onboarding.module.scss";
import Back from "/public/assets/icons/back.svg";

import Phone from "./Phone/phone";
import Otp from "./otp";
import WelcoomeCoupon from "./WelcomeCoupon/WelcomeCoupon";
import Kosher from "./Kosher/Kosher";
import End from "./End/End";
import Greeting from "./Greeting/Greeting";

import LanguageDirectionService from "services/LanguageDirectionService";

import { GPS_STATUS } from "../../../constants/gps-status";
import Api from "../../../api/requests";
import { GeneralService } from "../../../services/GeneralService";
import useStack from "../../../hooks/useStack";
import STACK_TYPES from "../../../constants/stack-types";
import Language from "./Language/Language";
import SlidePopup from "popups/Presets/SlidePopup";
import clsx from "clsx";
import OrderStatusService from "services/OrderStatusService";
import { NO_ORDER_STATUS } from "constants/OrderStatus";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import useKosher from "../../../hooks/useKosher";
import SlideAnimation from "components/SlideAnimation/SlideAnimation";
import { USER_PROPERTIES } from "constants/user-properties";
import Chat from "./Chat/chat";

function OnBoardingPopup(props) {
	const isrtl = LanguageDirectionService.isRTL();
	const siteDirection = isrtl === true ? "rtl" : "ltr";
	const { payload } = props;
	const { inOnBoarding = true } = payload;

	const deviceState = useSelector((store) => store.deviceState);
	const generalData = useSelector((store) => store.generalData);
	const stackState = useSelector(
		(store) => store.stackState[STACK_TYPES.ONBOARDING],
	);
	const translate = useTranslate();
	const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.ONBOARDING);

	const isKosher = useKosher();
	const ref = useRef();
	const dispatch = useDispatch();
	const animateOut = (callback) => ref.current.animateOut(callback);
	const user = useSelector((store) => store.userData);

	useEffect(() => {
		setStack({
			type: onboardinTypes.PHONE,
			params: {},
		});
	}, []);

	function onBackClick(e) {
		e.stopPropagation();
		goBack();
	}

	function getCustomerDetails() {
		const payload = { gpsstatus: generalData?.gpsstatus ?? GPS_STATUS.OFF };
		Api.getCustomerDetails({
			payload,
			onSuccessCB: (res) => {
				dispatch(Actions.setUser(res.data));
			},
		});
	}

	const openContinueOrderPopup = () => {
		dispatch(
			Actions.addPopup({
				type: popups.CONTINUE_ACTIVE_ORDER,
				payload: {
					onDeclineCallback: openDeliveryPopup,
				},
				// disablePromot: true,
			}),
		);
	};

	function openDeliveryPopup() {
		dispatch(
			Actions.addPopup({
				type: popups.DELIVERY,
				payload: {},
			}),
		);
	}

	function onOnboardingDone() {
		GeneralService.setDidOnBoarding();
		if (inOnBoarding) {
			const timeout = setTimeout(() => {
				OrderStatusService.getStatusFromUserData(
					NO_ORDER_STATUS,
					onAllowed,
					onDisallowed,
				);

				function onAllowed() {
					openDeliveryPopup();
				}

				function onDisallowed() {
					openContinueOrderPopup();
				}

				clearTimeout(timeout);
			}, 250);
			AnalyticsService.onboardingFinish(isKosher ? "kosher" : "");
		}
	}

	const navigateToGreeting = (name) => {
		setStack({
			type: onboardinTypes.GREETING,
			params: { name },
		});
	};

	const navigateToPhone = (name) => {
		setStack({
			type: onboardinTypes.PHONE,
			params: {},
		});
	};
	const navigateToChat = () => {
		setStack({
			type: onboardinTypes.SUPPORT_CHAT,
			params: {},
		});
	};
	const navigateToKosher = () => {
		setStack({
			type: onboardinTypes.KOSHER,
			params: {},
			header: {
				title: translate("your_preferences"),
				subtitle: translate("onboarding_kosher_header_subtitle"),
			},
		});
	};

	function onOTPSend(client) {
		if (client?.approvedTerms) {
			navigateToGreeting(client.firstName);

			AnalyticsService.setUserProperties({
				[USER_PROPERTIES.REGISTERED]: USER_PROPERTIES.values.YES,
			});
		} else {
			navigateToKosher();
		}
	}

	const navigateToOTP = (isMobilePhone, isHomePhone, phone, method) => {
		setStack({
			type: onboardinTypes.OTP,
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

	function onKosherBtnsClickHandler(isKosher) {
		const value = isKosher ? "1" : "0";

		GeneralService.setKosherPreference(value);
		if (user.type === "new") {
			onOnboardingDone();
			dispatch(Actions.removePopup());
		} else {
			navigateToGreeting(user.firstName);
		}
	}

	function RenderPopup() {
		let component = null;
		switch (currentScreen.type) {
			case onboardinTypes.LANGUAGE:
				component = (
					<Language
						key={currentScreen.type}
						params={currentScreen.params}
						navigateToPhone={navigateToPhone}
					/>
				);
				break;
			case onboardinTypes.PHONE:
				component = (
					<Phone
						key={currentScreen.type}
						params={currentScreen.params}
						navigateToChat={navigateToChat}
						navigateToOTP={navigateToOTP}
						navigateToKosher={navigateToKosher}
						title={translate("otp_title_label")}
						subtitle={translate("otp_subtitle_label")}
						inOnBoarding={props.payload.inOnBoarding ?? true}
					/>
				);
				break;
			case onboardinTypes.OTP:
				component = (
					<Otp
						key={currentScreen.type}
						params={currentScreen.params}
						onOTPSend={onOTPSend}
						inOnBoarding={props.payload.inOnBoarding ?? true}
					/>
				);
				break;
			case onboardinTypes.COUPON:
				component = (
					<WelcoomeCoupon
						key={currentScreen.type}
						params={currentScreen.params}
						navigateToKosher={navigateToKosher}
					/>
				);
				break;
			case onboardinTypes.KOSHER:
				component = (
					<Kosher
						params={currentScreen.params}
						onBtnClickHandler={onKosherBtnsClickHandler}
						key={currentScreen.type}
					/>
				);
				break;

			case onboardinTypes.GREETING:
				component = (
					<Greeting
						onDone={onOnboardingDone}
						params={currentScreen.params}
						animateOut={animateOut}
						key={currentScreen.type}
					/>
				);
				break;
			case onboardinTypes.SUPPORT_CHAT:
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
					/> // required for focus trap!
				);
				break;
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

	function header() {
		return (
			deviceState.isMobile &&
			currentScreen.headers && (
				<div className={clsx(styles["header"], styles[siteDirection])}>
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
			)
		);
	}

	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={styles["onboarding"]}
			header={header}
			showCloseIcon>
			<SlideAnimation stack={STACK_TYPES.ONBOARDING}>
				{RenderPopup()}
			</SlideAnimation>
		</SlidePopup>
	);
}

export default OnBoardingPopup;
