import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import GeneralHeader from "../../../../components/GeneralHeader/GeneralHeader";
import BranchDetails from "../../components/BranchDetails";
import Tags from "../../components/Tags";
import Contact from "../../components/contact";
import BranchDescription from "../../components/BranchDescription";
import Button from "../../../../components/button";
import { useSelector } from "react-redux";
import BranchAreaIcon from "/public/assets/icons/navigate-branch-icon.svg";
import BlueArrowIcon from "/public/assets/icons/blue-arrow-icon.svg";
import * as Routes from "constants/routes";
import Link from "next/dist/client/link";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { notEmptyObject } from "utils/functions";

const SCROLL_MAX = 30;
const minPopupHeight = 65;
const maxPopupHeight = 65;
export default function BranchMobile({
	data,
	id,
	handleNavigation,
	handleOrder,
	isOnCityPage,
	city,
}) {
	const isDataExists = notEmptyObject(data);
	const [scrollPosition, setScrollPosition] = useState(0);
	const branches = useSelector((store) => store.branches);
	const translate = useTranslate();
	const branchData = branches.find((b) => b.id === id);
	const [atTop, setAtTop] = useState(true);

	const [animation, setAnimation] = useState({
		icon: {},
		button: {},
		popup: {},
	});
	const [iconMaxHeight, setIconMaxHeight] = useState(null);
	const [buttonMaxHeight, setButtonMaxHeight] = useState(null);

	const iconRef = useRef(null);
	const buttonRef = useRef(null);

	function calculateHeight(height) {
		const currentHeight = (height * (SCROLL_MAX - scrollPosition)) / SCROLL_MAX;
		return currentHeight;
	}

	function calculateSize() {
		const currentSize = (SCROLL_MAX - scrollPosition) / SCROLL_MAX;
		return currentSize;
	}

	useEffect(() => {
		let new_state = { ...animation };
		if (scrollPosition <= 0) {
			new_state.icon.size = 1;
			new_state.icon.height = iconMaxHeight;
			new_state.button.size = 1;
			new_state.button.height = buttonMaxHeight;
		} else if (scrollPosition >= SCROLL_MAX) {
			new_state.icon.size = 0;
			new_state.icon.height = 0;
			new_state.button.size = 0;
			new_state.button.height = 0;
		} else {
			const size = calculateSize();
			const iconHeight = calculateHeight(iconMaxHeight);
			const buttonHeight = calculateHeight(buttonMaxHeight);
			new_state.icon.size = size;
			new_state.icon.height = iconHeight;
			new_state.button.size = size;
			new_state.button.height = buttonHeight;
		}

		setAnimation(new_state);
	}, [scrollPosition]);

	useEffect(() => {
		if (scrollPosition === 0) {
			setAtTop(true);
		} else {
			setAtTop(false);
		}
	}, [scrollPosition]);

	const [run, setRun] = useState(true);

	useEffect(() => {
		if (run) {
			setIconMaxHeight(iconRef?.current?.offsetHeight);
			setButtonMaxHeight(buttonRef?.current?.offsetHeight);
		}
		if (iconRef?.current?.offsetHeight && iconRef?.current?.offsetHeight) {
			setRun(false);
		}
	}, [iconRef?.current?.offsetHeight || buttonRef?.current?.offsetHeight]);

	const handleScroll = (e) => setScrollPosition(e.currentTarget.scrollTop);

	const backHref = isOnCityPage
		? Routes.branches
		: Routes.branches + "/" + city.url;

	const href = `${Routes.branches}/${city?.url}`;

	const order = () => {
		AnalyticsService.specificBranchesEnteries("order");
		handleOrder(id);
	};
	return (
		<div className={styles["container"]}>
			<GeneralHeader
				backLink
				href={backHref}
				title={translate("branchesScreen_header_title")}
				headerAsH1={false}
			/>
			{isDataExists && (
				<BranchDetails
					name={data.name}
					address={data.storeAddress}
					navigation={{
						lng: data.lng,
						lat: data.lat,
					}}
					animation={animation}
					refs={{ iconRef, buttonRef }}
					handleNavigation={handleNavigation}
					statusMessage={branchData.statusMessage}
				/>
			)}

			<div className={`${styles["popup-like"]} ${atTop ? styles["start"] : ""}`}>
				<div
					className={styles["content"]}
					onScroll={handleScroll}>
					<Tags tags={data.tags} />
					{data.tags ? <div className={styles["horizontal-separator"]} /> : <div />}
					<Contact
						phone={data.directPhone}
						email={data.email}
					/>
					{data.directPhone || data.email ? (
						<div className={styles["horizontal-separator"]} />
					) : (
						<div />
					)}

					<BranchDescription
						openingHours={data.openingHoursTextual}
						description={data.description}
						assetVersion={data.assetVersion}
						id={id}
					/>

					{!isOnCityPage ? (
						<Link
							href={href}
							className={styles["branches-area"]}>
							<img
								className={styles["icon"]}
								src={BranchAreaIcon.src}
							/>
							<span className={styles["branches-area-text"]}>
								{translate("branchScreen_branchesArea")}
							</span>
							<img
								className={styles["arrow-icon"]}
								src={BlueArrowIcon.src}
							/>
						</Link>
					) : (
						<div className={styles["branches-area"]} />
					)}
				</div>
				<div className={styles["button-wrapper"]}>
					<Button
						className={styles["custom-btn"]}
						text={translate("branchScreen_submitBtn_toOrder")}
						onClick={order}
					/>
				</div>
			</div>
		</div>
	);
}
