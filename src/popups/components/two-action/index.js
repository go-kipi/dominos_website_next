import React, { useEffect, useRef, useState } from "react";

import styles from "./index.module.scss";
// Animation
import LottieAnimation from "../../../components/LottieAnimation";
import GarbageShowAnimation from "animations/garbage_show.json";
import GarbageCloseAnimation from "animations/garbage_close.json";

import DuplicateIcon from "/public/assets/icons/duplicate_icon.svg";
import TWO_ACTION_TYPES from "../../../constants/two-actions-popup-types";
import Button from "../../../components/button";
import SlidePopup from "popups/Presets/SlidePopup";
import InfoIcon from "/public/assets/icons/info-icon.svg";
import TextOnlyButton from "components/text_only_button";
import clsx from "clsx";
import { AnimatedCapsule } from "components/AnimatedCapsule/AnimatedCapsule";

export default function TwoActionPopup(props) {
	const { payload = {} } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [selectedCallback, setSelectedCallback] = useState(() => {});

	const {
		title,
		addTitle,
		subTitle,
		mainBtnText,
		subBtnText,
		type,
		mainBtnFunc = () => {},
		subBtnFunc = () => {},
		isLottie = false,
		animatedBtn = false,
		capsuleButton = false,
	} = payload;

	const ref = useRef();
	const isDeleteUser = type === TWO_ACTION_TYPES.DELETE_USER;
	const animateOut = (callback) => ref.current.animateOut(callback);

	useEffect(() => {
		setIsOpen(true);
	}, []);

	const renderAnimation = () => {
		const firstAnimationComplete = () => {
			setIsOpen(true);
		};

		const secondAnimationComplete = (callback) => {
			setIsOpen(false);
			animateOut(callback);
		};
		switch (type) {
			case TWO_ACTION_TYPES.GARBAGE:
			case TWO_ACTION_TYPES.DELETE_USER:
				return (
					<LottieAnimation
						animation={isOpen ? GarbageShowAnimation : GarbageCloseAnimation}
						onComplete={
							isOpen
								? firstAnimationComplete
								: () => secondAnimationComplete(selectedCallback)
						}
					/>
				);
			case TWO_ACTION_TYPES.DUPLICATE:
				return (
					<img
						src={DuplicateIcon.src}
						alt={"duplicate"}
					/>
				);
			case TWO_ACTION_TYPES.UPDATE:
				return (
					<img
						src={InfoIcon.src}
						className={styles["update-icon"]}
						alt={"duplicate"}
					/>
				);
			default:
				break;
		}
	};

	const handleClick = (callback) => {
		if (isLottie) {
			setSelectedCallback(callback);
			setIsOpen(false);
			return;
		}
		animateOut(callback);
	};

	const renderButton = () => {
		if (capsuleButton) {
			return (
				<div className={styles["btn-wrap"]}>
					<AnimatedCapsule
						bluePillText={mainBtnText}
						redPillText={subBtnText}
						bluePillOnPress={() => handleClick(mainBtnFunc)}
						redPillOnPress={() => handleClick(subBtnFunc)}
					/>
				</div>
			);
		} else {
			return (
				<div className={styles["btn-wrap"]}>
					<div className={styles["animated-btn-wrapper"]}>
						<Button
							className={`${styles["btn"]} ${styles["main-btn"]}`}
							onClick={() => handleClick(mainBtnFunc)}
							text={mainBtnText}
							animated={animatedBtn}
						/>
					</div>
					<TextOnlyButton
						className={` ${styles["sec-btn"]}`}
						onClick={() => handleClick(subBtnFunc)}
						text={subBtnText}
					/>
				</div>
			);
		}
	};

	function RenderPopup() {
		return (
			<>
				<div className={styles["lotte-wrapper"]}>{renderAnimation()}</div>
				<div
					className={styles["text-wrapper"]}
					aria-live={"polite"}
					role={"alert"}
					tabIndex={0}>
					{subTitle && !isDeleteUser ? (
						<div className={styles["sub-title-row"]}>
							<h1 className={styles["sub-title"]}>{subTitle}</h1>
							<h2 className={styles["add-title"]}>{addTitle}</h2>
						</div>
					) : null}
					<h1
						className={clsx(
							styles["title"],
							isDeleteUser ? styles["delete-user"] : "",
						)}
						tabIndex={0}>
						{title}
					</h1>
					{isDeleteUser ? (
						<h2
							className={clsx(styles["sub-title"], styles["delete-user"])}
							tabIndex={0}>
							{subTitle}
						</h2>
					) : null}
				</div>

				{renderButton()}
			</>
		);
	}

	return (
		<SlidePopup
			id={props.id}
			showCloseIcon={true}
			animateOutCallback={subBtnFunc}
			className={clsx(
				styles["two-action-popup"],
				isDeleteUser ? styles["delete-user"] : "",
			)}
			ref={ref}>
			{RenderPopup()}
		</SlidePopup>
	);
}
