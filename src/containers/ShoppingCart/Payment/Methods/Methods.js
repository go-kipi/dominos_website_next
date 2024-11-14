import React, { useEffect, useRef, useState } from "react";
import * as popups from "popups/popup-types.js";
import PAYMENT_METHODS from "constants/PaymentMethods";
import Api from "api/requests";
import {
	ApplePayButton,
	BitButton,
	CashButton,
	CreditCardButton,
	GiftCardButton,
	GooglePayButton,
} from "../MethodPaymentButtons/MethodPaymentButtons";

import styles from "./Methods.module.scss";
import * as Routes from "constants/routes";
import { PAYMENT_METHODS_ACTIONS } from "constants/payments-methods-types";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";
import { useDispatch, useSelector } from "react-redux";
import ApplePayService from "services/ApplePay";
// import useIsSafari from "hooks/useIsSafari";
import { getMobileOperatingSystem, isSafariBrowser } from "utils/functions";
import Actions from "redux/actions";
import BitService from "services/Bit";
import { PROMO_POPUP_STATE_ENUM } from "constants/operational-promo-popups-state";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

const PAYMENT_BOX_SIZES = {
	1: { large: 1, medium: 0, small: 0 },
	2: { large: 0, medium: 2, small: 0 },
	3: { large: 0, medium: 0, small: 3 },
	4: { large: 0, medium: 4, small: 0 },
	5: { large: 0, medium: 2, small: 3 },
	6: { large: 0, medium: 0, small: 6 },
	7: { large: 0, medium: 4, small: 3 },
	8: { large: 0, medium: 2, small: 6 },
	9: { large: 0, medium: 0, small: 9 },
};

function Methods(props) {
	const dispatch = useDispatch();
	const selectedMethod = useSelector((store) => store.selectedMethod);
	const {
		setStack,
		digitalPaymentMenu = [],
		paymentMenu = [],
		setCurrency,
		getPaymentsPopups = [],
		leftToPay,
		setShowGPay,
		onAddCreditCard,
		getItemsAndListData,
		setCurrentButton,
		submitOrder,
	} = props;
	const payments = useSelector((store) => store.payments);
	const paymentMethodElement = payments?.paymentTypes || [];
	const deviceState = useSelector((store) => store.deviceState);
	const userData = useSelector((store) => store.userData);
	const order = useSelector((store) => store.order);
	const promoPopupsState = useSelector((store) => store.promoPopupsState);
	const isSafari = isSafariBrowser();
	const didAddGetPaymentsPopups =
		promoPopupsState === PROMO_POPUP_STATE_ENUM.GET_PAYMENTS;
	const [filteredPaymentList, setFilteredPaymentList] = useState(
		digitalPaymentMenu.elements,
	);

	useEffect(() => {
		if (
			getPaymentsPopups.length > 0 &&
			!didAddGetPaymentsPopups &&
			order?.isShownedUpSales
		) {
			dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENTS));
		}
	}, [order, getPaymentsPopups]);

	useEffect(() => {
		const filterByPlatform = () => {
			let filteredList = digitalPaymentMenu?.elements || [];
			if (filteredList.length > 0) {
				filteredList = isSafari
					? filteredList.filter(
							(method) => method.id !== PAYMENT_METHODS_ACTIONS.GOOGLE_PAY,
					  )
					: filteredList.filter(
							(method) => method.id !== PAYMENT_METHODS_ACTIONS.APPLE_PAY,
					  );
			}

			setFilteredPaymentList(filteredList);
		};

		filterByPlatform();
	}, [digitalPaymentMenu.length, isSafari]);

	function RenderPaymentMethods() {
		const numberOfMethods = filteredPaymentList?.length;
		if (!numberOfMethods) return;
		const boxSizesObject = { ...PAYMENT_BOX_SIZES[numberOfMethods] };
		const components = [];
		const sizePriority = ["large", "medium", "small"];
		let currentIndex = 0;
		if (numberOfMethods === 1) {
			return filteredPaymentList.map((item) => renderMethod(item, "large"));
		}

		filteredPaymentList.forEach((item) => {
			let selectedSize = null;

			// Select the size based on availability from large to small
			for (let size of sizePriority) {
				if (boxSizesObject[size] > 0) {
					selectedSize = size;
					boxSizesObject[size]--; // Decrement the count for this size
					break;
				}
			}

			if (!selectedSize) {
				console.warn("No available sizes left, defaulting to small");
				selectedSize = "small";
			}

			// Render the item with the selected size
			const component = renderMethod(item, selectedSize);
			components.push(component);
			currentIndex++;

			// Reset index if we've reached the maximum number of items per row
			if (currentIndex % 3 === 0) {
				currentIndex = 0;
			}
		});

		return components;
	}

	function basicOnClick({ id, currency, promoPopups }) {
		dispatch(Actions.setSelectedMethod(id));
		setCurrency(currency);

		// ADD A GENERAL CODE:
		let isStopper = false;
		if (Array.isArray(promoPopups) && promoPopups.length > 0) {
			dispatch(Actions.setPromoPopups(promoPopups));
			isStopper = promoPopups.some((pp) => pp.flowStopper == true);
			dispatch(Actions.setIsFlowStopper(isStopper));
			dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENT));
		}

		if (isStopper) return;

		const [items, listData] = getItemsAndListData();
		const newList = {
			...listData,
			payment_type: id,
			currency: paymentMethodElement.defaultCurrency,
		};
		AnalyticsService.addPaymentInfo(items, newList);
	}

	function onCashClick() {
		const payload = { type: PAYMENT_SCREEN_TYPES.CASH, params: {} };
		setStack(payload);
	}

	function onBitClick() {
		const currency = paymentMethodElement.find(
			(el) => el.id === PAYMENT_METHODS.BIT,
		)?.defaultCurrency;

		const payload = {
			paymentMethod: PAYMENT_METHODS.BIT,
			amount: leftToPay,
			currency: currency,
		};
		dispatch(Actions.setLoader(true));
		Api.addPayment({
			payload,
			onSuccess: (res) => {
				const data = res.extraData;
				const uuid = res.uuid;
				const { applicationSchemeAndroid, redirect, applicationSchemeIos } = data;
				const host = window.location.origin + "/" + Routes.bit;
				const websitelink =
					"%26return_scheme%3D" + encodeURIComponent(encodeURIComponent(host));
				const os = getMobileOperatingSystem();

				const isIOS = os === "iOS";
				const callbackUrl =
					(isIOS ? applicationSchemeIos : applicationSchemeAndroid) + websitelink;

				const params = applicationSchemeIos.split("i=")[1];
				const [orderId, orderTransactionId] = params.split("&j=");
				BitService.setTransactionIds(orderTransactionId, orderId);

				if (!redirect) {
					setStack({
						type: PAYMENT_SCREEN_TYPES.BIT_DONE,
						params: {},
					});
				} else {
					setStack({
						type: PAYMENT_SCREEN_TYPES.BIT,
						params: { bitUrl: callbackUrl, bitUUID: uuid, redirect },
					});
				}
				dispatch(Actions.setLoader(false));
			},
		});
	}

	function onCreditCardClick(props) {
		const { currency } = props;
		const payload = {
			type: PAYMENT_SCREEN_TYPES.CREDIT_CARD,
			params: {
				leftToPay,
				currency: currency,
			},
		};
		if (
			Array.isArray(userData.savedCreditCards) &&
			userData.savedCreditCards.length > 0
		) {
			setStack(payload);
		} else {
			const payload = {
				paymentMethod: PAYMENT_METHODS.CREDIT_CARD,
				amount: leftToPay,
				currency: currency,
				extraData: {},
			};
			Api.addPayment({
				payload,
				onSuccess: onSuccess,
			});

			function onSuccess(data) {
				const iframeUrl = data.extraData.frameUrl;
				if (deviceState.isMobile) {
					dispatch(
						Actions.addPopup({
							type: popups.ADD_CREDIT_CARD_FULLSCREEN,
							payload: {
								iframeUrl: iframeUrl,
								onAddCreditCardCallback: (token) => {
									typeof submitOrder === "function" && submitOrder();
								},
							},
						}),
					);
				} else {
					typeof onAddCreditCard === "function" && onAddCreditCard(iframeUrl);
				}
			}
		}
	}

	function onGooglePayPress(requestData) {
		setCurrentButton(PAYMENT_METHODS.GOOGLE_PAY, requestData);
	}

	function onApplePayPress(requestData) {
		const getApplePayPaymentData = (data) => {
			let tempData = {};
			if (data && typeof data === "object") {
				tempData = JSON.parse(JSON.stringify(data));
				tempData.total.amount = leftToPay;
			}
			return tempData;
		};

		ApplePayService.isApplePayAvailable().then((canMakePayments) => {
			if (canMakePayments) {
				ApplePayService.setTransactionInfo(requestData);
				const payload = {
					type: PAYMENT_SCREEN_TYPES.APPLE_PAY,
					params: {
						paymentMenu: paymentMethodElement,
						leftToPay,
					},
				};
				setStack(payload);
			}
		});
	}

	function onGiftCardClick() {
		const payload = { type: PAYMENT_SCREEN_TYPES.GIFT_CARD_OPTIONS, params: {} };
		setStack(payload);
	}

	function onClickByActionType(actionType, id) {
		const paymentActions = {
			[PAYMENT_METHODS.CREDIT_CARD]: (data) => onCreditCardClick(data),
			[PAYMENT_METHODS.BIT]: () => onBitClick(),
			[PAYMENT_METHODS.GOOGLE_PAY]: (data) => onGooglePayPress(data),
			[PAYMENT_METHODS.APPLE_PAY]: (data) => onApplePayPress(data),
			[PAYMENT_METHODS.CASH]: () => onCashClick(),
		};

		switch (actionType) {
			case "payment":
				if (paymentActions[id]) {
					return paymentActions[id]; // Return the appropriate function for the payment method
				} else {
					console.warn("Unknown payment method:", id);
					return null;
				}

			case "subMenu":
				return () => onGiftCardClick();

			default:
				return () => {
					console.warn("Action type was not recognized:", actionType);
				};
		}
	}

	function renderMethod(paymentMethod, size) {
		const { actionType, id: method, action } = paymentMethod;
		const isSelected = method === selectedMethod;

		const paymentMethodData = paymentMethodElement.find((el) => el.id === method);
		const currency = paymentMethodData?.defaultCurrency;
		const extraData = paymentMethodData?.extraData;

		const promoPopups = paymentMethodData?.popups;
		console.log("promoPopups", promoPopups);
		const onClickButton = onClickByActionType(actionType, method);
		const btnProps = {
			size,
			isSelected,
			className: styles["method-payment-button"],
			onClick: () => basicOnClick({ id: method, currency }, promoPopups),
			key: "method-" + method,
			paymentMethodElement,
			paymentMethod: paymentMethodData,
			onClickButton,
			extraData,
			leftToPay,
			setShowGPay,
			promoPopups,
			getItemsAndListData,
			paymentMenu,
		};

		switch (method) {
			case PAYMENT_METHODS.APPLE_PAY:
				return <ApplePayButton {...btnProps} />;
			case PAYMENT_METHODS.GOOGLE_PAY:
				return <GooglePayButton {...btnProps} />;
			case PAYMENT_METHODS.CASH:
				return <CashButton {...btnProps} />;
			case PAYMENT_METHODS.CREDIT_CARD:
				return <CreditCardButton {...btnProps} />;
			case PAYMENT_METHODS.BIT:
				return (
					<BitButton
						onBitClick={onBitClick}
						{...btnProps}
					/>
				);
			case PAYMENT_METHODS.GIFT_CARD:
				return <GiftCardButton {...btnProps} />;
			default:
				return null;
		}
	}

	return (
		<div className={styles["methods-wrapper"]}>
			<div className={styles["methods"]}>{RenderPaymentMethods()}</div>
		</div>
	);
}

export default Methods;
