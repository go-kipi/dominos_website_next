import React, { useEffect, useRef, useState } from "react";

import styles from "./BirthDayEventsPopup.module.scss";
import SlidePopup from "popups/Presets/SlidePopup";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";

import Api from "api/requests";
import { useSelector } from "react-redux";
import useAnimationDirection from "hooks/useAnimationDirection";
import BIRTHDAY_SCREEN_TYPES from "constants/birthDayEventsScreenTypes";
import BirthdayEventsForm from "./BirthdayEventsForm/BirthdayEventsForm";
import useTranslate from "hooks/useTranslate";
import Validate from "utils/validation";
import BirthdayEventsCalendar from "./BirthdayEventsCalendar/BirthdayEventsCalendar";
import BirthDayEventsSuccess from "./BirthDayEventsSuccess/BirthDayEventsSuccess";
import BirthDayEventsHeader from "./BirthDayEventsHeader/BirthDayEventsHeader";
import SlideAnimation from "components/SlideAnimation/SlideAnimation";

function BirthDayEventsPopup(props) {
	const translate = useTranslate();
	const [currentScreen, setStack, goBack, _, resetStack] = useStack(
		STACK_TYPES.BIRTH_DAY_EVENTS,
	);
	const [animationClassTransition, onEnd] = useAnimationDirection(
		STACK_TYPES.BIRTH_DAY_EVENTS,
	);

	const user = useSelector((store) => store.userData);
	const phone = useSelector((store) => store.generalData.phone);
	const isUserBack = user.type !== "new";
	const [firstTry, setFirstTry] = useState(true);
	const [isFormValid, setIsFormValid] = useState(false);
	const [errorMsg, setErrorMsg] = useState(false);
	const branches = useSelector((store) => store.branches);
	const [cities, setCites] = useState();
	const [selectedCity, setSelecetedCity] = useState(-1);
	const ref = useRef();

	const [form, setForm] = useState({
		name: {
			value: isUserBack ? user.firstName + " " + user.lastName : "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty"],
		},
		phone: {
			value: isUserBack ? phone : "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["phoneJustNumbers"],
		},
		email: {
			value: isUserBack ? user.email : "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["email"],
		},
		numberOfParticipants: {
			value: "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty"],
		},
		date: {
			value: "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty"],
		},
		city: {
			value: "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty"],
		},
		terms: {
			value: user.approvedTerms ?? false,
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["no_validation"],
		},
	});

	function resetForm() {
		setFirstTry(true);
		setErrorMsg("");
		setIsFormValid(false);

		setForm({
			name: {
				value: isUserBack ? user.firstName + " " + user.lastName : "",
				valid: false,
				errorMsg: "",
				rules: ["not_empty"],
			},

			phone: {
				value: isUserBack ? phone : "",
				valid: false,
				errorMsg: "",
				rules: ["phoneJustNumbers"],
			},
			email: {
				value: isUserBack ? user.email : "",
				valid: false,
				errorMsg: "",
				rules: ["email"],
			},
			numberOfParticipants: {
				value: "",
				valid: false,
				errorMsg: "",
				rules: ["not_empty"],
			},
			date: {
				value: "",
				valid: false,
				errorMsg: "",
				rules: ["not_empty"],
			},
			city: {
				value: "",
				valid: false,
				errorMsg: "",
				rules: ["not_empty"],
			},
			terms: {
				value: false,
				valid: false,
				errorMsg: "",
				rules: ["no_validation"],
			},
		});
	}

	useEffect(() => {
		resetStack();
		setStack({ type: BIRTHDAY_SCREEN_TYPES.FORM, params: {} });
	}, []);

	useEffect(() => {
		const citiesSet = new Set();
		for (const key in branches) {
			const branch = branches[key];
			citiesSet.add(branch.cityName);
		}

		const citiesArray = [];
		let index = 1;
		citiesSet.forEach((element) => {
			citiesArray.push({ item: element, index });
			index++;
		});

		setCites(citiesArray);
	}, [branches]);

	useEffect(() => {
		if (selectedCity === -1) {
			const newState = { ...form };

			newState.city.errorMsg = translate("birthDayEvents_cityInput_Error");
			newState.city.valid = false;

			setForm(newState);
		}
	}, [selectedCity]);

	function onChange(name, value) {
		let newState = { ...form };

		let validationObj = Validate(value, form[name].rules);
		newState[name].valid = validationObj.valid;
		newState[name].value = value;
		newState[name].errorMsg = validationObj.msg;

		let isFormVaildTester = true;
		for (let key in form) {
			if (!newState[key].valid) {
				isFormVaildTester = false;

				setErrorMsg(newState[key].errorMsg);
			}
		}
		setIsFormValid(isFormVaildTester);

		setForm(newState);
	}

	function onChangeInput(e) {
		const { name, value } = e.target;
		onChange(name, value);
	}

	function goToCalendar() {
		setStack({ type: BIRTHDAY_SCREEN_TYPES.CALENDAR, params: {} });
	}

	function goToForm() {
		setStack({ type: BIRTHDAY_SCREEN_TYPES.FORM, params: {} });
	}

	function goToSuccess() {
		setStack({ type: BIRTHDAY_SCREEN_TYPES.SUCCESS, params: {} });
	}

	function onSubmit() {
		let isFormVaild = true;
		let newState = { ...form };
		const payload = {};
		let firstInvalidRef = null;

		for (let key in form) {
			const validationObj = Validate(form[key].value, form[key].rules);

			newState[key].valid = validationObj.valid;
			newState[key].errorMsg = validationObj.msg;

			payload[key] = form[key].value;

			if (key === "city") {
				if (selectedCity === -1) {
					newState[key].errorMsg = translate("birthDayEvents_cityInput_Error");
					newState[key].valid = false;
					setErrorMsg(newState[key].errorMsg);
					isFormVaild = false;
				}
			}

			if (!validationObj.valid && !firstInvalidRef) {
				firstInvalidRef = newState[key]?.ref;
				isFormVaild = false;
				setErrorMsg(validationObj.msg);
			}
		}
		setIsFormValid(isFormVaild);
		setForm(newState);
		setFirstTry(false);

		if (isFormVaild) {
			payload.date = formatDate(payload.date);
			payload.numberOfParticipants = Number(payload.numberOfParticipants);
			payload.formType = "event";
			Api.contactUs({ payload, onSuccess });

			function onSuccess() {
				resetForm();

				goToSuccess();
			}
		} else {
			firstInvalidRef?.current?.focus();
		}
	}

	function formatDate(date) {
		var year = date.getFullYear();
		var month = ("0" + (date.getMonth() + 1)).slice(-2);
		var day = ("0" + date.getDate()).slice(-2);

		return year + "-" + month + "-" + day;
	}

	function renderScreen() {
		switch (currentScreen.type) {
			case BIRTHDAY_SCREEN_TYPES.CALENDAR:
				return (
					<BirthdayEventsCalendar
						onChange={onChange}
						goToForm={goToForm}
						form={form}
					/>
				);
				break;
			case BIRTHDAY_SCREEN_TYPES.FORM:
				return (
					<BirthdayEventsForm
						form={form}
						onChangeInput={onChangeInput}
						onChange={onChange}
						firstTry={firstTry}
						isFormValid={isFormValid}
						errorMsg={errorMsg}
						cities={cities}
						setSelecetedCity={setSelecetedCity}
						selectedCity={selectedCity}
						goToCalendar={goToCalendar}
						onSubmit={onSubmit}
					/>
				);

			case BIRTHDAY_SCREEN_TYPES.SUCCESS:
				return <BirthDayEventsSuccess />;

			default:
				return (
					<div
						className={"visually-hidden"}
						tabIndex={0}
					/>
				); // Must for focusTrap to work!
		}
	}

	const animateOut = () => ref.current.animateOut(resetStack);

	return (
		<SlidePopup
			id={props.id}
			className={styles["birthday-events-popup-wrapper"]}
			ref={ref}>
			<BirthDayEventsHeader
				hide={
					currentScreen.type === BIRTHDAY_SCREEN_TYPES.SUCCESS
						? goToForm
						: animateOut
				}
				goBack={goBack}
				close
				back={currentScreen.type === BIRTHDAY_SCREEN_TYPES.CALENDAR}
			/>
			<SlideAnimation stack={STACK_TYPES.BIRTH_DAY_EVENTS}>
				{renderScreen()}
			</SlideAnimation>
		</SlidePopup>
	);
}

export default BirthDayEventsPopup;
