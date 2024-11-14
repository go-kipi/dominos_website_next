import React from "react";

import RedClock from "/public/assets/icons/red-clock.svg";
import BlueClock from "/public/assets/icons/blue-clock.svg";
import Navigation from "/public/assets/icons/navigation.svg";

import styles from "./Branch.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "components/accessibility/keyboardsEvents";

export default function Branch(props) {
	const {
		name,
		address,
		isOpen,
		note,
		distance,
		comment,
		id,
		onClick,
		isOpenToday = true,
		withLink = false,
		role = "",
		handleAnalytics,
	} = props;

	const clock = isOpen ? BlueClock : RedClock;
	const translate = useTranslate();

	const onClickHandler = () => {
		if (!withLink && isOpenToday) {
			onClick(id);
		}
		typeof handleAnalytics === "function" && handleAnalytics();
	};

	return (
		<div
			id={id}
			className={clsx(
				styles["branch-with-location-wrapper"],
				isOpenToday ? "" : styles["disabled"],
			)}
			tabIndex={0}
			role={role}
			aria-checked={false}
			onClick={onClickHandler}
			onKeyDown={(event) => handleKeyPress(event, onClickHandler)}>
			<span className={styles["branch-name"]}>{name}</span>
			<span className={styles["branch-address"]}>{address}</span>
			<div className={styles["note-km-wrapper"]}>
				<div className={styles["note-wrapper"]}>
					<div className={styles["clock-wrapper"]}>
						<img
							src={clock.src}
							alt="clock"
							className={styles["clock-icon"]}
							aria-hidden={true}
						/>
					</div>
					<span
						className={clsx(
							styles["note"],
							isOpen ? styles["note-open"] : styles["note-close"],
						)}>
						{note}
					</span>
				</div>
				{distance >= 0 && (
					<div className={styles["distance-wrapper"]}>
						<div className={styles["navigation-icon-wrapper"]}>
							<img
								src={Navigation.src}
								className={styles["navigation-icon"]}
								alt="Navigation"
								aria-hidden={true}
							/>
						</div>
						<span className={styles["km"]}>
							{distance} <span>&nbsp;</span>
							{translate("km")}
						</span>
					</div>
				)}
			</div>
			{comment !== undefined && comment !== "" && (
				<div className={styles["comment-wrapper"]}>
					<span className={styles["comment-text"]}>{translate("asterisk")}</span>
					<span className={clsx(styles["comment-text"], styles["comment"])}>
						{comment}
					</span>
				</div>
			)}
		</div>
	);
}
