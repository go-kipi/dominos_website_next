import React from "react";
import basic from "./MarkerCalloutForBranches.module.scss";
import RedClock from "/public/assets/icons/red-clock.svg";
import BlueClock from "/public/assets/icons/blue-clock.svg";
import XIcon from "/public/assets/icons/x-icon.svg";
import Kosher from "/public/assets/icons/kosher-symbol.svg";
import Arrow from "/public/assets/icons/blue-arrow-icon.svg";
import Navigation from "/public/assets/icons/navigation.svg";

import { animated, useSpring } from "@react-spring/web";
import Button from "components/button";
import clsx from "clsx";
import useGetBranchDetails from "hooks/useGetBranchDetails";
import HTMLDisplay from "../../../../../../../components/HTMLDisplay";
import useTranslate from "hooks/useTranslate";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import Actions from "redux/actions";
import * as Routes from "constants/routes";
import Link from "next/dist/client/link";

export default function MarkerCalloutForBranches(props) {
	const { branch, onBtnClick, zIndex = 0, closeCallout } = props;
	const [styles] = useSpring(() => ({
		from: {
			y: 200,
		},
		to: {
			y: 0,
		},
	}));
	const [btnStyle] = useSpring(() => ({
		from: {
			opacity: 0,
		},
		to: {
			opacity: 1,
		},
		delay: 300,
	}));
	const {
		name,
		storeAddress,
		distance,
		isOpen,
		statusMessage,
		id,
		promiseTimes,
	} = branch;
	const branchDetails = useGetBranchDetails(id);
	const translate = useTranslate();
	const router = useRouter();
	const dispatch = useDispatch();

	const isKosher = branch?.tags?.includes("Kosher") ?? false;

	const handleOrder = () => {
		dispatch(
			Actions.updateUserBranches({
				...branch,
				orderFromBranch: true,
			}),
		);
		dispatch(Actions.updateOrder({ isPickup: true }));
		router.push(Routes.root);
	};

	const handleOnClick = () => {
		handleOrder();
	};

	function onMoreDetailsClick() {}

	const promiseTime = promiseTimes.find((time) => time.subServiceId === "pu");
	const allowTimedOrders = promiseTime.allowTimedOrders;

	const cityName = branch.cityUrl;
	const branchName = branch.url;
	let href = `${Routes.branches}/${branchName}`;
	if (cityName) {
		href = `${Routes.branches}/${cityName}/${branchName}`;
	}

	return (
		<animated.div
			style={{ ...styles, zIndex }}
			className={basic["callout-wrapper"]}>
			<div className={basic["callout-inner"]}>
				<button
					className={basic["close-icon"]}
					onClick={closeCallout}>
					<img
						src={XIcon.src}
						alt={""}
					/>
				</button>

				<div className={basic["text-wrapper"]}>
					<div className={basic["name-wrapper"]}>
						<div className={basic["branch-name"]}>
							{name}
							{isKosher && (
								<div className={basic["kosher-wrapper"]}>
									<img
										src={Kosher.src}
										alt={""}
									/>
								</div>
							)}
						</div>
					</div>
					<div className={basic["branch-address"]}>{storeAddress}</div>
				</div>
				<div className={basic["bottom-area-top"]}>
					<div className={basic["time-wrapper"]}>
						<div className={basic["time-icon"]}>
							<img
								src={isOpen ? BlueClock.src : RedClock.src}
								alt={""}
							/>
						</div>
						<span
							className={clsx(basic["time-text"], !isOpen ? basic["closed"] : "")}>
							{translate(statusMessage?.message)?.replace(
								"{time}",
								statusMessage?.values?.time,
							)}
						</span>
					</div>
					{distance && (
						<div className={basic["distance-wrapper"]}>
							<div className={basic["distance-icon"]}>
								<img
									src={Navigation.src}
									alt={""}
								/>
							</div>
							<span className={basic["distance-text"]}>
								{parseFloat(distance).toFixed(1)} <span>&nbsp;</span>
								{translate("km")}
							</span>
						</div>
					)}
				</div>
				<div className={basic["separator"]} />
				{branchDetails.openingHoursTextual ? (
					<>
						<div className={basic["opening-hours-wrapper"]}>
							<span className={basic["opening-hours-title"]}>
								{translate("branchesScreen_callout_openingHours_title")}
							</span>
						</div>

						<HTMLDisplay
							className={basic["opening-hours-data"]}
							html={branchDetails.openingHoursTextual}
						/>
					</>
				) : (
					<></>
				)}
				<Link
					href={href}
					className={basic["more-details-wrapper"]}>
					<span className={basic["more-details-text"]}>
						{translate("branchesScreen_callout_moreDetials_link")}
					</span>
					<div className={basic["arrow-icon-wrapper"]}>
						<img
							src={Arrow.src}
							alt={"arrow"}
						/>
					</div>
				</Link>
				<div className={basic["bottom-wrapper"]}>
					<animated.div
						style={btnStyle}
						className={basic["callout-button-wrapper"]}>
						{allowTimedOrders && (
							<Button
								animated={false}
								onClick={handleOnClick}
								className={basic["callout-btn"]}
								textClassName={basic["callout-btn-text"]}
								text={translate("branchesScreen_callout_btn_text")}
							/>
						)}
					</animated.div>
				</div>
			</div>
		</animated.div>
	);
}
