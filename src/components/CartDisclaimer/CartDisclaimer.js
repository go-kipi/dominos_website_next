import React from "react";

import styles from "./CartDisclaimer.module.scss";
import useTranslate from "hooks/useTranslate";
import { useSelector } from "react-redux";

function CartDisclaimer() {
	const translate = useTranslate();
	const isPickup = useSelector((state) => state.order.isPickup);

	return isPickup ? null : (
		<div className={styles["disclaimer-wrapper"]}>
			<span className={styles["disclaimer-text"]}>
				{translate("cart_disclaimer_text_p1")}
				<span className={styles["bold"]}>
					{translate("cart_disclaimer_text_p2")}
				</span>
				{translate("cart_disclaimer_text_p3")}
			</span>
		</div>
	);
}

export default CartDisclaimer;
