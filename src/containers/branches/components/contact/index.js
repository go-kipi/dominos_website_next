import React from "react";
import styles from "./index.module.scss";
import IconPhone from "/public/assets/icons/branch/branch-phone.svg";
import IconEmail from "/public/assets/icons/branch/branch-email.svg";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { useSelector } from "react-redux";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

export default function Contact({ phone = "", email = "" }) {
	const translate = useTranslate();

	const deviceState = useSelector((store) => store.deviceState);

	const analyticsPhone = () => {
		AnalyticsService.specificBranchesEnteries("call");
	};

	return (
		<div className={styles["contact-container"]}>
			<div className={styles["contacts"]}>
				{phone ? (
					<a
						className={styles["contact"]}
						href={`tel:${phone}`}
						onClick={analyticsPhone}>
						{deviceState.isDesktop ? (
							<img
								className={clsx(styles["icon"], styles["email"])}
								src={IconPhone.src}
								alt={translate("accessibility_alt_phoneNumber")}
							/>
						) : (
							<span className={styles["text-desc"]}>
								{translate("branchScreen_phone_title")}
							</span>
						)}
						<span className={styles["text"]}>{phone}</span>
					</a>
				) : (
					<></>
				)}
				{email ? (
					<a
						href={`mailto:${email}`}
						className={clsx(styles["contact"], styles["email"])}>
						{deviceState.isDesktop ? (
							<img
								className={clsx(styles["icon"], styles["email"])}
								src={IconEmail.src}
								alt={translate("accessibility_alt_email")}
							/>
						) : (
							<span className={styles["text-desc"]}>
								{translate("branchScreen_mail_title")}
							</span>
						)}

						<span className={styles["text"]}>{email}</span>
					</a>
				) : (
					<></>
				)}
			</div>
		</div>
	);
}
