import React from "react";
import EmptyBox from "/public/assets/icons/empty_box.svg";

import styles from "./index.module.scss";
import Button from "components/button";
import useOrder from "hooks/useOrder";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";
const EmptyCart = (props) => {
	const { onClick, isCountItemIsZero } = props;
	const { hasOrder } = useOrder();
	const translate = useTranslate();
	return (
		<div className={clsx(styles["empty-box-wrap"], "empty-box-wrap")}>
			{!isCountItemIsZero ? (
				<>
					<img
						className={clsx(styles["empty-box-icon"], "empty-box-icon")}
						src={EmptyBox.src}
						alt={"empty"}
					/>
					<span className={styles["empty-box-text"]}>
						{translate("cart_your_cart_empty")}
					</span>
				</>
			) : null}
			<Button
				className={styles["blue-btn-wrap"]}
				textClassName={styles["blue-btn-wrap-inner"]}
				onClick={onClick}
				text={
					hasOrder
						? isCountItemIsZero
							? translate("cart_start_ordering_noActiveOrder")
							: translate("cart_start_ordering")
						: translate("cart_start_ordering_noActiveOrder")
				}
			/>
		</div>
	);
};

export default EmptyCart;
