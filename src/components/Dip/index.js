import React, { useRef } from "react";
import styles from "./index.module.scss";
import ImageWithPlaceholder from "components/ImageWithPlaceholder";
import Price from "components/Price";
import CounterButton from "components/CounterButton";
import useTranslate from "hooks/useTranslate";
import SRContent from "components/accessibility/srcontent";
import { createAccessibilityText } from "components/accessibility/acfunctions";
import { getCurrencySign } from "utils/functions";
import { useSelector } from "react-redux";

function Dip(props) {
	const {
		image,
		label,
		price,
		title,
		description,
		alt,
		id,
		min = 0,
		max = 10,
		currency = "shekel",
		onDecrement,
		onIncrement,
		quantity,
		isCounterDisabled,
		showPriceBeforeDiscount,
		priceBeforeDiscount,
		isOutOfStock = false,
		isNextDipsInCharge,
	} = props;

	const imageRef = useRef();
	const translate = useTranslate();
	const currentProductTemplate = useSelector(
		(store) => store.currentProductTemplate,
	);
	const dipSalePrice = currentProductTemplate?.priceOverrides?.[0]?.products[id];

	function onIncrementHandler(e) {
		e?.stopPropagation();
		if (!isCounterDisabled && quantity <= max && !isOutOfStock) {
			onIncrement();
		}
	}

	function onDecrementHandler(e) {
		e.stopPropagation();
		if (!isCounterDisabled && quantity > 0 && !isOutOfStock) {
			onDecrement();
		}
	}

	const srText = createAccessibilityText(
		label,
		title,
		description,
		`${price}${getCurrencySign(currency)}`,
		priceBeforeDiscount !== price &&
			createAccessibilityText(
				translate("accessibility_srContent_insteadOf"),
				priceBeforeDiscount,
				getCurrencySign(currency),
			),
	);

	return (
		<>
			<SRContent
				id={id}
				message={srText}
			/>
			<div className={styles["dip-container"]}>
				<div className={styles["image-container"]}>
					<ImageWithPlaceholder
						src={image}
						ariaHidden={true}
						alt={alt}
						className={styles["dip-image"]}
						ref={imageRef}
					/>
				</div>
				<div className={styles["main-content"]}>
					<p>{title}</p>

					<div className={styles["price-container"]}>
						{isNextDipsInCharge ? (
							<>
								{showPriceBeforeDiscount && (
									<Price
										mark
										value={priceBeforeDiscount}
										className={styles["old-price"]}
									/>
								)}
								<Price
									value={price}
									className={styles["price"]}
								/>
							</>
						) : Number(dipSalePrice) ? (
							<Price
								value={dipSalePrice}
								className={styles["price"]}
							/>
						) : (
							<Price
								value={price}
								className={styles["price-placeholder"]}
							/>
						)}
					</div>
				</div>

				<div className={styles["counter-container"]}>
					{isOutOfStock ? (
						<span className={styles["out-of-stock"]}>{translate("outOfStock")}</span>
					) : (
						<CounterButton
							min={min}
							max={max}
							value={quantity}
							onIncrement={onIncrementHandler}
							onDecrement={onDecrementHandler}
							className={styles["counter-button"]}
							disabled={isCounterDisabled}
							ariaLabelAdd={translate("accessibility_ariaLabel_add")}
							ariaLabelRemove={translate("accessibility_ariaLabel_remove")}
							ariaDescription={id}
							focusOnLayout
							btnStyle={styles["action-btn"]}
							pressedClass = {styles["action-btn-pressed"]}
						/>
					)}
				</div>
			</div>
		</>
	);
}

export default Dip;
