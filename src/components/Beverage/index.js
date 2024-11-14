import React, { useRef } from "react";
import BeveragePlaceholder from "/public/assets/placeholders/beverage.svg";
import styles from "./index.module.scss";
import ExpandIcon from "/public/assets/icons/outline-expand.svg";
import CounterButton from "../CounterButton";
import Button from "../button";
import Price from "../Price";
import LanguageDirectionService from "../../services/LanguageDirectionService";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import ImageWithPlaceholder from "components/ImageWithPlaceholder";
import SRContent from "../accessibility/srcontent";
import { createAccessibilityText } from "../accessibility/acfunctions";
import { getCurrencySign } from "../../utils/functions";

const Beverage = (props) => {
	const {
		alt = "",
		id,
		name,
		image,
		title,
		price,
		counter,
		min = 0,
		max = 10,
		oldPrice,
		label,
		description,
		showExpand = false,
		outOfStock = false,
		isComplex = false,
		currency = "shekel",
		onExpand = () => {},
		onChange = () => {},
		onIncrement = () => {},
		onDecrement = () => {},
		isCounterDisabled = false,
		showPriceBeforeDiscount = false,
		productClick,
	} = props;
	const imageRef = useRef(null);
	const translate = useTranslate();

	const switchToCounter = (e) => {
		e?.stopPropagation();
		if (!isCounterDisabled) {
			if (!isComplex) {
				onIncrementHandler(e);
			}
		}
	};

	function getBoundingClientRect() {
		const rect = imageRef.current.getBoundingClientRect();
		return {
			py: rect.y,
			width: rect.width,
			height: rect.height,
			right: rect.right,
			left: rect.left,
		};
	}

	function onIncrementHandler(e) {
		e?.stopPropagation();
		if (!isCounterDisabled) {
			onIncrement(id, getBoundingClientRect());
		}
	}

	function onDecrementHandler(e) {
		e.stopPropagation();
		if (!isCounterDisabled) {
			onDecrement(id, getBoundingClientRect());
		}
	}

	function onExpandHandler() {
		onExpand(id, getBoundingClientRect());
	}

	const onZeroReached = () => {};
	const renderButton = () => {
		if (outOfStock) {
			return (
				<div className={styles["out-of-stock-wrapper"]}>
					<div className={styles["out-of-stock"]}>{translate("outOfStock")}</div>
				</div>
			);
		}
		if (counter > 0) {
			return (
				<CounterButton
					min={min}
					max={max}
					name={name}
					value={counter}
					onZeroReached={onZeroReached}
					onChange={onChange}
					onIncrement={onIncrementHandler}
					onDecrement={onDecrementHandler}
					className={styles["beverage-button"]}
					disabled={isCounterDisabled}
					ariaLabelAdd={translate("accessibility_ariaLabel_add")}
					ariaLabelRemove={translate("accessibility_ariaLabel_remove")}
					ariaDescription={id}
					focusOnLayout
				/>
			);
		}
		return (
			<Button
				className={styles["beverage-button"]}
				onClick={switchToCounter}
				text={translate("addToCart")}
				extraStyles={styles}
				ariaDescription={id}
			/>
		);
	};
	const isRTL = LanguageDirectionService.isRTL() ? styles["rtl"] : "";
	const srText = createAccessibilityText(
		label,
		title,
		description,
		`${price}${getCurrencySign(currency)}`,
		oldPrice !== price &&
			createAccessibilityText(
				translate("accessibility_srContent_insteadOf"),
				oldPrice,
				getCurrencySign(currency),
			),
	);
	return (
		<div
			id={`beverage-${id}`}
			onClick={(e) => {
				if (max > counter && !outOfStock) {
					e?.stopPropagation();
					switchToCounter(e);
					typeof productClick === "function" && productClick();
				}
			}}
			className={clsx(styles["beverage-wrapper"], isRTL)}>
			<SRContent
				id={id}
				message={srText}
			/>
			{label && <div className={styles["beverage-label"]}>{label}</div>}
			{showExpand && (
				<img
					src={ExpandIcon.src}
					alt="expand"
					onClick={onExpandHandler}
					className={styles["expand-icon"]}
				/>
			)}
			<div className={styles["beverage-image-wrapper"]}>
				<ImageWithPlaceholder
					src={image}
					ariaHidden={true}
					placeholderSrc={BeveragePlaceholder.src}
					alt={alt}
					placeholderClassName={styles["beverage-image"]}
					className={styles["beverage-image"]}
					ref={imageRef}
				/>
			</div>
			<div className={styles["beverage-left-side"]}>
				<div className={styles["beverage-top"]}>
					<div
						className={styles["title"]}
						aria-hidden={true}>
						{title}
					</div>
					<div
						className={styles["description"]}
						aria-hidden={true}>
						{description}
					</div>
				</div>
				<div className={styles["beverage-bottom"]}>
					<div
						className={clsx(
							styles["beverage-prices"],
							showPriceBeforeDiscount ? styles["multi-prices"] : "",
						)}
						aria-hidden={true}>
						{showPriceBeforeDiscount && (
							<Price
								value={oldPrice}
								currency={currency}
								className={styles["beverage-old-price"]}
								extraStyles={styles}
								mark
							/>
						)}
						<Price
							value={price}
							currency={currency}
							className={styles["beverage-price"]}
							extraStyles={styles}
						/>
					</div>
					{renderButton()}
				</div>
			</div>
		</div>
	);
};

export default Beverage;
