import React from "react";

import styles from "./index.module.scss";
import { useSelector } from "react-redux";
import PhoneLogo from "/public/assets/icons/footer/phone-logo.svg";
import GoogleBtn from "/public/assets/buttons/googlestore-pay.svg";
import AppleBtn from "/public/assets/buttons/appstore-pay.svg";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import getConfig from "next/config";
import DynamicLink from "components/dynamic_link";
import { getFullMediaUrl } from "utils/functions";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import LINK_BEHAVIOR_TYPES from "constants/dynamic-link-behavior-types";

const { publicRuntimeConfig } = getConfig();
const version = publicRuntimeConfig?.version;

function FooterTop(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();
	const footerSocial = useSelector((store) => store.links.footerSocial);

	const onSocialClick = (name) => {
		AnalyticsService.homepage(name);
		AnalyticsService.supportSocialPlatforms(name);
	};

	const googleAppLink = {
		url: "https://play.google.com/store/apps/details?id=il.co.dominos.android",
		linkBehavior: LINK_BEHAVIOR_TYPES.NEW_TAB,
		isInternal: false,
	};

	const appleAppLink = {
		url: "https://apps.apple.com/il/app/%D7%93%D7%95%D7%9E%D7%99%D7%A0%D7%95%D7%A1-%D7%A4%D7%99%D7%A6%D7%94/id467171472",
		linkBehavior: LINK_BEHAVIOR_TYPES.NEW_TAB,
		isInternal: false,
	};

	return (
		<div className={styles["footer-top-container"]}>
			<span className={styles["version"]}>v-{version}</span>

			<div className={styles["footer-left"]}>
				<span className={styles["title"]}>
					{translate("footer_new_app")}
					&nbsp;
					<span className={styles["footer_surprises"]}>
						{translate("footer_surprises")}
					</span>
				</span>

				<div className={styles["btn-container"]}>
					<DynamicLink
						className={styles["btn"]}
						link={googleAppLink}
						ariaLabel={
							translate("accessibility_footer_downloadApp") +
							"" +
							translate("accessibility_footer_googlePlay")
						}
						onClick={() => {
							AnalyticsService.homepage("Google Play");
						}}>
						<img
							src={GoogleBtn.src}
							alt={""}
							aria-hidden={true}
						/>
					</DynamicLink>
					<DynamicLink
						className={styles["btn"]}
						link={appleAppLink}
						ariaLabel={
							translate("accessibility_footer_downloadApp") +
							"" +
							translate("accessibility_footer_appleStore")
						}
						onClick={() => {
							AnalyticsService.homepage("Apple Store");
						}}>
						<img
							src={AppleBtn.src}
							alt={""}
							aria-hidden={true}
						/>
					</DynamicLink>
				</div>
			</div>

			<div className={styles["footer-mid"]}>
				<div className={styles["text-container"]}>
					<span className={styles["text"]}>
						{translate("footer_dont_miss_our_sales")}
					</span>
					&nbsp;
					<span className={styles["bold"]}>{translate("footer_follow_us")}</span>
				</div>

				<div className={styles["icon-wrapper"]}>
					{footerSocial.map((item, index) => {
						const icon = getFullMediaUrl(
							item,
							MEDIA_TYPES.URL_LIST,
							MEDIA_ENUM.WEB,
							"svg",
						);

						return (
							<DynamicLink
								key={"footer-link-social" + index}
								link={item}
								ariaLabel={translate(`accessibility_footer_${item?.id?.toLowerCase()}`)}
								onClick={onSocialClick.bind(this, item.id)}
								className={styles["icon"]}>
								<img
									src={icon}
									alt={"icon"}
									aria-hidden={true}
								/>
							</DynamicLink>
						);
					})}
				</div>
			</div>

			{!deviceState?.isDesktop && <div className={"horizontal-line"} />}

			<div className={styles["footer-right"]}>
				{deviceState?.isDesktop ? (
					<button
						onClick={() => {
							AnalyticsService.homepage("phone");
						}}>
						<a
							className={styles["phone-wrap"]}
							href={`tel:${translate("phone_number")}`}>
							<span className={styles["phone"]}>{translate("phone_number")}</span>
							&nbsp;
							<span className={styles["title"]}>{translate("for_orders")}</span>
						</a>
					</button>
				) : (
					<button
						onClick={() => {
							AnalyticsService.homepage("phone");
						}}>
						<a
							className={styles["phone-container"]}
							href={`tel:${translate("phone_number")}`}>
							<div className={styles["phone-inner"]}>
								<div className={styles["logo-wrap"]}>
									<img
										className={styles["logo"]}
										src={PhoneLogo.src}
										alt={"logo"}
									/>
								</div>

								<div className={styles["text-container"]}>
									<span className={styles["title"]}>{translate("for_orders")}:</span>
									<span className={styles["phone"]}>{translate("phone_number")}</span>
								</div>
							</div>
						</a>
					</button>
				)}
			</div>
		</div>
	);
}

export default FooterTop;
