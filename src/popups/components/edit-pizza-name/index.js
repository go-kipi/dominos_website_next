import React, { useRef, useState } from "react";

import styles from "./index.module.scss";

import Button from "components/button";

import TextInput from "../../../components/forms/textInput";
import SlidePopup from "popups/Presets/SlidePopup";
import useTranslate from "hooks/useTranslate";
import SRContent from "../../../components/accessibility/srcontent";
import { PizzaWithToppings } from "animations-manager/animations/MovingSavedPizza";
import { useSelector } from "react-redux";

export default function EditPizzaNamePopup(props) {
	const { toppings, pizzaId } = props.payload;
	const [errorMessage, setErrorMessage] = useState("");
	const [showError, setShowError] = useState(false);
	const [pizzaName, setPizzaName] = useState(
		props.payload.pizzaName ?? "pizzas",
	);
	const translate = useTranslate();
	const validations = useSelector(
		(store) => store.globalParams?.savedKitNameValidation?.result,
	);

	const ref = useRef();

	const animateOut = () => ref.current.animateOut();

	const throwError = (message) => {
		setErrorMessage(message);
		setShowError(true);
	};

	const handleOnChangeText = (e) => {
		const { value } = e.target;
		setShowError(false);
		if (validations?.regexp) {
			const reg = RegExp(validations.regexp);
			if (reg.exec(value) === null) {
				throwError(translate("savedKit_error_bad_characters"));
			}
		}
		setPizzaName(value);
	};

	const handleSavePizzaName = () => {
		const { onChange } = props.payload;
		if (validations && validations?.minCharacters > pizzaName.length) {
			throwError(translate("savedKit_error_too_short"));
			return;
		}
		typeof onChange === "function" && onChange(pizzaName);
		animateOut();
	};

	return (
		<SlidePopup
			id={props.id}
			className={styles["edit-pizzas-name"]}
			ref={ref}
			showCloseIcon={true}>
			<div className={styles["edit-pizzas-wrapper"]}>
				<div className={styles["pizzas-img-wrapper"]}>
					<PizzaWithToppings
						id={pizzaId}
						toppings={toppings}
					/>
				</div>
				<TextInput
					centerInput
					showClearIcon
					className={styles["edit-pizzas-name-input"]}
					value={pizzaName}
					ariaLabel={translate("accessibility_ariaLabel_editPizzaName")}
					onChange={(e) => handleOnChangeText(e)}
					name={"pizza-name"}
					maxLength={validations?.maxCharacters}
					showError={showError}
					errorMessage={errorMessage}
				/>
				<Button
					text={translate("editPizzaPopup_saveName_btnTitle")}
					className={styles["save-pizzas-name"]}
					onClick={handleSavePizzaName}
				/>
			</div>
		</SlidePopup>
	);
}
