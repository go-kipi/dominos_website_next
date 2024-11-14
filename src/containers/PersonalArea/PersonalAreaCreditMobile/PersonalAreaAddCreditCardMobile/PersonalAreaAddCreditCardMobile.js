import React, { useEffect, useState } from "react";
import HeaderTitle from "../../HeaderTitle/HeaderTitle";
import Api from "api/requests";
import styles from "./PersonalAreaAddCreditCardMobile.module.scss";
import { useDispatch } from "react-redux";
import Actions from "redux/actions";
import { useRouter } from "next/router";
import useTranslate from "hooks/useTranslate";
import usePostMessage from "hooks/usePostMessage";

function PersonalAreaAddCreditCardMobile(props) {
	const [cgUrl, setCgUrl] = useState("");
	const dispatch = useDispatch();
	const router = useRouter();
	const translate = useTranslate();
	usePostMessage(onSuccess);

	useEffect(() => {
		getCgUrl();
	}, []);

	function onSuccess() {
		dispatch(Actions.toggleIsAddedCreditCard(true));
		router.back();
	}

	function getCgUrl() {
		const payload = {};
		Api.createCustomerSavedCard({ payload, onSuccess });
		function onSuccess(res) {
			if (res.frameUrl) setCgUrl(res.frameUrl);
		}
	}
	return (
		<div className={styles["add-credit-card-wrap"]}>
			<HeaderTitle
				title={translate("personalArea_credit_card_addCard")}
				canGoBack={true}
			/>
			<div className={styles["body"]}>
				{
					<iframe
						src={cgUrl}
						className={styles["iframe"]}
					/>
				}
			</div>
		</div>
	);
}

export default PersonalAreaAddCreditCardMobile;
