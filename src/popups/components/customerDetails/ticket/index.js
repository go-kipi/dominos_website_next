import useMenus from "../../../../hooks/useMenus";
import ActionTypes from "../../../../constants/menus-action-types";
import clsx from "clsx";
import styles from "./index.module.scss";
import Price from "../../../../components/Price";

import React from "react";
import CartItem from "entitiesCartItem/CartItem";
import { isPizzaItem } from "utils/functions";

export default function Ticket({
	className,
	title,
	value,
	separator,
	basketItem,
	total,
}) {
	const menuItem = useMenus(basketItem?.productId, ActionTypes.PRODUCT);
	const ticketKey = title ? title : menuItem?.nameUseCases?.Title;
	const ticketValue = value ? value : menuItem?.nameUseCases?.SubTitle;

	const hasSubitem =
		Array.isArray(basketItem?.subItems) && basketItem?.subItems.length;

	const showValue = !hasSubitem;

	const isDeal = menuItem.meta === "Deals";
	const isPizzaOrSideDishWithSelection = !isDeal && !!hasSubitem;

	return (
		<div className={clsx(styles["ticket-wrap"], className)}>
			<div className={styles["row"]}>
				{ticketKey && (
					<span className={styles["key"]}>
						{ticketKey}

						{!isPizzaOrSideDishWithSelection && showValue
							? ticketValue
								? ": "
								: " "
							: ""}
						<span className={styles["space"]}>&nbsp;</span>
						{ticketValue && showValue && (
							<span className={styles["value"]}>{ticketValue}</span>
						)}
						{isPizzaOrSideDishWithSelection ? ": " : ""}
						{isPizzaOrSideDishWithSelection && basketItem?.subItems && (
							<PizzaItemDesc additional={basketItem.subItems} />
						)}
					</span>
				)}

				{typeof total === "number" && (
					<Price
						className={clsx(styles["price"], styles["total"])}
						value={total}
						currency={"shekel"}
					/>
				)}
			</div>
			{!isPizzaOrSideDishWithSelection && basketItem?.subItems && (
				<Additional additional={basketItem.subItems} />
			)}
			{separator && <div className={styles["separator"]} />}
		</div>
	);
}

function PizzaItemDesc({ additional }) {
	return Object.values(additional).map((additionalItem, index) => {
		const isLast = index === Object.values(additional).length - 1;
		return (
			<SubItem
				key={"sub-" + additionalItem.uuid}
				additional={additionalItem}
				separator={!isLast}
			/>
		);
	});
}

function Additional({ additional }) {
	return Object.values(additional).map((additionalItem) => {
		return (
			<Item
				key={"sub-" + additionalItem.uuid}
				additionalItem={additionalItem}
			/>
		);
	});
}

function Item({ additionalItem }) {
	const item = useMenus(additionalItem?.productId, ActionTypes.PRODUCT);

	const showValue = !additionalItem?.subItems;

	return (
		<div className={styles["sub-wrap"]}>
			<span className={styles["key"]}>
				{item?.nameUseCases?.Title}
				{(additionalItem.subItems || item?.nameUseCases?.SubTitle) && ":"}
				&nbsp;
				{showValue && item?.nameUseCases?.SubTitle && (
					<span className={styles["value"]}>{item?.nameUseCases?.SubTitle}</span>
				)}
				{additionalItem.subItems
					? Object.values(additionalItem.subItems).map((subItem, index, row) => {
							const separator = index + 1 !== row.length;
							return (
								<SubItem
									key={subItem.uuid}
									additional={subItem}
									separator={separator}
								/>
							);
					  })
					: null}
			</span>
		</div>
	);
}

function SubItem({ additional, separator }) {
	const additionalItem = useMenus(additional?.productId, ActionTypes.PRODUCT);

	return (
		<span className={styles["value"]}>
			{additionalItem.nameUseCases?.Title} {separator && <span>{"|"}</span>}{" "}
		</span>
	);
}
