import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import clsx from "clsx";
import CloseIcon from "/public/assets/icons/x-icon.svg";
import useTranslate from "hooks/useTranslate";
import { useSelector } from "react-redux";
import SRContent from "../../../components/accessibility/srcontent";

const DIST_THRESHOLD = 50;

function TrackerNotification({ msg }) {
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const lang = useSelector((store) => store.generalData.lang);
	const trackerMessagesTranslations = useSelector(
		(store) => store.trackerMessagesTranslations,
	);
	const trackerMessagesObject = trackerMessagesTranslations[msg] ?? {};
	const { values = {} } = trackerMessagesObject;
	const messages = values[lang] ?? [];
	const message = messages?.[0] || msg;
	const didSwipe = useRef(false);
	const startX = useRef();
	const startY = useRef();
	const [hiddenClassName, setHiddenClassName] = useState("hidden-top");

	useEffect(() => {
		setHiddenClassName("");
	}, []);

	const hideNotification = (dir = "top") => {
		if (!hiddenClassName) {
			setHiddenClassName(`hidden-${dir}`);
		}
	};

	const handleOnClick = () => {
		hideNotification();
	};

	function handleOnTouchStart(event) {
		startX.current = event.changedTouches[0].clientX;
		startY.current = event.changedTouches[0].clientY;
	}

	function handleOnTouchMove(event) {
		const touch = event.changedTouches[0];
		const currentX = touch.clientX;
		const currentY = touch.clientY;
		const deltaX = currentX - startX.current;
		const deltaY = currentY - startY.current;

		// Check if swipe distance is greater than threshold
		if (Math.abs(deltaX) > DIST_THRESHOLD || Math.abs(deltaY) > DIST_THRESHOLD) {
			// Determine swipe direction
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				if (deltaX > 0) {
					// Swipe right
					didSwipe.current = true;
					hideNotification("right");
				} else {
					// Swipe left
					didSwipe.current = true;
					hideNotification("left");
				}
			} else {
				if (deltaY > 0) {
					// Swipe down
					didSwipe.current = true;
					hideNotification("bottom");
				} else {
					// Swipe up
					didSwipe.current = true;
					hideNotification("top");
				}
			}
		}
	}

	function handleOnTouchEnd(e) {
		startX.current = undefined;
		startY.current = undefined;
		if (didSwipe.current) {
			hideNotification();
			didSwipe.current = undefined;
		}
	}

	return (
		<div
			onTouchStart={(e) => handleOnTouchStart(e)}
			onTouchMove={(e) => handleOnTouchMove(e)}
			onTouchEnd={(e) => handleOnTouchEnd(e)}
			className={clsx(
				styles["tracker-notification-wrapper"],
				hiddenClassName ? styles[hiddenClassName] : "",
			)}>
			<SRContent message={message} ariaLive={'polite'} role={'alert'}/>
			{!(deviceState.isMobile || deviceState.isTablet) ? (
				<div
					onClick={handleOnClick}
					aria-hidden={true}
					className={styles["close-icon"]}>
					<img src={CloseIcon.src} />
				</div>
			) : null}
			<span className={styles["tracker-notification-msg"]}>{message}</span>
		</div>
	);
}

export default TrackerNotification;
