import React, { useRef, useState, useEffect } from "react";

import useTranslate from "hooks/useTranslate";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import Validate from "utils/validation";
import Api from "api/requests";
import * as popups from "constants/popup-types";
import Button from "components/button";
import TextAreaBox from "components/forms/TextAreaBox/TextAreaBox";
import AnimatedInput from "components/forms/animated_input";

import styles from "./BigOrdersForm.module.scss";
import MenuIcon from "/public/assets/icons/menuDownload.svg";
import Actions from "redux/actions";
import BIG_ORDERS_SCREEN_TYPES from "constants/bigOrdersScreenTypes";
import TermsCheckbox from "components/TermsCheckbox/TermsCheckbox";
import LanguageDirectionService from "services/LanguageDirectionService";

function BigOrdersForm(props) {
	const translate = useTranslate();
	const isRTL = LanguageDirectionService.isRTL();
	const user = useSelector((store) => store.userData);
	const phone = useSelector((store) => store.generalData.phone);
	const isUserBack = user.type !== "new";
	const [firstTry, setFirstTry] = useState(true);
	const [isFormValid, setIsFormValid] = useState(false);
	const [errorMsg, setErrorMsg] = useState(false);
	const dispatch = useDispatch();
	const deviceState = useSelector((store) => store.deviceState);
	const { setStack } = props;

	const [form, setForm] = useState({
		name: {
			value: "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty"],
		},

		phone: {
			value: "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["phoneJustNumbers"],
		},
		email: {
			value: "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["email"],
		},
		address: {
			value: "",
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["not_empty"],
		},
		comments: {
			value: "",
			valid: false,
			errorMsg: "",
			rules: ["not_empty"],
		},
		terms: {
			value: false,
			valid: false,
			ref: useRef(),
			errorMsg: "",
			rules: ["no_validation"],
		},
	});

	useEffect(() => {
		if (user) {
			setForm(prevForm => ({
				...prevForm,
				name: {
					...prevForm.name,
					value: `${user.firstName} ${user.lastName}`,
				},
				phone: {
					...prevForm.phone,
					value: phone,
				},
				email: {
					...prevForm.email,
					value: user.email,
				},
				terms: {
					...prevForm.terms,
					value: user.approvedTerms ?? false,
				},
			}));
		}
	}, [user, phone, isUserBack]);

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

	function getLongInputs() {
		return (
			<div className={styles["long-inputs"]}>
				<div className={styles["long-input-row-wrapper"]}>
					<AnimatedInput
						ref={form.name.ref}
						name={"name"}
						value={form.name.value}
						onChange={onChangeInput}
						showCloseIcon
						showError={showError("name")}
						errorMsg={form.name.errorMsg}
						placeholder={translate("BigOrders_form_name_placeholder")}
						className={styles["input-wrapper"]}
					/>
					<AnimatedInput
						ref={form.phone.ref}
						name={"phone"}
						type={"tel"}
						value={form.phone.value}
						onChange={onChangeInput}
						showCloseIcon
						showError={showError("phone")}
						errorMsg={form.phone.errorMsg}
						placeholder={translate("BigOrders_form_phone_placeholder")}
						className={styles["input-wrapper"]}
					/>
				</div>
				<div className={styles["long-input-row-wrapper"]}>
					<AnimatedInput
						ref={form.email.ref}
						name={"email"}
						value={form.email.value}
						onChange={onChangeInput}
						showCloseIcon
						showError={showError("email")}
						errorMsg={form.email.errorMsg}
						placeholder={translate("BigOrders_form_email_placeholder")}
						className={styles["input-wrapper"]}
					/>
					<AnimatedInput
						ref={form.address.ref}
						name={"address"}
						value={form.address.value}
						onChange={onChangeInput}
						showCloseIcon
						showError={showError("address")}
						errorMsg={form.address.errorMsg}
						placeholder={translate("BigOrders_form_address_placeholder")}
						className={styles["input-wrapper"]}
					/>
				</div>
			</div>
		);
	}

	function getTextArea() {
		return (
			<TextAreaBox
				name={"comments"}
				value={form.comments.value}
				onChange={onChangeInput}
				showCloseIcon
				showError={showError("comments")}
				errorMsg={form.comments.errorMsg}
				placeholder={translate("BigOrders_form_comments_placeholder")}
				className={styles["input-wrapper"]}
				ariaLabel={translate("BigOrders_form_comments_placeholder")}
			/>
		);
	}

	function onChangeCheckBox(e) {
		const { id, checked } = e.target;
		onChange(id, checked);
	}

	function getCheckBox() {
		return (
			<div className={styles["checkbox-wrapper"]}>
				<TermsCheckbox
					ref={form.terms.ref}
					name="terms"
					onChange={onChangeCheckBox}
					value={form.terms.value}
				/>
			</div>
		);
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
			payload.formType = "largeOrder";
			Api.contactUs({ payload, onSuccess });

			function onSuccess() {
				resetForm();
				onShowSuccess();
			}
		} else {
			firstInvalidRef?.current?.focus();
		}
	}

	function resetForm() {
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
				rules: ["phone"],
			},
			email: {
				value: isUserBack ? user.email : "",
				valid: false,
				errorMsg: "",
				rules: ["email"],
			},
			address: {
				value: "",
				valid: false,
				errorMsg: "",
				rules: ["not_empty"],
			},
			comments: {
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
		setFirstTry(true);
		setErrorMsg("");
	}

	function onShowSuccess() {
		if (deviceState.notDesktop) {
			dispatch(
				Actions.addPopup({
					type: popups.BIG_ORDERS_SUCCESS,
					payload: {},
				}),
			);
		} else {
			setStack({ type: BIG_ORDERS_SCREEN_TYPES.SUCCESS, params: {} });
		}
	}

	function showError(field) {
		return !firstTry && !form[field].valid;
	}

	function showErrorBtnHandler() {
		return !firstTry && !isFormValid;
	}

	const showErrorBtn = showErrorBtnHandler();

	const menuFileName = isRTL ? "Large-Menu" : "Large-Menu-English";
	return (
		<div className={styles["big-orders-form-container"]}>
			<div className={styles["header"]}>
				<h1 className={styles["title"]}>{translate("BigOrders_form_title")}</h1>
				<h2 className={styles["subtitle"]}>
					{translate("BigOrders_form_subtitle")}
				</h2>
			</div>
			<div className={styles["menus"]}>
				<MenuButton
					href={`/static/${menuFileName}.jpeg`}
					filename={"Large-Menu.jpeg"}
					title={translate("BigOrders_form_menu_regular")}
				/>
				<MenuButton
					href={"/static/Large-Menu-Kosher.jpeg"}
					filename={"Large-Menu-Kosher.jpeg"}
					title={translate("BigOrders_form_menu_kosher")}
				/>
			</div>
			<div className={styles["form"]}>
				{getLongInputs()}
				{getTextArea()}
				{getCheckBox()}
			</div>
			<div className={styles["actions"]}>
				<Button
					text={translate("bigOrders_form_submit_btn")}
					onClick={onSubmit}
					isError={showErrorBtn}
					isBtnOnForm={true}
					errorText={errorMsg}
					className={styles["submit-btn"]}
				/>
			</div>
		</div>
	);
}

export default BigOrdersForm;

function MenuButton({ title, href, filename }) {
	const translate = useTranslate();
	return (
		<a
			className={styles["menu-button"]}
			aria-label={`${translate("bigOrders_accessibility_label")} ${title}`}
			href={href}
			rel="noreferrer"
			target="_blank"
			download={filename}
			tabIndex={0}>
			<div className={styles["menu-icon"]}>
				<img
					src={MenuIcon.src}
					alt={""}
				/>
			</div>
			<span className={styles["menu-button-text"]}>
				{translate("BigOrders_form_menu")}&nbsp;
				<span
					className={clsx(
						styles["menu-button-text"],
						styles["menu-button-text-bold"],
					)}>
					{title}
				</span>
			</span>
		</a>
	);
}
