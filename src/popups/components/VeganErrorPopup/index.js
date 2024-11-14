import React, { useRef } from "react";
import styles from "./index.module.scss";

import VeganErrorPizzaIcon from "/public/assets/icons/vegan-error-icon.svg";
import Button from "components/button";

import SlidePopup from "popups/Presets/SlidePopup";
import useTranslate from "hooks/useTranslate";

function VeganErrorPopup(props) {
	const ref = useRef();
	const translate = useTranslate();
	const animateOut = (callback) => ref.current.animateOut(callback);

	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={styles["vegan-error-popup"]}
			showCloseIcon={true}>
			<div className={styles["vegan-error-wrapper"]}>
				<div className={styles["vegan-error-img"]}>
					<img src={VeganErrorPizzaIcon.src} />
				</div>
				<span
					className={styles["vegan-error-title"]}
					tabIndex={0}>
					{translate("veganErrorModal_title")}
				</span>
				<span
					className={styles["vegan-error-subtitle"]}
					tabIndex={0}>
					{translate("veganErrorModal_subtitle")}
				</span>
				<span
					className={styles["vegan-error-hint"]}
					tabIndex={0}>
					{translate("veganErrorModal_hint_title")}
				</span>
				<Button
					text={translate("veganPizzaModal_toppingsBuilder_continueBtn_label")}
					className={styles["ok-btn"]}
					onClick={animateOut}
				/>
			</div>
		</SlidePopup>
	);
}

export default VeganErrorPopup;
