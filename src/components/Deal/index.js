import React, { useRef } from "react";
import Button from "components/button";
import Price from "components/Price";
import CounterButton from "components/CounterButton";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import ImageWithPlaceholder from "components/ImageWithPlaceholder";
import DealPlaceholder from "/public/assets/placeholders/Deal.png";
import Actions from "redux/actions";
import { createAccessibilityText } from "../accessibility/acfunctions";
import { getCurrencySign } from "../../utils/functions";

const Deal = (props) => {
	const {
		id,
		title,
		image,
		min = 0,
		max = 10,
		mark = false,
		price,
		counter,
		name,
		oldPrice,
		className = "",
		currency = "shekel",
		outOfStock = false,
		onClick = () => {},
		onChange = () => {},
		onIncrement = () => {},
		onDecrement = () => {},
		isCounterDisabled = false,
		showPriceBeforeDiscount = false,
		disabledClick = false,
	} = props;
	const dispatch = useDispatch();
	const deviceState = useSelector((store) => store.deviceState);
	const isDisabled = useSelector((store) => store.isBuilderActive);
	const imageRef = useRef(null);
	const { isDesktop } = deviceState;
	const translate = useTranslate();
	const clickedButtonRef = useRef(null);

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

	function onClickHandler(evt) {
		if (isDisabled || outOfStock) return;
		dispatch(Actions.setIsBuilderActive(true));
		if (max > counter && !isCounterDisabled && !disabledClick) {
			evt?.stopPropagation();
			onIncrementHandler(evt);
		}
		const timeout = setTimeout(() => {
			dispatch(Actions.setIsBuilderActive(false));
			clearTimeout(timeout);
		}, 350);
	}

	function onZeroReached() {}

	function onIncrementHandler(e) {
		if (isDisabled || outOfStock) return;
		e?.stopPropagation();
		e?.preventDefault();
		onIncrement(getBoundingClientRect());
	}

	function onDecrementHandler(e) {
		e?.stopPropagation();
		onDecrement(getBoundingClientRect());
	}

	const renderButton = () => {
		if (outOfStock) {
			return (
				<div className={styles["button"]}>
					<span className={styles["out-of-stock"]}>{translate("outOfStock")}</span>
				</div>
			);
		}
		if (counter > 0) {
			return (
				<CounterButton
					min={min}
					max={max}
					name={name}
					className={styles["button"]}
					onZeroReached={onZeroReached}
					onIncrement={onIncrementHandler}
					onDecrement={onDecrementHandler}
					value={counter}
					disabled={isDisabled || isCounterDisabled}
					ariaDescription={id}
					ariaLabelAdd={translate("accessibility_ariaLabel_add")}
					ariaLabelRemove={translate("accessibility_ariaLabel_remove")}
					focusOnLayout
				/>
			);
		}
		return (
			<Button
				text={translate("addToCart")}
				className={styles["button"]}
				textClassName={styles["button-text"]}
				onClick={onClickHandler}
				disabled={isDisabled}
				extraStyles={styles}
				ariaLabel={srText}
			/>
		);
	};

	const Bottom = deviceState.isDesktop ? BottomDesktop : BottomMobile;
	const srText = createAccessibilityText(
		title,
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
			id={`deal-${id}`}
			onClick={(e) => onClickHandler(e)}
			className={clsx(
				styles["deal-wrapper"],
				isDisabled || outOfStock ? "disable-click" : "",
				className,
			)}>
			<div className={styles["top"]}>
				<div className={styles["image-wrapper"]}>
					<ImageWithPlaceholder
						ref={imageRef}
						src={image}
						alt="/"
						placeholderSrc={DealPlaceholder.src}
						className={styles["image"]}
						ariaHidden={true}
						placeholderClassName={styles["placeholder-image"]}
					/>
				</div>
				<div
					className={styles["title"]}
					aria-hidden={true}>
					{title}
				</div>
			</div>
			<Bottom
				price={price}
				oldPrice={oldPrice}
				currency={currency}
				mark={mark}
				renderButton={renderButton}
				showPriceBeforeDiscount={showPriceBeforeDiscount}
			/>
		</div>
	);
};

export default Deal;

function BottomMobile(props) {
	const {
		price,
		oldPrice,
		currency,
		mark,
		renderButton,
		showPriceBeforeDiscount,
	} = props;
	return (
		<div className={styles["bottom"]}>
			<div
				aria-hidden={true}
				className={clsx(
					styles["prices-wrapper"],
					showPriceBeforeDiscount ? styles["multi-prices"] : "",
				)}>
				<Price
					value={price}
					currency={currency}
					className={styles["deal-price"]}
					extraStyles={styles}
				/>
				{showPriceBeforeDiscount && (
					<Price
						value={oldPrice}
						currency={currency}
						mark={mark}
						className={styles["deal-old-price"]}
					/>
				)}
			</div>
			{renderButton()}
		</div>
	);
}

function BottomDesktop(props) {
	const {
		price,
		oldPrice,
		currency,
		mark,
		renderButton,
		showPriceBeforeDiscount = true,
	} = props;
	return (
		<div className={styles["bottom"]}>
			{showPriceBeforeDiscount && (
				<Price
					ariaHidden={true}
					value={oldPrice}
					currency={currency}
					mark={mark}
					className={styles["deal-old-price-desktop"]}
				/>
			)}
			<div className={styles["price-button-desktop"]}>
				<Price
					ariaHidden={true}
					value={price}
					currency={currency}
					className={styles["deal-price"]}
					extraStyles={styles}
				/>
				{renderButton()}
			</div>
		</div>
	);
}
