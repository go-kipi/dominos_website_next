import React, { useEffect, useRef, useState } from "react";
import * as popups from "popups/popup-types.js";
import PAYMENT_METHODS from "constants/PaymentMethods";
import Api from "api/requests";
import {
	ApplePayButton,
	BitButton,
	CashButton,
	CreditCardButton,
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

const PAYMENT_BOX_SIZES = {
	2: { large: 2, medium: 0, small: 0 },
	3: { large: 0, medium: 0, small: 3 },
	4: { large: 0, medium: 4, small: 0 },
	5: { large: 0, medium: 2, small: 3 },
	6: { large: 0, medium: 0, small: 6 },
};

function Methods(props) {
	const dispatch = useDispatch();
	const selectedMethod = useSelector((store) => store.selectedMethod);
	const {
		setStack,
		paymentMethods = [],
		setCurrency,
		getPaymentsPopups = [],
		leftToPay,
		setShowGPay,
		onAddCreditCard,
		getItemsAndListData,
		setCurrentButton,
		submitOrder,
	} = props;
	const deviceState = useSelector((store) => store.deviceState);
	const userData = useSelector((store) => store.userData);
	const order = useSelector((store) => store.order);
	const promoPopupsState = useSelector((store) => store.promoPopupsState);
	const isSafari = isSafariBrowser();
	const didAddGetPaymentsPopups =
		promoPopupsState === PROMO_POPUP_STATE_ENUM.GET_PAYMENTS;
	const [filteredPaymentList, setFilteredPaymentList] = useState(paymentMethods);

	const actionClick = {
		[PAYMENT_METHODS_ACTIONS.BIT]: () => onBitClick(),
		[PAYMENT_METHODS_ACTIONS.CASH]: () => onCashClick(),
		[PAYMENT_METHODS_ACTIONS.CREDIT_CARD]: onCreditCardClick,
		[PAYMENT_METHODS_ACTIONS.GOOGLE_PAY]: (data) => onGooglePayPress(data),
		[PAYMENT_METHODS_ACTIONS.APPLE_PAY]: (data) => onApplePayPress(data),
	};

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
			let filteredList = paymentMethods.filter(
				(method) => method.action !== PAYMENT_METHODS_ACTIONS.GIFT_CARD,
			);
			if (isSafari) {
				filteredList = filteredList.filter(
					(method) => method.action !== PAYMENT_METHODS_ACTIONS.GOOGLE_PAY,
				);
			} else {
				filteredList = filteredList.filter(
					(method) => method.action !== PAYMENT_METHODS_ACTIONS.APPLE_PAY,
				);
			}

			setFilteredPaymentList(filteredList);
		};
		filterByPlatform();
	}, [paymentMethods]);

	function RenderPaymentMethods() {
		const numberOfMethods = filteredPaymentList.length;
		const boxSizesObject = PAYMENT_BOX_SIZES[numberOfMethods];
		const components = [];

		let currentIndex = 0;

		Object.keys(boxSizesObject ?? {}).map((size, index) => {
			const numberOfSizeItems = boxSizesObject[size];
			for (let key = 0; key < numberOfSizeItems; key++) {
				const paymentMethod = filteredPaymentList[currentIndex];
				const component = RenderMethod(paymentMethod, size);
				components.push(component);
				currentIndex++;
			}
			return null;
		});
		return components;
	}

	function basicOnClick({ id, currency }) {
		dispatch(Actions.setSelectedMethod(id));
		setCurrency(currency);
	}

	function onCashClick() {
		const payload = { type: PAYMENT_SCREEN_TYPES.CASH, params: {} };
		setStack(payload);
	}

	function onBitClick() {
		const bitMethod = paymentMethods.filter(
			(paymentMethod) => paymentMethod.id === PAYMENT_METHODS.BIT,
		)[0];
		const payload = {
			paymentMethod: PAYMENT_METHODS.BIT,
			amount: leftToPay,
			currency: bitMethod.defaultCurrency,
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

	function onCreditCardClick({ currency }) {
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
		ApplePayService.isApplePayAvailable().then((canMakePayments) => {
			if (canMakePayments) {
				ApplePayService.setTransactionInfo(requestData);
				const payload = {
					type: PAYMENT_SCREEN_TYPES.APPLE_PAY,
					params: {
						paymentMethods,
						leftToPay,
					},
				};
				setStack(payload);
			}
		});
	}

	function RenderMethod(paymentMethod, size) {
		const method = paymentMethod.id;
		const isSelected = method === selectedMethod;
		const action = paymentMethod.action;
		const extraData = paymentMethod.extraData;
		const currency = paymentMethod.defaultCurrency;
		const promoPopups = paymentMethod?.popups;
		const onClickButton = actionClick[action];

		const btnProps = {
			size,
			isSelected,
			className: styles["method-payment-button"],
			onClick: () => basicOnClick({ id: method, currency }),
			key: "method-" + method,
			paymentMethod,
			onClickButton,
			extraData,
			leftToPay,
			setShowGPay,
			promoPopups,
			getItemsAndListData,
		};
		switch (method) {
			case PAYMENT_METHODS.APPPLE_PAY:
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
