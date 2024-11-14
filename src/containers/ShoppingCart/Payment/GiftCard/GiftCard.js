import React, { useEffect, useState } from "react";
import styles from "./GiftCard.module.scss";
import Api from "api/requests";
import { useSelector } from "react-redux";
import useTranslate from "hooks/useTranslate";
import usePostMessage from "hooks/usePostMessage";

export default function GiftCard(props) {
	const { goBackToChoosePayment, leftToPay, method } = props;
	console.log(", leftToPay, method ", leftToPay, method);
	const [cgUrl, setCgUrl] = useState("");
	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();

	usePostMessage(onSuccess, onSuccess);

	useEffect(() => {
		if (cgUrl.length === 0 && method) {
			const { id, defaultCurrency } = method;
			const payload = {
				paymentMethod: id,
				amount: leftToPay,
				currency: defaultCurrency,
			};
			Api.addPayment({ payload, onSuccess });
			function onSuccess(res) {
				const { frameUrl } = res.extraData;
				setCgUrl(frameUrl);
			}
		}
	}, []);

	function onSuccess() {
		typeof goBackToChoosePayment === "function" && goBackToChoosePayment();
	}

	return (
		<div className={styles["gift-card-wrapper"]}>
			{deviceState.isDesktop && (
				<span className={styles["title"]}>
					{translate("payment_giftCard_title")}
				</span>
			)}
			<div className={styles["body"]}>
				<iframe
					src={cgUrl}
					className={styles["iframe"]}
				/>
			</div>
		</div>
	);
}
