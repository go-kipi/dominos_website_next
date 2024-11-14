import React, { useRef } from "react";
import { useSelector } from "react-redux";

import Button from "../../../components/button";
import TextOnlyButton from "../../../components/text_only_button";

import styles from "./index.module.scss";

import RemainingUpgradesIcon from "/public/assets/icons/remaining-upgrades-icon.svg";
import SlidePopup from "popups/Presets/SlidePopup";
import { UPSALES_TYPES } from "constants/upsales-types";
import useTranslate from "hooks/useTranslate";

// const UPGRADES_TYPES = {
//   TOPPINGS: "toppings",
//   DOUGH: "dough",
// };

export default function RemainingUpgradesModal(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const { payload } = props;
	const {
		upgrades = [],
		onUpgradePress = () => {},
		remainingToppings,
	} = payload;
	const translate = useTranslate();
	const stillHaveMoreText = "remainingUpgradesModal_youStillHave_label";
	const moreThanOneToppingUpgradesLabel =
		"remainingUpgradesModal_moreThanOneTopping_label";
	const moreThanOneDoughUpgradesLabel =
		"remainingUpgradesModal_moreThanOneDough_label";
	const oneToppingUpgradesLabel = "remainingUpgradesModal_oneTopping_label";
	const oneDoughUpgradesLabel = "remainingUpgradesModal_oneDough_label";
	const lessThanOneLabel = "remainingUpgradesModal_lessThanOneTopping_label";
	const ref = useRef();

	const formatText = () => {
		let toppingCount = 0;
		let doughCount = 0;
		let toppingText, doughText;
		const startText = translate(stillHaveMoreText) + " ";
		if (upgrades.length > 0) {
			upgrades.forEach((upgrade) => {
				if (upgrade.type === UPSALES_TYPES.ADD_SUB_ITEM) {
					toppingCount++;
				} else if (upgrade.type === UPSALES_TYPES.CHANGE_ITEM) {
					doughCount++;
				}
			});
			toppingText =
				toppingCount > 0
					? toppingCount > 1
						? translate(moreThanOneToppingUpgradesLabel)
						: translate(oneToppingUpgradesLabel)
					: "";
			doughText =
				doughCount > 0
					? doughCount > 1
						? translate(moreThanOneDoughUpgradesLabel)
						: translate(oneDoughUpgradesLabel)
					: "";
			if (toppingText) {
				toppingText =
					startText + toppingText.replace("{amount}", toppingCount) + ",";
			}
			if (doughText) {
				doughText = !toppingText
					? startText + doughText.replace("{amount}", doughCount)
					: doughText.replace("{amount}", doughCount);
			}
		} else if (typeof remainingToppings === "number") {
			const isLessThanOne = remainingToppings > 0 && remainingToppings < 1;
			if (isLessThanOne) {
				toppingText = translate(lessThanOneLabel).replace(
					"{number}",
					remainingToppings,
				);
			} else {
				toppingText =
					remainingToppings > 0
						? remainingToppings > 1
							? translate(moreThanOneToppingUpgradesLabel)
							: translate(oneToppingUpgradesLabel)
						: "";
			}
			if (toppingText) {
				toppingText =
					startText + toppingText.replace("{amount}", remainingToppings);
			}
		}

		if (!deviceState.isMobile) {
			return (
				<div className={styles["textWrapper"]}>
					<h2
						className={styles["text-desktop"]}
						tabIndex={0}>
						{toppingText + " " + (doughText ?? "")}
					</h2>
				</div>
			);
		}

		return (
			<div className={styles["textWrapper"]}>
				{toppingText && (
					<h2
						className={styles["text"]}
						tabIndex={0}>
						{toppingText}
					</h2>
				)}
				{doughText && (
					<h2
						className={styles["text"]}
						tabIndex={0}>
						{doughText}
					</h2>
				)}
			</div>
		);
	};

	const handleOnUpgrade = () => {
		// TODO: Navigate to correct upgrade page.
		animateOut(onUpgradePress);
	};

	const openEndOfSale = () => {
		const { onShowEndOfSale } = payload;
		typeof onShowEndOfSale === "function" && onShowEndOfSale();
	};

	const animateOut = (callback) => ref.current?.animateOut(callback);

	const onShowEndOfSaleModal = () => {
		animateOut(() => {
			openEndOfSale();
		});
	};

	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={styles["upgrades-popup"]}
			showCloseIcon={true}>
			<div className={styles["remaining-upgrades-wrapper"]}>
				<div className={styles["remaining-upgrades-img"]}>
					<img
						src={RemainingUpgradesIcon.src}
						alt={""}
					/>
				</div>
				<h1
					className={styles["title"]}
					tabIndex={0}>
					{translate("remainingUpgradesModal_justToMakeSure_title")}
				</h1>
				<h2
					className={styles["subtitle"]}
					tabIndex={0}>
					{translate("remainingUpgradesModal_haveRemainingUpgrades_subtitle")}
				</h2>
				{formatText()}
				<div className={styles["actions"]}>
					<Button
						className={styles["continue-add-btn"]}
						text={translate("remainingUpgradesModal_addUpgrade_btnLabel")}
						animated={false}
						onClick={handleOnUpgrade}
					/>
					<TextOnlyButton
						className={styles["continue-close-btn"]}
						text={translate("remainingUpgradesModal_dontWantToAddAnything_btnLabel")}
						onClick={onShowEndOfSaleModal}
					/>
				</div>
			</div>
		</SlidePopup>
	);
}
