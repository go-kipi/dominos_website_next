import SlidePopup from "popups/Presets/SlidePopup";
import React, { useEffect, useRef } from "react";

import Button from "components/button";

import ApiErrorIcon from "/public/assets/icons/api-error-icon.svg";
import styles from "./index.module.scss";
import useTranslate from "hooks/useTranslate";
import { AnimatedCapsule } from "components/AnimatedCapsule/AnimatedCapsule";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

function ApiErrorPopup(props) {
	const DEFAULT_ERROR_MESSAGE = "תקלת שרת, אנא נסה שנית מאוחר יותר";
	const { payload } = props;
	const translate = useTranslate();

	const {
		title = translate("errorPopup_not500title"),
		text = DEFAULT_ERROR_MESSAGE,
		button1Text = translate("errorPopup_btn_label"),
		button2Text = "",
		button1OnClick = () => {},
		button2OnClick = () => {},
		enableClickOutside = true,
		showCloseIcon = true,
		animateOutCallback = () => {},
		methodName,
		timeStamp,
		dataPayload,
		url,
	} = payload;

	const isLoading = useSelector((store) => store.loaderState);
	const dispatch = useDispatch();

	const ref = useRef();
	const handleClick1 = () => {
		typeof button1OnClick === "function" && button1OnClick();
		animateOut();
	};
	const handleClick2 = () => {
		typeof button2OnClick === "function" && button2OnClick();
		animateOut();
	};

	useEffect(() => {
		if (isLoading) {
			dispatch(Actions.setLoader(false));
		}
	}, [isLoading]);

	const animateOut = () => ref.current?.animateOut();

	const has2Buttons = button1Text && button2Text;

	return (
		<SlidePopup
			id={props.id}
			showCloseIcon={showCloseIcon}
			className={styles["general-api-error"]}
			ref={ref}
			enableClickOutside={enableClickOutside}
			animateOutCallback={animateOutCallback}>
			<div className={styles["general-api-error-wrapper"]}>
				<div className={styles["general-api-error-img"]}>
					<img
						src={ApiErrorIcon.src}
						alt="error-icon"
					/>
				</div>
				{/* // TODO: Return this simple msg after SEO checks done */}
				<h1
					tabIndex={0}
					aria-live={"polite"}
					className={styles["general-api-error-title"]}>
					{title}
				</h1>
				<p
					className={styles["general-api-error-message"]}
					tabIndex={0}>
					{text}
				</p>
				{/* // ! Temporary payload - for SEO purpose */}
				<div className={styles["actions"]}>
					{has2Buttons ? (
						<AnimatedCapsule
							bluePillText={button1Text}
							redPillText={button2Text}
							className={styles["confirm-message-btn"]}
							redPillOnPress={handleClick2}
							bluePillOnPress={handleClick1}
						/>
					) : button1Text ? (
						<Button
							className={styles["confirm-message-btn"]}
							text={button1Text}
							onClick={handleClick1}
						/>
					) : null}
					<button style={{ opacity: 0, width: 1, height: 1 }} />
				</div>
			</div>
		</SlidePopup>
	);
}

export default ApiErrorPopup;
