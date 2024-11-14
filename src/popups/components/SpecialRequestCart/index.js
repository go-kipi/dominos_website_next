import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

import { INPUT_NAMES } from "../../../constants/input-names";
import styles from "./index.module.scss";
import AnimatedInput from "../../../components/forms/animated_input";
import Button from "../../../components/button";

import Validate from "utils/validation";
import SlidePopup from "popups/Presets/SlidePopup";
import useTranslate from "hooks/useTranslate";

const MAX_WORDS = 40;
export default function SpecialRequestCart(props) {
	const [firstTry, setFirstTry] = useState(true);
	const [isFormValid, setIsFormValid] = useState(false);
	const specialRequestCart = useSelector((store) => store.specialRequestCart);
	const user = useSelector((store) => store.userData);
	const generalData = useSelector((store) => store.generalData);
	const isPickup = useSelector((store) => store.order.isPickup);
	const dispatch = useDispatch();
	const order = useSelector((store) => store.order);

	const [errorMsg, setErrorMsg] = useState(false);
	const ref = useRef();
	const translate = useTranslate();
	const deliveryInstructions = order?.delivery?.deliveryInstructions;

	const [input, setInput] = useState({
		[INPUT_NAMES.ORDER]: {
			value: specialRequestCart[INPUT_NAMES.ORDER],
			valid: false,
			errorMsg: "",
			rules: ["no_validation"],
			words_left: calculateNumOfWordsOnStartUp(
				specialRequestCart[INPUT_NAMES.ORDER],
				MAX_WORDS,
			),
		},
		[INPUT_NAMES.DELIVERY_PERSON]: {
			value: checkForKey(INPUT_NAMES.DELIVERY_PERSON, deliveryInstructions),
			valid: false,
			errorMsg: "",
			rules: ["no_validation"],
			words_left: calculateNumOfWordsOnStartUp(
				specialRequestCart[INPUT_NAMES.DELIVERY_PERSON],
				MAX_WORDS,
			),
		},
		[INPUT_NAMES.FULL_NAME]: {
			value: checkForKey(INPUT_NAMES.FULL_NAME, getFullNamefromRedux()),
			valid: false,
			errorMsg: "",
			rules: ["not_empty"],
			words_left: MAX_WORDS,
		},
		[INPUT_NAMES.PHONE]: {
			value: checkForKey(INPUT_NAMES.PHONE, generalData.phone),
			valid: false,
			errorMsg: "",
			rules: ["phone"],
		},
	});

	function checkForKey(key, defaultValue) {
		if (key in specialRequestCart) {
			return specialRequestCart[key];
		}
		return defaultValue;
	}

	function calculateNumOfWordsOnStartUp(fieldValue, max) {
		if (fieldValue) {
			return max - fieldValue.length;
		}
		return max;
	}

	const calculateNumOfWords = (wordsLeft, words) => {
		return wordsLeft - words;
	};
	function onChange(response) {
		const name = response.target.name;
		const value = response.target.value;

		let formValid = false;

		const newState = { ...input };
		const validationObj = Validate(value, input[name].rules);
		newState[name].valid = validationObj.valid;
		newState[name].errorMsg = validationObj.msg;
		newState[name].value = value;
		if (!newState[name].valid) {
			setErrorMsg(newState[name].errorMsg);
		}
		if (validationObj.valid) {
			formValid = true;
		}
		setIsFormValid(formValid);
		if (newState[name].hasOwnProperty("words_left")) {
			let wordsLeft = MAX_WORDS;
			wordsLeft = calculateNumOfWords(wordsLeft, value.length);
			newState[name].words_left = wordsLeft;
		}

		setInput(newState);
	}

	function onSubmit() {
		let formValid = true;
		const newState = { ...input };
		let validationObj;
		const payload = {};
		let errorMsg = "";

		for (const key in input) {
			validationObj = Validate(input[key].value, input[key].rules);
			newState[key].valid = validationObj.valid;
			newState[key].errorMsg = validationObj.msg;
			payload[key] = input[key].value;
			if (!validationObj.valid) {
				formValid = false;
			}
			if (validationObj.msg && !errorMsg) {
				errorMsg = validationObj.msg;
			}
		}
		setErrorMsg(errorMsg);

		setInput(newState);
		setFirstTry(false);
		setIsFormValid(formValid);

		if (formValid) {
			dispatch(Actions.updateSpecialRequest({ ...payload }));
			ref.current?.animateOut();
		}
	}

	function getFullNamefromRedux() {
		if (user.type !== "new") {
			return user.firstName + " " + user.lastName;
		}
		return "";
	}

	function showError(field) {
		return !firstTry && !input[field].valid;
	}

	function showErrorBtn() {
		return !firstTry && !isFormValid;
	}

	const showButtonError = showErrorBtn();

	function RenderPopup() {
		return (
			<div className={styles["container"]}>
				<div className={styles["wrapper"]}>
					<span
						className={styles["title"]}
						tabIndex={0}>
						{translate("specialRequestsModal_toppingsBuilder_title")}
					</span>
					<div className={styles["input-container"]}>
						<AnimatedInput
							className={styles["field"]}
							value={input[INPUT_NAMES.ORDER].value}
							placeholder={translate("specialRequest_popup_input_order_placeholder")}
							autocomplete={false}
							onChange={(e) => onChange(e)}
							showError={showError(INPUT_NAMES.ORDER)}
							errorMsg={input[INPUT_NAMES.ORDER].errorMsg}
							name={INPUT_NAMES.ORDER}
							placeHolderClass={styles["custom-placeholder"]}
							focusPlaceHolderClass={styles["focus-custom-placeholder"]}
							maxLength={MAX_WORDS}
							extraStyles={styles}
							ariaDescribedBy={"orderDescription"}
							showCloseIcon
						/>
						<span
							id={"orderDescription"}
							className={styles["words-left"]}
							tabIndex={0}>
							{input[INPUT_NAMES.ORDER].words_left}{" "}
							{translate("specialRequest_popup_characters")}
						</span>
					</div>

					{!isPickup && (
						<div className={styles["input-container"]}>
							<AnimatedInput
								className={styles["field"]}
								value={input[INPUT_NAMES.DELIVERY_PERSON].value}
								placeholder={translate(
									"specialRequest_popup_input_delivery_placeholder",
								)}
								autocomplete={false}
								onChange={(e) => onChange(e)}
								showError={showError(INPUT_NAMES.DELIVERY_PERSON)}
								errorMsg={input[INPUT_NAMES.DELIVERY_PERSON].errorMsg}
								name={INPUT_NAMES.DELIVERY_PERSON}
								placeHolderClass={styles["custom-placeholder"]}
								focusPlaceHolderClass={styles["focus-custom-placeholder"]}
								maxLength={MAX_WORDS}
								extraStyles={styles}
								ariaDescribedBy={"pickupDescription"}
								showCloseIcon
							/>
							<span
								id={"pickupDescription"}
								className={styles["words-left"]}>
								{input[INPUT_NAMES.DELIVERY_PERSON].words_left}{" "}
								{translate("specialRequest_popup_characters")}
							</span>
						</div>
					)}
					<div className={styles["bottom-container"]}>
						<span
							className={styles["bottom-title"]}
							tabIndex={0}>
							{translate("specialRequest_popup_call_contact")}
						</span>
						<div className={styles["inputs-container"]}>
							<AnimatedInput
								className={styles["field"]}
								value={input[INPUT_NAMES.FULL_NAME].value}
								placeholder={translate("specialRequest_popup_contact")}
								autocomplete={false}
								onChange={(e) => onChange(e)}
								showError={showError(INPUT_NAMES.FULL_NAME)}
								errorMsg={input[INPUT_NAMES.FULL_NAME].errorMsg}
								name={INPUT_NAMES.FULL_NAME}
								placeHolderClass={styles["custom-placeholder"]}
								focusPlaceHolderClass={styles["focus-custom-placeholder"]}
								maxLength={MAX_WORDS}
								extraStyles={styles}
								showCloseIcon
							/>
							<AnimatedInput
								className={styles["field"]}
								value={input[INPUT_NAMES.PHONE].value}
								placeholder={translate("specialRequest_popup_phoneNumber")}
								autocomplete={false}
								onChange={(e) => onChange(e)}
								showError={showError(INPUT_NAMES.PHONE)}
								errorMsg={input[INPUT_NAMES.PHONE].errorMsg}
								name={INPUT_NAMES.PHONE}
								placeHolderClass={styles["custom-placeholder"]}
								focusPlaceHolderClass={styles["focus-custom-placeholder"]}
								type={"tel"}
								showCloseIcon
								extraStyles={styles}
							/>
						</div>
					</div>
				</div>
				<div className={styles["actions"]}>
					<Button
						isPrimary={true}
						className={styles["btn"]}
						text={translate("specialRequest_popup_save")}
						onClick={onSubmit}
						isBtnOnForm={true}
						errorText={errorMsg || translate("specialRequest_popup_error")}
						isError={showButtonError}
					/>
				</div>
			</div>
		);
	}

	return (
		<SlidePopup
			id={props.id}
			className={styles["two-action-popup"]}
			showCloseIcon={true}
			ref={ref}>
			{RenderPopup()}
		</SlidePopup>
	);
}
