import React from "react";
import DeliveryIcon from "/public/assets/icons/delivery.svg";

import styles from "./DeliveryFee.module.scss";
import Price from "components/Price";
import SRContent from "../../../../components/accessibility/srcontent";
import RenderPrices from "../RenderCartPrices/RenderCartPrices";

function DeliveryFee(props) {
	const { text, price } = props;

	return (
		<div
			className={styles["conatiner"]}
			tabIndex={0}>
			<SRContent
				role={"alert"}
				message={`${text} ₪${price}`}
				ariaLive={"polite"}
			/>
			<div className={styles["left-side"]}>
				<div className={styles["icon-wrapper"]}>
					<img src={DeliveryIcon.src} />
				</div>
				<span className={styles["text"]}>{text}</span>
			</div>
			<div className={styles["right-side"]}>
				<RenderPrices newPrice={price} />
			</div>
		</div>
	);
}
export default DeliveryFee;
