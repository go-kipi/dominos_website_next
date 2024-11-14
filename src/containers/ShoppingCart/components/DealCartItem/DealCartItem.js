import React, { useMemo } from "react";

import styles from "./DealCartItem.module.scss";

import { RenderCartItemSubItems } from "../RenderCartItemSubItems/RenderCartItemSubItems";
import RenderPrices from "../RenderCartPrices/RenderCartPrices";
import OptionsCart from "../OptionsCart/OptionsCart";
import CartItemDisclaimers from "../CartItemDisclaimers/CartItemDisclaimers";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
import useTranslate from "../../../../hooks/useTranslate";
import { getCurrencySign } from "../../../../utils/functions";

function DealCartItem(props) {
	const {
		disclaimers = [],
		newPrice,
		price,
		text,
		subItems,
		options,
		onRemoveUpgrade,
		showPriceBeforeDiscount = false,
		onEditItem,
	} = props;
	const translate = useTranslate();

	const srText = createAccessibilityText(
		translate("accessibility_shoppingCart_itemInCart"),
		text,
		`${newPrice}${getCurrencySign("shekel")}`,
		showPriceBeforeDiscount &&
			createAccessibilityText(
				translate("accessibility_srContent_insteadOf"),
				`${price}${getCurrencySign("shekel")}`,
			),
	);
	return (
		<div
			className={styles["conatiner"]}
			tabIndex={0}>
			<div className={styles["item-ticket-body"]}>
				<div className={styles["content"]}>
					<div className={styles["price-text-wrap"]}>
						<div className={styles["item-ticket-right"]}>
							<span className={styles["text"]}>{text}</span>
						</div>
						<div className={styles["prices-wrap"]}>
							<RenderPrices
								newPrice={newPrice}
								showPriceBeforeDiscount={showPriceBeforeDiscount}
								price={price}
							/>
						</div>
					</div>
					<CartItemDisclaimers disclaimers={disclaimers} />
				</div>

				<OptionsCart options={options} />
			</div>

			<RenderCartItemSubItems
				onRemoveUpgrade={onRemoveUpgrade}
				subItems={subItems}
				onEditItem={onEditItem}
			/>
		</div>
	);
}

export default DealCartItem;
