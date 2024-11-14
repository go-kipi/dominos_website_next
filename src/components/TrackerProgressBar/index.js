import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import LottieAnimation from "components/LottieAnimation";
import styles from "./index.module.scss";
import {
	TRACKER_PICKUP_STEPS,
	TRACKER_DELIVERY_STEPS,
	TRACKER_STATUS_ENUM,
} from "constants/tracker-status-id";
import MakeAnimation from "animations/tracker/tracker-make-step.json";
import BakeAnimation from "animations/tracker/tracker-bake-step.json";
import PackAnimation from "animations/tracker/tracker-pack-step.json";
import DeliveryAnimation from "animations/tracker/tracker-delivery-step.json";
import clsx from "clsx";
import LanguageDirectionService from "services/LanguageDirectionService";
import useTranslate from "hooks/useTranslate";
import SRContent from "../accessibility/srcontent";

const STEPS_TRANSLATIONS = [
	"trackerScreen_tracker_makeStep",
	"trackerScreen_tracker_bakeStep",
	"trackerScreen_tracker_packStep",
	"trackerScreen_tracker_enrouteStep",
];
const STEPS_LOTTIE = {
	[TRACKER_STATUS_ENUM.PREPARATION]: MakeAnimation,
	[TRACKER_STATUS_ENUM.BAKING]: BakeAnimation,
	[TRACKER_STATUS_ENUM.PACKING]: PackAnimation,
	[TRACKER_STATUS_ENUM.DISPATCHED]: DeliveryAnimation,
	[TRACKER_STATUS_ENUM.ENROUTE]: DeliveryAnimation,
	[TRACKER_STATUS_ENUM.NEXT_TO_BE_DELIVERED]: DeliveryAnimation,
	[TRACKER_STATUS_ENUM.ARRIVING_SOON]: DeliveryAnimation,
};
export default function TrackerProgressBar(props) {
	const translate = useTranslate();
	const {
		orderType = "pu",
		isActive = false,
		ETA,
		status,
		stepSeconds,
		secondsRemaining,
	} = props;
	const isPickup = orderType === "pu";
	const isDelivery = !isPickup;
	const isEnrouteStep =
		status === TRACKER_STATUS_ENUM.ENROUTE ||
		status === TRACKER_STATUS_ENUM.DISPATCHED ||
		status === TRACKER_STATUS_ENUM.NEXT_TO_BE_DELIVERED ||
		status === TRACKER_STATUS_ENUM.ARRIVING_SOON;
	const lottieRef = useRef();
	const progressBarRef = useRef();

	const progressBarWrapperRef = useRef();
	const [wrapperRect, setWrapperRect] = useState(0);

	const steps = isPickup ? TRACKER_PICKUP_STEPS : TRACKER_DELIVERY_STEPS;
	const [timePassed, setTimePassed] = useState(0);
	const stepLength = 100 / Object.keys(steps).length;

	useLayoutEffect(() => {
		if (progressBarWrapperRef.current) {
			const rect = progressBarWrapperRef.current.getBoundingClientRect();
			setWrapperRect(rect.width);
		}
	}, []);

	useEffect(() => {
		updateProgress(2);
		if (wrapperRect !== 0) {
			updateProgressBasedOnRemainingSeconds();
		}
	}, [ETA, wrapperRect, secondsRemaining]);

	function calculatePointInStep(pointStart, pointEnd, percent) {
		// Calculate the range of the current checkpoint
		const range = pointEnd - pointStart;

		// Calculate the halfway point within the current point's range
		const pointWithin = pointStart + range * (percent / 100);

		return pointWithin;
	}

	function getStartingPoint() {
		switch (status) {
			case TRACKER_STATUS_ENUM.PREPARATION:
				return 0;
			case TRACKER_STATUS_ENUM.BAKING:
				return isPickup ? 36 : 28;
			case TRACKER_STATUS_ENUM.PACKING:
				return isPickup ? 69 : 52;
			case TRACKER_STATUS_ENUM.DISPATCHED:
			case TRACKER_STATUS_ENUM.ENROUTE:
			case TRACKER_STATUS_ENUM.NEXT_TO_BE_DELIVERED:
				return 77;
			default:
				return 0;
		}
	}

	function getEndingPoint() {
		switch (status) {
			case TRACKER_STATUS_ENUM.PREPARATION:
				return isPickup ? 36 : 28;
			case TRACKER_STATUS_ENUM.BAKING:
				return isPickup ? 69 : 52;
			case TRACKER_STATUS_ENUM.PACKING:
				return isPickup ? 100 : 77;
			case TRACKER_STATUS_ENUM.DISPATCHED:
			case TRACKER_STATUS_ENUM.ENROUTE:
			case TRACKER_STATUS_ENUM.NEXT_TO_BE_DELIVERED:
				return 100;
			default:
				return 25;
		}
	}

	function updateProgressBasedOnRemainingSeconds() {
		const isArrivingSoon = status === TRACKER_STATUS_ENUM.ARRIVING_SOON;
		const startingPoint = getStartingPoint();
		const endingPoint = getEndingPoint();
		const a = stepSeconds - secondsRemaining;
		const progressInPercent =
			secondsRemaining > 0 ? (a / stepSeconds) * 100 : 100;
		const pointInStep = isArrivingSoon
			? 100
			: calculatePointInStep(startingPoint, endingPoint, progressInPercent);
		updateProgress(pointInStep);
	}

	function updateProgress(percent) {
		if (lottieRef.current) {
			if (LanguageDirectionService.isRTL()) {
				lottieRef.current.style.right = `${percent}%`;
			} else {
				lottieRef.current.style.left = `${percent}%`;
			}
		}
		if (progressBarRef.current) {
			progressBarRef.current.style.width = `${percent}%`;
		}
	}

	function renderPoint() {
		return <div className={styles["progress-point"]} />;
	}

	function renderProgressBar() {
		return <div className={styles["progress-bar"]} />;
	}

	function renderStep(index, id) {
		const isLastStep = isDelivery
			? Object.keys(steps).length - 1 === index
			: false;
		const isSelected = isDelivery && isLastStep ? isEnrouteStep : status === id;
		return (
			<div
				key={`step-${id}`}
				className={styles["step-wrapper"]}>
				<div className={styles["step-inner-wrapper"]}>
					{renderProgressBar()}
					{renderPoint()}
				</div>
				<div
					className={clsx(
						styles["step-name"],
						isActive ? styles["active"] : "",
						isSelected ? styles["selected"] : "",
					)}
					aria-current={"step"}>
					{translate(STEPS_TRANSLATIONS[index])}
					{index === 0 && ( // so it will read only once
						<SRContent
							role={"alert"}
							ariaLive={"polite"}
							message={translate(STEPS_TRANSLATIONS[index])}
						/>
					)}
				</div>
			</div>
		);
	}

	function renderActiveProgress() {
		const anim = STEPS_LOTTIE[status];
		const defaultOptions = {
			loop: true,
			autoplay: true,
			animation: anim,
		};
		const stepIndex = Object.keys(STEPS_LOTTIE).indexOf(status);
		return (
			<div className={styles["active-progress-line-wrapper"]}>
				<div
					className={clsx(
						styles["active-progress-line"],
						styles["active-progress-bar-anim"],
					)}
					ref={progressBarRef}
				/>

				<div
					tabIndex={0}
					aria-label={translate(STEPS_TRANSLATIONS[stepIndex])}
					className={styles["active-progress-bar-lottie-anim"]}
					ref={lottieRef}>
					<LottieAnimation
						className={styles["tracker-lottie"]}
						{...defaultOptions}
					/>
				</div>
			</div>
		);
	}

	function renderBySteps() {
		const stepsArr = [renderPoint()];
		Object.values(steps).forEach((stepId, idx) => {
			stepsArr.push(renderStep(idx, stepId));
		});
		return stepsArr;
	}

	return (
		<div
			ref={progressBarWrapperRef}
			className={styles["progress-bar-wrapper"]}>
			{renderBySteps()}
			{isActive ? renderActiveProgress() : null}
		</div>
	);
}
