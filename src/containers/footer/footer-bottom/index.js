import React from "react";
import styles from "./index.module.scss";
import HeilaLogo from "/public/assets/logos/heila-logo.svg";
import DominosLogoDesktop from "/public/assets/logos/dominos-logo-with-blue-name.svg";
import DominosLogoMobile from "/public/assets/logos/dominos-logo-with-blue-name-mobile.svg";
import { useSelector } from "react-redux";
import useTranslate from "hooks/useTranslate";
import DynamicLink from "components/dynamic_link";

function FooterBottom(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const footerLinks = useSelector((store) => store.links?.footer);

	if (deviceState?.isMobile) return null;

	return (
		<div className={styles["footer-bottom-container"]}>
			<div className={styles["footer-bottom"]}>
				<div className={styles["logo-wrap"]}>
					<img
						className={styles["logo"]}
						src={
							deviceState?.isDesktop ? DominosLogoDesktop.src : DominosLogoMobile.src
						}
						alt={"logo"}
					/>
				</div>

				<div className={`${styles["item"]} ${styles["links-wrap"]}`}>
					{footerLinks &&
						footerLinks.map((item, index) => {
							return (
								<DynamicLink
									key={"footer-link-" + index}
									className={styles["link"]}
									link={item}>
									{item.nameUseCases}
								</DynamicLink>
							);
						})}
				</div>

				{deviceState?.isDesktop && <Credits />}
			</div>

			{!deviceState?.isDesktop && <Credits />}
		</div>
	);
}

export default FooterBottom;

function Credits() {
	const translate = useTranslate();

	return (
		<div className={styles["footer-bottom-left"]}>
			<a
				className={styles["text"]}
				href={"https://www.inmanage.co.il/"}
				target="_blank"
				rel="noreferrer">
				<span className={styles["company-name"]}>
					{" "}
					{translate("footer_inmanage_credit")}
				</span>
			</a>
			<span className={styles["separate-line"]}></span>
			<a
				className={styles["text"]}
				href={"https://www.uxpert.com/"}
				target="_blank"
				rel="noreferrer">
				<span className={styles["company-name"]}>
					{" "}
					{translate("footer_uxpert_credit")}
				</span>
			</a>
			<span className={styles["separate-line"]}></span>
			<a
				className={styles["text"]}
				href={"https://heilasystems.com/"}
				target="_blank"
				rel="noreferrer">
				<img
					className={styles["company-logo"]}
					src={HeilaLogo.src}
					alt="heila"
				/>
			</a>
		</div>
	);
}
