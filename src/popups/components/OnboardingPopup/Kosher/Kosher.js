import React from "react";

import LottieAnimation from "components/LottieAnimation";

import * as onboardinTypes from "constants/onboarding-types";

import styles from "./Kosher.module.scss";
import KosherAnimation from "animations/kosher.json";
import { AnimatedCapsule } from "../../../../components/AnimatedCapsule/AnimatedCapsule";
import useStack from "../../../../hooks/useStack";
import STACK_TYPES from "../../../../constants/stack-types";
import { GeneralService } from "services/GeneralService";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

export default function Kosher(props) {
	const { onBtnClickHandler } = props;
	const translate = useTranslate();
	function kosherButton() {
		onBtnClickHandler(true);
		AnalyticsService.onboardingKosher("kosher");
	}
	function notKosherButton() {
		onBtnClickHandler(false);
		AnalyticsService.onboardingKosher("not kosher");
	}

	const defaultOptions = {
		loop: false,
		autoplay: true,
		animation: KosherAnimation,
	};
	return (
		<div
			className={styles["kosher-wrapper"]}
			role={"alert"}>
			<div className={styles["lottie-wrapper"]}>
				<LottieAnimation {...defaultOptions} />
			</div>
			<h1
				className={styles["title"]}
				tabIndex={0}>
				{translate("onboarding_kosher_title")}
			</h1>
			<div className={styles["actions-wrapper"]}>
				<AnimatedCapsule
					bluePillText={translate("onboarding_kosher_blue_part")}
					redPillText={translate("onboarding_kosher_red_part")}
					redPillOnPress={notKosherButton}
					bluePillOnPress={kosherButton}
					className={styles["actions"]}
				/>
				<h2
					className={styles["subtitle"]}
					tabIndex={0}>
					{translate("onboarding_kosher_header_subtitle")}
				</h2>
			</div>
		</div>
	);
}
