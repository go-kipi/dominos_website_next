import React, { useState, useRef } from "react";
import TrashIcon from "/public/assets/icons/blue-trash.svg";

import styles from "./CreditCard.module.scss";
import TWO_ACTION_TYPES from "../../../constants/two-actions-popup-types";
import Actions from "../../../redux/actions";
import * as popupTypes from "constants/popup-types";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import SRContent from "../../../components/accessibility/srcontent";

export default function CreditCard(props) {
	const [fadeOut, setFadeOut] = useState(false);
	const dispatch = useDispatch();
	const creditRef = useRef(null);
	const { index, card, getCardImage, newCard, removeCreditCard } = props;
	const translate = useTranslate();

	const getNewCard = () => newCard && newCard.token === card.token;

	const showDeletePopup = (uuid) => {
		const payload = {
			title: translate("personalArea_creditCard_deleteCard_title"),
			addTitle: "",
			subTitle: "",
			mainBtnText: translate("personalArea_creditCard_deleteCard_yes"),
			subBtnText: translate("personalArea_creditCard_deleteCard_no"),
			isLottie: true,
			mainBtnFunc: () => {
				setTimeout(() => {
					setFadeOut(true);
					removeCreditCard(uuid);
				}, 300);
			},
			subBtnFunc: () => {},
			type: TWO_ACTION_TYPES.GARBAGE,
		};
		renderPopup(payload);
	};

	const renderPopup = (payload) => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.TWO_ACTION,
				payload,
			}),
		);
	};

	return (
		<>
			<div
				ref={creditRef}
				key={index}
				id={index}
				className={clsx(
					styles["credit-card-wrap"],
					card.expired ? styles["expired"] : "",
					fadeOut ? styles["fade-out"] : "",
					getNewCard() ? styles["new-card"] : "",
				)}>
				<img
					className={styles["icon"]}
					src={getCardImage(card.brand, card.expired)?.src}
				/>
				<div className={styles["details-wrap"]}>
					<div className={styles["row"]}>
						<span className={styles["credit-detail"]}>{card.brand}</span>
						<span className={styles["credit-detail"]}>{card?.lastFourDigits}</span>
					</div>
					{card.expired ? (
						<div className={styles["expired"]}>
							<span className={styles["expired-text"]}>
								{translate("personalArea_creditCard_expired")}
							</span>
						</div>
					) : null}
				</div>
				<button
					className={styles["delete-icon"]}
					onClick={() => showDeletePopup(card.token)}>
					<SRContent
						message={`${translate("accessibility_imageAlt_deleteCreditCard")} 
            ${card?.brand} ${card?.lastFourDigits} ${
							card.expired ? translate("personalArea_creditCard_expired") : ""
						}`}
					/>
					<img
						src={TrashIcon.src}
						aria-hidden={true}
					/>
				</button>
			</div>
		</>
	);
}
