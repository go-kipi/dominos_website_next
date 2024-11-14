import React, { useEffect } from "react";
import useTranslate from "hooks/useTranslate";
import styles from "./index.module.scss";
import ConfettiAnimation from "animations/confetti-with-check.json";
import LottieAnimation from "components/LottieAnimation";
import { useDispatch } from "react-redux";
import Actions from "redux/actions";

function BitPaymentDone({ submitOrder }) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect(() => {
		submitOrder();
		dispatch(Actions.setLoader(true));
	}, []);

	const defaultOptions = {
		loop: false,
		autoplay: true,
		animation: ConfettiAnimation,
	};

	return (
		<div className={styles["wrapper"]}>
			<LottieAnimation
				{...defaultOptions}
				className={styles["confetti-wrapper"]}
			/>
			<div className={styles["payment-accepted"]}>
				{translate("bitPaymentDone_title")}
			</div>
			<div className={styles["back-to-tab"]}>
				{translate("bitPaymentDone_subtitle")}
			</div>
		</div>
	);
}

export default BitPaymentDone;
