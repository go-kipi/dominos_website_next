import React from "react";

import styles from "./CartItemDisclaimers.module.scss";

function CartItemDisclaimers({ disclaimers }) {
	return Array.isArray(disclaimers) && disclaimers.length > 0 ? (
		<div className={styles["disclaimers-wrap"]}>
			<span className={styles["disclaimers"]}>{disclaimers.join(" ")}</span>
		</div>
	) : null;
}

export default CartItemDisclaimers;
