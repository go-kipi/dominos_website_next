import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import Api from "api/requests";
import GiftCardWhiteIcon from "/public/assets/icons/gift-card-item.svg";
import GiftCardBlackIcon from "/public/assets/icons/gift-card-item-black.svg";
import TrashWhiteIcon from "/public/assets/icons/trash.svg";
import EditWhiteIcon from "/public/assets/icons/edit.svg";
import TrashBlueIcon from "/public/assets/icons/blue-trash-icon.svg";
import EditBlueIcon from "/public/assets/icons/blue-edit-icon.svg";
import AcceptBlueIcon from "/public/assets/icons/blue-checkmark-icon.svg";
import CancelBlueIcon from "/public/assets/icons/blue-cancel-icon.svg";
import AcceptWhiteIcon from "/public/assets/icons/white-checkmark-icon.svg";
import CancelWhiteIcon from "/public/assets/icons/white-cancel-icon.svg";
import { useDispatch, useSelector } from "react-redux";
import TextInput from "components/forms/textInput";
import Price from "components/Price";
import useTranslate from "hooks/useTranslate";
import Button from "components/button";
import Actions from "redux/actions";
import { getFullMediaUrl } from "utils/functions";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";

const GIFT_CARD_MINIMUM = 0.09;

export default function GiftCardRowItem(props) {
	const {
		uuid = "",
		price,
		total,
		lastFourDigits = "",
		onUpdate,
		onDelete,
	} = props;
	const translate = useTranslate();
	const [isEdit, setIsEdit] = useState(false);
	const [currentPrice, setCurrentPrice] = useState(price ?? 0);
	const [balance, setBalance] = useState(currentPrice);
	const deviceState = useSelector((store) => store.deviceState);
	const payments = useSelector((store) => store.payments);
	const paymentsPaid = payments?.paid;
	const paymentsType = payments?.paymentTypes;
	const totalBasket = useSelector((store) => store.cartData?.total);
	const [isErrorStyle, setIsErrorStyle] = useState(false);
	const dispatch = useDispatch();
	const GiftCardIcon =
		deviceState.isMobile || deviceState.isTablet
			? GiftCardWhiteIcon
			: GiftCardBlackIcon;

	const EditIcon = EditBlueIcon;
	const TrashIcon = TrashBlueIcon;
	const AcceptIcon =
		deviceState.isMobile || deviceState.isTablet
			? AcceptBlueIcon
			: AcceptWhiteIcon;
	const CancelIcon = CancelBlueIcon;
	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);
	const giftCardPrice = Number(currentPrice);
	const isAboveMinimum = GIFT_CARD_MINIMUM < giftCardPrice;
	const isBelowMaximum = total >= giftCardPrice;
	const isPriceOverrunByGC =
		paymentsPaid.length > 1 ? checkIsAboveLeftToPay() : false;

	const errorMessage = !isAboveMinimum
		? translate("giftCartRow_errorMessage_belowMinimum")
		: !isBelowMaximum
		? translate("giftCartRow_errorMessage_aboveMaximum")
		: isPriceOverrunByGC
		? translate("giftCartRow_errorMessage_aboveLeftToPatWithGC")
		: "";

	useEffect(() => {
		const balanceValue = findBalanceById();
		setBalance(balanceValue);
	}, [paymentsPaid.length, paymentsPaid]);

	useEffect(() => {
		dispatch(Actions.setIsEditGiftCardMode({ uuid, isEdit }));

		return () => {
			if (isEdit) {
				dispatch(Actions.setIsEditGiftCardMode({ uuid, isEdit: false }));
			}
		};
	}, [isEdit, uuid, dispatch]);

	useEffect(() => {
		if (giftCardPrice > balance) {
			setIsErrorStyle(true);
		} else {
			setIsErrorStyle(false);
		}
	}, [currentPrice]);

	function checkIsAboveLeftToPay() {
		const rowPrice = findCurrPayment().total;
		const leftToPayByTotal = paymentsPaid.reduce(
			(acc, payment) => acc + payment.total,
			0,
		);
		const calcPriceOverrun =
			Number(leftToPayByTotal) - Number(rowPrice) + Number(currentPrice);
		return calcPriceOverrun > totalBasket;
	}

	function findBalanceById() {
		const currPayment = findCurrPayment();

		return currPayment ? currPayment.extra.balance : null;
	}

	function findCurrPayment() {
		const currPayment = paymentsPaid?.find((payment) => payment.uuid === uuid);
		return currPayment;
	}

	function findPaymentTypeByMethod(method) {
		return paymentsType?.find((payment) => payment.id === method);
	}

	function getPaymentImg() {
		const currPayment = findCurrPayment();
		const paymentsType = findPaymentTypeByMethod(currPayment?.method);
		const imgUrl = getFullMediaUrl(
			paymentsType,
			MEDIA_TYPES.MENU,
			MEDIA_ENUM.SELECTED_WEB,
		);

		return imgUrl;
	}

	function onEditPress() {
		setIsEdit(true);
	}

	const onDeclinePress = () => {
		setCurrentPrice(`${price}`);
		setIsEdit(false);
	};

	const handleChangeText = (event) => {
		const text = event.target.value;
		const floatRegex = /^\d+\.\d{3,}$/;
		const result = text.match(floatRegex);
		if (!result) {
			setCurrentPrice(text);
		}
	};

	const onUpdatePrice = () => {
		if (
			isAboveMinimum &&
			isBelowMaximum &&
			!isPriceOverrunByGC &&
			!isErrorStyle
		) {
			typeof onUpdate === "function" &&
				onUpdate(uuid, currentPrice, () => setIsEdit(false));
		}
	};

	const onDeletePress = () => {
		typeof onDelete === "function" && onDelete(uuid);
	};
	const floatingPrice = Number(currentPrice).toFixed(displayDecimalPoint);

	return (
		<div
			className={styles["gift-card-row-item"]}
			style={{ backgroundColor: !isEdit ? "#f6f6f6" : "" }}>
			<div className={styles["gift-card-right"]}>
				<div className={styles["gift-card-icon-digits"]}>
					<div className={styles["card-brand-icon"]}>
						<img
							src={getPaymentImg()}
							alt=""
						/>
					</div>
					{!isEdit ? (
						<>
							<span className={styles["gift-card-digits"]}>{lastFourDigits}</span>
							<Price
								value={floatingPrice}
								extraStyles={styles}
							/>
						</>
					) : (
						<div className={styles["price-input-container"]}>
							<div>
								<TextInput
									autoFocus
									showError={!isAboveMinimum || !isBelowMaximum || isPriceOverrunByGC}
									errorMessage={errorMessage}
									className={styles["price-input-wrapper"]}
									inputClassName={styles["price-input"]}
									onChange={(e) => handleChangeText(e)}
									type="number"
									value={currentPrice}
									name={"price-input"}
									extraStyles={styles}
								/>
								<span className={styles["text-input-currency-icon"]}>₪</span>
							</div>
							<span
								className={`${styles["amount-of-money-in-card"]} ${
									isErrorStyle ? styles["error-style"] : ""
								}`}>
								{isAboveMinimum &&
									isBelowMaximum &&
									!isPriceOverrunByGC &&
									translate("amount_of_money_in_gc").replace("{balance}", balance)}
							</span>
						</div>
					)}
				</div>
			</div>
			<div className={styles["gift-card-left"]}>
				{!isEdit ? (
					<>
						<div
							onClick={onEditPress}
							className={styles["gift-card-edit"]}>
							<img src={EditIcon.src} />
						</div>
						<div
							onClick={onDeletePress}
							className={styles["gift-card-delete"]}>
							<img src={TrashIcon.src} />
						</div>
					</>
				) : (
					<>
						<Button
							text={translate("confirm_amount_of_money")}
							onClick={onUpdatePrice}
							className={styles["confrim-btn"]}
							animated={false}
						/>

						<div
							onClick={onDeclinePress}
							className={styles["gift-card-delete"]}>
							<img src={CancelIcon.src} />
						</div>
					</>
				)}
			</div>
		</div>
	);
}
