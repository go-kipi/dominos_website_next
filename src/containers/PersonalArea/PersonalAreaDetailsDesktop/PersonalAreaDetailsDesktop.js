import React, { useEffect, useRef, useState } from "react";

import Validate from "utils/validation";
import FullCircularCheckbox from "/public/assets/checkbox/red-checkbox-full-dark.svg";
import EmptyCircularCheckbox from "/public/assets/checkbox/red-checkbox-empty-dark.svg";

import ExclamationMark from "/public/assets/icons/circular-exclamation-mark.svg";
import CircularChecked from "/public/assets/icons/circular-blue-checked.svg";
import styles from "./PersonalAreaDetailsDesktop.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { fillDate } from "utils/functions/index.js";
import Api from "api/requests";
import Actions from "redux/actions";
import { INPUT_NAMES } from "../../../constants/input-names";
import AnimatedInput from "../../../components/forms/animated_input";
import Checkbox from "../../../components/forms/checkbox";
import Button from "../../../components/button";
import useKosher from "hooks/useKosher";
import { GeneralService } from "services/GeneralService";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "../../../components/accessibility/keyboardsEvents";
import SRContent from "../../../components/accessibility/srcontent";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_FOCUS,
} from "../../../constants/accessibility-types";
import moment from "moment/moment";
import { createAccessibilityText } from "../../../components/accessibility/acfunctions";

export default function PersonalAreaDetailsDesktop(props) {
	const translate = useTranslate();

	const [firstTry, setFirstTry] = useState(true);
	const [errorMsg, setErrorMsg] = useState(false);
	const [isFormValid, setIsFormValid] = useState(false);
	const [showSavedBtn, setShowSavedBtn] = useState(false);
	const isKosher = useKosher();
	const userData = useSelector((store) => store.userData);
	const generalData = useSelector((store) => store.generalData);
	const [focusElement, setFocusElement] = useState(false);
	const dispatch = useDispatch();
	const [selectedGender, setSelectedGender] = useState(userData?.gender || "");

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
		}
		delete payload.kosher;

		if (formValid) {
			delete payload.kosher;
			Api.setCustomerDetails({ payload, onSuccess });

			function onSuccess(res) {
				dispatch(Actions.setUser(res.data));
				setShowSavedBtn(true);

				if (payload.preferences.includes("kosher")) {
					GeneralService.setKosherPreference("1");
				} else {
					GeneralService.setKosherPreference("0");
				}

				let timeout = setTimeout(() => {
					setShowSavedBtn(false);
					clearTimeout(timeout);
				}, 3000);

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
				const isKosher =
					Array.isArray(userData.preferences) &&
					userData.preferences?.includes("kosher");
				oldState[key] = isKosher;
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

	function renderInputsWrap() {
		return (
			<>
				<AnimatedInput
					ref={input[INPUT_NAMES.FIRST_NAME].ref}
					className={clsx(styles["field"], styles["first"])}
					value={input[INPUT_NAMES.FIRST_NAME].value}
					placeholder={
						translate("register_popup_placeHolder_first_name") + translate("asterisk")
					}
					autocomplete={false}
					ariaRequired={true}
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
					ariaRequired={true}
					className={clsx(styles["field"], styles["second"])}
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
				<AnimatedInput
					ref={input[INPUT_NAMES.EMAIL].ref}
					ariaRequired={true}
					className={clsx(styles["field"], styles["third"])}
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
	}

	function renderDataWrap() {
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
			<>
				<div className={styles["phone-date-wrapper"]}>
					<div
						className={clsx(styles["field"], styles["data"], styles["first"])}
						tabIndex={0}>
						<span className={styles["data-title"]}>
							{translate("personalArea_personalDetails_phone")}
						</span>
						<span className={styles["data-value"]}>{generalData.phone}</span>
					</div>

					{userData.dateOfBirth ? (
						<div
							aria-label={dateSrText}
							className={clsx(styles["field"], styles["data"], styles["second"])}
							tabIndex={TAB_INDEX_DEFAULT}>
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
						<div className={clsx(styles["field"], styles["data"], styles["second"])}>
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
						</div>
					)}
				</div>

				<div className={clsx(styles["gender-wrap"], styles["third"])}>
					{renderGenderWrap()}
				</div>
			</>
		);
	}

	const onKeyDown = () => {
		if (!focusElement) {
			return;
		}

		onSelected(focusElement.target.id);
	};

	const onFocus = (event) => {
		setFocusElement(event);
	};

	const onBlur = () => {
		setFocusElement(false);
	};

	function renderGenderWrap() {
		return (
			<div className={styles["gender-container"]}>
				<span className={styles["gender-title"]}>
					{translate("personalArea_personalDetails_genderTitle")}
				</span>
				<div
					className={styles["gender-checkboxes"]}
					onKeyDown={(event) => handleKeyPress(event, onKeyDown)}>
					{Object.values(genders).map((item) => {
						return (
							<Checkbox
								key={"gender-" + item.id}
								className={`${styles["gender-checkbox"]} ${
									selectedGender === item.id && styles["bold"]
								}`}
								id={item.id}
								name={item.text}
								label={item.text}
								value={selectedGender === item.id}
								overrideVariant
								emptyImage={EmptyCircularCheckbox}
								checkedImage={FullCircularCheckbox}
								onChange={() => onSelected(item.id)}
								onBlur={onBlur}
								onFocus={onFocus}
								tabIndex={0}
							/>
						);
					})}
				</div>
			</div>
		);
	}

	function renderKosherCheckbox() {
		const setKosher = () => {
			const newState = { ...input };
			newState[INPUT_NAMES.KOSHER].value = !newState[INPUT_NAMES.KOSHER].value;
			AnalyticsService.personalAreaNavKosher(
				newState[INPUT_NAMES.KOSHER].value ? "on" : "off",
			);
			setInput(newState);
		};

		return (
			<div onKeyDown={(event) => handleKeyPress(event, setKosher)}>
				<Checkbox
					className={`${styles["kosher-checkbox"]} ${
						input[INPUT_NAMES.KOSHER].value ? styles["bold"] : ""
					}`}
					id={"kosher-checkbox"}
					name={"kosher-checkbox"}
					label={translate("personalArea_personalDetails_sendKosher")}
					value={input[INPUT_NAMES.KOSHER].value}
					emptyImage={EmptyCircularCheckbox}
					checkedImage={FullCircularCheckbox}
					overrideVariant
					onChange={setKosher}
					disabled={false}
					tabIndex={0}
					onFocus={onFocus}
					onBlur={onBlur}
					extraStyles={styles}
				/>
			</div>
		);
	}

	return (
		<div className={styles["personal-area-details-desktop"]}>
			<div className={styles["title-wrap"]}>
				<h1 className={styles["title"]}>
					{translate("personalArea_personalDetails_titleDetails")}
				</h1>
				<h2 className={styles["title"]}>
					{translate("personalArea_personalDetails_titleSettings")}
				</h2>
			</div>
			<div className={styles["row-wrap"]}>{renderInputsWrap()}</div>
			<Separator className={styles["top"]} />
			<div className={styles["row-wrap"]}>{renderDataWrap()}</div>

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
			<Separator className={styles["bottom"]} />
			<div className={styles["kosher-wrap"]}>{renderKosherCheckbox()}</div>

			<div className={styles["btn-container"]}>
				<div className={styles["btn-container-inner"]}>
					{showSavedBtn ? (
						<RenderSavedButton />
					) : (
						<Button
							className={styles["btn"]}
							text={translate("personalArea_personalDetails_save")}
							onClick={onSubmit}
							isBtnOnForm={true}
							errorText={errorMsg || translate("specialRequest_popup_error")}
							isError={showButtonError}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

export function RenderSavedButton() {
	const translate = useTranslate();

	return (
		<div className={styles["saved-btn-container"]}>
			<img
				className={"icon"}
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

function Separator({ className }) {
	return <div className={clsx(styles["separator"], className)} />;
}
