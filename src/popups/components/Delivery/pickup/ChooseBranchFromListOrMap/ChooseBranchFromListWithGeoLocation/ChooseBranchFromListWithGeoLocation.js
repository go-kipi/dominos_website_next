import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Filter from "../Filter/Filter";
import Header from "../Header/Header";
import Branch from "./Branch/Branch";
import LottieAnimation from "components/LottieAnimation";
import TextOnlyButton from "components/text_only_button";

import Actions from "redux/actions";

import SecondAnimation from "animations/second-no-branches-found.json";
import FirstAnimation from "animations/first-no-branches-found.json";
import SwitchToMap from "/public/assets/icons/switch-to-map.svg";
import styles from "./ChooseBranchFromListWithGeoLocation.module.scss";
import clsx from "clsx";
import HiddableScroolBar from "components/HiddableScrollBar/HiddableScrollBar";
import Link from "next/dist/client/link";
import * as Routes from "constants/routes";
import useTranslate from "hooks/useTranslate";
import SRContent from "../../../../../../components/accessibility/srcontent";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { TAB_INDEX_HIDDEN } from "../../../../../../constants/accessibility-types";

export default function ChooseBranchFromListWithGeoLocation(props) {
	const dispatch = useDispatch();
	const deviceState = useSelector((store) => store.deviceState);
	const [isFirstAnimation, setIsFirstAnimation] = useState(true);
	const filters = useSelector((store) => store.filterBranches);
	const lang = useSelector((store) => store.generalData.lang);
	const [reachedToEnd, setReachedToEnd] = useState(false);
	const [reachedToStart, setReachedToStart] = useState(true);
	const {
		branches,
		animateOut,
		toggleSwitch,
		onSelectedBranch,
		didSkipPage = false,
		showHeader,

		isOnBranchesScreen,
		showFilter,
		extraDataFunc,
		addCustomScrollbar = false,
		useLink,

		selectedTags,
	} = props;

	const ref = useRef();
	const translate = useTranslate();

	function RenderBranch(branch, withLink = false) {
		const statusMessage = branch.statusMessage;

		const note = translate(statusMessage?.message)?.replace(
			"{time}",
			statusMessage?.values?.time,
		);

		let allowTimedOrders = false;
		const promiseTime = branch.promiseTimes;

		for (const service of promiseTime) {
			if (service.subServiceId === "pu") {
				allowTimedOrders = service.allowTimedOrders;
			}
		}

		function handleBranchSelect(id) {
			onSelectedBranch(id);
			AnalyticsService.chooseNewBranchLocation(
				filters.fields.join(", "),
				branch?.name,
			);
		}

		const handleAnalytics = () => {
			const payload = {
				filter: filters.fields.join(", "),
				item: branch?.name,
				type: branch?.tags?.map((tag) => tag.toLowerCase() === "kosher")
					? "kosher"
					: "not kosher",
			};
			AnalyticsService.selectSpecificBranch(payload);
		};

		return (
			<Branch
				isOpenToday={isOnBranchesScreen ? true : allowTimedOrders}
				id={branch.id}
				name={branch.name}
				address={branch.storeAddress}
				role={"button"}
				isOpen={branch.isOpen}
				note={note}
				comment={branch?.manualMessage[lang]}
				distance={Number(branch.distance) >= 0 ? branch.distance : undefined}
				onClick={handleBranchSelect}
				withLink={withLink}
				handleAnalytics={handleAnalytics}
			/>
		);
	}

	function renderBranchesList() {
		return branches.map((branch, index) => {
			const showSeperator =
				!showFilter || deviceState.isDesktop ? index !== 0 : true;
			return (
				<div
					className={styles["bracnh-item"]}
					key={"bracnh-item" + branch.id}>
					{showSeperator && <div className={styles["seperator"]} />}
					{useLink ? RenderBranchWithLink(branch) : RenderBranch(branch)}
				</div>
			);
		});
	}

	function RenderBranchWithLink(branch) {
		const cityName = branch.cityUrl;
		const branchName = branch.url;
		let href = `${Routes.branches}/${branchName}`;
		if (cityName) {
			href = `${Routes.branches}/${cityName}/${branchName}`;
		}

		return <Link href={href}>{RenderBranch(branch, true)}</Link>;
	}

	function onFirstAnimationFinish() {
		setIsFirstAnimation(false);
	}

	function RenderFirstAnimation() {
		const defaultOptions = {
			loop: false,
			autoplay: true,
			animation: FirstAnimation,
			onComplete: onFirstAnimationFinish,
		};
		return (
			<div
				className={styles["animation-wrapper"]}
				key={"first-animation"}>
				<LottieAnimation {...defaultOptions} />
			</div>
		);
	}

	function RenderSecondAnimation() {
		const defaultOptions = {
			loop: true,
			autoplay: true,
			animation: SecondAnimation,
		};
		return (
			<div
				className={styles["animation-wrapper"]}
				key={"second-animation"}>
				<LottieAnimation {...defaultOptions} />
			</div>
		);
	}

	function resetFilters() {
		dispatch(Actions.resetFilterBranches());
		setIsFirstAnimation(true);
	}

	function RenderNoBranchesFound() {
		const hasFilterFields = filters.fields.length !== 0;

		const title1 = hasFilterFields
			? translate(
					"deliveryPopup_chooseBranchFromListWithLocation_noBranchesFoundWithFilter_title1",
			  )
			: translate(
					"deliveryPopup_chooseBranchFromListWithLocation_noBranchesFoundWithQuery_title1",
			  );
		const title2 = hasFilterFields
			? translate(
					"deliveryPopup_chooseBranchFromListWithLocation_noBranchesFoundWithFilter_title2",
			  )
			: translate(
					"deliveryPopup_chooseBranchFromListWithLocation_noBranchesFoundWithQuery_title2",
			  );
		const title3 = hasFilterFields
			? translate(
					"deliveryPopup_chooseBranchFromListWithLocation_noBranchesFoundWithFilter_title3",
			  )
			: translate(
					"deliveryPopup_chooseBranchFromListWithLocation_noBranchesFoundWithQuery_title3",
			  );

		return (
			<div className={styles["no-branches-found-container"]}>
				<div className={styles["no-branches-found-wrapper"]}>
					<div
						className={clsx(
							styles["seperator"],
							styles["seperator-no-branches-found"],
						)}
					/>
					{isFirstAnimation ? RenderFirstAnimation() : RenderSecondAnimation()}
				</div>
				<div className={styles["title-wrapper"]}>
					<h3
						className={styles["title"]}
						aria-live={"polite"}
						role={"alert"}
						tabIndex={0}>
						{title1} <span className={styles["bold"]}>{title2}</span> {title3}
					</h3>
				</div>
				<TextOnlyButton
					text={translate(
						"deliveryPopup_chooseBranchFromListWithLocation_noBranchesFound_btn",
					)}
					onClick={resetFilters}
					className={styles["no-branch-found-btn"]}
					ariaDescribedBy={"description"}
				/>
			</div>
		);
	}

	function onScroll(e) {
		const { scrollHeight, scrollTop, clientHeight } = e.nativeEvent.target;
		const scroll = scrollHeight - scrollTop - clientHeight;

		if (scroll > 0) {
			// We are not at the bottom of the scroll content
			setReachedToEnd(false);
		} else if (scroll < 0) {
			// We are at the bottom
			setReachedToEnd(true);
		}
		if (scrollTop == 0) {
			setReachedToStart(true);
		} else {
			setReachedToStart(false);
		}
	}

	function RenderBranches() {
		return (
			<HiddableScroolBar
				isOpen={true}
				listref={ref}
				extraStyles={styles}
				className={`${styles["branchs-found-wrapper"]} ${
					isOnBranchesScreen ? styles["on-branches-screen"] : ""
				} branchs-found-wrapper ${reachedToEnd ? "end" : ""} ${
					reachedToStart ? "start" : ""
				}`}
				onScroll={onScroll}>
				<SRContent
					message={translate("accessibility_pickup_numberOfBranches").replace(
						"{branches}",
						branches.length,
					)}
					ariaLive={"assertive"}
					role={"region"}
				/>
				<div
					className={`${styles["branches-found"]} branches-found`}
					ref={ref}>
					{renderBranchesList()}
					{typeof extraDataFunc === "function" && extraDataFunc()}
				</div>

				<SRContent
					id={"label"}
					message={translate("accessibility_label_navigationBranch")}
				/>
				{isOnBranchesScreen && deviceState.isDesktop ? null : Switch()}
			</HiddableScroolBar>
		);
	}

	function RenderNothing() {
		return <div />;
	}

	function Switch() {
		return (
			<button
				className={styles["toggle-list-icon-wrapper"]}
				onClick={toggleSwitch}
				aria-hidden={"true"}
				tabIndex={TAB_INDEX_HIDDEN}>
				<img
					className={styles["icon"]}
					src={SwitchToMap.src}
					alt={translate("accessibility_imageIcon_selectBranchFromMap")}
				/>
			</button>
		);
	}

	return (
		<div
			className={`${styles["choose-branch-with-geolocation-container"]} ${
				addCustomScrollbar ? styles["show-scroll"] : ""
			}`}>
			{showHeader && (
				<Header
					animateOut={animateOut}
					hideCloseIcon={didSkipPage}
				/>
			)}
			{showFilter && (
				<Filter
					showFilterBtn={isOnBranchesScreen}
					isOnBranchesScreen={isOnBranchesScreen}
					selectedTags={selectedTags}
				/>
			)}
			{!branches
				? RenderNothing()
				: branches.length > 0
				? RenderBranches()
				: RenderNoBranchesFound()}
		</div>
	);
}
