import React, { useEffect } from "react";
import styles from "./index.module.scss";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";
import useTranslate from "hooks/useTranslate";
import Actions from "redux/actions";
import usePostMessage from "hooks/usePostMessage";
import { useDispatch } from "react-redux";

function AddCreditCard(props) {
	const { params, setStack, submitOrder } = props;
	const { iframeUrl } = params;
	const translate = useTranslate();
	const dispatch = useDispatch();

	usePostMessage(onSuccess, onError);

	function onSuccess() {
		setStack({
			type: PAYMENT_SCREEN_TYPES.LOADER,
			params: {},
		});
		typeof submitOrder === "function" && submitOrder();
	}

	function onError() {
		setStack({
			type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
			params: {},
		});
	}

	return (
		<div className={styles["add-credit-card-wrapper"]}>
			<div className={styles["title"]}>
				{translate("addCreditCard_screen_desktopTitle")}
			</div>
			<div className={styles["iframe-wrapper"]}>
				<iframe src={iframeUrl} />
			</div>
		</div>
	);
}

export default AddCreditCard;
