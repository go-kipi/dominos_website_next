import PAYMENT_METHODS from "constants/PaymentMethods";
import React, { useRef } from "react";
import GooglePay from "services/GooglePay";

import ApplePayIcon from "/public/assets/icons/payment/apple-pay.svg";
import GooglePayIcon from "/public/assets/icons/payment/google-pay.svg";
import CreditCard from "/public/assets/icons/payment/credit-card.svg";
import Cash from "/public/assets/icons/payment/cash.svg";
import Bit from "/public/assets/icons/payment/bit.svg";
import GiftCard from "/public/assets/icons/payment/gift-card.svg";

import styles from "./MethodPaymentButtons.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "../../../../utils/analyticsService/AnalyticsService";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import { PROMO_POPUP_STATE_ENUM } from "constants/operational-promo-popups-state";

export default function PaymentButton(props) {
	const {
		image,
		title,
		onClick,
		size,
		isSelected = false,
		id,
		className = "",
	} = props;

	const isDisabledOnEditMode = useSelector(
		(store) => store.isEditGiftCardMode.isEditMode,
	);

	const isLarge = size === "large";
	const isMedium = size === "medium";
	const isSmall = size === "small";

	function onClickHandler() {
		typeof onClick === "function" && onClick(id);
	}

	const btnClassName = clsx(
		isLarge ? styles["large-box"] : "",
		isMedium ? styles["medium-box"] : "",
		isSmall ? styles["small-box"] : "",
		isSelected ? styles["selected-box"] : "",
		className,
	);

	return (
		<button
			onClick={onClickHandler}
			disabled={isDisabledOnEditMode}
			className={clsx(styles["payment-button-basic"], btnClassName)}>
			<div
				className={clsx(
					styles["payment-button-image"],
					isLarge ? styles["large-icon"] : styles["icon"],
				)}>
				<img
					src={image.src}
					aria-hidden={true}
				/>
			</div>
			<span className={styles["payment-button-title"]}>{title}</span>
		</button>
	);
}

export function ApplePayButton(props) {
	const getApplePayPaymentData = (data) => {
		let tempData = {};
		if (data && typeof data === "object") {
			tempData = JSON.parse(JSON.stringify(data));
			tempData.total.amount = leftToPay;
		}
		return tempData;
	};
	const {
		size,
		isSelected,
		onClick,
		className = "",
		paymentMethod,
		onClickButton,
		extraData,
		leftToPay,
		getItemsAndListData,
		promoPopups,
	} = props;
	const dispatch = useDispatch();
	const image = ApplePayIcon;
	const translate = useTranslate();
	const title = translate("payment_method_applePay");
	let data = extraData && typeof extraData === "object" ? extraData : null;
	const id = PAYMENT_METHODS.APPLE_PAY;

	function onClickHandler() {
		let isStopper = false;
		if (Array.isArray(promoPopups) && promoPopups.length > 0) {
			dispatch(Actions.setPromoPopups(promoPopups));
			isStopper = promoPopups.some((pp) => pp.flowStopper == true);
			dispatch(Actions.setIsFlowStopper(isStopper));
			dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENT));
		}
		if (isStopper) return;
		typeof onClick === "function" &&
			onClick({ id, currency: paymentMethod.defaultCurrency });
		data = getApplePayPaymentData(data);
		typeof onClickButton === "function" && onClickButton(data);

		const [items, listData] = getItemsAndListData();
		const newList = {
			...listData,
			payment_type: id,
			currency: paymentMethod.defaultCurrency,
		};
		AnalyticsService.addPaymentInfo(items, newList);
	}

	const btnProps = {
		size,
		isSelected,
		image,
		title,
		id,
		onClick: onClickHandler,
		className,
	};
	return <PaymentButton {...btnProps} />;
}

export function GooglePayButton(props) {
	const {
		size,
		isSelected,
		onClick,
		className = "",
		paymentMethod,
		onClickButton,
		extraData,
		leftToPay,
		getItemsAndListData,
		promoPopups,
	} = props;
	const dispatch = useDispatch();
	const image = GooglePayIcon;
	const translate = useTranslate();
	const title = translate("payment_method_googlePay");
	let data = extraData && typeof extraData === "object" ? extraData : null;
	const id = PAYMENT_METHODS.GOOGLE_PAY;

	function onClickHandler() {
		let isStopper = false;
		if (Array.isArray(promoPopups) && promoPopups.length > 0) {
			dispatch(Actions.setPromoPopups(promoPopups));
			isStopper = promoPopups.some((pp) => pp.flowStopper == true);
			dispatch(Actions.setIsFlowStopper(isStopper));
			dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENT));
		}
		if (isStopper) return;
		typeof onClick === "function" &&
			onClick({ id, currency: paymentMethod.defaultCurrency });
		const formattedData = {
			data: GooglePay.formatGooglePayRequestData(data, leftToPay),
		};
		typeof onClickButton === "function" && onClickButton(formattedData);

		const [items, listData] = getItemsAndListData();
		const newList = {
			...listData,
			payment_type: id,
			currency: paymentMethod.defaultCurrency,
		};
		AnalyticsService.addPaymentInfo(items, newList);
	}

	const btnProps = {
		size,
		isSelected,
		image,
		title,
		id,
		onClick: onClickHandler,
		className,
	};
	return <PaymentButton {...btnProps} />;
}

export function BitButton(props) {
	const {
		size,
		isSelected,
		onClick,
		onClickButton,
		onBitClick,
		setShowGPay,
		paymentMethod,
		className = "",
		getItemsAndListData,
		promoPopups,
	} = props;
	const dispatch = useDispatch();
	const image = Bit;
	const translate = useTranslate();
	const title = translate("payment_method_bit");

	const id = PAYMENT_METHODS.BIT;

	function onClickHandler() {
		let isStopper = false;
		if (Array.isArray(promoPopups) && promoPopups.length > 0) {
			dispatch(Actions.setPromoPopups(promoPopups));
			isStopper = promoPopups.some((pp) => pp.flowStopper == true);
			dispatch(Actions.setIsFlowStopper(isStopper));
			dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENT));
		}
		if (isStopper) return;
		typeof setShowGPay === "function" && setShowGPay(false);
		typeof onClick === "function" &&
			onClick({ id, currency: paymentMethod.defaultCurrency });
		typeof onBitClick === "function" && onBitClick();
		const [items, listData] = getItemsAndListData();
		const newList = {
			...listData,
			payment_type: id,
			currency: paymentMethod.defaultCurrency,
		};
		AnalyticsService.addPaymentInfo(items, newList);
	}

	const btnProps = {
		size,
		isSelected,
		image,
		title,
		id,
		onClick: onClickHandler,
		className,
	};
	return <PaymentButton {...btnProps} />;
}

export function CashButton(props) {
	const {
		size,
		isSelected,
		onClick,
		className = "",
		paymentMethod,
		onClickButton,
		setShowGPay,
		getItemsAndListData,
		promoPopups,
	} = props;
	const dispatch = useDispatch();
	const translate = useTranslate();
	const image = Cash;
	const title = translate("payment_method_cash");

	const id = PAYMENT_METHODS.CASH;

	function onClickHandler() {
		let isStopper = false;
		if (Array.isArray(promoPopups) && promoPopups.length > 0) {
			dispatch(Actions.setPromoPopups(promoPopups));
			isStopper = promoPopups.some((pp) => pp.flowStopper == true);
			dispatch(Actions.setIsFlowStopper(isStopper));
			dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENT));
		}
		if (isStopper) return;
		typeof setShowGPay === "function" && setShowGPay(false);
		typeof onClick === "function" &&
			onClick({ id, currency: paymentMethod.defaultCurrency });

		typeof onClickButton === "function" && onClickButton();

		const [items, listData] = getItemsAndListData();
		const newList = {
			...listData,
			payment_type: id,
			currency: paymentMethod.defaultCurrency,
		};
		AnalyticsService.addPaymentInfo(items, newList);
	}

	const btnProps = {
		size,
		isSelected,
		image,
		title,
		id,
		onClick: onClickHandler,
		className,
	};
	return <PaymentButton {...btnProps} />;
}

export function CreditCardButton(props) {
	const {
		size,
		isSelected,
		onClick,
		className = "",
		paymentMethod,
		onClickButton,
		setShowGPay,
		promoPopups,
		getItemsAndListData,
	} = props;
	const dispatch = useDispatch();
	const image = CreditCard;
	const translate = useTranslate();
	// const isCreditModalOpen = useSelector((store) => store.isCreditModalOpen);
	const title = translate("payment_method_credit_card");
	const isMobile = useSelector((store) => store.deviceState.isMobile);

	const id = PAYMENT_METHODS.CREDIT_CARD;

	function onClickHandler() {
		// if (isCreditModalOpen) return;
		// dispatch(Actions.setIsCreditModalOpen(true));
		let isStopper = false;
		if (Array.isArray(promoPopups) && promoPopups.length > 0) {
			dispatch(Actions.setPromoPopups(promoPopups));
			isStopper = promoPopups.some((pp) => pp.flowStopper == true);
			dispatch(Actions.setIsFlowStopper(isStopper));
			dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENT));
		}
		if (isStopper) return;
		typeof setShowGPay === "function" && setShowGPay(false);
		typeof onClick === "function" &&
			onClick({ id, currency: paymentMethod.defaultCurrency });
		typeof onClickButton === "function" &&
			onClickButton({ currency: paymentMethod.defaultCurrency });

		const [items, listData] = getItemsAndListData();
		const newList = {
			...listData,
			payment_type: id,
			currency: paymentMethod.defaultCurrency,
		};
		AnalyticsService.addPaymentInfo(items, newList);
	}

	const btnProps = {
		size,
		isSelected,
		image,
		title,
		id,
		onClick: onClickHandler,
		className,
	};
	return <PaymentButton {...btnProps} />;
}

export function GiftCardButton(props) {
	const {
		size,
		isSelected,
		onClick,
		className = "",
		paymentMethodElement,
		onClickButton,
		setShowGPay,
		getItemsAndListData,
		promoPopups,
		paymentMenu,
	} = props;

	const dispatch = useDispatch();
	const translate = useTranslate();
	const image = GiftCard;
	const title = translate("payment_giftCard_title");

	const id = PAYMENT_METHODS.GIFT_CARD;

	function onClickHandler() {
		return onClickButton();
	}

	const btnProps = {
		size,
		isSelected,
		image,
		title,
		id,
		onClick: onClickHandler,
		className,
	};
	return <PaymentButton {...btnProps} />;
}

// export function CibusButton(props) {
// 	const {
// 		size,
// 		isSelected,
// 		onClick,
// 		className = "",
// 		paymentMethodElement,
// 		onClickButton,
// 		setShowGPay,
// 		promoPopups,
// 		getItemsAndListData,
// 	} = props;
// 	const dispatch = useDispatch();
// 	const image = CreditCard;
// 	const translate = useTranslate();
// 	const isCreditModalOpen = useSelector((store) => store.isCreditModalOpen);
// 	const title = translate("payment_method_credit_card");
// 	const isMobile = useSelector((store) => store.deviceState.isMobile);

// 	const id = PAYMENT_METHODS.CREDIT_CARD;

// 	// function onClickHandler() {
// 	// 	if (isCreditModalOpen) return;
// 	// 	dispatch(Actions.setIsCreditModalOpen(true));
// 	// 	let isStopper = false;
// 	// 	if (Array.isArray(promoPopups) && promoPopups.length > 0) {
// 	// 		dispatch(Actions.setPromoPopups(promoPopups));
// 	// 		isStopper = promoPopups.some((pp) => pp.flowStopper == true);
// 	// 		dispatch(Actions.setIsFlowStopper(isStopper));
// 	// 		dispatch(Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.GET_PAYMENT));
// 	// 	}
// 	// 	if (isStopper) return;
// 	// 	typeof setShowGPay === "function" && setShowGPay(false);
// 	// 	typeof onClick === "function" &&
// 	// 		onClick({ id, currency: paymentMethodElement.defaultCurrency });
// 	// 	typeof onClickButton === "function" &&
// 	// 		onClickButton({ currency: paymentMethodElement.defaultCurrency });

// 		// const [items, listData] = getItemsAndListData();
// 		// const newList = {
// 		// 	...listData,
// 		// 	payment_type: id,
// 		// 	currency: paymentMethodElement.defaultCurrency,
// 		// };
// 		// AnalyticsService.addPaymentInfo(items, newList);
// 	}

// 	const btnProps = {
// 		size,
// 		isSelected,
// 		image,
// 		title,
// 		id,
// 		onClick: onClickHandler,
// 		className,
// 	};
// 	return <PaymentButton {...btnProps} />;
// }
