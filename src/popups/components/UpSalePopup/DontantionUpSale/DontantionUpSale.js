import { getFullMediaUrl } from "utils/functions";
import useMenus from "hooks/useMenus";
import Button from "components/button";
import TextInput from "components/forms/textInput";
import Price from "components/Price";
import TextOnlyButton from "components/text_only_button";
import { MEDIA_ENUM } from "constants/media-enum";
import { MEDIA_TYPES } from "constants/media-types";
import React, { useEffect, useState } from "react";

import styles from "./DontantionUpSale.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";

function DontantionUpSale(props) {
	const {
		accept = () => {},
		decline = () => {},
		item = {},
		menu = {},
		hasElements = false,
	} = props;
	const [input, setInput] = useState("");
	const [inputId, setInputId] = useState();
	const [selectedBtn, setSelectedBtn] = useState("");
	const isBtnDiabled = input === "" && selectedBtn === "";
	const translate = useTranslate();
	const imgUrl = getFullMediaUrl(
		item,
		MEDIA_TYPES.MENU,
		MEDIA_ENUM.UNSELECTED_WEB,
	);

	function handleInputChange(e) {
		const { value } = e.target;
		if (selectedBtn) {
			setSelectedBtn("");
		}
		const numericRegex = /^\d+$/;
		if (numericRegex.test(value) || value === "") {
			setInput(value);
		}
	}

	function onBtnPress(id) {
		if (input === "") {
			setSelectedBtn(id);
		}
	}

	function onAcceptHandler() {
		if (selectedBtn) {
			return typeof accept === "function" && accept(selectedBtn);
		} else {
			return typeof accept === "function" && accept(inputId, input);
		}
	}

	function onDeclineHandler() {
		return typeof decline === "function" && decline();
	}

	const srText = createAccessibilityText(
		translate("upsale_dontantionBox_title"),
		item.label,
	);
	return (
		<div className={styles["dontantion-up-sale-wrapper"]}>
			<div className={styles["dontantion-up-sale-content"]}>
				<div className={styles["dontantion-up-sale-image-wrapper"]}>
					<div className={styles["dontantion-up-sale-image"]}>
						<img
							src={imgUrl}
							aria-hidden={true}
						/>
					</div>
				</div>
				<div className={styles["dontantion-up-sale-title-wrapper"]}>
					<h1 className={clsx(styles["title"], styles["title1"])}>
						{translate("upsale_dontantionBox_title")}
					</h1>
					<h2 className={clsx(styles["title"], styles["title2"])}>{item.label}</h2>
				</div>
				<div className={styles["price-list-wrapper"]}>
					{hasElements &&
						menu.elements.map((item) => {
							return (
								<PriceButton
									key={"price-" + item.id}
									id={item.id}
									onClick={onBtnPress}
									isSelected={item.id === selectedBtn}
									item={item}
									baseAriaLabel={srText}
								/>
							);
						})}
				</div>
				{hasElements &&
					menu.elements.map((item) => {
						return (
							<TextInputWrapper
								key={"text-input-" + item.id}
								onChange={handleInputChange}
								value={input}
								item={item}
								setInputId={setInputId}
							/>
						);
					})}

				<Button
					className={styles["dontantion-up-sale-accept-btn"]}
					textClassName={styles["btn-text"]}
					disabled={isBtnDiabled}
					text={translate("upsale_dontantion_acceptBtn_label")}
					onClick={onAcceptHandler}
					animated={false}
				/>
			</div>
			<TextOnlyButton
				className={styles["dontantion-up-sale-decline-btn"]}
				text={translate("upsale_dontantion_declineBtn_label")}
				onClick={onDeclineHandler}
			/>
		</div>
	);
}

export default DontantionUpSale;

function PriceButton(props) {
	const { onClick = () => {}, isSelected = false, id, item } = props;
	const product = useMenus(item.id, item.actionType);

	function onClickHandler() {
		onClick(id);
	}

	if (product?.basketBehavior !== "freePrice") {
		return (
			<button
				onClick={onClickHandler}
				className={clsx(
					styles["price-btn-wrapper"],
					isSelected ? styles["selected"] : "",
				)}
				aria-description={props.baseAriaLabel}
				role={"radio"}
				aria-checked={isSelected}>
				<Price
					value={product.price}
					className={styles["price-btn-text"]}
				/>
			</button>
		);
	} else {
		return <></>;
	}
}

function TextInputWrapper(props) {
	const { value, onChange, item, setInputId } = props;
	const product = useMenus(item.id, item.actionType);
	const translate = useTranslate();

	const isInput = product?.basketBehavior === "freePrice";

	useEffect(() => {
		if (item && isInput) {
			setInputId(item.id);
		}
	}, [item, isInput]);

	if (isInput) {
		return (
			<TextInput
				centerInput={true}
				type={"number"}
				name={"price"}
				className={styles["price-text-input"]}
				placeholder={translate("upsale_dontantion_input_placeholder")}
				value={value}
				onChange={onChange}
			/>
		);
	} else {
		return <></>;
	}
}
