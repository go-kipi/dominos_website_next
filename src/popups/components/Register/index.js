import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

import { INPUT_NAMES } from "../../../constants/input-names";
import AnimatedInput from "../../../components/forms/animated_input";
import Button from "../../../components/button";
import { fillDate } from "utils/functions/index.js";
import Api from "api/requests";
import Validate from "utils/validation";
import Checkbox from "../../../components/forms/checkbox";

import LottieAnimation from "../../../components/LottieAnimation";

import RegisterLottie from "animations/register";

import FullCircularCheckbox from "/public/assets/checkbox/red-checkbox-full.svg";
import EmptyCircularCheckbox from "/public/assets/checkbox/red-checkbox-empty.svg";

import styles from "./index.module.scss";
import useKosher from "hooks/useKosher";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "../../../components/accessibility/keyboardsEvents";
import TermsCheckbox from "components/TermsCheckbox/TermsCheckbox";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

export default function RegisterPopup(props) {
	const translate = useTranslate();
	const [firstTry, setFirstTry] = useState(true);
	const [errorMsg, setErrorMsg] = useState(false);
	const [isFormValid, setIsFormValid] = useState(false);
	const userData = useSelector((store) => store?.userData);
	const dispatch = useDispatch();
	const [selectedGender, setSelectedGender] = useState(userData?.gender ?? "");
	const [focusedElement, setFocusedElement] = useState(null);
	const isKosher = useKosher();
	const { navigateToSuccess } = props;
	const isUserBack = userData.type !== "new";

	const genders = {
		WOMAN: {
			id: "female",
			text: translate("personalArea_pesonalDetails_genderWoman"),
		},
		MEN: {
			id: "male",
			text: translate("personalArea_pesonalDetails_genderMen"),
		},
		NOT_RELEVANT: {
			id: "none",
			text: translate("personalArea_pesonalDetails_genderNotRelevant"),
		},
	};
	const [input, setInput] = useState({
		[INPUT_NAMES.FIRST_NAME]: {
			value: isUserBack ? userData.firstName : "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty","minLength"],
		},
		[INPUT_NAMES.LAST_NAME]: {
			value: isUserBack ? userData.lastName : "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty","minLength"],
		},
		[INPUT_NAMES.EMAIL]: {
			value: isUserBack ? userData.email : "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["email"],
		},
		[INPUT_NAMES.BIRTH_DATE]: {
			value: isUserBack ? arrangeDate(userData.dateOfBirth) : "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["no_validation"],
		},
		[INPUT_NAMES.TERM_OF_SERVICE]: {
			value: isUserBack ? userData.approvedTerms : false,
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["checkbox_term_of_service"],
		},
		// [INPUT_NAMES.MARKETING]: {
		//     value: isUserBack ? userData.allowMarketing : true,
		//     valid: false,
		//     errorMsg: "",
		//     rules: ["no_validation"],
		// },
	});

	function onKeyDown() {
		if (!focusedElement) {
			return;
		}
		const name = focusedElement.target.getAttribute("name");
		if (name === "gender") {
			onSelected(focusedElement);
		} else {
			const id = focusedElement.target.getAttribute("id");
			const newState = { ...input };
			newState[id].value = !newState[id].value;
			setInput(newState);
		}
	}

	function onFocus(event) {
		setFocusedElement(event);
	}

	function onBlur() {
		setFocusedElement(null);
	}

	function rearangeDate(originalDate) {
		if (!originalDate) {
			return "";
		}
		const parts = originalDate.split("/");
		return parts[2] + "-" + parts[1] + "-" + parts[0];
	}

	function arrangeDate(originalDate) {
		if (!originalDate) {
			return "";
		}
		const parts = originalDate.split("-");

		for (const index in parts) {
			if (parts[index].length === 1) {
				parts[index] = "0" + parts[index];
			}
		}
		return parts[2] + "/" + parts[1] + "/" + parts[0];
	}

	function onSubmit() {
		let formValid = true;
		const newState = { ...input };
		let validationObj;
		const payload = {};
		let firstInvalidRef = null;

		for (const key in input) {
			validationObj = Validate(input[key].value, input[key].rules);
			newState[key].valid = validationObj.valid;
			newState[key].errorMsg = validationObj.msg;

			payload[key] = input[key].value;

			if (!validationObj.valid && !firstInvalidRef) {
				firstInvalidRef = newState[key]?.ref;
				formValid = false;
				setErrorMsg(validationObj.msg);
			}
		}

		setInput(newState);
		setFirstTry(false);
		setIsFormValid(formValid);

		payload.gender = selectedGender;
		if (isKosher) {
			payload.preferences = ["kosher"];
		}

		if (payload[INPUT_NAMES.BIRTH_DATE]) {
			payload[INPUT_NAMES.BIRTH_DATE] = rearangeDate(
				payload[INPUT_NAMES.BIRTH_DATE],
			);
		}
		if (formValid) {
			Api.setCustomerDetails({ payload, onSuccess });

			function onSuccess(res) {
				dispatch(Actions.setUser({ ...res.data, approvedTerms: true }));

				setTimeout(() => {
					AnalyticsService.signup("form");
					navigateToSuccess(res.data);
				}, 500);
			}
		} else {
			firstInvalidRef?.current?.focus();
		}
	}

	// Date validation will only work if the input is filled
	function changeDateRules(value) {
		if (value) return ["date"];
		else return ["no_validation"];
	}

	function onSelected(e) {
		const { id } = e.target;
		if (id === selectedGender) {
			setSelectedGender("");
		} else {
			setSelectedGender(id);
		}
	}

	function onChangeCheckBox(e) {
		const { id, checked } = e.target;
		updateInputValidation(id, checked);
	}

	function updateInputValidation(id, checked) {
		const newState = { ...input };
		const validationObj = Validate(checked, input[id].rules);
		newState[id].valid = validationObj.valid;
		newState[id].value = checked;
		newState[id].errorMsg = validationObj.msg;
		setInput(newState);
	}

	function onChange(response) {
		const name = response?.target?.name;
		const value = response?.target?.value;

		const newState = { ...input };

		const validationObj = Validate(value, input[name].rules);
		newState[name].valid = validationObj.valid;
		const lastValue = newState[name].value;
		newState[name].value = value;
		if (name === INPUT_NAMES.BIRTH_DATE) {
			newState[name].rules = changeDateRules(value);
			newState[name].value = fillDate(lastValue, newState[name].value);
		}
		newState[name].errorMsg = validationObj.msg;

		setInput(newState);
	}

	function showError(field) {
		return !firstTry && !input[field].valid;
	}

	function showErrorBtn() {
		return !firstTry && !isFormValid;
	}

	const showButtonError = showErrorBtn();

	const renderGenderCheckboxes = () => {
		return (
			<>
				{Object.values(genders).map((gender, index) => {
					return (
						<Checkbox
							key={"gender-" + index}
							className={clsx(
								styles["gender-checkbox"],
								selectedGender === gender.id && styles["bold"],
							)}
							id={gender.id}
							type={"checkbox"}
							name={"gender"}
							label={gender.text}
							value={selectedGender === gender.id}
							emptyImage={EmptyCircularCheckbox}
							checkedImage={FullCircularCheckbox}
							overrideVariant
							onChange={onSelected}
							tabIndex={0}
							onFocus={onFocus}
							onBlur={onBlur}
							ariaLabel={gender.text}
							extraStyles={styles}
						/>
					);
				})}
			</>
		);
	};

	const renderInputsWrap = () => {
		return (
			<>
				<div className={styles["input-row"]}>
					<AnimatedInput
						ref={input[INPUT_NAMES.FIRST_NAME].ref}
						className={styles["field"]}
						value={input[INPUT_NAMES.FIRST_NAME].value}
						placeholder={translate("register_popup_placeHolder_first_name") + "*"}
						autocomplete={false}
						onChange={(e) => onChange(e)}
						showError={showError(INPUT_NAMES.FIRST_NAME)}
						errorMsg={input[INPUT_NAMES.FIRST_NAME].errorMsg}
						name={INPUT_NAMES.FIRST_NAME}
						placeHolderClass={styles["custom-placeholder"]}
						focusPlaceHolderClass={styles["focus-custom-placeholder"]}
						showCloseIcon
						ariaRequired={true}
					/>
					<AnimatedInput
						ref={input[INPUT_NAMES.LAST_NAME].ref}
						className={styles["field"]}
						value={input[INPUT_NAMES.LAST_NAME].value}
						placeholder={translate("register_popup_placeHolder_last_name") + "*"}
						autocomplete={false}
						onChange={(e) => onChange(e)}
						showError={showError(INPUT_NAMES.LAST_NAME)}
						errorMsg={input[INPUT_NAMES.LAST_NAME].errorMsg}
						name={INPUT_NAMES.LAST_NAME}
						placeHolderClass={styles["custom-placeholder"]}
						focusPlaceHolderClass={styles["focus-custom-placeholder"]}
						showCloseIcon
						ariaRequired={true}
					/>
				</div>
				<div className={clsx(styles["input-row"], styles["second"])}>
					<AnimatedInput
						ref={input[INPUT_NAMES.EMAIL].ref}
						className={clsx(styles["field"], styles["email"])}
						value={input[INPUT_NAMES.EMAIL].value}
						placeholder={translate("register_popup_placeHolder_email") + "*"}
						autocomplete={false}
						onChange={(e) => onChange(e)}
						showError={showError(INPUT_NAMES.EMAIL)}
						errorMsg={input[INPUT_NAMES.EMAIL].errorMsg}
						name={INPUT_NAMES.EMAIL}
						placeHolderClass={styles["custom-placeholder"]}
						showCloseIcon
						focusPlaceHolderClass={styles["focus-custom-placeholder"]}
						ariaRequired={true}
					/>
					{userData.dateOfBirth ? (
						<div className={styles["data"]}>
							<span className={styles["data-title"]}>
								{translate("personalArea_personalDetails_date")}
							</span>
							<span className={styles["data-value"]}>
								{arrangeDate(userData.dateOfBirth)}
							</span>
						</div>
					) : (
						<AnimatedInput
							ref={input[INPUT_NAMES.BIRTH_DATE].ref}
							className={clsx(styles["field"], styles["birthdate"])}
							value={input[INPUT_NAMES.BIRTH_DATE].value}
							placeholder={translate("register_popup_placeHolder_birthDate_notMust")}
							autocomplete={false}
							onChange={(e) => onChange(e)}
							showError={showError(INPUT_NAMES.BIRTH_DATE)}
							errorMsg={input[INPUT_NAMES.BIRTH_DATE].errorMsg}
							name={INPUT_NAMES.BIRTH_DATE}
							placeHolderClass={styles["custom-placeholder"]}
							showCloseIcon
							focusPlaceHolderClass={styles["focus-custom-placeholder"]}
							maxLength={10}
							errorClassName={styles["error-custom"]}
							ariaRequired={input[INPUT_NAMES.BIRTH_DATE].value > 0}
							type={"tel"}
						/>
					)}
				</div>
				<span className={styles["birth-date-add-text"]}>
					{translate("register_popup_birthDaySubText")}
				</span>
			</>
		);
	};

	const renderCheckboxButtons = () => {
		return (
			<>
				<TermsCheckbox
					ref={input[INPUT_NAMES.TERM_OF_SERVICE].ref}
					name={INPUT_NAMES.TERM_OF_SERVICE}
					onChange={onChangeCheckBox}
					value={input[INPUT_NAMES.TERM_OF_SERVICE].value}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			</>
		);
	};

	function RenderPopup() {
		return (
			<div
				className={styles["register-content"]}
				onKeyDown={(event) => handleKeyPress(event, onKeyDown)}>
				<div className={styles["title-wrap"]}>
					<LottieAnimation
						className={styles["lottie"]}
						animation={RegisterLottie}
					/>
					{isUserBack ? (
						<span className={styles["sub-title"]} tabIndex={0}>
							{translate("register_popup_subTitle_comeBack")}
						</span>
					) : null}
					<h1
						id="desc"
						className={styles["register-title"]} tabIndex={0}>
						{isUserBack
							? translate("register_popup_title_your_details")
							: translate("register_popup_title")}
					</h1>
				</div>

				<fieldset className={styles["gender-wrap"]}>
					<legend className={"visually-hidden"}>
						{translate("accessibility_legend_choose_gender")}
					</legend>
					{renderGenderCheckboxes()}
				</fieldset>
				<div className={styles["input-wrap"]}>{renderInputsWrap()}</div>

				<div className={styles["checkboxes-wrap"]}>{renderCheckboxButtons()}</div>

				<Button
					isPrimary={true}
					className={styles["btn"]}
					text={
						!userData
							? translate("register_popup_logIn_button")
							: translate("register_popup_save_and_continue")
					}
					onClick={onSubmit}
					isBtnOnForm={true}
					errorText={errorMsg || translate("specialRequest_popup_error")}
					isError={showButtonError}
				/>
			</div>
		);
	}

	return <div className={styles["content"]}>{RenderPopup()}</div>;
}
