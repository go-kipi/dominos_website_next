import React, { useEffect, useState } from "react";

import styles from "./FlipDevice.module.scss";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";

import PizzaBox from "/public/assets/icons/favorite-pizza.svg";
import useTranslate from "hooks/useTranslate";
import { useSelector } from "react-redux";
import SRContent from "../accessibility/srcontent";
import { createAccessibilityText } from "../accessibility/acfunctions";

function FlipDevice(props) {
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const [hidden, setHidden] = useState(true);

	useEffect(() => {
		if ((!deviceState.isMobile && !deviceState.isTablet) || !isMobile()) {
			const portrait = window.matchMedia("(orientation: landscape)");

			portrait.addEventListener("change", onScreenRotate);
			return () => {
				portrait.removeEventListener("change", onScreenRotate);
			};
		}
	}, []);

	function onScreenRotate(event) {
		if (event.matches) {
			setHidden(false);
		} else {
			setHidden(true);
		}
	}

	function isMobile() {
		const regex =
			/Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
		return regex.test(navigator.userAgent);
	}

	if ((!deviceState.isMobile && !deviceState.isTablet) || !isMobile()) {
		return null;
	}
	return (
		<div
			className={styles["flip-device-wrapper"]}
			id={"flip-device-overlay"}>
			<BackgroundImage />
			<div className={styles["content"]}>
				{!hidden && (
					<SRContent
						aria-live={"polite"}
						role={"alert"}
						message={createAccessibilityText(
							translate("flipDevice_title"),
							translate("flipDevice_subtitle"),
						)}
					/>
				)}
				<div
					className={styles["image-wrapper"]}
					aria-hidden={true}>
					<img
						src={PizzaBox.src}
						alt={""}
					/>
				</div>
				<span
					className={`${styles["text"]} ${styles["title"]}`}
					aria-hidden={hidden}>
					{translate("flipDevice_title")}
				</span>
				<span
					className={`${styles["text"]} ${styles["subtitle"]}`}
					aria-hidden={hidden}>
					{translate("flipDevice_subtitle")}
				</span>
			</div>
		</div>
	);
}

export default FlipDevice;
