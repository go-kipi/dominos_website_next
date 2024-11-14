import React from "react";

import StoreIcon from "/public/assets/icons/store.svg";
import Button from "components/button";
import TextOnlyButton from "components/text_only_button";

import styles from "./index.module.scss";

function BranchCoupon(props) {
	const { params } = props;
	const {
		title = "",
		subtitle = "",
		primaryBtnText = "",
		secondaryBtnText = "",
	} = params;

	function useCouponHandler() {}

	function saveForLaterHandler() {}

	return (
		<div className={styles["store-wrapper"]}>
			<div className={styles["img-wrap"]}>
				<img
					className={"img"}
					src={StoreIcon.src}
					alt={"img"}
				/>
			</div>
			<h3 className={styles["title"]}>{title}</h3>
			<h5 className={styles["subtitle"]}>{subtitle}</h5>
			<div className={styles["actions"]}>
				<Button
					text={primaryBtnText}
					onClick={useCouponHandler}
					className={styles["accept-btn"]}
				/>
				<TextOnlyButton
					text={secondaryBtnText}
					onClick={saveForLaterHandler}
					className={styles["decline-btn"]}
				/>
			</div>
		</div>
	);
}

export default BranchCoupon;
