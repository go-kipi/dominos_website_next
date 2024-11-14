import React, { useEffect, useState } from "react";
import useTranslate from "hooks/useTranslate";
import Api from "api/requests";
import DominosLoader from "components/DominosLoader/DominosLoader";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";
import styles from "./PaymentLoader.module.scss";

function PaymentLoader(props) {
	const translate = useTranslate();
	const { params } = props;
	const { loaderText } = params;

	return (
		<div className={styles["payment-loader"]}>
			<DominosLoader />
			{loaderText ? (
				<div className={styles["loader-text"]}>{translate(loaderText)}</div>
			) : null}
		</div>
	);
}

export default PaymentLoader;
