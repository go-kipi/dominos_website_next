import React, { useRef } from "react";
import styles from "./index.module.scss";

import VeganPizzaIcon from "/public/assets/icons/vegan-pizza-icon.svg";
import Button from "components/button";

import SlidePopup from "popups/Presets/SlidePopup";
import useTranslate from "hooks/useTranslate";

function VeganPizzaPopup(props) {
	const ref = useRef();

	const animateOut = (callback) => ref.current.animateOut(callback);
	const translate = useTranslate();
	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={styles["vegan-pizza-popup"]}
			showCloseIcon={true}>
			<div className={styles["vegan-pizza-wrapper"]}>
				<div className={styles["vegan-pizza-img"]}>
					<img
						src={VeganPizzaIcon.src}
						alt={""}
					/>
				</div>
				<div aria-live={"polite"}>
					<h1
						className={styles["vegan-pizza-title"]}
						tabIndex={0}>
						{translate("veganPizzaModal_toppingsBuilder_title")}
					</h1>
					<h2
						className={styles["vegan-pizza-subtitle"]}
						tabIndex={0}>
						{translate("veganPizzaModal_toppingsBuilder_subtitle")}
					</h2>
				</div>
				<Button
					text={translate("veganPizzaModal_toppingsBuilder_continueBtn_label")}
					className={styles["ok-btn"]}
					onClick={animateOut}
				/>
			</div>
		</SlidePopup>
	);
}

export default VeganPizzaPopup;
