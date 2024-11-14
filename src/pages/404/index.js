import React from "react";

import styles from "./index.module.scss";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import * as Routes from "constants/routes";
import Logo from "/public/assets/logos/dominos-logo-with-name.svg";
import Button from "components/button";
import useTranslate from "hooks/useTranslate";
import { useSelector } from "react-redux";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import Header from "containers/header";

import MobileImage from "/public/assets/bg-images/404-mobile.png";
import DesktopImage from "/public/assets/bg-images/404-desktop.png";
import { useRouter } from "next/router";

function Page404() {
	const translate = useTranslate();
	const router = useRouter();
	const deviceState = useSelector((store) => store.deviceState);
	return (
		<div className={styles["page-404-wrapper"]}>
			<BackgroundImage
				src={deviceState.isDesktop ? DesktopImage : MobileImage}
				className={styles["bg-img"]}
			/>
			<div className={styles["header-content"]}>
				{deviceState.isDesktop ? (
					<Header showCart={false} />
				) : (
					<GeneralHeader hamburger />
				)}
				<div className={styles["content"]}>
					{deviceState.notDesktop && (
						<div className={styles["logo"]}>
							<img src={Logo.src} />
						</div>
					)}
					<h1 className={styles["title"]}>{translate("404Page_title")}</h1>
					<h2 className={styles["subtitle"]}>{translate("404Page_subtitle")}</h2>
					<Button
						onClick={() => router.push(Routes.root)}
						animated={false}
						className={styles["button"]}
						text={translate("404Page_btn_text")}
					/>
				</div>
			</div>
		</div>
	);
}

export default Page404;
