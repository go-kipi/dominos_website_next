import React, { useRef } from "react";

import styles from "./Benefit.module.scss";
import { getFullMediaUrl } from "utils/functions";
import Button from "components/button";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import useOrder from "hooks/useOrder";
import { useRouter } from "next/router";
import * as Routes from "constants/routes";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";
import { TAB_INDEX_HIDDEN } from "../../constants/accessibility-types";
import { createAccessibilityText } from "../accessibility/acfunctions";
import usePreventRageClick from "hooks/usePreventRageClick";
import { useEffect } from "react";
import { GENERAL_MESSAGE } from "constants/popup-types";

function Benefit(props) {
	const {
		title,
		subtitle,
		date,
		id,
		openBuilderWithBenefit,
		productID,
		assetVersion,
		isDisabled = false,
		popupContent,
		popupLabel,
	} = props;
	const dispatch = useDispatch();
	const { hasOrder } = useOrder();
	const dateObj = new Date(date);
	const router = useRouter();
	const translate = useTranslate();
	const imageRef = useRef();
	const cartIconBoundingPos = useRef(null);
	const burgerIconBoundingPos = useRef(null);

	const benfitDate = `${dateObj.getDate()}/${
		dateObj.getMonth() + 1
	}/${dateObj.getFullYear()}`;

	// todo: to change this to real isBenefit check
	const isBenefit = true;

	const label = isBenefit
		? translate("benefitsScreen_benefit_label")
		: translate("benefitsScreen_compensation_label");

	function getImageSize() {
		const rect = imageRef.current.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height,
		};
	}
	const item = {
		assetVersion: assetVersion,
		id: productID,
	};
	const imageUrl = getFullMediaUrl(
		item,
		MEDIA_TYPES.PRODUCT,
		MEDIA_ENUM.IN_MENU,
	);

	function onClick(e) {
		e?.stopPropagation();
		if (isDisabled) return;
		const benefit = { id, imageUrl, imageSize: getImageSize() };
		dispatch(Actions.setBenefit(benefit));
		if (hasOrder) {
			openBuilderWithBenefit(id, imageUrl, getImageSize());
		} else {
			const timeout = setTimeout(() => {
				router.push(Routes.root);
				clearTimeout(timeout);
			}, 350);
		}
	}

	const srContent = createAccessibilityText(
		translate("benefitsScreen_addBenefitToBasket"),
		title,
		subtitle,
		translate("benefitsScreen_expiryAt").replace("{date}", ""),
		dateObj.toLocaleDateString(["he-IL", "en-US"], {
			day: "numeric",
			month: "long",
			year: "numeric",
		}),
	);

	const openTermsModal = (e) => {
		e.stopPropagation();
		dispatch(
			Actions.addPopup({
				type: GENERAL_MESSAGE,
				payload: {
					text: popupContent,
					btnText: translate("benefit_terms_modal_btn"),
				},
			}),
		);
	};
	return (
		<div
			onClick={onClick}
			className={clsx(
				styles["benefit-card-wrapper"],
				isDisabled ? "disable-click" : "",
			)}>
			<div
				className={styles["content"]}
				aria-hidden={true}>
				<div className={styles["image-label-wrapper"]}>
					<div className={styles["label-wrapper"]}>
						<span className={styles["label"]}>{label}</span>
					</div>
					<div className={styles["image-wrapper"]}>
						<img
							ref={imageRef}
							src={imageUrl}
							alt={""}
						/>
					</div>
				</div>
				<div className={styles["texts-wrapper"]}>
					<span className={styles["aria-hidden"]}>{label}</span>
					<h1 className={styles["title"]}>{title}</h1>
					<p className={styles["subtitle"]}>{subtitle}</p>
					<p className={`${styles["subtitle"]} ${styles["date"]}`}>
						{translate("benefitsScreen_expiryAt").replace("{date}", benfitDate)}
					</p>
					{popupLabel ? (
						<p
							onClick={openTermsModal}
							className={styles["popupLabel"]}>
							{popupLabel}
						</p>
					) : null}
				</div>
			</div>
			<div className={styles["actions"]}>
				<Button
					text={translate("benefitsScreen_addBenefitToBasket")}
					disabled={isDisabled}
					extraStyles={styles}
					onClick={onClick}
					ariaLabel={srContent}
				/>
			</div>
		</div>
	);
}

export default Benefit;
