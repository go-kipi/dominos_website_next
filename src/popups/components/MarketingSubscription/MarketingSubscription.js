/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";

import styles from "./MarketingSubscription.module.scss";
// Animation
import Button from "../../../components/button";
import SlidePopup from "popups/Presets/SlidePopup";
import TextOnlyButton from "components/text_only_button";
import clsx from "clsx";
import BenefitImage from "/public/assets/icons/benefit/MarketingBenefit.svg";
import OpenBenefit from "/public/assets/icons/benefit/openBenefit.svg";
import { useDispatch, useSelector } from "react-redux";
import MARKETING_TYPES from "constants/Marketing-types";
import Actions from "redux/actions";

export default function MarketingSubscription(props) {
	const { payload = {} } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [selectedCallback, setSelectedCallback] = useState(() => {});
	const prize = useSelector((store) => store.orderPrize);
	const dispatch = useDispatch();

	const {
		title,
		addTitle,
		subTitle,
		mainBtnText,
		subBtnText,
		type,
		mainBtnFunc = () => {},
		subBtnFunc = () => {},
		isLottie = true,
	} = payload;

	const ref = useRef();
	const animateOut = (callback) => ref.current.animateOut(callback);

	const formatDate = () => {
		if (!prize.expirationDate) return "";
		const dateObj = new Date(prize.expirationDate);

		const options = {
			day: "numeric",
			month: "numeric",
			year: "numeric",
			timeZone: "UTC",
		};
		const formattedDate = dateObj
			.toLocaleString("he-IL", options)
			.replace(/\./g, "/");

		return formattedDate;
	};

	const formattedDate = formatDate();

	const getFormattedSubtitle = () => {
		if (formattedDate) {
			return subTitle.replace("{date}", " " + formattedDate + "\n");
		} else {
			const startIndex = subTitle.indexOf("{date}");
			if (startIndex !== -1) {
				return subTitle.slice(startIndex + "{date}".length);
			} else {
				return subTitle;
			}
		}
	};
	const formattedSubtitle = getFormattedSubtitle();

	useEffect(() => {
		setIsOpen(true);
		if (type === MARKETING_TYPES.PRESENT_POPUP) {
			dispatch(Actions.updateTrackerOrderRoleta());
		}
		return () => {
			if (prize) {
				dispatch(Actions.resetPrize());
			}
		};
	}, []);

	const renderImage = () => {
		switch (type) {
			case MARKETING_TYPES.SUGGEST_PRESENT_POPUP:
				return (
					<img
						src={BenefitImage.src}
						className={styles["icon"]}
						alt={"icon"}
					/>
				);
			case MARKETING_TYPES.PRESENT_POPUP:
				return (
					<img
						src={OpenBenefit.src}
						className={styles["icon"]}
						alt={"icon"}
					/>
				);

			default:
				break;
		}
	};

	const handleClick = (callback) => {
		setSelectedCallback(callback);
		setIsOpen(false);
		if (!isLottie) {
			callback();
		}
		animateOut();
	};

	function RenderPopup() {
		return (
			<>
				<div className={styles["image-wrapper"]}>{renderImage()}</div>
				<div
					className={styles["text-wrapper"]}
					aria-live={"polite"}
					role={"alert"}
					tabIndex={0}>
					{addTitle && (
						<h2
							className={clsx(styles["add-title"])}
							tabIndex={0}>
							{addTitle}
						</h2>
					)}

					<h1
						className={clsx(styles["title"])}
						tabIndex={0}>
						{title}
					</h1>

					{formattedSubtitle && (
						<h3
							className={clsx(styles["sub-title"])}
							tabIndex={0}>
							{formattedSubtitle}
						</h3>
					)}
				</div>

				<div className={styles["btn-wrap"]}>
					<Button
						className={`${styles["btn"]} ${styles["main-btn"]}`}
						onClick={() => handleClick(mainBtnFunc)}
						text={mainBtnText}
					/>
					<TextOnlyButton
						className={` ${styles["sec-btn"]}`}
						onClick={() => handleClick(subBtnFunc)}
						text={subBtnText}
					/>
				</div>
			</>
		);
	}

	return (
		<SlidePopup
			id={props.id}
			showCloseIcon={true}
			className={clsx(styles["marketing-popup"])}
			animateOutCallback={subBtnFunc}
			ref={ref}>
			{RenderPopup()}
		</SlidePopup>
	);
}
