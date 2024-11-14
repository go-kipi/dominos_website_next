import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import Animation from "animations/no-kosher-branch-found.json";
import xBtn from "/public/assets/icons/x-icon.svg";
import backIcon from "/public/assets/icons/back-black.svg";
import styles from "./index.module.scss";

import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";
import Button from "components/button";
import Actions from "redux/actions";
import LottieAnimation from "components/LottieAnimation";
import NoBranchImage from "/public/assets/icons/nobranch-regular.svg";
import useStack from "../../../../../hooks/useStack";
import STACK_TYPES from "../../../../../constants/stack-types";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import TextOnlyButton from "components/text_only_button";

const NoBranch = (props) => {
	const { params } = props;
	const { handleSpecialDelivery, isKosher } = params;
	const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.DELIVERY);
	const dispatch = useDispatch();
	const translate = useTranslate();

	const handlePickup = () => {
		setStack({
			type: deliveryScreensTypes.BRANCHWITHLOCATION,
			showHeader: false,
			params: {
				selectedTags: isKosher ? ["Kosher"] : [],
			},
		});
	};

	const handleClose = () => {
		dispatch(Actions.setTemporarilyNotKosher(false));
		dispatch(Actions.removePopup());
	};

	const onHandleSpecialDelivery = () => {
		dispatch(Actions.setTemporarilyNotKosher(true));
		handleSpecialDelivery();
	};

	return (
		<div className={styles["no-branch-popup-wrapper"]}>
			<div className={styles["header"]}>
				<button
					aria-label={translate("accessibility_alt_arrowBack")}
					className={styles["back-btn-wrapper"]}
					onClick={() => goBack()}>
					<img
						src={backIcon.src}
						alt={""}
						className={styles["back-btn"]}
					/>
				</button>
				<button
					aria-label={"close popup"}
					className={styles["x-btn-wrapper"]}
					onClick={handleClose}>
					<img
						src={xBtn.src}
						alt=""
						className={styles["x-btn"]}
					/>
				</button>
			</div>
			{isKosher && (
				<LottieAnimation
					className={styles["animation-wrapper"]}
					animation={Animation}
				/>
			)}
			{!isKosher && (
				<img
					src={NoBranchImage.src}
					className={clsx(styles["animation-wrapper"], styles["no-branch-icon"])}
					alt={"No branch found"}
				/>
			)}
			<div
				className={styles["title"]}
				tabIndex={0}>
				{translate("nobranch_title")}
			</div>
			<div
				className={styles["description"]}
				tabIndex={0}>
				{translate(
					isKosher ? "nobranch_description_kosher" : "nobranch_description",
				)}
			</div>
			<div className={styles["no-branch-actions"]}>
				<Button
					className={clsx(styles["nobranch-btn"], "primary")}
					text={translate("nobranch_button")}
					onClick={handlePickup}
				/>
				{isKosher && (
					<TextOnlyButton
						onClick={onHandleSpecialDelivery}
						text={translate("delivery_once_not_kosher_btn")}
					/>
				)}
			</div>
		</div>
	);
};

export default NoBranch;
