import React from "react";

import styles from "./birthday.module.scss";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import { useDispatch, useSelector } from "react-redux";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import useTranslate from "hooks/useTranslate";
import BreadCrumbs from "components/breadcrumbs";
import Header from "containers/header";
import * as Routes from "constants/routes";
import Flags from "/public/assets/icons/flags.svg";
import Party from "/public/assets/icons/party-icon.png";
import clsx from "clsx";
import Button from "components/button";

import * as popupTypes from "constants/popup-types";
import Actions from "redux/actions";

import StarsBlue from "/public/assets/icons/stars-blue.svg";
import StarsRed from "/public/assets/icons/stars-red.svg";
import ISR from "utils/ISR";
import { reduxWrapper } from "redux/store";
import SRContent from "../../components/accessibility/srcontent";

import MobileBackground from "/public/assets/bg-images/birthday-bg.png";
import DesktopBackground from "/public/assets/bg-images/birthday-Desktop-bg.jpg";
import Api from "api/requests";

function Birthday(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();
	const dispatch = useDispatch();

	function openPopup() {
		dispatch(Actions.addPopup({ type: popupTypes.BIRTHDAY_EVENTS, payload: {} }));
	}
	const srText = `${translate("birthDayEvents_content_title")} ${translate(
		"birthDay_party_alt",
	)}, ${translate("birthDayEvents_content_text1")} ${translate(
		"birthDayEvents_content_text2",
	)}`;
	return (
		<div className={styles["birthday-page-wrapper"]}>
			<BackgroundImage
				className={styles["background-image"]}
				src={deviceState.isDesktop ? DesktopBackground : MobileBackground}
			/>
			<SRContent
				message={srText}
				ariaLive={"polite"}
				role={"alert"}
			/>
			{deviceState.isDesktop ? (
				<>
					<Header title={translate("birthDayEvents_header_title")} />
					<div className={styles["stars-blue"]}>
						<img src={StarsBlue.src} />
					</div>
					<div className={styles["stars-red"]}>
						<img src={StarsRed.src} />
					</div>
				</>
			) : (
				<>
					<div className={styles["liner-top"]} />
					<GeneralHeader
						hamburger
						title={translate("birthDayEvents_header_title")}
					/>
				</>
			)}

			<BreadCrumbs
				root={{ route: Routes.root, name: translate("breadcrumbs_root") }}
				crumbs={{
					routes: [Routes.birthday],
					names: [translate("breadcrumbs_birthday")],
				}}
				className={styles["custom-breadcrumbs"]}
			/>

			<div className={styles["middle"]}>
				<div className={styles["middle-content"]} />
				<div className={styles["flags-image-wrapper"]}>
					<img
						src={Flags.src}
						alt={translate("birthDay_flags_alt")}
					/>
				</div>
				<h1
					className={styles["title"]}
					aria-label={`${translate("birthDayEvents_content_title")} ${translate(
						"birthDay_party_alt",
					)}`}
					tabIndex={0}>
					{translate("birthDayEvents_content_title")}
				</h1>
				<div className={styles["party-image-wrapper"]}>
					<img
						src={Party.src}
						alt={translate("birthDay_party_alt")}
					/>
				</div>
			</div>
			<div className={styles["text-button-wrapper"]}>
				<span
					className={clsx(styles["content-text"], styles["content-text1"])}
					tabIndex={0}>
					{translate("birthDayEvents_content_text1")}
				</span>
				<span
					className={clsx(styles["content-text"], styles["content-text2"])}
					tabIndex={0}>
					{translate("birthDayEvents_content_text2")}
				</span>
				<Button
					text={translate("birthDayEvents_content_btnText")}
					className={styles["button-wrapper"]}
					onClick={openPopup}
				/>
			</div>
		</div>
	);
}

export default Birthday;

export const getStaticProps = reduxWrapper.getStaticProps(
	(store) =>
		async ({ params, locale }) => {
			ISR.setGlobalStore(store);
			const isrRevalidate = parseInt(process.env.NEXT_PUBLIC_ISR_REVALIDATE);
			const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

			if (isrEnabled) {
				try {
					await ISR.sharedRequests(locale);
					await ISR.BranchesCities(true, locale);
					await ISR.getGeneralMetaTags(locale, "/birthdays-events");

					return {
						props: { ...params },
						revalidate: isrRevalidate,
					};
				} catch {
					return {
						props: null,
						revalidate: isrRevalidate,
					};
				}
			} else {
				return {
					props: { ...params },
				};
			}
		},
);
