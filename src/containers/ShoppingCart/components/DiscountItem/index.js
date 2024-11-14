import React from "react";
import styles from "./index.module.scss";
import TrashIcon from "/public/assets/icons/trash.svg";
import CouponIcon from "/public/assets/icons/coupon-icon.svg";
import clsx from "clsx";
import { useSelector } from "react-redux";
import CartItemDisclaimers from "../CartItemDisclaimers/CartItemDisclaimers";
import useTranslate from "../../../../hooks/useTranslate";
const DiscountItem = (props) => {
	const {
		id,
		uuid,
		subText,
		price = "",
		text,
		onDelete,
		disclaimers = [],
	} = props;
	const translate = useTranslate();

	const handleDelete = () => {
		typeof onDelete === "function" && onDelete(uuid);
	};

	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);
	const floatingPrice = Number(price).toFixed(displayDecimalPoint);

	return (
		<div
			className={styles["discount-wrapper"]}
			tabIndex={0}>
			<div className={styles["discount-right"]}>
				<div className={styles["coupon-icon"]}>
					<img
						src={CouponIcon.src}
						aria-hidden={true}
						alt={"coupon icon"}
					/>
				</div>
				<div className={styles["coupon-text-wrapper"]}>
					<span className={styles["coupon-text"]}>{text}</span>
					<CartItemDisclaimers disclaimers={disclaimers} />
				</div>
			</div>
			<div className={styles["discount-left"]}>
				<div className={clsx(styles["coupon-difference"])}>
					{"₪" + " " + floatingPrice}
				</div>
				<div
					role={"button"}
					tabIndex={0}
					aria-label={translate(
						"accessibility_shoppingCart_discount_removeDiscount",
					)}
					className={styles["coupon-delete"]}
					onClick={handleDelete}>
					<img src={TrashIcon.src} />
				</div>
			</div>
		</div>
	);
};

export default DiscountItem;
