import React from "react";
import { useDispatch, useSelector } from "react-redux";

import * as popups from "constants/popup-types";
import Api from "api/requests";

import Man from "/public/assets/icons/PersonalArea/man-mobile.svg";
import House from "/public/assets/icons/PersonalArea/house-mobile.svg";
import Credit from "/public/assets/icons/PersonalArea/credit-mobile.svg";
import Kosher from "/public/assets/icons/PersonalArea/kosher-mobile.svg";
import Lang from "/public/assets/icons/PersonalArea/lang-mobile.svg";
import Out from "/public/assets/icons/PersonalArea/out-mobile.svg";
import Arrow from "/public/assets/icons/PersonalArea/shevron.svg";

import styles from "./PersonalAreaMenuMobile.module.scss";
import Switch from "components/Switch/Switch";
import TextOnlyButton from "components/text_only_button";
import Actions from "redux/actions";
import useKosher from "hooks/useKosher";
import { GeneralService } from "services/GeneralService";
import PERSONAL_AREA_SCREEN_TYPES from "constants/personal-area-screen-types";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

function PersonalAreaMenuMobile({ deleteCustomer }) {
	const lang = useSelector((store) => store.generalData.lang);
	const isKosher = useKosher();
	const dispatch = useDispatch();
	const user = useSelector((store) => store.userData);
	const translate = useTranslate();

	const data = [
		{
			title: translate("personalArea_menu_personalDetails_title"),
			icon: Man,
			children: RenderArrow,
			to: PERSONAL_AREA_SCREEN_TYPES.PERSONAL_DEATILS,
		},
		{
			title: translate("personalArea_menu_address_title"),
			icon: House,
			children: RenderArrow,
			to: PERSONAL_AREA_SCREEN_TYPES.ADDRESS,
		},
		{
			title: translate("personalArea_menu_credit_title"),
			icon: Credit,
			children: RenderArrow,
			to: PERSONAL_AREA_SCREEN_TYPES.CREDIT_CARD,
		},
		{
			title: translate("personalArea_menu_kosher_title"),
			icon: Kosher,
			children: RenderSwitch,
		},
		{
			title: translate("personalArea_menu_lang_title"),
			icon: Lang,
			children: RenderArrow,
			bold: translate(lang),
			to: PERSONAL_AREA_SCREEN_TYPES.LANG,
		},
	];

	function changeKosherInServer(val, callback) {
		const preferences = [...(user.preferences || [])];
		const index = preferences.indexOf("kosher");

		if (!val) {
			if (index > -1) {
				preferences.splice(index, 1);
			}
		} else {
			if (index === -1) {
				preferences.push("kosher");
			}
		}

		function onSuccess() {
			typeof callback === "function" && callback();
			dispatch(Actions.setUser({ preferences }));
		}

		const payload = {
			firstName: user.firstName,
			lastName: user.lastName,
			gender: user.gender,
			email: user.email,
			preferences,
			termsApproval: user.approvedTerms,
			allowMarketing: user.allowMarketing,
			DateOfBirth: user.dateOfBirth,
		};
		Api.setCustomerDetails({ payload, onSuccess });
	}

	function ChangeKosher(name, val) {
		const value = val ? "1" : "0";
		AnalyticsService.personalAreaNavKosher(val ? "on" : "off");
		if (user.approvedTerms) {
			changeKosherInServer(val, () => GeneralService.setKosherPreference(value));
		} else {
			GeneralService.setKosherPreference(value);
		}
	}

	function RenderArrow() {
		return (
			<div className={styles["arrow-wrapper"]}>
				<img
					src={Arrow.src}
					alt="arrow"
					aria-hidden={true}
				/>
			</div>
		);
	}

	function RenderSwitch() {
		return (
			<>
				<Switch
					state={isKosher}
					onClick={ChangeKosher}
					srMessage={translate("personalArea_menu_kosher_title")}
				/>
			</>
		);
	}

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

	function RenderLogOut() {
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

	return (
		<div className={styles["personal-area-menu-mobile-wrapper"]}>
			<div
				className={styles["personal-area-menu-rows"]}
				role={"menu"}>
				{data.map((item, index) => {
					return (
						<RowItem
							{...item}
							index={index}
							key={"row-item-" + index}>
							{item.children()}
						</RowItem>
					);
				})}
			</div>
			<div className={styles["bottom-part"]}>
				<div className={styles["divider"]} />
				<div className={styles["account-wrapper"]}>
					{RenderLogOut()}

					<TextOnlyButton
						className={styles["delete-account-btn"]}
						text={translate("personalArea_menu_deleteUser_text")}
						onClick={deleteCustomer}
					/>
				</div>
			</div>
		</div>
	);
}

export default PersonalAreaMenuMobile;

function RowItem(props) {
	const { icon, title, children, index, bold, to } = props;
	const [currentScreen, setStack] = useStack(STACK_TYPES.PERSONAL_AREA);

	function RenderRowItem() {
		return (
			<>
				{index > 0 && <div className={styles["divider"]} />}
				<div
					className={styles["menu-row-item"]}
					role={"menuitem"}
					onClick={() => AnalyticsService.personalAreaNav(title)}>
					<div className={styles["icon-text-wrapper"]}>
						<div className={styles["icon-wrapper"]}>
							<img
								src={icon.src}
								alt={"/"}
							/>
						</div>
						<span className={styles["menu-item-title"]}>{title}</span>

						{bold && (
							<>
								<div className={styles["block"]} />
								<span className={styles["menu-item-bold-title"]}>{bold}</span>
							</>
						)}
					</div>
					{children}
				</div>
			</>
		);
	}
	function routeTo() {
		setStack({
			type: to,
			params: {},
		});
	}

	if (to) {
		return (
			<button
				className={styles["menu-row-item-wrapper"]}
				onClick={routeTo}>
				{RenderRowItem()}
			</button>
		);
	} else {
		return (
			<div className={styles["menu-row-item-wrapper"]}>{RenderRowItem()}</div>
		);
	}
}
