import RenderNotes from "components/PizzaNotes/PizzaNotes";
import Separator from "components/common/separator";
import React, { useMemo } from "react";
import EditIcon from "/public/assets/icons/edit.svg";
import styles from "./RenderCartItemSubItems.module.scss";
import Trash from "/public/assets/icons/multipleOptionsIndicator/trash.svg";
import clsx from "clsx";
import useMenus from "hooks/useMenus";
import { useSelector } from "react-redux";
import {
	getCurrencySign,
	getFullMediaUrl,
	getQuartersText,
} from "utils/functions";
import { META_ENUM } from "constants/menu-meta-tags";
import ActionTypes from "constants/menus-action-types";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import RenderPrices, {
	RenderInculde,
} from "../RenderCartPrices/RenderCartPrices";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
import useTranslate from "../../../../hooks/useTranslate";

export function RenderCartItemSubItems({
	subItems,
	onRemoveUpgrade,
	onEditItem,
}) {
	return (
		<div className={clsx(styles["collapse-wrap"])}>
			<div className={clsx(styles["items-wrap"])}>
				{subItems &&
					subItems.map((item, index, arr) => {
						let lastIndex = false;
						if (arr.length - 1 === index) {
							lastIndex = true;
						}
						return (
							<RenderCartItemSubItem
								item={item}
								lastIndex={lastIndex}
								key={index}
								onRemoveUpgrade={(upgradeId) => onRemoveUpgrade(upgradeId, index)}
								onEditItem={() => onEditItem(index)}
							/>
						);
					})}
			</div>
		</div>
	);
}

function RenderCartItemSubItem(props) {
	const { item, lastIndex, onRemoveUpgrade, onEditItem } = props;
	const translate = useTranslate();
	const product = useMenus(item.productId, ActionTypes.PRODUCT);

	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);

	const image = getFullMediaUrl(
		product,
		MEDIA_TYPES.PRODUCT,
		MEDIA_ENUM.IN_MENU,
	);

	const getPizzaRequestsDetails = (items) => {
		return (
			<RenderNotes
				items={items}
				className={styles["detail-request"]}
			/>
		);
	};

	const getAdditionals = (additionals) => {
		return additionals?.map((add) => {
			const addition = catalogProducts?.[add?.productId];

			const hasQuarters = add?.quarters && Array.isArray(add?.quarters);

			const isRemovableAddition = addition.meta === META_ENUM.TOPPING_UPGRADE;

			if (addition?.meta === META_ENUM.PIZZA_PREP) {
				return null;
			}

			return (
				<div
					key={add.uuid}
					className={styles["additional"]}>
					<div className={styles["sub-text-wrapper"]}>
						{hasQuarters && (
							<span className={`${styles["sub-text"]} ${styles["quarters"]}`}>
								{getQuartersText(add.quarters)}
							</span>
						)}
						<span className={styles["sub-text"]}>
							{addition?.nameUseCases?.Title}
						</span>
					</div>
					<RenderInculde
						price={add.totalBeforeDiscount}
						newPrice={add.total}
						showPriceBeforeDiscount={add.showPriceBeforeDiscount}
					/>

					{isRemovableAddition ? (
						<img
							onClick={() => onRemoveUpgrade(addition.id)}
							src={Trash.src}
							className={styles["icon"]}
							alt={translate("accessibility_imageAlt_deleteOrder")}
							aria-hidden={true}
						/>
					) : null}
				</div>
			);
		});
	};
	const hasQuarters = item?.quarters && Array.isArray(item?.quarters);

	if (product.meta === META_ENUM.PIZZA_PREP) {
		return null;
	}
	return (
		<React.Fragment key={item.uuid}>
			<div className={clsx(styles["item-wrap"])}>
				<div className={`${styles["img-wrap"]}`}>
					<img
						className={`${styles["product-img"]} `}
						src={image}
						alt={"image"}
						aria-hidden={true}
					/>
				</div>

				<div className={styles["details-content"]}>
					<div className={styles["details-wrap"]}>
						<div className={styles["details"]}>
							<div className={styles["title-wrapper"]}>
								{hasQuarters && (
									<span className={`${styles["title"]} ${styles["quarters"]}`}>
										{getQuartersText(item.quarters)}
									</span>
								)}
								<span className={styles["title"]}>{product.nameUseCases?.Title}</span>
							</div>
							{getPizzaRequestsDetails(item.subItems)}
						</div>
						<RenderInculde
							price={item.totalBeforeDiscount}
							newPrice={item.total}
							showPriceBeforeDiscount={item.showPriceBeforeDiscount}
						/>

						<img
							onClick={onEditItem}
							src={EditIcon.src}
							className={styles["edit-icon"]}
							alt={translate("accessibility_imageAlt_deleteOrder")}
							aria-hidden={true}
						/>
					</div>
					{item.subItems ? getAdditionals(item.subItems) : null}
				</div>
			</div>
			{!lastIndex && <Separator className={styles["separator"]} />}
		</React.Fragment>
	);
}
