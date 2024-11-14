import React from "react";

import styles from "./BigOrdersSuccess.module.scss";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";
import XIcon from "/public/assets/icons/x-icon.svg";
import EndOfSaleAnimation from "animations/end-of-sale.json";
import LottieAnimation from "components/LottieAnimation";

function BigOrdersSuccess(props) {
	const translate = useTranslate();
	const { onCloseClick } = props;

	return (
		<div className={styles["big-orders-success-wrapper"]}>
			<button
				aria-label={"Close popup"}
				className={"close-icon-wrapper"}
				onClick={() => onCloseClick()}>
				<img src={XIcon.src} />
			</button>

			<LottieAnimation
				animation={EndOfSaleAnimation}
				className={styles["animation"]}
			/>

			<div className={styles["text-wrapper"]}>
				<span
					className={styles["text"]}
					tabIndex={0}>
					{translate("birthDayEvents_success_title1")}
				</span>
				<span
					className={clsx(styles["text"], styles["text-bold"])}
					tabIndex={0}>
					{translate("birthDayEvents_success_title2")}
				</span>
			</div>
		</div>
	);
}

export default BigOrdersSuccess;
