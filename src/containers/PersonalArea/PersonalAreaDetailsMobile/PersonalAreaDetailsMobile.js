import React, { useEffect, useRef, useState } from "react";

import styles from "./PersonalAreaDetailsMobile.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { INPUT_NAMES } from "../../../constants/input-names";
import Checkbox from "../../../components/forms/checkbox";
import Validate from "utils/validation";
import Api from "api/requests";
import Actions from "redux/actions";
import { fillDate } from "utils/functions/index.js";
import AnimatedInput from "../../../components/forms/animated_input";
import Button from "../../../components/button";

import FullCircularCheckbox from "/public/assets/checkbox/red-checkbox-full-dark.svg";
import EmptyCircularCheckbox from "/public/assets/checkbox/red-checkbox-empty-dark.svg";
import ExclamationMark from "/public/assets/icons/circular-exclamation-mark.svg";
import CircularChecked from "/public/assets/icons/circular-blue-checked.svg";
import useKosher from "hooks/useKosher";
import { GeneralService } from "services/GeneralService";
import clsx from "clsx";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import PERSONAL_AREA_SCREEN_TYPES from "constants/personal-area-screen-types";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "../../../components/accessibility/keyboardsEvents";
import SRContent from "../../../components/accessibility/srcontent";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import moment from "moment";
import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_FOCUS,
} from "../../../constants/accessibility-types";
import { createAccessibilityText } from "../../../components/accessibility/acfunctions";

export default function PersonalAreaDetailsMobile(props) {
	const translate = useTranslate();

	const [firstTry, setFirstTry] = useState(true);
	const [errorMsg, setErrorMsg] = useState(false);
	const [isFormValid, setIsFormValid] = useState(false);
	const [showSavedBtn, setShowSavedBtn] = useState(false);

	const userData = useSelector((store) => store.userData);
	const generalData = useSelector((store) => store.generalData);
	const [focusElement, setFocusElement] = useState(false);
	const dispatch = useDispatch();
	const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.PERSONAL_AREA);

	const [selectedGender, setSelectedGender] = useState(userData?.gender);
	const isKosher = useKosher();

	const genders = {
		WOMAN: {
			id: "female",
			text: translate("register_popup_radioBtn_woman"),
		},
		MEN: {
			id: "male",
			text: translate("register_popup_radioBtn_men"),
		},
		NOT_RELEVANT: {
			id: "none",
			text: translate("register_popup_radioBtn_notRelevant"),
		},
	};
	const [input, setInput] = useState({
		[INPUT_NAMES.FIRST_NAME]: {
			value: userData.firstName,
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty"],
		},
		[INPUT_NAMES.LAST_NAME]: {
			value: userData.lastName,
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty"],
		},
		[INPUT_NAMES.EMAIL]: {
			value: userData.email,
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["email"],
		},
		[INPUT_NAMES.KOSHER]: {
			value: isKosher,
			valid: false,
			errorMsg: "",
			rules: ["no_validation"],
		},
		[INPUT_NAMES.BIRTH_DATE]: {
			value: arrangeDate(userData.dateOfBirth),
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["date"],
		},
	});

	useEffect(() => {
		AnalyticsService.personalAreaEntries("details enteries");
	}, []);

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

	function rearangeDate(originalDate) {
		if (!originalDate) {
			return "";
		}
		const parts = originalDate.split("/");
		return parts[2] + "-" + parts[1] + "-" + parts[0];
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

		payload.termsApproval = userData.approvedTerms;
		payload.allowMarketing = userData.allowMarketing;

		if (selectedGender) {
			payload.gender = selectedGender;
		}
		if (payload[INPUT_NAMES.BIRTH_DATE]) {
			payload[INPUT_NAMES.BIRTH_DATE] = rearangeDate(
				payload[INPUT_NAMES.BIRTH_DATE],
			);
		}

		payload.preferences = [];

		if (payload.kosher) {
			payload.preferences.push("kosher");
			const value = payload.kosher ? "1" : "0";
			GeneralService.setKosherPreference(value);
		}
		delete payload.kosher;

		if (formValid) {
			delete payload.kosher;
			Api.setCustomerDetails({ payload, onSuccess });

			function onSuccess(res) {
				dispatch(Actions.setUser(res.data));

				setTimeout(() => {
					setShowSavedBtn(true);
					const timeout = setTimeout(() => {
						setStack({
							type: PERSONAL_AREA_SCREEN_TYPES.MAIN,
							params: {},
						});

						clearTimeout(timeout);
					}, 250);
				}, 500);
				handleAnalytics(newState);
			}
		} else {
			firstInvalidRef?.current?.focus();
		}
	}

	const handleAnalytics = (changedState) => {
		const oldState = {};

		Object.keys(input).forEach((key) => {
			if (key === INPUT_NAMES.KOSHER) {
				oldState[key] = userData.preferences?.includes("kosher");
			} else if (key === INPUT_NAMES.BIRTH_DATE) {
				oldState[key] = arrangeDate(userData.dateOfBirth);
			} else {
				oldState[key] = userData[key];
			}
		});
		Object.keys(changedState).forEach((key) => {
			if (changedState[key].value !== oldState[key]) {
				AnalyticsService.personalAreaDetailsUpdate(`${key + " Update"}`);
			}
		});
	};

	function onSelected(id) {
		if (id === selectedGender) {
			setSelectedGender("");
		} else {
			setSelectedGender(id);
		}
	}

	function onChange(response) {
		const name = response?.target?.name;
		let value = response?.target?.value;
		const type = response?.target?.type;
		setFirstTry(true);

		const newState = { ...input };

		if (type === "checkbox") {
			value = response.target.checked;
		}
		const validationObj = Validate(value, input[name].rules);
		newState[name].valid = validationObj.valid;
		const lastValue = newState[name].value;
		newState[name].value = value;

		if (name === INPUT_NAMES.BIRTH_DATE) {
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

	const onFocus = (event) => {
		setFocusElement(event);
	};

	const onBlur = () => {
		setFocusElement(null);
	};

	const onKeyDown = () => {
		if (!focusElement) {
			return;
		}
		onSelected(focusElement.target.id);
	};

	const renderGenderCheckboxes = () => {
		return (
			<>
				{Object.values(genders).map((item) => {
					return (
						<Checkbox
							key={"gender-" + item.id}
							className={clsx(
								styles["gender-checkbox"],
								selectedGender === item.id && styles["bold"],
							)}
							id={item.id}
							name={item.text}
							label={item.text}
							value={selectedGender === item.id}
							emptyImage={EmptyCircularCheckbox}
							checkedImage={FullCircularCheckbox}
							overrideVariant
							onChange={() => onSelected(item.id)}
							onFocus={onFocus}
							onBlur={onBlur}
							tabIndex={0}
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
						placeholder={
							translate("register_popup_placeHolder_first_name") +
							translate("asterisk")
						}
						autocomplete={false}
						onChange={(e) => onChange(e)}
						showError={showError(INPUT_NAMES.FIRST_NAME)}
						errorMessage={input[INPUT_NAMES.FIRST_NAME].errorMsg}
						name={INPUT_NAMES.FIRST_NAME}
						placeHolderClass={styles["custom-placeholder"]}
						focusPlaceHolderClass={styles["focus-custom-placeholder"]}
						showCloseIcon
					/>
					<AnimatedInput
						ref={input[INPUT_NAMES.LAST_NAME].ref}
						className={styles["field"]}
						value={input[INPUT_NAMES.LAST_NAME].value}
						placeholder={
							translate("register_popup_placeHolder_last_name") + translate("asterisk")
						}
						autocomplete={false}
						onChange={(e) => onChange(e)}
						showError={showError(INPUT_NAMES.LAST_NAME)}
						errorMessage={input[INPUT_NAMES.LAST_NAME].errorMsg}
						name={INPUT_NAMES.LAST_NAME}
						placeHolderClass={styles["custom-placeholder"]}
						focusPlaceHolderClass={styles["focus-custom-placeholder"]}
						showCloseIcon
					/>
				</div>

				<AnimatedInput
					ref={input[INPUT_NAMES.EMAIL].ref}
					className={clsx(styles["field"], styles["email"])}
					value={input[INPUT_NAMES.EMAIL].value}
					placeholder={
						translate("register_popup_placeHolder_email") + translate("asterisk")
					}
					autocomplete={false}
					onChange={(e) => onChange(e)}
					showError={showError(INPUT_NAMES.EMAIL)}
					errorMessage={input[INPUT_NAMES.EMAIL].errorMsg}
					name={INPUT_NAMES.EMAIL}
					placeHolderClass={styles["custom-placeholder"]}
					showCloseIcon
					focusPlaceHolderClass={styles["focus-custom-placeholder"]}
				/>
			</>
		);
	};

	function getNoEditedData() {
		const birthDayMoment = userData.dateOfBirth
			? moment(userData.dateOfBirth, "YYYY-MM-DD")
			: moment();
		const dateString = birthDayMoment
			.toDate()
			.toLocaleDateString(["he-IL", "en-US"], {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
		const dateSrText = createAccessibilityText(
			translate("personalArea_personalDetails_date"),
			dateString,
		);
		return (
			<div className={clsx(styles["date-phone-wrapper"], styles["input-row"])}>
				<div
					className={styles["data"]}
					tabIndex={0}>
					<span className={styles["data-title"]}>
						{translate("personalArea_personalDetails_phone")}
					</span>
					<span className={styles["data-value"]}>{generalData?.phone}</span>
				</div>

				{
					// In case there is no date input - let user add email
					userData.dateOfBirth ? (
						<div
							aria-label={dateSrText}
							className={styles["data"]}
							tabIndex={TAB_INDEX_FOCUS}>
							<span
								className={styles["data-title"]}
								aria-hidden={true}>
								{translate("personalArea_personalDetails_date")}
							</span>
							<span
								className={styles["data-value"]}
								aria-hidden={true}>
								{arrangeDate(userData.dateOfBirth)}
							</span>
						</div>
					) : (
						<AnimatedInput
							ref={input[INPUT_NAMES.BIRTH_DATE].ref}
							className={styles["field"]}
							value={input[INPUT_NAMES.BIRTH_DATE].value}
							placeholder={translate("personalArea_personalDetails_date")}
							autocomplete={false}
							onChange={(e) => onChange(e)}
							showError={showError(INPUT_NAMES.BIRTH_DATE)}
							errorMessage={input[INPUT_NAMES.BIRTH_DATE].errorMsg}
							name={INPUT_NAMES.BIRTH_DATE}
							placeHolderClass={styles["custom-placeholder"]}
							focusPlaceHolderClass={styles["focus-custom-placeholder"]}
							showCloseIcon
							maxLength={10}
							type={"tel"}
						/>
					)
				}
			</div>
		);
	}

	return (
		<div className={styles["personal-area-mobile-details-wrap"]}>
			<GeneralHeader
				title={translate("personalArea_menu_personalDetails_title")}
				back
				backOnClick={goBack}
				gradient
			/>
			<div className={styles["body"]}>
				<div
					className={styles["gender-wrap"]}
					onKeyDown={(event) => handleKeyPress(event, onKeyDown)}>
					{renderGenderCheckboxes()}
				</div>

				<div className={styles["input-wrap"]}>{renderInputsWrap()}</div>

				<div className={clsx(styles["input-wrap"], styles["data-row"])}>
					{getNoEditedData()}
				</div>
				<div className={styles["note-wrap"]}>
					<img
						className={styles["icon"]}
						src={ExclamationMark.src}
					/>
					<span
						className={styles["note-text"]}
						tabIndex={0}>
						<SRContent
							message={
								!userData.dateOfBirth
									? translate("personalArea_personalDetails_noteText_phoneChange")
									: translate("personalArea_personalDetails_noteText")
							}
							role={"alert"}
						/>
						{!userData.dateOfBirth
							? translate("personalArea_personalDetails_noteText_phoneChange")
							: translate("personalArea_personalDetails_noteText")}
					</span>
				</div>
				{showSavedBtn ? (
					<RenderSavedButton />
				) : (
					<Button
						className={styles["btn"]}
						text={translate("personalArea_personalDetails_save")}
						onClick={onSubmit}
						isBtnOnForm
						errorText={errorMsg || translate("specialRequest_popup_error")}
						isError={showButtonError}
						show={!isFormValid}
					/>
				)}
			</div>
		</div>
	);
}

export function RenderSavedButton() {
	const translate = useTranslate();

	return (
		<div className={styles["saved-btn-container"]}>
			<img
				className={styles["icon"]}
				src={CircularChecked.src}
				alt={"icon"}
			/>
			<span
				className={styles["saved-text"]}
				role={"alert"}>
				{translate("personalArea_personalDetails_saved")}
				<SRContent
					message={translate("accessibility_personalArea_saved_screenReaderContent")}
				/>
			</span>
		</div>
	);
}
