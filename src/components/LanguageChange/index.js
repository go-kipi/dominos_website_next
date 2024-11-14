import React, { useEffect, useState } from "react";
import Api from "api/requests";
import { useDispatch, useSelector } from "react-redux";

import styles from "./index.module.scss";
import Logo from "animations/dominos-splash.json";
import Actions from "redux/actions";
import LottieAnimation from "components/LottieAnimation";
import clsx from "clsx";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

const LanguageChange = (props) => {
	const dispatch = useDispatch();
	const languageFlag = useSelector((store) => store.languageFlag);
	const [animationState, setAnimationState] = useState(styles["enter"]);

	useEffect(() => {
		if (languageFlag) {
			setTimeout(() => {
				const userAgent = navigator.userAgent;
				const languageCover = document.querySelector("#language-change");
				if (!userAgent.match(/safari/i)) {
					disableBodyScroll(languageCover);
				} else {
					document.body.style.overflow = "hidden";
					document.body.style.WebkitOverflowScrolling = "none";
				}

				function onSuccessCB() {
					setAnimationState(styles["exit"]);
					setTimeout(() => {
						dispatch(Actions.resetLanguageFlag());
						dispatch(Actions.resetAllBrachDetails());
						if (!userAgent.match(/safari/i)) {
							clearAllBodyScrollLocks();
						} else {
							const popupWrapper = document.querySelector(".popup_wrapper");
							if (!popupWrapper) {
								document.body.style.overflow = null;
								document.body.style.WebkitOverflowScrolling = null;
							}
						}
						setAnimationState(styles["enter"]);
					}, 500);
				}

				Api.getAllTranslations(languageFlag);
				Api.getLinks(languageFlag);

				const payload = {
					lang: languageFlag,
					onlyvisited: false,
				};
				const config = {
					showLoader: false,
				};

				Api.getStoreList({ payload, config, onSuccessCB });
			}, 500);
		}
	}, [languageFlag]);

	if (!languageFlag) {
		return <></>;
	}

	return (
		<div
			id={"language-change"}
			className={clsx(styles["change-language-cover"], animationState)}>
			<div className={styles["logo-wrapper"]}>
				<LottieAnimation
					speed={1000}
					animation={Logo}
				/>
			</div>
		</div>
	);
};

export default LanguageChange;
