import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import LottieAnimation from "components/LottieAnimation";

import BackIcon from "/public/assets/icons/back-black.svg";
import ClockAnimation from "animations/clock.json";
import styles from "./FutureOrder.module.scss";
import TimePicker from "components/TimePicker/TimePicker";
import Button from "components/button";
import STACK_TYPES from "constants/stack-types";
import useStack from "hooks/useStack";
import Actions from "../../../../redux/actions";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
import SRContent from "../../../../components/accessibility/srcontent";
import moment from "moment";
import { getStringTime } from "utils/functions";

function nowIsBetweenDates(startDate, endDate) {
	const currentDate = new Date();

	if (startDate <= currentDate && currentDate < endDate) {
		return true;
	}
	return false;
}

function getCorrectTime(startHour, startMinute) {
	let min = startMinute;
	let hour = startHour;
	if (min >= 60) {
		hour += 1;
		min -= 60;
	}

	return { hour: hour, min: min };
}

function getHoursInterval(
	openTime,
	closeTime,
	interval,
	startTime = 0,
	minTime = 0,
	addToOpenMinute = 0,
) {
	const currentDate = new Date();

	const openDate = moment(openTime, "YYYY-MM-DD HH:mm").toDate();
	const closeDate = moment(closeTime, "YYYY-MM-DD HH:mm").toDate();

	const closestOpenTime = getClosestRoundHourAndMinutes(
		openDate.getHours(),
		openDate.getMinutes(),
	);

	const currentHour = currentDate.getHours();
	const currentMinute = currentDate.getMinutes();

	const openHour = closestOpenTime.hour;
	const openMinute = closestOpenTime.min;

	const isStoreOpen = nowIsBetweenDates(openDate, closeDate);

	let hour = isStoreOpen ? currentHour : openHour;
	let minute = isStoreOpen
		? currentMinute + minTime
		: openMinute + addToOpenMinute;

	let defaultIndex = 0;

	const times = [];

	let correctTime = getCorrectTime(hour, minute);
	let defaultMin = correctTime.min;
	let defaultHour = correctTime.hour;

	const closestDefault = getClosestRoundHourAndMinutes(defaultHour, defaultMin);
	defaultHour = closestDefault.hour;
	defaultMin = closestDefault.min;

	let currentTime = currentDate;
	currentTime.setHours(defaultHour);
	currentTime.setMinutes(defaultMin);
	currentTime.setSeconds(0);
	currentTime.setMilliseconds(0);

	correctTime = getCorrectTime(defaultHour, defaultMin + startTime);
	defaultMin = correctTime.min;
	defaultHour = correctTime.hour;

	const defaultTime =
		getStringTime(defaultHour) + ":" + getStringTime(defaultMin);

	// Iterate through the time intervals and add to the result array
	while (currentTime <= closeDate) {
		const hours = currentTime.getHours().toString().padStart(2, "0");
		const minutes = currentTime.getMinutes().toString().padStart(2, "0");
		const time = `${hours}:${minutes}`;

		if (time === defaultTime && isStoreOpen) {
			defaultIndex = times.length;
		}

		const date =
			currentTime.getFullYear() +
			"-" +
			(currentTime.getMonth() < 9
				? "0" + (currentTime.getMonth() + 1)
				: currentTime.getMonth() + 1) +
			"-" +
			(currentTime.getDate() < 10
				? "0" + currentTime.getDate()
				: currentTime.getDate());
		times.push({
			hour: hours,
			minute: minutes,
			date: date,
		});
		// Increment the current time by the specified interval (in minutes)
		currentTime.setMinutes(currentTime.getMinutes() + interval);
	}

	return { times, defualtIndex: defaultIndex };
}

function getClosestRoundHourAndMinutes(hour, min) {
	if (min === 0) {
		return { hour, min };
	} else if (min > 0 && min <= 15) {
		return { hour, min: 15 };
	} else if (min <= 30) {
		return { hour, min: 30 };
	} else if (min <= 45) {
		return { hour, min: 45 };
	}
	return { hour: hour + 1, min: 0 };
}

function FutureOrder(props) {
	const { params } = props;
	const { branch, address, onSuccess = () => {}, onBackClick } = params;
	const userBranches = useSelector((store) => store.userData.branches);
	const [_, __, goBack, screenAt, resetStack, removeScreen] = useStack(
		STACK_TYPES.DELIVERY,
	);
	const deviceState = useSelector((store) => store.deviceState);

	const timedOrders = useSelector(
		(store) => store.globalParams.timedOrders.result,
	);
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [time, setTime] = useState(undefined);
	const [times, setTimes] = useState([]);

	useEffect(() => {
		let updatedBranches = [];
		if (branch?.orderFromBranch) {
			updatedBranches = JSON.parse(JSON.stringify(userBranches));
			updatedBranches[updatedBranches.length - 1].orderFromBranch = false;
			dispatch(Actions.setUserBranches(updatedBranches));
		}
		return () => {
			removeScreen(deliveryScreensTypes.FUTUREORDER);
		};
	}, []);

	useEffect(() => {
		if (branch && time === undefined) {
			const promiseTimes = branch.promiseTimes;

			const timedToAllowedFrom = promiseTimes.find(
				(s) => s.subServiceId === "pu",
			)?.timedToAllowedFrom;
			const timedToAllowedUntil = promiseTimes.find(
				(s) => s.subServiceId === "pu",
			)?.timedToAllowedUntil;

			const response = getHoursInterval(
				timedToAllowedFrom,
				timedToAllowedUntil,
				timedOrders.TimedOrdersMinutesStepForPickup,
				timedOrders.TimedOrdersMinutesDefaultScrollStartForPickup,
				20,
			);

			if (response) {
				setTime({
					index: response.defualtIndex,
					time: response.times[response.defualtIndex],
				});
				setTimes(response.times);
			}
		}
	}, [branch]);

	useEffect(() => {
		if (address && time === undefined) {
			const weeklyOpeningHours = address.deliverability.openingHours;
			const openingHours = weeklyOpeningHours[0];

			const response = getHoursInterval(
				openingHours.from,
				openingHours.to,
				timedOrders.TimedOrdersMinutesStepForDelivery,
				timedOrders.TimedOrdersMinutesDefaultScrollStartForDelivery,
				35,
				30,
			);

			if (response) {
				setTime({
					index: response.defualtIndex,
					time: response.times[response.defualtIndex],
				});
				setTimes(response.times);
			}
		}
	}, [address]);

	useEffect(() => {
		if (deviceState.isDesktop) {
			const timePicker = "tp-down-arrow";
			const timeout = setTimeout(() => {
				const arrow = document.getElementById(timePicker);
				arrow?.focus();
				clearTimeout(timeout);
			}, 500);
		}
	}, []);

	function onBackClickHandler() {
		if (typeof onBackClick === "function") return onBackClick();
		goBack();
	}

	const defaultOptions = {
		loop: false,
		autoplay: true,
		animation: ClockAnimation,
	};

	function updateTime(currentTime) {
		setTime(currentTime);
	}

	const onClick = () => {
		let secondArg = null;
		if (branch) {
			secondArg = branch.id;
		}
		onSuccess(time?.time, secondArg);
		params?.isPickup
			? AnalyticsService.chooseLaterPickupTimeConfirm("later")
			: AnalyticsService.chooseLaterShippmentTimeConfirm("later");
	};

	const isBranchOpen =
		(branch && branch?.isOpen) || (address && address.deliverability.deliverNow);

	const srText = createAccessibilityText(
		translate("deliveryPopup_futurePickup_accept_btn"),
		translate("accessibility_timePicker_selectTime"),
		`${time?.time?.hour}:${time?.time?.minute}`,
	);
	const alertText = createAccessibilityText(
		!isBranchOpen && translate("deliveryPopup_futurePickup_branchclosed_title"),
		branch
			? translate("deliveryPopup_futurePickup_title")
			: translate("deliveryPopup_futureDelivery_title"),
	);
	return (
		<div className={styles["future-pickup-wrapper"]}>
			<SRContent
				role={"alert"}
				message={alertText}
			/>
			{deviceState.notDesktop && !isBranchOpen && (
				<div className={styles["future-pickup-store-closed-wrapper"]}>
					<span className={styles["closed-branch-text"]}>
						{translate("deliveryPopup_futurePickup_branchclosed_title")}
					</span>
				</div>
			)}
			<div className={styles["future-pickup-header-wrapper"]}>
				<div className={styles["back-button-wrapper"]}>
					<button
						aria-label={translate("accessibility_alt_arrowBack")}
						id={"back-btn"}
						className={styles["icon-wrapper"]}
						onClick={onBackClickHandler}>
						<img
							src={BackIcon.src}
							alt={""}
							className={styles["icon"]}
						/>
					</button>
				</div>
				<div className={styles["empty"]} />
			</div>

			<div className={styles["future-pickup-clock-animation-wrapper"]}>
				<LottieAnimation {...defaultOptions} />
			</div>
			<div className={styles["future-pickup-content-wrapper"]}>
				<h1
					role={"region"}
					className={styles["future-pickup-title"]}>
					{branch
						? translate("deliveryPopup_futurePickup_title")
						: translate("deliveryPopup_futureDelivery_title")}
				</h1>
				<div className={styles["future-pickup-time-picker"]}>
					{time && (
						<TimePicker
							time={time}
							setTime={updateTime}
							data={times}
						/>
					)}
				</div>
				<div className={styles["actions"]}>
					<Button
						id={"submit-btn"}
						text={translate("deliveryPopup_futurePickup_accept_btn")}
						className={styles["accept-btn"]}
						ariaLabel={srText}
						ariaLive={"off"}
						onClick={onClick}
					/>
				</div>
			</div>
			{deviceState.isDesktop && !isBranchOpen && (
				<div className={styles["branch-is-closed-bottom"]}>
					<span
						className={styles["closed-branch-text"]}
						tabIndex={0}>
						{translate("deliveryPopup_futurePickup_branchclosed_title")}
					</span>
				</div>
			)}
		</div>
	);
}

export default FutureOrder;
