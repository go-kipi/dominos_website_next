import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

import { conditionalClass } from "utils/functions";

import styles from "./AnimatedCapsule.module.scss";
import useTranslate from "hooks/useTranslate";
import { EVENTS } from "constants/events";
import useEventEmitter from "hooks/useEventEmitter";
import { HTTP_STATUS } from "constants/httpStatus";
import DominosLoader from "components/DominosLoader/DominosLoader";

const BUTTON_STATES = {
	OPEN: "OPEN",
	FOLD: "FOLD",
};

const BUTTON_ID = {
	RED: "RED",
	BLUE: "BLUE",
};

function MemoizedCapsule(props) {
	const {
		bluePillText,
		redPillText,
		bluePillOnPress,
		redPillOnPress,
		className = "",
	} = props;

	const buttonRef = useRef();
	const cachedEvent = useRef(null);
	const btnPressed = useRef(null);
	const [animationState, setAnimationState] = useState(BUTTON_STATES.OPEN);
	const [showLoader, setShowLoader] = useState(false);
	const [initialWidth, setInitialWidth] = useState(null);
	const translate = useTranslate();

	useEventEmitter(EVENTS.HTTP_REQUEST, handleHttpEvent);

	useEffect(() => {
		if (buttonRef.current && !initialWidth) {
			setInitialWidth(buttonRef.current.clientWidth);
		}
	}, [buttonRef.current]);

	useEffect(() => {
		if (buttonRef.current) {
			const handleTransitionEnd = (e) => {
				if (e.propertyName === "transform" && btnPressed.current !== null) {
					onAnimationDone();
				}
			};
			buttonRef.current.addEventListener("transitionend", handleTransitionEnd);
			return () => {
				buttonRef?.current?.removeEventListener(
					"transitionend",
					handleTransitionEnd,
				);
			};
		}
	}, [buttonRef.current]);

	useEffect(() => {
		if (buttonRef.current && initialWidth) {
			if (animationState === BUTTON_STATES.OPEN) {
				openCapsule();
			}
			if (animationState === BUTTON_STATES.FOLD) {
				closeCapsule();
			}
		}
	}, [animationState, buttonRef.current, initialWidth]);

	function closeCapsule() {
		const height = buttonRef?.current?.clientHeight;
		buttonRef.current.style.width = height + "px";
		setTimeout(() => {
			buttonRef.current.style.opacity = 0;
			buttonRef.current.style.transform = "scale(0)";
		}, 250);
	}

	function handleHttpEvent(event) {
		if (cachedEvent.current !== event.detail) {
			cachedEvent.current = event.detail;
			if (
				event.detail === HTTP_STATUS.FAILED ||
				event.detail === HTTP_STATUS.REJECT
			) {
				openCapsule();
			}
		}
	}

	function openCapsule() {
		if (!buttonRef.current) return;
		const height = buttonRef.current.clientHeight;
		buttonRef.current.style.width = height + "px";
		setTimeout(() => {
			if (!buttonRef.current) return;
			buttonRef.current.style.opacity = 1;
			buttonRef.current.style.transform = "scale(1)";
			buttonRef.current.style.width = initialWidth + "px";
		}, 300);
	}

	function openCapsuleDueToError() {
		setTimeout(() => {
			setShowLoader(false);
			setAnimationState(BUTTON_STATES.OPEN);
		}, 4000);
	}

	function onCapsuleClicked(buttonId) {
		setAnimationState(BUTTON_STATES.FOLD);
		btnPressed.current = buttonId;
	}

	function onAnimationDone() {
		setShowLoader(true);
		openCapsuleDueToError();

		if (btnPressed.current === BUTTON_ID.RED) {
			typeof redPillOnPress === "function" && redPillOnPress();
		}
		if (btnPressed.current === BUTTON_ID.BLUE) {
			typeof bluePillOnPress === "function" && bluePillOnPress();
		}
		btnPressed.current = null;
	}

	const blueButtonClass = btnPressed.current === BUTTON_ID.BLUE ? "clicked" : "";
	const redButtonClass = btnPressed.current === BUTTON_ID.RED ? "clicked" : "";
	const animationClass = animationState === BUTTON_STATES.OPEN ? "open" : "";

	return (
		<div
			className={clsx(
				styles["animated-capsule-wrapper"],
				conditionalClass(className),
			)}
			role={"group"}>
			{showLoader && (
				<>
					<div className={styles["loader-wrapper"]}>
						<DominosLoader />
					</div>
				</>
			)}
			{!showLoader && (
				<div
					ref={buttonRef}
					className={clsx(
						styles["capsule-wrapper"],
						styles[conditionalClass(blueButtonClass)],
						styles[conditionalClass(redButtonClass)],
						styles[conditionalClass(animationClass)],
					)}>
					<button
						className={clsx(
							styles["capsule-btn-wrapper"],
							styles["red"],
							styles[conditionalClass(redButtonClass)],
						)}
						onClick={() => onCapsuleClicked(BUTTON_ID.RED)}
						aria-label={redPillText}>
						<span
							className={styles["btn"]}
							aria-label={redPillText}>
							{redPillText}
						</span>
					</button>
					<div className={styles["or-wrapper"]}>
						<span className={styles["or-text"]}>
							{translate("or_middle_section")}
						</span>
					</div>
					<button
						className={clsx(
							styles["capsule-btn-wrapper"],
							styles["blue"],
							styles[conditionalClass(blueButtonClass)],
						)}
						onClick={() => onCapsuleClicked(BUTTON_ID.BLUE)}
						aria-label={bluePillText}>
						<span
							className={styles["btn"]}
							aria-label={bluePillText}>
							{bluePillText}
						</span>
					</button>
				</div>
			)}
		</div>
	);
}

export const AnimatedCapsule = React.memo(MemoizedCapsule);
