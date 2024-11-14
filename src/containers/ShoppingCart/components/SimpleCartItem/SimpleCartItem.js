/* eslint-disable @next/next/no-img-element */
import React from "react";

import styles from "./SimpleCartItem.module.scss";
import RenderNotes from "components/PizzaNotes/PizzaNotes";
import clsx from "clsx";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import { META_ENUM } from "constants/menu-meta-tags";
import { getQuartersText } from "utils/functions";
import OptionsCart from "../OptionsCart/OptionsCart";
import CartItemDisclaimers from "../CartItemDisclaimers/CartItemDisclaimers";
import Trash from "/public/assets/icons/multipleOptionsIndicator/trash.svg";
import RenderPrices, {
	RenderInculde,
} from "../RenderCartPrices/RenderCartPrices";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
import useTranslate from "hooks/useTranslate";

function SimpleCartItem(props) {
	const {
		image,
		disclaimers = [],
		newPrice,
		price,
		text,
		subItems,
		onRemoveUpgrade,
		options,
		showPriceBeforeDiscount = false,
	} = props;

	return (
		<div
			className={clsx(styles["cart-item-wrapper"])}
			tabIndex={0}>
			<div className={`${styles["img-wrap"]}`}>
				<img
					className={styles["image"]}
					src={image}
					alt={"image"}
					aria-hidden={true}
				/>
			</div>

			<div className={styles["item-ticket-body"]}>
				<div className={styles["item-ticket-top"]}>
					<div className={styles["content"]}>
						<div className={styles["item-ticket-right"]}>
							<span className={styles["text"]}>{text}</span>
						</div>

						<div className={styles["item-ticket-left"]}>
							<RenderPrices
								showPriceBeforeDiscount={showPriceBeforeDiscount}
								price={price}
								newPrice={newPrice}
							/>
						</div>
					</div>
					<CartItemDisclaimers disclaimers={disclaimers} />
				</div>

				<RenderNotes
					items={subItems}
					className={styles["content-text"]}
					styles={styles}
				/>

				{subItems &&
					subItems.map((item, idx) => {
						return (
							<RenderSubItems
								item={item}
								key={`${item.productId}-${idx}`}
								onRemoveUpgrade={onRemoveUpgrade}
							/>
						);
					})}
			</div>
			<OptionsCart options={options} />
		</div>
	);
}

export default SimpleCartItem;

function RenderSubItems(props) {
	const { item, onRemoveUpgrade } = props;
	const product = useMenus(item.productId, ActionTypes.PRODUCT);
	const translate = useTranslate();

	const isRemovableProduct = product.meta === META_ENUM.TOPPING_UPGRADE;

	const hasQuarters = item?.quarters && Array.isArray(item?.quarters);

	if (product.meta === META_ENUM.PIZZA_PREP) {
		return null;
	}

	return (
		<div className={styles["details-wrap"]}>
			<div className={styles["details"]}>
				<div className={styles["title-wrapper"]}>
					{hasQuarters && (
						<span className={`${styles["content-text"]} ${styles["quarters"]}`}>
							{getQuartersText(item.quarters)}
						</span>
					)}
					<span className={styles["content-text"]}>
						{product.nameUseCases?.Title}
					</span>
				</div>
			</div>
			<RenderInculde
				price={item.totalBeforeDiscount}
				newPrice={item.total}
				showPriceBeforeDiscount={item.showPriceBeforeDiscount}
			/>
			{isRemovableProduct ? (
				<img
					onClick={() => onRemoveUpgrade(item.productId)}
					src={Trash.src}
					className={styles["icon"]}
					alt={translate("accessibility_imageAlt_deleteOrder")}
					aria-hidden={true}
				/>
			) : null}
		</div>
	);
}
