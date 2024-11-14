import React, { useRef } from "react";

import styles from "./GeneralMessagePopup.module.scss";
import SlidePopup from "popups/Presets/SlidePopup";

import InfoIcon from "/public/assets/icons/info-icon.svg";
import useTranslate from "hooks/useTranslate";
import Button from "components/button";
import { useDispatch } from "react-redux";
import Actions from "redux/actions";
import DynamicLink from "components/dynamic_link";
import HTMLDisplay from "components/HTMLDisplay";

function GeneralMessage(props) {
	const ref = useRef();
	const dispatch = useDispatch();
	const translate = useTranslate();
	const {
		id,
		text,
		subtext,
		btnText,
		hideCloseButton = false,
		enableClickOutside = true,
		linkUrl = "",
		linkBehavior = "",
		animateCallback,
		isPromo = false,
	} = props.payload;

	const dynamicLinkItem = {
		linkBehavior,
		url: linkUrl,
	};
	const handleOnClick = () => {
		ref.current.animateOut(() => {
			if (isPromo) {
				dispatch(Actions.removePromoPopup());
			}
			typeof animateCallback === "function" && animateCallback();
		});
	};

	const animateOutCallback = () => {
		if (isPromo) {
			dispatch(Actions.removePromoPopup());
		}
		typeof animateCallback === "function" && animateCallback();
	};

	return (
		<SlidePopup
			id={props.id}
			className={styles["pizza-not-in-meal"]}
			ref={ref}
			animateOutCallback={animateOutCallback}
			showCloseIcon={!enableClickOutside || hideCloseButton}
			enableClickOutside={enableClickOutside}>
			<div
				className={styles["info-icon-wrapper"]}
				tabIndex={0}>
				<img
					src={InfoIcon.src}
					alt={translate("accessibility_imageAlt_info")}
				/>
			</div>
			{text && (
				<span
					className={styles["content"]}
					tabIndex={0}>
					{text}{" "}
				</span>
			)}
			{subtext && (
				<div className={styles["subtext-wrapper"]}>
					<HTMLDisplay
						className={styles["subtext-content"]}
						html={subtext}
					/>
				</div>
			)}
			{btnText && (
				<DynamicLink
					link={dynamicLinkItem}
					className={styles["button"]}>
					<Button
						onClick={handleOnClick}
						text={btnText}
					/>
				</DynamicLink>
			)}
		</SlidePopup>
	);
}

export default GeneralMessage;
