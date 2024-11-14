import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import CloseIcon from "/public/assets/icons/x-icon.svg";
import BlurPopup from "../../Presets/BlurPopup";

import Api from "api/requests";
import Actions from "../../../redux/actions";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import usePostMessage from "hooks/usePostMessage";

export default function AddCreditCardPopup(props) {
	const [cgUrl, setCgUrl] = useState("");
	const dispatch = useDispatch();
	const ref = useRef();
	const translate = useTranslate();
	const { setSavedCreditCards } = props.payload;

	useEffect(() => {
		getCgUrl();
	}, []);

	usePostMessage(onSuccess);

	function onSuccess() {
		dispatch(Actions.toggleIsAddedCreditCard(true));
		Api.getCustomerSavedCards({
			onSuccess: (res) => {
				setSavedCreditCards(res.creditCards);
			},
		});
		ref?.current?.animateOut();
	}

	function getCgUrl() {
		const payload = {};
		Api.createCustomerSavedCard({ payload, onSuccess });

		function onSuccess(res) {
			if (res.frameUrl) setCgUrl(res.frameUrl);
		}
	}

	function renderPopupContent() {
		return (
			<>
				<div className={styles["header-container"]}>
					<div className={styles["item"]}></div>
					<h2
						className={clsx(styles["header-title"], styles["item"])}
						tabIndex={0}>
						{translate("personalArea_credit_card_addCard")}
					</h2>
					<img
						className={clsx(styles["close-icon"], styles["item"])}
						src={CloseIcon.src}
						alt={"X"}
						onClick={ref?.current?.animateOut}
					/>
				</div>

				<div className={styles["iframe-wrapper"]}>
					<iframe src={cgUrl} />
				</div>
			</>
		);
	}

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			className={styles["add-credit-card-popup"]}>
			{renderPopupContent()}
		</BlurPopup>
	);
}
