import React from "react";
import styles from "./index.module.scss";
import xBtn from "/public/assets/icons/x-icon.svg";
import Actions from "redux/actions";
import { useDispatch } from "react-redux";
import Animation from "animations/closed-branch.json";
import LottieAnimation from "components/LottieAnimation";

import Button from "../../../../components/button";
import useTranslate from "hooks/useTranslate";

const ClosedBranch = (props) => {
	const { params = {}, navigateToMenuScreen } = props;
	const { hour = "00:00", orderingTime = 13, isPickup } = params;
	const translate = useTranslate();

	const dispatch = useDispatch();

	const handleClose = () => {
		dispatch(Actions.removePopup());
	};

	return (
		<div className={styles["closed-branch-wrapper"]}>
			<div className={styles["closed-branch-header"]}>
				<button
					aria-label={"close popup"}
					className={styles["closed-branch-close-btn"]}>
					<img
						src={xBtn.src}
						alt=""
						className={styles["x-btn"]}
						onClick={handleClose}
					/>
				</button>
			</div>
			<div className={styles["animation-wrapper"]}>
				<LottieAnimation
					className={styles["animation"]}
					animation={Animation}
				/>
			</div>
			<div className={styles["closed-branch-body"]}>
				<div
					className={styles["closed-branch-title"]}
					tabIndex={0}>
					{translate("closedBranch_title")}
				</div>
				<div
					className={styles["closed-branch-closing-time"]}
					tabIndex={0}>
					{translate("closedBranch_closing_time").replace("[_]", hour)}
				</div>
				<div
					className={styles["closed-branch-calm-message"]}
					tabIndex={0}>
					{translate("closedBranch_calm_down_part_1")}
					<span className={styles["closed-branch-calm-message-bold"]}>
						{translate("closedBranch_calm_down_part_2").replace("[_]", orderingTime)}
					</span>
					{translate("closedBranch_calm_down_part_3")}
				</div>
				<div
					className={styles["closed-branch-staff"]}
					tabIndex={0}>
					{translate(
						isPickup ? "closedBranch_staff_pickup" : "closedBranch_staff_delivery",
					)}
				</div>
			</div>
			<Button
				className={styles["closed-branch-button"]}
				text={translate("closedBranch_no_worries")}
				onClick={navigateToMenuScreen}
			/>
		</div>
	);
};

export default ClosedBranch;
