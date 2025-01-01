import ApplePayButton from "components/ApplePayButton/ApplePayButton";
import React from "react";
import ApplePayService from "services/ApplePay";
import Api from "api/requests";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";
import PAYMENT_METHODS from "constants/PaymentMethods";
import styles from "./index.module.scss";
import appleLogo from "/public/assets/icons/payment/apple-pay-logo.png";
import Image from "next/image";
import useTranslate from "hooks/useTranslate";

function ApplePay(props) {
	const { setStack, submitOrder } = props;
	const { paymentMenu, leftToPay } = props.params;
	const translate = useTranslate();

	function onApplePaymentSuccess(appleSession, data) {
		const applePayMethod = paymentMenu.filter(
			(paymentMenu) => paymentMenu.id === PAYMENT_METHODS.APPLE_PAY,
		)[0];

		const payload = {
			paymentMethod: applePayMethod.id,
			amount: leftToPay,
			currency: applePayMethod.defaultCurrency,
			extraData: {
				token: JSON.stringify(data?.token),
			},
		};

		setStack({
			type: PAYMENT_SCREEN_TYPES.LOADER,
			params: {
				loaderText: "defaultPaymentLoaderText",
			},
		});

		Api.addPayment({
			payload,
			onSuccess: (res) => {
				appleSession?.completePayment(window.ApplePaySession.STATUS_SUCCESS);

				typeof submitOrder === "function" && submitOrder();
			},
			onFailure: (res) => {
				appleSession?.completePayment(window.ApplePaySession.STATUS_FAILURE);
				setStack({
					type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
					params: {},
				});
			},
			onRejection: (res) => {
				appleSession?.completePayment(window.ApplePaySession.STATUS_FAILURE);
				setStack({
					type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
					params: {},
				});
			},
		});
	}

	function onNavigateToPayments() {
		setStack({
			type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
			params: {},
		});
	}

	return (
		<div className={styles["apple-pay-wrapper"]}>
			<Image
				className={styles["logo-icon"]}
				src={appleLogo}
			/>
			<div className={styles["main-text"]}>
				<p>{translate("apple_pay_text_description")}</p>
				<p>{translate("apple_pay_action")}</p>
			</div>

			<ApplePayButton
				onClick={() =>
					ApplePayService.setButtonClickListener(onApplePaymentSuccess)
				}
			/>
			<p onClick={onNavigateToPayments}>{translate("payment_choose_another")}</p>
		</div>
	);
}

export default ApplePay;
