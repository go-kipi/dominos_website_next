import React, { useRef } from "react";
import SlidePopup from "popups/Presets/SlidePopup";
import MinimunPriceIcon from "/public/assets/icons/minimum-price.svg";
import useTranslate from "hooks/useTranslate";
import Button from "components/button";
import styles from "./MinimumPrice.module.scss";
import { useSelector } from "react-redux";

export default function MinimumPricePopup(props) {
	const ref = useRef();
	const translate = useTranslate();
	const order = useSelector((store) => store.order);
	const isPickup = order?.isPickup;
	const minPrice = order?.minSaleAmount;

	const onHide = () => {
		ref.current.animateOut();
	};

	const messageKey = "BasketDidNotReachMinimumSum";

	let message = translate(messageKey).replace("{minSaleAmount}", `${minPrice}`);

	if (isPickup) {
		message = message.replace("{subServiceType}", translate("pickup_label"));
	} else {
		message = message.replace("{subServiceType}", translate("delivery_label"));
	}

	return (
		<SlidePopup
			id={props.id}
			showCloseIcon
			className={styles["minimum-price"]}
			ref={ref}>
			<div className={styles["minimum-price-wrapper"]}>
				<div className={styles["minimum-price-icon"]}>
					<img src={MinimunPriceIcon.src} />
				</div>
				<span
					className={styles["minimum-price-text"]}
					tabIndex={0}>
					{message}
				</span>
				<Button
					className={styles["minimum-price-btn"]}
					text={translate("minimumPricePopup_button_label")}
					onClick={onHide}
				/>
			</div>
		</SlidePopup>
	);
}
