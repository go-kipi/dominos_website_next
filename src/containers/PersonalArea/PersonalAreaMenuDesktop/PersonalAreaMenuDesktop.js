import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Routes from "constants/routes";
import * as popups from "constants/popup-types";
import Man from "/public/assets/icons/PersonalArea/man-desktop.svg";
import House from "/public/assets/icons/PersonalArea/house-desktop.svg";
import Credit from "/public/assets/icons/PersonalArea/credit-desktop.svg";
import Saved from "/public/assets/icons/PersonalArea/saved-desktop.svg";
import ManSelected from "/public/assets/icons/PersonalArea/man-desktop-selected.svg";
import HouseSelected from "/public/assets/icons/PersonalArea/house-desktop-selected.svg";
import CreditSelected from "/public/assets/icons/PersonalArea/credit-desktop-selected.svg";
import SavedSelected from "/public/assets/icons/PersonalArea/saved-desktop-selected.svg";
import Out from "/public/assets/icons/PersonalArea/out-desktop.svg";

import styles from "./PersonalAreaMenuDesktop.module.scss";
import Link from "next/link";
import Actions from "redux/actions";
import clsx from "clsx";
import { useRouter } from "next/router";
import useTranslate from "hooks/useTranslate";

import AnalyticsService from "utils/analyticsService/AnalyticsService";
import {createAccessibilityText} from "../../../components/accessibility/acfunctions";

function PersonalAreaMenuDesktop({ deleteCustomer }) {
	const user = useSelector((store) => store.userData);
	const dispatch = useDispatch();
	const translate = useTranslate();

	const tabsRef = useRef();

	const data = [
		{
			title: translate("personalArea_menu_savedPizzas_title"),
			icon: Saved,
			selected: SavedSelected,
			to: Routes.personalAreaSavedPizza,
		},
		{
			title: translate("personalArea_menu_personalDetails_title"),
			icon: Man,
			selected: ManSelected,

			to: Routes.personalAreaPersonalDetails,
		},
		{
			title: translate("personalArea_menu_address_title"),
			icon: House,
			selected: HouseSelected,

			to: Routes.personalAreaAddress,
		},
		{
			title: translate("personalArea_menu_credit_title"),
			icon: Credit,
			selected: CreditSelected,

			to: Routes.personalAreaCreditCard,
		},
	];

	function openLogout() {
		dispatch(
			Actions.addPopup({
				type: popups.LOGOUT,
				payload: {},
				disablePromot: true,
			}),
		);
		AnalyticsService.personalAreaLogout("logout");
	}

	function RenderLogout() {
		return (
			<button
				className={styles["logout"]}
				onClick={openLogout}>
				<div className={styles["logout-icon-wrapper"]}>
					<img
						src={Out.src}
						alt={"out"}
						aria-hidden={true}
					/>
				</div>
				<span className={styles["logout-text"]}>
					{translate("personalArea_menu_logout_text")}
				</span>
			</button>
		);
	}
	const srText = createAccessibilityText(
		translate("personalArea_menu_greeting_text"),
		user?.firstName,
	);
	return (
		<aside className={styles["personal-area-menu-desktop-wrapper"]} aria-description={srText}>
			<div className={styles["personal-area-menu-desktop-greeting-wrapper"]}>
				<h3 className={styles["greeting"]}>
					{translate("personalArea_menu_greeting_text")}
				</h3>
				<h3 className={styles["name"]}>{user?.firstName}</h3>
			</div>
			<div
				ref={tabsRef}
				className={styles["menu-list-wrapper"]}
				// onKeyDown={(event) => handleArrowUpAndDown(event, handleKeyboardEvents)}
				role={"tablist"}>
				{data.map((item, index) => {
					return (
						<RowItem
							key={"row-item-" + index}
							{...item}
						/>
					);
				})}
			</div>
			<div className={styles["account-wrapper"]}>
				{RenderLogout()}
				<button
					onClick={deleteCustomer}
					className={styles["delete-account-btn"]}>
					{translate("personalArea_menu_deleteUserDesktop_text")}
				</button>
			</div>
		</aside>
	);
}

export default PersonalAreaMenuDesktop;

function RowItem(props) {
	const { to, icon, title, selected } = props;
	const router = useRouter();
	const isActive = router.pathname === to;

	const onClick = () => {
		AnalyticsService.personalAreaNav(title);
	};

	return (
		<Link
			prefetch
			href={to}
			role={"tab"}
			aria-selected={isActive}
			className={clsx(styles["menu-item"], isActive ? styles["active"] : "")}
			onClick={onClick}
			aria-current={isActive ? "page" : false}>
			<div className={clsx(styles["icon-wrapper"], styles["not-selected"])}>
				<img
					src={icon.src}
					alt={title}
					aria-hidden={true}
				/>
			</div>
			<div className={clsx(styles["icon-wrapper"], styles["selceted"])}>
				<img
					src={selected.src}
					alt={title}
					aria-hidden={true}
				/>
			</div>
			<span className={styles["title"]}>{title}</span>
		</Link>
	);
}
