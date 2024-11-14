import React from "react";
import styles from "./index.module.scss";
import Price from "../Price";
import clsx from "clsx";
import useTranslate from "../../hooks/useTranslate";
import SRContent from "../accessibility/srcontent";

export default function PriceListRow(props) {
	const {
		className = "",
		showPriceBeforeDiscount = false,
		text = "",
		price = "0",
		oldPrice = "",
		type = '',
	} = props;
	const translate = useTranslate();

	const priceBefore = translate('accessibility_priceBefore').replace('{price}', oldPrice);
	const srText = (translate('accessibility_priceList_row')
		.replace('{type}', type)
		.replace('{pizzaType}', text)
		.replace('{price}', price)) + ((oldPrice && oldPrice !== price) ? priceBefore : '');
	return (
		<div className={clsx(styles["price-list-row-wrapper"], className)} aria-description={srText} tabIndex={0}>
			<span className={styles["row-text"]} aria-hidden={true}>{text}</span>
			<div
				className={styles["row-dotted-line"]}
				aria-hidden={true}
			/>
			{showPriceBeforeDiscount && (
				<Price
					ariaHidden={true}
					className={styles["row-old-price"]}
					value={oldPrice}
					mark
				/>
			)}
			<Price
				ariaHidden={true}
				className={styles["row-price"]}
				extraStyles={styles}
				value={price}
			/>
		</div>
	);
}
