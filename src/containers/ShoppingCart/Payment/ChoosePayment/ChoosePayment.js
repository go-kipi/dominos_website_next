import React, { useEffect, useRef, useState } from "react";
import Methods from "../Methods/Methods";
import GooglePayButton from "@google-pay/button-react";
import ApplePayButton from "components/ApplePayButton/ApplePayButton";
import styles from "./ChoosePayment.module.scss";
import Api from "api/requests";
import ApplePayService from "services/ApplePay";
import GooglePay from "services/GooglePay";
import PAYMENT_METHODS from "constants/PaymentMethods";
import useTranslate from "hooks/useTranslate";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";
import TextOnlyButton from "components/text_only_button";

import BitStyledButton from "components/BitButton/BitButton";
import { useDispatch, useSelector } from "react-redux";
import { PAYMENT_METHODS_ACTIONS } from "constants/payments-methods-types";
import Actions from "redux/actions";

function ChoosePayment(props) {
	const anotherGiftCardTitle = "shoppingCart_payment_giftCard_anothertitle";
	const giftCardTitle = "shoppingCart_payment_giftCard_title";
	const payTranslate = "shoppingCart_payment_choosePayment_title";
	const payTheRestTranslate =
		"shoppingCart_payment_choosePayment_alternatetitle";
	const {
		setStack,
		paymentMethods,
		setCurrency,
		leftToPay,
		currency,
		hasGiftCards = false,
		goToTracker,
		onPaymentDone,
		onAddCreditCard,
		getItemsAndListData,
		getPaymentsPopups,
		submitOrder,
	} = props;
	const boxRef = useRef();
	const [googlePayData, setGooglePayData] = useState(null);
	const translate = useTranslate();
	const dispatch = useDispatch();
	const giftCardPayment = paymentMethods.find(
		(method) => method.action === PAYMENT_METHODS_ACTIONS.GIFT_CARD,
	);
	const hasGiftCardPayment = typeof giftCardPayment !== "undefined";
	const giftCardTranslate = hasGiftCards ? anotherGiftCardTitle : giftCardTitle;
	const paymentTranslate = hasGiftCards ? payTheRestTranslate : payTranslate;
	const selectedMethod = useSelector((store) => store.selectedMethod);

	useEffect(() => {
		return () => {
			dispatch(Actions.resetSelectedMethod());
		};
	}, []);

	useEffect(() => {
		boxRef.current?.focus();
	}, []);

	function onGPayPaymentSuccess(data) {
		const gpayMethod = paymentMethods.filter(
			(paymentMethod) => paymentMethod.id === PAYMENT_METHODS.GOOGLE_PAY,
		)[0];
		const { paymentMethodData } = data;
		console.log("got gpay data", data);
		const payload = {
			paymentMethod: gpayMethod.action,
			amount: leftToPay,
			currency: gpayMethod.defaultCurrency,
			extraData: {
				token: paymentMethodData.tokenizationData.token,
			},
		};
		Api.addPayment({
			payload,
			onSuccess: (res) => {
				typeof submitOrder === "function" && submitOrder();
			},
		});
	}

	function onGiftCardClick() {
		const giftcardPaymentMethod = paymentMethods.filter(
			(paymentMethod) =>
				paymentMethod.action === PAYMENT_METHODS_ACTIONS.GIFT_CARD,
		);
		const promoPopups =
			giftcardPaymentMethod?.popups?.length > 0
				? giftcardPaymentMethod?.popups
				: [];
		let isStopper = false;
		if (Array.isArray(promoPopups) && promoPopups.length > 0) {
			dispatch(Actions.setPromoPopups(promoPopups));
			isStopper = promoPopups.some((pp) => pp.flowStopper == true);
			dispatch(Actions.setIsFlowStopper(isStopper));
			dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENT));
		}
		if (isStopper) return;
		const payload = { type: PAYMENT_SCREEN_TYPES.GIFT_CARD, params: {} };
		setStack(payload);
	}

	function getCurrentCustomButton() {
		switch (selectedMethod) {
			case PAYMENT_METHODS.GOOGLE_PAY:
				if (googlePayData?.data) {
					const gpayFormattedData = GooglePay.updateGooglePayRequestDataFields(
						googlePayData.data,
					);
					return (
						<GooglePayButton
							environment={googlePayData.data?.environment}
							paymentRequest={gpayFormattedData}
							onClick={() => {
								setStack({
									type: PAYMENT_SCREEN_TYPES.LOADER,
									params: {
										loaderText: "defaultPaymentLoaderText",
									},
								});
							}}
							onLoadPaymentData={(data) => {
								onGPayPaymentSuccess(data);
							}}
							onError={(err) => {
								console.log("err", err);
								setStack({
									type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
									params: {},
								});
								setCurrentButton();
							}}
							onCancel={(err) => {
								console.log("user canceled gpay", err);
								setStack({
									type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
									params: {},
								});
								setCurrentButton();
							}}
							onReadyToPayChange={(res) => {
								const googleButton = document.querySelector(
									".gpay-card-info-container",
								);
								googleButton?.focus();
								console.log("ready to pay", res);
							}}
						/>
					);
				} else {
					return null;
				}
			default:
				return null;
		}
	}

	function setCurrentButton(type = "", data = "") {
		switch (type) {
			case PAYMENT_METHODS.GOOGLE_PAY:
				setGooglePayData(data);
				break;
			default:
				setGooglePayData(null);
				break;
		}
	}

	return (
		<div
			className={styles["choose-payment-wrapper"]}
			ref={boxRef}>
			<h1
				className={styles["choose-payment-title"]}
				tabIndex={0}>
				{translate(paymentTranslate)}
			</h1>
			{paymentMethods && (
				<Methods
					setStack={setStack}
					paymentMethods={paymentMethods}
					getPaymentsPopups={getPaymentsPopups}
					setCurrency={setCurrency}
					currency={currency}
					leftToPay={leftToPay}
					goToTracker={goToTracker}
					onAddCreditCard={onAddCreditCard}
					getItemsAndListData={getItemsAndListData}
					onPaymentDone={onPaymentDone}
					setCurrentButton={setCurrentButton}
					submitOrder={submitOrder}
				/>
			)}
			{getCurrentCustomButton()}

			{hasGiftCardPayment ? (
				<TextOnlyButton
					className={styles["gift-card-title"]}
					onClick={onGiftCardClick}
					text={translate(giftCardTranslate)}
				/>
			) : null}
		</div>
	);
}

export default ChoosePayment;
