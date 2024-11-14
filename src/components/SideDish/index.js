import React, { useRef } from "react";
import styles from "./index.module.scss";
import Price from "components/Price";
import Button from "components/button";
import CounterButton from "../CounterButton";
import { useSelector } from "react-redux";
import LanguageDirectionService from "../../services/LanguageDirectionService";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import SidedishPlaceholder from "/public/assets/placeholders/sidedish.png";
import ImageWithPlaceholder from "components/ImageWithPlaceholder";
import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_HIDDEN,
} from "../../constants/accessibility-types";
import SRContent from "../accessibility/srcontent";
import { createAccessibilityText } from "../accessibility/acfunctions";
import { getCurrencySign } from "../../utils/functions";
import Container from "components/AccessibilityContainer";

const SideDish = (props) => {
	const {
		alt = "",
		id,
		name,
		title,
		price,
		image,
		label,
		comment,
		counter,
		min = 0,
		max = 10,
		oldPrice,
		labelColor,
		description,
		clicked = false,
		isComplex = false,
		outOfStock = false,
		currency = "shekel",
		onExpand = () => {},
		onIncrement = () => {},
		onDecrement = () => {},
		onChange = () => {},
		isCounterDisabled = false,
		isInBuilder = false,
		showPriceBeforeDiscount = false,
		iconUrl = undefined,
		isBuilderRecommended = false,
		productClick,
		buttonTabIndex = TAB_INDEX_DEFAULT,
		className = "",
		priceOverride,
	} = props;

	const deviceState = useSelector((store) => store.deviceState);
	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);
	const { notDesktop } = deviceState;
	const imageRef = useRef(null);
	const translate = useTranslate();
	const itemClickedRef = useRef(null);
	const srText = createAccessibilityText(
		iconUrl && translate("accessibility_product_veganFriendly"),
		label,
		title,
		description,
		!isInBuilder && `${price}${getCurrencySign(currency)}`,
		!isInBuilder &&
			showPriceBeforeDiscount &&
			oldPrice !== price &&
			createAccessibilityText(
				translate("accessibility_srContent_insteadOf"),
				oldPrice,
				getCurrencySign(currency),
			),
		comment,
	);
	const onAddToCartPress = (e) => {
		e?.stopPropagation();
		if (!isCounterDisabled) {
			if (isComplex) {
				onExpandHandler(e);
			} else {
				onIncrementHandler();
			}
		}
	};

	const onZeroReached = () => {};

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

	function onExpandHandler(e) {
		itemClickedRef.current = e.currentTarget;
		itemClickedRef.current.classList.add("disable-click");
		setTimeout(() => {
			itemClickedRef.current.classList.remove("disable-click");
		}, 5000);
		e?.stopPropagation();
		if (!outOfStock) {
			onExpand(id, getBoundingClientRect());
		}
	}

	function onIncrementHandler(e) {
		e?.stopPropagation();
		if (isComplex) {
			onExpandHandler(e);
		} else {
			if (!isCounterDisabled) {
				onIncrement(id, getBoundingClientRect());
			}
		}
	}

	function onDecrementHandler(e) {
		e?.stopPropagation();
		if (!isCounterDisabled) {
			onDecrement(id, getBoundingClientRect());
		}
	}

	const renderOutOfStock = () => {
		if (outOfStock) {
			return (
				<div className={styles["out-of-stock-wrapper"]}>
					<div className={styles["out-of-stock"]}>{translate("outOfStock")}</div>
				</div>
			);
		}
	};

	const renderButton = () => {
		if (outOfStock) {
			return renderOutOfStock();
		}
		if (counter > 0) {
			return (
				<CounterButton
					min={min}
					max={max}
					name={name}
					className={styles["button"]}
					onChange={onChange}
					onZeroReached={onZeroReached}
					onIncrement={(e) => onIncrementHandler(e)}
					onDecrement={(e) => onDecrementHandler(e)}
					value={counter}
					disabled={isCounterDisabled}
					ariaDescription={"side-dish-" + id}
					ariaLabelAdd={translate("accessibility_ariaLabel_add")}
					ariaLabelRemove={translate("accessibility_ariaLabel_remove")}
					// focusOnLayout //this is fucked up the side dish animation
				/>
			);
		}
		return (
			<Button
				className={styles["button"]}
				onClick={onAddToCartPress}
				text={translate("addToCart")}
				extraStyles={styles}
				ariaDescription={"side-dish-" + id}
				tabIndex={buttonTabIndex}
			/>
		);
	};

	const clickedClass = clicked ? styles["clicked"] : "";
	const isRTL = LanguageDirectionService.isRTL() ? styles["rtl"] : "";

	return (
		<Container
			id={"side-dish-" + id}
			srText={srText}
			isBuilderRecommended={isBuilderRecommended}
			onClick={(e) => {
				e?.stopPropagation();
				if (max > counter && !outOfStock) {
					typeof productClick === "function" && productClick();
					!isComplex ? onAddToCartPress(e) : onExpandHandler(e);
				}
			}}
			className={clsx(
				styles["side-dish-wrapper"],
				clickedClass,
				isRTL,
				className,
			)}>
			<SRContent
				message={srText}
				id={"side-dish-" + id}
			/>
			<div className={styles[`top-left-icons-wrapper`]}>
				{iconUrl && notDesktop && (
					<img
						src={iconUrl}
						alt="vegan friendly"
						aria-hidden={true}
						className={styles["vegan-icon"]}
					/>
				)}
			</div>
			{iconUrl && !notDesktop && (
				<img
					src={iconUrl}
					alt="vegan friendly"
					aria-hidden={true}
					className={styles[`vegan-icon`]}
				/>
			)}
			{label && (
				<div
					className={styles[`label-wrapper`]}
					aria-hidden={true}>
					<div
						className={styles["label"]}
						style={{ backgroundColor: labelColor }}>
						{label}
					</div>
				</div>
			)}
			<div className={styles["image-wrapper"]}>
				<ImageWithPlaceholder
					ariaHidden={true}
					src={image}
					placeholderSrc={SidedishPlaceholder.src}
					alt={alt}
					className={styles["side-dish-image"]}
					placeholderClassName={styles["side-dish-image"]}
					ref={imageRef}
				/>
			</div>
			<div className={styles["leftSide"]}>
				<div className={styles["top"]}>
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
				<div className={styles["bottom"]}>
					<div
						aria-hidden={true}
						className={clsx(
							styles["prices-area"],
							showPriceBeforeDiscount ? styles["multi-prices"] : "",
						)}>
						{priceOverride ? (
							<div className={styles["price-override"]}>
								{isRTL ? (
									<>
										<span className={styles["price"]}>
											{(!notDesktop ? "[ " : "") +
												priceOverride.toFixed(displayDecimalPoint)}
										</span>
										<span className={styles["currency"]}>
											{"₪ +" + (!notDesktop ? " ]" : "")}
										</span>
									</>
								) : (
									<>
										<span className={styles["currency"]}>
											{(!notDesktop ? "[ " : "") + "+ ₪"}
										</span>
										<span className={styles["price"]}>
											{priceOverride + (!notDesktop ? " ]" : "")}
										</span>
									</>
								)}
							</div>
						) : null}
						{!isInBuilder && (
							<Price
								className={styles["current-price"]}
								value={price}
								currency={currency}
								extraStyles={styles}
							/>
						)}
						{!isInBuilder && showPriceBeforeDiscount && (
							<Price
								className={styles["old-price"]}
								value={oldPrice}
								currency={currency}
								extraStyles={styles}
								mark
							/>
						)}
						{comment && <div className={styles["comment"]}>{comment}</div>}
					</div>

					<div className={styles["button-wrapper"]}>
						{isBuilderRecommended ? renderOutOfStock() : renderButton()}
					</div>
				</div>
			</div>
		</Container>
	);
};

export default SideDish;
