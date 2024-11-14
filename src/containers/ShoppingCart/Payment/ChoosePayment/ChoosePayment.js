import React, { useEffect, useRef, useState } from "react";
import Methods from "../Methods/Methods";
import GooglePayButton from "@google-pay/button-react";
import ApplePayButton from "components/ApplePayButton/ApplePayButton";
import styles from "./ChoosePayment.module.scss";
import stylesFree from "../Free/Free.module.scss";
import Api from "api/requests";
import ApplePayService from "services/ApplePay";
import GooglePay from "services/GooglePay";
import PAYMENT_METHODS from "constants/PaymentMethods";
import useTranslate from "hooks/useTranslate";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";

import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import GiftCardRowItem from "containers/ShoppingCart/components/GiftCardRowItem";
import Price from "components/Price";

import PizzaBox from "/public/assets/icons/pizza-box-hearts.svg";
import clsx from "clsx";
import Button from "components/button";
function ChoosePayment(props) {
	const anotherGiftCardTitle = "shoppingCart_payment_giftCard_anothertitle";
	const giftCardTitle = "shoppingCart_payment_giftCard_title";
	const {
		setStack,
		paymentMenu,
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
		paidGiftCards,
		isLeftToPayZero,
	} = props;

	const titleTranslationKey = hasGiftCards
		? "shoppingCart_payment_choosePayment_alternatetitle"
		: "shoppingCart_payment_choosePayment_title";
	const boxRef = useRef();
	const [googlePayData, setGooglePayData] = useState(null);
	const translate = useTranslate();
	const dispatch = useDispatch();
	const buttonText = translate("send_the_order_to_the_branch");
	const isLeftToPay = leftToPay <= 0;
	const digitalPaymentMenu = paymentMenu.find(
		(menu) => menu?.id === "digitalPayments",
	);

	const isEditMode = useSelector((store) => store.isEditGiftCardMode);

	const selectedMethod = useSelector((store) => store.selectedMethod);
	const payments = useSelector((store) => store.payments);

	//TODO: TRY TO IMPLEMENT THIS: when the use delete all the gift cards this is return to the page - choose payment

	useEffect(() => {
		if (payments?.paid?.length === 0) {
			const payload = { type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT, params: {} };
			setStack(payload);
		}
	}, [payments?.paid?.length]);

	useEffect(() => {
		boxRef.current?.focus();

		return () => {
			dispatch(Actions.resetSelectedMethod());
		};
	}, []);

	function onGPayPaymentSuccess(data) {
		const gpayMethod = payments.paymentTypes.filter(
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

	function getCurrentCustomButton() {
		// Check if Google Pay is selected and googlePayData is available
		if (selectedMethod === PAYMENT_METHODS.GOOGLE_PAY && googlePayData?.data) {
			const gpayFormattedData = GooglePay.updateGooglePayRequestDataFields(
				googlePayData.data,
			);

			return (
				<GooglePayButton
					environment={googlePayData.data?.environment}
					paymentRequest={gpayFormattedData}
					onClick={() =>
						setStack({
							type: PAYMENT_SCREEN_TYPES.LOADER,
							params: { loaderText: "defaultPaymentLoaderText" },
						})
					}
					onLoadPaymentData={(data) => onGPayPaymentSuccess(data)}
					onError={(err) => {
						console.error("Google Pay error", err);
						setStack({ type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT, params: {} });
						setCurrentButton(); // Reset the button in case of error
					}}
					onCancel={(err) => {
						console.log("User canceled Google Pay", err);
						setStack({ type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT, params: {} });
						setCurrentButton(); // Reset the button when payment is canceled
					}}
					onReadyToPayChange={(res) => {
						document.querySelector(".gpay-card-info-container")?.focus();
						console.log("ready to pay", res);
					}}
				/>
			);
		}

		// If not Google Pay, return null
		return null;
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

	function renderMethods() {
		return (
			<Methods
				setStack={setStack}
				digitalPaymentMenu={digitalPaymentMenu}
				paymentMenu={paymentMenu}
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
		);
	}

	function renderThereIsNothingMoreToPay() {
		return (
			<div
				className={clsx(
					stylesFree["free-wrapper"],
					hasGiftCards ? styles["has-giftcard"] : "",
				)}>
				<div className={stylesFree["pizza-box-hearts-wrapper"]}>
					<img src={PizzaBox.src} />
				</div>

				<h1
					className={stylesFree["free-subtitle"]}
					aria-live={"polite"}>
					{translate("zero_ledt_to_pay_title")}
				</h1>
				<div
					className={clsx(
						stylesFree["actions"],
						hasGiftCards ? stylesFree["has-gift-card"] : "",
					)}>
					<Button
						className={stylesFree["button-accept"]}
						text={buttonText}
						// onClick={onClickHandler}
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			className={styles["choose-payment-wrapper"]}
			ref={boxRef}>
			{!hasGiftCards && (
				<h1
					className={styles["choose-payment-title"]}
					tabIndex={0}>
					{translate(titleTranslationKey)}
				</h1>
			)}

			{hasGiftCards && (
				<>
					<RenderTotalAmountLeftToPay />
					<RenderRowLeftToPay />
					<h1
						className={styles["choose-payment-title"]}
						tabIndex={0}>
						{isLeftToPay ? "" : translate(titleTranslationKey)}
					</h1>
				</>
			)}

			{paymentMenu.length > 0 ? renderMethods() : null}

			{/* : isLeftToPay
				 ? renderThereIsNothingMoreToPay() */}

			{/* Custom Payment Button */}
			{getCurrentCustomButton()}
		</div>
	);
}

export default ChoosePayment;

export function RenderRowLeftToPay() {
	const payments = useSelector((store) => store.payments);
	const cartItems = useSelector((store) => store.cartData);
	console.log("payments", payments);
	const paidGiftCards = payments?.paid;
	const leftToPay = payments?.leftToPay;

	const getPayments = () => {
		const payload = {};
		Api.getPayments({ payload, onSuccess });

		function onSuccess(data) {
			const promoPopups = data?.popups;

			if (
				Array.isArray(promoPopups) &&
				promoPopups.length > 0 &&
				getPaymentsPopups.length === 0 &&
				!didAddGetPaymentsPopups
			) {
				setGetPaymentsPopups(promoPopups);
			}
		}
	};

	function onGiftCardDelete(uuid) {
		const payload = { id: uuid };
		Api.deletePayment({
			payload,
			onSuccess: () => {
				getPayments();
			},
		});
	}

	function onGiftCardUpdate(uuid, price, callback) {
		const payload = { uuid, total: Number(price) };
		Api.changePaymentSum({
			payload,
			onSuccess: () => {
				typeof callback === "function" && callback();
				getPayments();
			},
		});
	}
	console.log("paidGiftCards", paidGiftCards);
	return paidGiftCards.length > 0 ? (
		<div className={styles["gift-cards-list-container"]}>
			<div className={styles["gradient-top-list"]}></div>
			<div className={styles["gift-cards-list"]}>
				{[
					...paidGiftCards,
					// ...paidGiftCards,
					// ...paidGiftCards,
					// ...paidGiftCards,
					// ...paidGiftCards,
					// ...paidGiftCards,
				].map((gc, index) => {
					const { cardMask } = gc.extra;
					const lastIndex = cardMask?.length;
					const lastFourDigits = cardMask?.substring(lastIndex - 4, lastIndex);
					return (
						<GiftCardRowItem
							uuid={gc?.uuid}
							price={gc?.total}
							total={cartItems.total}
							lastFourDigits={lastFourDigits}
							onUpdate={(uuid, price, callback) =>
								onGiftCardUpdate(uuid, price, callback)
							}
							onDelete={(uuid) => onGiftCardDelete(uuid)}
							key={"gift-card-row" + index}
						/>
					);
				})}
			</div>
			<div className={styles["gradient-bottom-list"]}></div>
		</div>
	) : null;
}

export function RenderTotalAmountLeftToPay() {
	const translate = useTranslate();
	const payments = useSelector((store) => store.payments);

	const leftToPay = payments?.leftToPay;

	return (
		<div className={styles["left-to-pay-container"]}>
			<span className={styles["left-to-pay-title"]}>
				{translate("left_to_pay_title")}
			</span>
			<div className={styles["payment-price-wrapper"]}>
				{leftToPay !== undefined && (
					<Price
						value={leftToPay}
						className={styles["payment-price"]}
						extraStyles={styles}
						readPrice={true}
					/>
				)}
			</div>
		</div>
	);
}
