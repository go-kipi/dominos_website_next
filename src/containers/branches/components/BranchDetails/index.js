import React from "react";
import styles from "./index.module.scss";
import TransparentBranch from "/public/assets/icons/transparent_branch.svg";
import { useSelector } from "react-redux";
import TransparentButton from "components/transparentButton";
import IconNavigation from "/public/assets/icons/branch/branch-navigation.svg";
import BackIcon from "/public/assets/icons/back-black.svg";
import CloseIcon from "/public/assets/icons/x-icon.svg";
import { calcDistance } from "../../../../utils/functions";
import { useRouter } from "next/router";
import clsx from "clsx";
import Contact from "../contact";
import useUserLocation from "hooks/useUserLocation";
import Link from "next/dist/client/link";
import * as Routes from "constants/routes";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

const BranchDetailsScreen = ({
	name,
	address,
	navigation,
	animation,
	refs,
	handleNavigation,
	phone,
	email,

	city,
	isOnCityPage,
	cityName,
	statusMessage = { message: "" },
}) => {
	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();
	const [userLocation, setLoaction, haveLocationPermission] = useUserLocation(
		() => {},
	);
	const router = useRouter();

	const distanceInKm = userLocation
		? calcDistance(userLocation, navigation, "float").toFixed(1)
		: "";

	const iconAnimation = {
		transform: `scale(${animation?.icon?.size})`,
		height: `${animation?.icon?.height}px`,
	};

	const buttonAnimation = {
		transform: `scale(${animation?.button?.size})`,
		height: `${animation?.button?.height}px`,
	};

	const note = translate(statusMessage?.message)?.replace(
		"{time}",
		statusMessage?.values?.time,
	);

	const nav = () => {
		handleNavigation(navigation.lat, navigation.lng);
		AnalyticsService.specificBranchesEnteries("navigation");
	};

	function renderMobile() {
		return (
			<div className={styles["branch-details-container"]}>
				<img
					src={TransparentBranch.src}
					alt={"icon"}
					className={styles["icon"]}
					style={iconAnimation}
					ref={refs?.iconRef}
				/>
				<h1 className={styles["branch-name"]}>{name}</h1>
				<span className={styles["detail-text"]}>{address}</span>

				<div className={styles["details"]}>
					{statusMessage && statusMessage?.message && (
						<span className={styles["detail-text"]}>{note}</span>
					)}
					{statusMessage && statusMessage?.message && haveLocationPermission && (
						<div className={styles["separator"]} />
					)}
					{haveLocationPermission && (
						<span className={styles["detail-text"]}>
							{distanceInKm} {translate("branchScreen_branchKm")}
						</span>
					)}
				</div>

				<TransparentButton
					icon={IconNavigation}
					text={translate("branchScreen_details_navigate")}
					className={""}
					onClick={nav}
					animation={buttonAnimation}
					ref={refs?.buttonRef}
				/>
			</div>
		);
	}

	const backHref = `${Routes.branches}/${city?.url}`;

	function onCloseClick() {
		router.push(Routes.branches);
	}

	function renderDesktop() {
		return (
			<div className={styles["branch-details-container"]}>
				<div className={styles["title-container"]}>
					<div className={styles["column"]}>
						{!isOnCityPage && (
							<Link
								href={backHref}
								className={styles["back-icon-wrapper"]}>
								<img
									className={styles["back-icon"]}
									src={BackIcon.src}
									alt={translate("accessibility_alt_arrowBack")}
								/>
							</Link>
						)}
						<h1 className={styles["title"]}>
							{name && name}
						</h1>
						<h2 className={styles["subtitle"]}>
							{translate("branchesScreen_branchSubtitleCity").replace(
								"{city}",
								cityName,
							)}
						</h2>
					</div>
					<button
						onClick={onCloseClick}
						className={styles["close-icon"]}>
						<img
							src={CloseIcon.src}
							alt={translate("accessibility_aria_close")}
						/>
					</button>
				</div>
				<div className={styles["sub-title-container"]}>
					<span className={clsx(styles["sub-title"], styles["text"])}>
						{address}
					</span>
					<div className={styles["separator"]} />
					<div className={styles["detail-container"]} />
					{haveLocationPermission && (
						<span className={styles["text"]}>
							{distanceInKm} {translate("branchScreen_branchKm")}
						</span>
					)}
					<div className={styles["separator"]} />

					<Contact
						phone={phone}
						email={email}
					/>
				</div>
			</div>
		);
	}

	return deviceState.isDesktop ? renderDesktop() : renderMobile();
};

export default BranchDetailsScreen;
