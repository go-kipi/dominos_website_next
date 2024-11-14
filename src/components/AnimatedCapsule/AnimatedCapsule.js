import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

import { conditionalClass } from "utils/functions";

import styles from "./AnimatedCapsule.module.scss";
import useTranslate from "hooks/useTranslate";
import { EVENTS } from "constants/events";
import useEventEmitter from "hooks/useEventEmitter";
import { HTTP_STATUS } from "constants/httpStatus";

const BUTTON_STATES = {
	INIT: "FIRST",
	FINAL: "FINAL",
	OPEN: "OPEN",
};

function MemoizedCapsule(props) {
	const {
		bluePillText,
		redPillText,
		bluePillOnPress,
		redPillOnPress,
		className = "",
	} = props;
	const initialWidth = useRef(-1);
	const buttonRef = useRef();
	const cachedEvent = useRef(null);
	const [animationState, setAnimationState] = useState(BUTTON_STATES.INIT);
	const [redPressed, setRedPressed] = useState(null);
	const [bluePressed, setBluePressed] = useState(null);
	const translate = useTranslate();

	useEffect(() => {
		if (buttonRef.current) {
			if (initialWidth.current === -1) {
				initialWidth.current = buttonRef.current?.clientWidth;

				const height = buttonRef.current?.clientHeight;

				buttonRef.current.style.width = height + "px";

				setTimeout(() => {
					buttonRef.current.style.opacity = 1;
					buttonRef.current.style.transform = "scale(1)";
					setAnimationState(BUTTON_STATES.OPEN);
					buttonRef.current.style.width = initialWidth.current + "px";
				}, 300);
			}
		}
	}, [buttonRef.current]);

	useEffect(() => {
		if (buttonRef.current) {
			if (animationState === BUTTON_STATES.FINAL) {
				const height = buttonRef?.current?.clientHeight;
				buttonRef.current.style.width = height + "px";

				setTimeout(() => {
					buttonRef.current.style.opacity = 0;
					buttonRef.current.style.transform = "scale(0)";
					setTimeout(() => {
						executeOnClick();
					}, 250);
				}, 250);
			}
		}
	}, [animationState, buttonRef.current]);

	function onBluePillPressHandler() {
		setBluePressed(true);
		setAnimationState(BUTTON_STATES.FINAL);
	}

	const executeOnClick = () => {
		setTimeout(() => {
			if (buttonRef.current) {
				setAnimationState(BUTTON_STATES.OPEN);
				buttonRef.current.style.width = initialWidth.current + "px";

				buttonRef.current.style.opacity = 1;
				buttonRef.current.style.transform = "scale(1)";
				setBluePressed(null);
				setRedPressed(null);
			}
		}, 500);
		if (redPressed) {
			return typeof redPillOnPress === "function" && redPillOnPress();
		}
		if (bluePressed) {
			return typeof bluePillOnPress === "function" && bluePillOnPress();
		}
	};

	function onRedPressHandler() {
		setRedPressed(true);
		setAnimationState(BUTTON_STATES.FINAL);
	}

	const blueButtonClass = bluePressed ? "clicked" : "";
	const redButtonClass = redPressed ? "clicked" : "";
	const animationClass = animationState === BUTTON_STATES.OPEN ? "open" : "";
	return (
		<div
			className={clsx(
				styles["animated-capsule-wrapper"],
				conditionalClass(className),
			)}
			role={"group"}>
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
					onClick={onRedPressHandler}
					aria-label={redPillText}>
					<span
						className={styles["btn"]}
						aria-label={redPillText}>
						{redPillText}
					</span>
				</button>
				<div className={styles["or-wrapper"]}>
					<span className={styles["or-text"]}>{translate("or_middle_section")}</span>
				</div>
				<button
					className={clsx(
						styles["capsule-btn-wrapper"],
						styles["blue"],
						styles[conditionalClass(blueButtonClass)],
					)}
					onClick={onBluePillPressHandler}
					aria-label={bluePillText}>
					<span
						className={styles["btn"]}
						aria-label={bluePillText}>
						{bluePillText}
					</span>
				</button>
			</div>
		</div>
	);
}

export const AnimatedCapsule = React.memo(MemoizedCapsule);
