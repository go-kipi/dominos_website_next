import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

import { OTP_METHODS } from "constants/otp-methods";
import Api from "api/requests";
import styles from "./index.module.scss";

import TextInput from "components/forms/textInput";
import TextOnlyButton from "components/text_only_button";
import IdentificationAnimation from "animations/identification.json";
import LottieAnimation from "components/LottieAnimation";
import { GPS_STATUS } from "constants/gps-status";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { MENUS } from "constants/menu-types";
import useOrder from "hooks/useOrder";
import RecaptchaText from "components/recaptcha";
import {
	KEY_ARROW_LEFT,
	KEY_ARROW_RIGHT,
	KEY_BACKSPACE,
	KEY_ENTER,
} from "../../../../constants/accessibility-types";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

const defaultOptions = {
	loop: false,
	autoplay: true,
	animation: IdentificationAnimation,
};

function OTP(props) {
	const { inOnBoarding = true } = props;
	const translate = useTranslate();
	const [refArray, setRefArray] = useState([
		useRef(),
		useRef(),
		useRef(),
		useRef(),
		useRef(),
		useRef(),
	]);
	const [inputsArr, setInputsArr] = useState([
		{
			val: "",
			disabled: false,
			focused: true,
		},
		{
			val: "",
			disabled: true,
			focused: false,
		},
		{
			val: "",
			disabled: true,
			focused: false,
		},
		{
			val: "",
			disabled: true,
			focused: false,
		},
		{
			val: "",
			disabled: true,
			focused: false,
		},
		{
			val: "",
			disabled: true,
			focused: false,
		},
	]);
	const [etaOtp, setEtaOtp] = useState(5);
	const [isOtpActive, setIsOtpActive] = useState(false);
	const [isError, setIsError] = useState(false);
	const timer = useRef();
	const [submitOtp, setSubmitOtp] = useState(false);
	const generalData = useSelector((store) => store.generalData);
	const deviceState = useSelector((store) => store.deviceState);
	const dispatch = useDispatch();
	const { hasOrder } = useOrder();

	//set the initial focus on the first input
	useEffect(() => {
		setIsOtpActive(true);
		refArray[0].current.focus();
	}, []);

	useEffect(() => {
		decreaseLeftTime(etaOtp);
	}, [etaOtp]);

	//submit code when all digits are entered
	useEffect(() => {
		if (!submitOtp) {
			let allNums = "";
			for (let i = 0; i < inputsArr.length; i++) {
				allNums += inputsArr[i].val;
			}
			if (allNums.length === inputsArr.length) {
				onSubmitOtp(allNums);
			}
		}
	}, [submitOtp, inputsArr]);

	//set focus on next input
	useEffect(() => {
		for (let index in inputsArr) {
			if (inputsArr[index].focused) {
				refArray[index].current.focus();
			} else {
				refArray[index].current.blur();
			}
		}
	}, [inputsArr]);

	function handleOtpChange(e, index) {
		const { value } = e.target;
		let updatedInputsArr = JSON.parse(JSON.stringify(inputsArr));

		//if entire code is pasted into the input, distribute them between inputs
		if (value.length === updatedInputsArr.length) {
			updatedInputsArr.forEach((item, index) => {
				item.val = value[index];
			});
		} else {
			updatedInputsArr[index].val = value.substring(0, 1);
		}

		updatedInputsArr = clearFocus(updatedInputsArr);

		if (index !== inputsArr.length - 1) {
			updatedInputsArr[index + 1].focused = true;
		}
		updatedInputsArr = updateDisabledFields(updatedInputsArr);

		setInputsArr(updatedInputsArr);
	}

	function handleKeyDown(evt, index) {
		if (evt.key === KEY_ARROW_RIGHT || evt.key === KEY_ENTER) {
			moveToNextRef(index);
		}
		if (evt.key === KEY_ARROW_LEFT) {
			moveToPrevRef(index);
		}
		if (evt.key === KEY_BACKSPACE) {
			handleBackspace(evt, index);
		}
	}

	function handleBackspace(e, index) {
		let updatedInputsArr = JSON.parse(JSON.stringify(inputsArr));

		if (updatedInputsArr[index].val !== "") {
			updatedInputsArr[index].val = "";
		} else {
			if (index > 0) {
				updatedInputsArr[index - 1].val = "";
				updatedInputsArr = clearFocus(updatedInputsArr);
				updatedInputsArr[index - 1].focused = true;
			}
		}

		updatedInputsArr = updateDisabledFields(updatedInputsArr);
		updatedInputsArr = handleLostFocus(updatedInputsArr);

		setInputsArr(updatedInputsArr);
	}

	function handleLostFocus(updatedInputsArr) {
		const focusFound = updatedInputsArr.find((item) => {
			return item.focused;
		});

		if (!focusFound) {
			for (let i = updatedInputsArr.length - 1; i >= 0; i--) {
				if (!updatedInputsArr.disabled) {
					updatedInputsArr[i].focused = true;
				}
			}
		}
		return updatedInputsArr;
	}

	//disabled inputs from the end of the array and breaks on first input that should be enabled
	function updateDisabledFields(updatedInputsArr) {
		for (let i = updatedInputsArr.length - 1; i >= 0; i--) {
			if (i !== 0) {
				let prevIndex = i - 1;
				let isDisabled = updatedInputsArr[prevIndex].val === "";
				updatedInputsArr[i].disabled = isDisabled;
				if (isDisabled) {
					updatedInputsArr[i].focused = false;
					refArray[i].current.blur();
				} else {
					break;
				}
			}
		}
		return updatedInputsArr;
	}

	function moveToNextRef(index) {
		if (index < 5) {
			let updatedInputsArr = JSON.parse(JSON.stringify(inputsArr));
			if (!updatedInputsArr[index + 1].disabled) {
				updatedInputsArr[index].focused = false;
				updatedInputsArr[index + 1].focused = true;
				setInputsArr(updatedInputsArr);
			}
		}
	}

	function moveToPrevRef(index) {
		let prevInputIndex = index - 1;
		if (index > 0) {
			let updatedInputsArr = JSON.parse(JSON.stringify(inputsArr));

			if (!updatedInputsArr[prevInputIndex].disabled) {
				updatedInputsArr[index].focused = false;
				updatedInputsArr[prevInputIndex].focused = true;
			}

			setInputsArr(updatedInputsArr);
		}
	}

	function decreaseLeftTime(leftTime) {
		if (leftTime === 0) {
			return;
		}
		timer.current = setTimeout(() => {
			setEtaOtp((prevState) => {
				return prevState - 1;
			});
		}, 1000);
	}

	function onSubmitOtp(otpCode) {
		setSubmitOtp(true);

		const payload = {
			pinCode: otpCode,
		};

		const handleAnalytics = (callback1, callback2) => {
			if (inOnBoarding) {
				typeof callback1 === "function" && callback1();
			} else {
				typeof callback2 === "function" && callback2();
			}
		};

		const onSuccessCB = () => {
			if (deviceState.isMobile) {
				window.scrollTo(0, 0);
			}
			getCustomerDetails();
			handleAnalytics(
				() => AnalyticsService.login("sms"),
				() => AnalyticsService.signupOTP("send otp"),
			);
		};
		const onRejectionCB = (res) => {
			resetAllOtpFields();
			setIsError(true);
			setIsOtpActive(false);
			setSubmitOtp(false);

			handleAnalytics(
				() => AnalyticsService.onboardingLoginFailed(res.message.id),
				() => AnalyticsService.signupOTPFail(res.message.id),
			);
		};

		Api.verifyOtp({
			payload,
			onSuccessCB,
			onRejectionCB,
		});
	}

	function resetAllOtpFields() {
		let updatedInputsArr = [...inputsArr];

		for (let i = 0; i < updatedInputsArr.length; i++) {
			updatedInputsArr[i].val = "";
			updatedInputsArr[i].disabled = true;
			updatedInputsArr[i].focused = false;
		}

		updatedInputsArr[0].disabled = false;
		updatedInputsArr[0].focused = false;

		setInputsArr(updatedInputsArr);
	}

	function getCustomerDetails() {
		const payload = {
			gpsstatus: generalData?.gpsstatus ?? GPS_STATUS.OFF,
		};
		dispatch(Actions.resetUser());

		Api.getCustomerDetails({
			payload,
			onSuccessCB: (res) => {
				dispatch(Actions.setUser(res.data));

				if (hasOrder && !inOnBoarding) {
					const payload = { menuId: MENUS.DIGITAL_MENU };

					Api.getMenus({ payload });
				}

				props.onOTPSend(res.data);
			},
		});
	}

	function clearFocus(inputsObject) {
		//reset previous focused input

		inputsObject.forEach((item) => {
			item.focused = false;
		});
		return inputsObject;
	}

	function sendCodeAgain() {
		const payload = {
			otpMethod: props.params.method,
			customerId: props.params.phone,
			language: generalData.lang,
		};
		Api.sendOtp({ payload });
	}

	const handleOnFocus = (index) => {
		let updatedInputsArr = JSON.parse(JSON.stringify(inputsArr));
		updatedInputsArr = clearFocus(updatedInputsArr);
		updatedInputsArr[index].focused = true;
		setInputsArr(updatedInputsArr);
	};

	const { phone } = props.params;
	const otpEtaText = translate(
		props.params.method === OTP_METHODS.TEXT
			? "otp_sms_will_come_in_seconds"
			: "otp_we_will_call_to_you_in_seconds",
	)?.replace("{leftTime}", etaOtp);
	const subtitleText = translate("otp_subtitle_sentNumber")?.replace(
		"{phone}",
		phone,
	);

	const isActive = isOtpActive;

	const title =
		props.params.method === OTP_METHODS.TEXT
			? translate("otp_we_send_you_sms")
			: translate("otp_we_are_calling");

	const btnText =
		props.params.method === OTP_METHODS.TEXT
			? translate("otp_send_me_again")
			: translate("otp_call_me_again");

	const getOtpInputs = () => {
		let inputArr = inputsArr.map((input, index) => {
			return (
				<TextInput
					className={clsx(styles["otp-input"], isError ? styles["error"] : "")}
					onChange={(e) => handleOtpChange(e, index)}
					required
					centerInput
					type="number"
					value={input.val}
					name={"input" + index}
					ref={refArray[index]}
					key={"otp-input-" + index}
					extraStyles={styles}
					ariaLabel={
						translate("accessibility_aria_otp_writeDigit") +
						(index + 1) +
						translate("accessibility_aria_otp_outOf") +
						inputsArr.length
					}
					ariaDescribedBy={isError ? "otpInput" : ""}
					onKeyDown={(e) => handleKeyDown(e, index)}
					onFocus={() => handleOnFocus(index)}
					disabled={input.disabled}
				/>
			);
		});
		return inputArr;
	};

	const handleActivateInputs = () => {
		if (!isOtpActive) {
			setIsOtpActive(true);
			refArray[0].current.focus();
		}
	};

	return (
		<div
			className={styles["otp"]}
			role={"group"}
			aria-labelledby={"otp-group-label"}>
			<div className={styles["image-wrapper"]}>
				<LottieAnimation {...defaultOptions} />
			</div>
			{!isError && (
				<>
					<h3
						id={"otp-group-label"}
						className={styles["title-label"]} tabIndex={0}>
						{title}
					</h3>
					<h4 className={styles["subtitle-label"]} tabIndex={0}>{subtitleText}</h4>
				</>
			)}
			{isError && (
				<>
					<h1
						id="otpInput"
						role={"alert"}
						className={styles["title-label"]} tabIndex={0}>
						{translate("otp_error_title")}
					</h1>
					<h2 className={styles["subtitle-label"]} tabIndex={0}>{translate("otp_type_again")}</h2>
				</>
			)}

			<div
				className={clsx(styles["otp-wrapper"], isActive ? styles["active"] : "")}
				onClick={handleActivateInputs}>
				{!isOtpActive && (
					<span className={styles["placeHolder"]} tabIndex={0}>
						{translate("otp_placeholderLabel")}
					</span>
				)}
				{getOtpInputs()}
			</div>
			<RecaptchaText styles={styles} />
			<div className={styles["eta-wrapper"]}>
				{etaOtp > 0 && <span className={styles["otp-eta"]} aria-hidden={true}>{otpEtaText}</span>}
				{etaOtp === 0 && (
					<TextOnlyButton
						className={styles["send-again"]}
						text={btnText}
						onClick={sendCodeAgain}
					/>
				)}
			</div>
		</div>
	);
}

export default OTP;
