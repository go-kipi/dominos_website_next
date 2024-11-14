import { getCurrencySign } from "utils/functions";
import React, { useEffect, useRef, useState } from "react";
import basic from "./index.module.scss";
import clsx from "clsx";
import LanguageDirectionService from "services/LanguageDirectionService";
import { useSelector } from "react-redux";
import SRContent from "../accessibility/srcontent";
import useTranslate from "../../hooks/useTranslate";
import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_HIDDEN,
} from "../../constants/accessibility-types";

const Price = (props) => {
	const priceRef = useRef();
	const [color, setColor] = useState("");
	const {
		value,
		mark = false,
		className = "",
		currency = "shekel",
		extraStyles = {},
		readPrice = false,
		ariaHidden = false,
	} = props;

	const translate = useTranslate();
	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);

	const floatingValue = Number(value).toFixed(displayDecimalPoint);
	const isNegativeValue = value < 0;
	const isRTL = LanguageDirectionService.isRTL();

	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};

	const getPrice = () => {
		const price = floatingValue.toString().split(".");
		return (
			<div
				role={mark ? "insertion" : "deletion"}
				className={styles("number-container")}>
				{" "}
				<span>{price[0]}.</span>
				<span className={styles("decimal-price")}>{price[1]}</span>
			</div>
		);
	};

	useEffect(() => {
		const color = window
			.getComputedStyle(priceRef.current)
			.getPropertyValue("color");
		setColor(color);
	}, [priceRef.current]);

	const ariaLabel = mark
		? translate("accessibility_priceBefore").replace(
				"{price}",
				`${floatingValue}${getCurrencySign(currency)}`,
		  )
		: `${floatingValue}${getCurrencySign(currency)}`;
	return (
		<div
			aria-hidden={ariaHidden}
			className={clsx(styles("price-wrapper"), className)}
			ref={priceRef}
			tabIndex={readPrice ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
			aria-label={ariaHidden ? undefined : ariaLabel}>
			<div
				aria-hidden={"true"}
				className={clsx(
					styles("price"),
					isNegativeValue ? styles("negative") : "",
				)}>
				{!isNegativeValue && (
					<span className={[styles("currency")]}>{getCurrencySign(currency)}</span>
				)}
				{getPrice()}
				{isNegativeValue && isRTL && (
					<span className={[styles("currency")]}>{getCurrencySign(currency)}</span>
				)}
			</div>
			{mark && (
				<div
					className={styles("line-through")}
					style={{ backgroundColor: color }}
				/>
			)}
		</div>
	);
};

export default Price;
