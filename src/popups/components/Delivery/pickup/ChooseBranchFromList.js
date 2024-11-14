import React, { useEffect, useMemo, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import Actions from "redux/actions";
import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";
import Api from "api/requests";

import { AnimatedCapsule } from "components/AnimatedCapsule/AnimatedCapsule";
import SlideUpAndOpacityAnimation from "components/SlideUpAndOpacityAnimation/SlideUpAndOpacityAnimation";
import Button from "components/button";

import FindBranch from "/public/assets/icons/find-branch.svg";
import FullRadio from "/public/assets/icons/full-radio.svg";
import EmptyRadio from "/public/assets/icons/empty-radio.svg";
import AddBranch from "/public/assets/icons/add-branch.svg";
import BranchAnimation from "animations/branch.json";

import LottieAnimation from "components/LottieAnimation";

import styles from "./ChooseBranchFromList.module.scss";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import OrderStatusService from "services/OrderStatusService";
import { NO_ORDER_STATUS } from "constants/OrderStatus";
import * as popupsTypes from "constants/popup-types";
import useKosher from "hooks/useKosher";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import Scrollbar from "components/Scrollbar";

const defaultOptions = {
	loop: false,
	autoplay: true,
	animation: BranchAnimation,
};
const PADDING = 5;

const trailTime = 300;

export default function ChooseBranchFromList(props) {
	const {
		params = {},
		navigateToMenuScreen,
		animateOut,
		chosenBranchId,
	} = props;

	const dispatch = useDispatch();
	const branchs = useSelector((store) => store.userData?.branches);

	const [selectedBranch, setSelectedBranch] = useState(undefined);
	const lang = useSelector((store) => store.generalData.lang);
	const [_, setStack] = useStack(STACK_TYPES.DELIVERY);

	const translate = useTranslate();
	const listRef = useRef(null);
	const listContentRef = useRef(null);
	const isKosher = useKosher();

	const userBranches = useMemo(
		() =>
			branchs &&
			branchs?.filter((b) => !isKosher || (b.tags && b.tags.includes("Kosher"))),
		[branchs, isKosher],
	);

	const hasBranches = userBranches?.length > 0;
	const checkedForBranches = useRef(false);

	const [showTopGradient, setShowTopGradient] = useState(false);
	const [showBottomGradient, setShowBottomGradient] = useState(
		userBranches?.length > 3,
	);
	const [isContentBiggerThanList, setIsContentBiggerThenList] = useState(true);

	let selectedtBranchObejct = {};
	let promiseTime = 0;
	if (selectedBranch !== undefined && userBranches) {
		selectedtBranchObejct = userBranches[selectedBranch];
		for (const key in selectedtBranchObejct?.promiseTimes) {
			const service = selectedtBranchObejct.promiseTimes[key];
			if (service.subServiceId === "pu") {
				promiseTime = service.minutes;
			}
		}
	}

	useEffect(() => {
		if (branchs && branchs[0]?.orderFromBranch) {
			setSelectedBranch(0);

			setStack({
				type: deliveryScreensTypes.FUTUREORDER,
				showHeader: true,
				params: {
					branch: branchs[0],
					onSuccess: onTimePicked,
					isPickup: true,
				},
			});
		}
	}, [branchs]);

	useEffect(() => {
		function onSuccessCB() {
			checkedForBranches.current = true;
			if (params.branch) {
				dispatch(Actions.addUserBranch(params.branch));
				onBranchChange(0);
			}
		}

		const payload = { lang, onlyvisited: true };
		Api.getStoreList({
			payload,
			onSuccessCB,
		});
	}, []);

	useEffect(() => {
		if (userBranches && checkedForBranches.current) {
			if (!hasBranches || userBranches.length === 0) {
				noBranchFound();
			}
		}
	}, [branchs]);

	useEffect(() => {
		if (userBranches?.length > 0 && listRef.current && listContentRef.current) {
			const listrefHeight = listRef.current?.clientHeight;
			const listContentrefHeight = listContentRef.current.clientHeight;

			if (listrefHeight < listContentrefHeight) {
				setIsContentBiggerThenList(true);
			} else {
				setIsContentBiggerThenList(false);
			}
		}
	}, [listRef, listContentRef, userBranches?.length]);

	function RenderNoBranches() {
		return (
			<div className={styles["no-branches-found-wrapper"]}>
				<div className={styles["no-branches-found-image-wrapper"]}>
					<img
						src={FindBranch.src}
						className={styles["no-branches-found-image"]}
						alt={""}
					/>
				</div>
				<h3
					className={clsx(
						styles["no-branches-found-title"],
						styles["no-branches-found-title-1"],
					)}
					tabIndex={0}>
					{translate("deliveryPopup_notFound_title")}
				</h3>
				<h3
					className={clsx(
						styles["no-branches-found-title"],
						styles["no-branches-found-title-2"],
					)}
					tabIndex={0}>
					{translate("deliveryPopup_noBranchesFound_subtitle")}
				</h3>

				<Button
					className={styles["no-branch-found-button"]}
					text={translate("deliveryPopup_noBranchsFound_buttonLabel")}
					onClick={onDiffrentBranchPress}
				/>
			</div>
		);
	}

	function RenderBranchesList() {
		const branchsList = [];
		for (const index in userBranches) {
			const branch = userBranches[index];

			const statusMessage = branch.statusMessage;

			const note = statusMessage?.message
				? translate(statusMessage?.message)?.replace(
						"{time}",
						statusMessage?.values?.time,
				  )
				: "";

			const isKosher = branch.tags && branch.tags.includes("Kosher");

			const component = (
				<div
					className={styles["branch-item"]}
					key={"branch-item" + index}>
					<Branch
						index={index}
						id={branch?.id}
						isSelected={parseInt(selectedBranch, 10) === parseInt(index, 10)}
						isKosher={isKosher}
						onChange={onBranchChange}
						address={branch?.storeAddress}
						note={note}
						comment={branch?.manualMessage ? branch.manualMessage[lang] : ""}
						role={"radio"}
					/>
				</div>
			);
			branchsList.push(component);
		}

		return branchsList;
	}

	function onBranchChange(id) {
		setSelectedBranch(id);
		AnalyticsService.choosePickupLocation("other branch");
	}

	function RenderAddBranch() {
		return (
			<div
				className={styles["add-branch-wrapper"]}
				key={"add-branch-item"}
				onClick={onDiffrentBranchPress}>
				<button className={styles["add-branch"]}>
					<div className={styles["add-branch-icon-wrapper"]}>
						<img
							src={AddBranch.src}
							alt={translate("accessibility_alt_addBranch")}
							className={styles["add-branch-icon"]}
							aria-hidden={true}
						/>
					</div>
					<span
						className={styles["different-brancn-label"]}
						tabIndex={0}>
						{translate("deliveryPopup_diffrentBranch_label")}
					</span>
				</button>
			</div>
		);
	}

	function checkForActiveOrder(callback) {
		dispatch(Actions.resetMenus());
		dispatch(Actions.clearAllPath());
		OrderStatusService.getStatus(NO_ORDER_STATUS, callback, onDisallowed);

		function onDisallowed() {
			animateOut();

			dispatch(
				Actions.addPopup({
					type: popupsTypes.CONTINUE_ACTIVE_ORDER,
					payload: {
						onDeclineCallback: callback,
					},
				}),
			);
		}
	}

	function onTimeSelectedPress() {
		const promiseTime = selectedtBranchObejct.promiseTimes.find(
			(service) => service.subServiceId === "pu",
		);
		const payload = {
			storeId: selectedtBranchObejct.id,
			timedto: "",
			promiseTime: promiseTime.minutes,
		};

		checkForActiveOrder(() => {
			Api.selectPickupStore({
				payload,
				onSuccessCB: navigateToMenuScreen,
			});
		});
		const shippingInfo = {
			shipping_tier: `pickup - ${promiseTime}`,
			affiliation: selectedtBranchObejct.name,
		};
		AnalyticsService.choosePickupTime(`${promiseTime} minutes`);
		AnalyticsService.shippingInfo(shippingInfo);
	}

	function onDiffrentBranchPress() {
		setStack({
			type: deliveryScreensTypes.BRANCHWITHLOCATION,
			showHeader: false,
			params: {},
		});
	}

	function noBranchFound() {
		setStack({
			type: deliveryScreensTypes.BRANCHWITHLOCATION,
			showHeader: false,
			params: { didSkipPage: true },
		});
	}

	const onTimePicked = (time, branchId) => {
		const datetime = time.date + " " + time.hour + ":" + time.minute;

		const payload = {
			storeId: branchId,
			timedto: datetime,
		};

		checkForActiveOrder(() => {
			Api.selectPickupStore({
				payload,
				onSuccessCB: navigateToMenuScreen,
			});
		});
	};

	function onFutureOrderPress() {
		setStack({
			type: deliveryScreensTypes.FUTUREORDER,
			showHeader: true,
			params: {
				branch: userBranches[selectedBranch],
				onSuccess: onTimePicked,
				isPickup: true,
			},
		});
		const shippingInfo = {
			shipping_tier: "pickup - later",
			affiliation: selectedtBranchObejct.name,
		};
		AnalyticsService.choosePickupTime("later");
		AnalyticsService.shippingInfo(shippingInfo);
	}

	function onScrollList(e) {
		const window = e.target;

		if (window.scrollTop === 0) {
			setShowTopGradient(false);
		} else {
			setShowTopGradient(true);
		}
		if (window.scrollTop + window.offsetHeight + PADDING >= window.scrollHeight) {
			setShowBottomGradient(false);
		} else {
			setShowBottomGradient(true);
		}
	}

	function RenderBranches() {
		if (!hasBranches) {
			return null;
		}
		let btnAcceptText = translate("deliveryPopup_accept_btn");
		let isSelectedBranchAvailable = true;
		if (selectedBranch !== undefined) {
			isSelectedBranchAvailable = selectedtBranchObejct.isOpen;

			btnAcceptText = btnAcceptText.replace("{time}", `${promiseTime}`);
		}

		const branchesListLength = userBranches.length;
		let delay = branchesListLength;
		if (branchesListLength > 3) {
			delay = 3;
		}
		delay += 0.5;

		return (
			<div className={styles["pickup-existing-branches-select-wrapper"]}>
				<div className={styles["animation-wrapper-branch"]}>
					<LottieAnimation {...defaultOptions} />
				</div>
				<h1
					aria-live={"polite"}
					className={styles["title"]}
					tabIndex={0}>
					{translate("deliveryPopup_choosingBranch_title")}
				</h1>
				<div className={styles["branches-list-container"]}>
					<Scrollbar
						className={styles["branches-list-wrapper"]}
						onScroll={onScrollList}>
						<SlideUpAndOpacityAnimation
							className={styles["branches-wrapper"]}
							list={RenderBranchesList()}
							trail={trailTime}
							ref={listContentRef}
						/>
						{showTopGradient && isContentBiggerThanList && (
							<div
								className={clsx(
									styles["linear-gradient"],
									styles["linear-gradient-top"],
								)}
							/>
						)}
						{showBottomGradient && isContentBiggerThanList && (
							<div
								className={clsx(
									styles["linear-gradient"],
									styles["linear-gradient-bottom"],
								)}
							/>
						)}
					</Scrollbar>
				</div>
				<SlideUpAndOpacityAnimation
					className={styles["add-branch-container"]}
					list={[RenderAddBranch()]}
					delay={delay * trailTime}
				/>
				{selectedBranch !== undefined ? (
					<div className={styles["actions"]}>
						{isSelectedBranchAvailable ? (
							<AnimatedCapsule
								bluePillText={translate("deliveryPopup_decline_btn")}
								redPillText={btnAcceptText}
								redPillOnPress={onTimeSelectedPress}
								bluePillOnPress={onFutureOrderPress}
							/>
						) : (
							<Button
								className={styles["future-order"]}
								text={translate("deliveryPopup_futureOrder_ButtonLabel")}
								onClick={onFutureOrderPress}
							/>
						)}
					</div>
				) : null}
			</div>
		);
	}

	return RenderBranches();
}

function Branch(props) {
	const { isSelected, onChange, isKosher, address, note, comment, index } =
		props;
	const translate = useTranslate();

	const radioImage = isSelected ? FullRadio : EmptyRadio;

	function onClick() {
		onChange(index);
	}

	return (
		<button
			className={clsx(
				styles["branch-wrapper"],
				isSelected ? styles["selected"] : "",
			)}
			onClick={onClick}
			tabIndex={0}
			role={"radio"}
			aria-checked={isSelected}>
			<div className={styles["branch-container"]}>
				<div className={styles["branch-details"]}>
					<div className={styles["radio-wrapper"]}>
						<img
							src={radioImage.src}
							className={styles["radio"]}
							alt={translate("accessibility_alt_chooseBranch")}
							aria-hidden={true}
						/>
					</div>
					<div className={styles["branch"]}>
						<h3 className={styles["address"]}>{address}</h3>
						<span className={styles["note"]}>{note}</span>
					</div>
				</div>
				{isKosher && (
					<div className={styles["kosher-wrapper-title"]}>
						<div className={styles["divider"]} />
						<h3 className={styles["kosher-title"]}>
							{translate("branch_kosher_title")}
						</h3>
					</div>
				)}
			</div>
			{comment && (
				<div className={styles["comment-wrapper"]}>
					<span className={clsx(styles["comment-text"], styles["asterisk"])}>
						{translate("asterisk")}
					</span>
					<span className={clsx(styles["comment-text"], styles["comment"])}>
						{" "}
						{comment}
					</span>
				</div>
			)}
		</button>
	);
}
