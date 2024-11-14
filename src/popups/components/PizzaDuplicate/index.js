import React, { useRef, useState } from "react";
import styles from "./index.module.scss";
import Actions from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../../components/button";
import Checkbox from "../../../components/forms/checkbox";
import FullCircularCheckbox from "/public/assets/checkbox/red-checkbox-full.svg";
import EmptyCircularCheckbox from "/public/assets/checkbox/red-checkbox-empty.svg";
import CounterButton from "../../../components/CounterButton";
import BlurPopup from "../../Presets/BlurPopup";

import { Pizza } from "../builder/Pizza";
import useTranslate from "hooks/useTranslate";
import CartItem from "entitiesCartItem/CartItem";
import useIsSafari from "hooks/useIsSafari";
import clsx from "clsx";
import { CHECKBOX_VARAINTS } from "constants/checkbox-variants";
import TextOnlyButton from "components/text_only_button";
import PizzaBuilderService from "services/PizzaBuilderService";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import SRContent from "../../../components/accessibility/srcontent";

const PizzaDuplicate = (props) => {
	const ref = useRef();
	const { payload = {} } = props;
	const {
		title,
		subtitle,
		primaryBtnText,
		primaryBtnOnPress = () => {},
		coverages,
		isSquare,
		pizzaImg,
		extraStyles = {},
		stepIndex = 0,
		maxAmount = 1,
		shouldReset = false,
		fatherEntity,
		updatedSaleObj = null,
	} = payload;
	const isSafari = useIsSafari();
	const dispatch = useDispatch();
	const [quantity, setQuantity] = useState(1);
	const userData = useSelector((store) => store.userData);
	const saleObj = useSelector((store) => store.cartItem);
	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();
	const pizzaId = useSelector((store) => store.builder.pizzaId[stepIndex]);

	const multiplyPizzas = quantity > 1;
	const handleContinuePress = () => {
		let temp;
		let currentSaleObj = updatedSaleObj ? updatedSaleObj.item : saleObj;

		if (
			currentSaleObj.hasOwnProperty("item") &&
			typeof currentSaleObj.item === "object"
		) {
			temp = CartItemEntity.parseValidateRes(currentSaleObj);
		} else {
			temp = JSON.parse(JSON.stringify(currentSaleObj));
		}

		if (
			currentSaleObj.hasOwnProperty("item") &&
			typeof currentSaleObj.item === "object"
		) {
			temp = CartItemEntity.parseValidateRes(currentSaleObj);
		} else {
			temp = JSON.parse(JSON.stringify(currentSaleObj));
		}

		const item = PizzaBuilderService.duplicateItem(temp, stepIndex, quantity);

		const payload = {
			item,
			step: "duplicate pizza",
		};

		ref.current?.animateOut(() => primaryBtnOnPress(payload, quantity));
	};

	const handleRememberChange = (name, checked) => {
		dispatch(Actions.setDontShowDuplicatePizzaModal(checked));
	};

	function renderButton() {
		return (
			<div className={styles["continue-button-wrapper"]}>
				<Button
					className={styles["continue_button"]}
					text={primaryBtnText}
					onClick={handleContinuePress}
				/>
			</div>
		);
	}

	const handleOnClosePress = () => {
		if (shouldReset) {
			dispatch(Actions.setPizzaId({ step: stepIndex ?? 0, id: "" }));
			dispatch(Actions.setDough({ step: stepIndex ?? 0, data: {} }));
			dispatch(Actions.setToppings({ step: stepIndex ?? 0, data: {} }));
		}
	};

	const renderButtons = () => {
		return (
			<div className={styles["buttons-wrapper"]}>
				{renderButton()}
				<Checkbox
					id={"duplicate"}
					label={translate("duplicatePizzaModal_radioButton_label")}
					variant={CHECKBOX_VARAINTS.LIGHT}
					className={styles["do-not-ask-again"]}
					onChange={handleRememberChange}
					value={userData?.showDuplicatePizza}
					emptyImage={EmptyCircularCheckbox}
					checkedImage={FullCircularCheckbox}
					overrideVariant
					smart
					extraStyles={styles}
				/>
			</div>
		);
	};

	const getShape = () => {
		if (!isSquare) {
			return styles["circle"];
		}
		return styles["square"];
	};

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			showCloseIcon
			onClose={handleOnClosePress}
			className={styles["pizzas-duplicate-popup"]}>
			<SRContent
				role={"alert"}
				message={`${title} ${subtitle}`}
			/>
			<div className={styles["content"]}>
				<div className={styles["duplicate-right-side"]}>
					<div className={styles["right-side-texts"]}>
						<div
							className={clsx(
								styles["description"],
								isSafari ? styles["safari"] : "",
							)}>
							{subtitle}
						</div>
						<div className={styles["header-title"]}>{title}</div>
					</div>
					{deviceState.isDesktop && (
						<Checkbox
							id={"duplicate"}
							label={translate("duplicatePizzaModal_radioButton_label")}
							variant={CHECKBOX_VARAINTS.LIGHT}
							className={styles["do-not-ask-again"]}
							onChange={handleRememberChange}
							value={userData?.showDuplicatePizza}
							emptyImage={EmptyCircularCheckbox}
							checkedImage={FullCircularCheckbox}
							overrideVariant
							smart
							extraStyles={styles}
						/>
					)}
				</div>
				<div className={styles["duplicate-left-side"]}>
					<div className={clsx(styles["pizza"], getShape())}>
						<Pizza
							styles={styles}
							extraStyles={extraStyles}
							coverages={coverages}
							pizzaId={pizzaId}
						/>
						<CounterButton
							value={quantity}
							min={1}
							max={maxAmount}
							className={styles["duplicate-counter"]}
							onChange={(name, value) => setQuantity(value)}
							ariaLabelAdd={translate("accessibility_ariaLabel_pizzaDuplicate_add")}
							ariaLabelRemove={translate(
								"accessibility_ariaLabel_pizzaDuplicate_remove",
							)}
							extraStyles={styles}
						/>

						<span className={styles["additional-text"]}>
							{translate("duplicate_modal_additionalText_includeCurrent")}
						</span>
					</div>
					{deviceState.isDesktop && renderButton()}
				</div>
			</div>
			{deviceState.notDesktop && renderButtons()}
		</BlurPopup>
	);
};

export default PizzaDuplicate;
