import React from "react";
import LottieAnimation from "components/LottieAnimation";

import styles from "./index.module.scss";
import BlueArrow from "/public/assets/icons/blue-arrow-icon.svg";
import DeliveryIcon from "/public/assets/icons/trackerSelection/delivery.svg";
import PickupIcon from "/public/assets/icons/trackerSelection/pickup.svg";
import useTranslate from "hooks/useTranslate";
import { useSelector } from "react-redux";

export default function TrackerListItem(props) {
	const {
		onClick = null,
		saleHash,
		acceptedAt,
		details,
		// step = 0,
		total,
	} = props;
	const translate = useTranslate();
	const isDelivery = details?.subService !== "pu";

	const date = new Date(acceptedAt.replace(/-/g, "/"));
	const hour = date.getHours();
	const minute =
		date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

	const acceptedAtTime = hour + ":" + minute;

	const address = isDelivery ? details?.address?.address : details?.storeName;
	const icon = isDelivery ? DeliveryIcon : PickupIcon;

	const acceptedAtText = translate(
		"trackerScreen_multipleOrders_orderAcceptedAt_label",
	).replace("{time}", acceptedAtTime);

	const addressText = isDelivery
		? translate("trackerScreen_multipleOrders_delivery_orderTo_label").replace(
				"{address}",
				address,
		  )
		: translate("trackerScreen_multipleOrders_pickup_orderTo_label").replace(
				"{branch}",
				address,
		  );

	const handleOnClick = () => {
		typeof onClick === "function" && onClick(saleHash);
	};

	return (
		<button
			onClick={handleOnClick}
			className={styles["tracker-list-item-wrapper"]}
			role={"listitem"}>
			<div className={styles["tracker-item-container"]}>
				<div className={styles["tracker-item-lottie"]}>
					<img src={icon.src} />
				</div>
				<div className={styles["item-info"]}>
					<div className={styles["accepted-at-text"]}>{acceptedAtText}</div>
					<div className={styles["address-text"]}>{addressText}</div>

					<div className={styles["order-total-text"]}>{`${total} ₪`}</div>
				</div>
			</div>
			<div className={styles["blue-arrow-icon"]}>
				<img src={BlueArrow.src} />
			</div>
		</button>
	);
}
