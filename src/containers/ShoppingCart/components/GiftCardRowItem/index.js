import React, { useState } from "react";
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
import { useSelector } from "react-redux";
import TextInput from "components/forms/textInput";
import Price from "components/Price";
import useTranslate from "hooks/useTranslate";

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
	const deviceState = useSelector((store) => store.deviceState);
	const GiftCardIcon =
		deviceState.isMobile || deviceState.isTablet
			? GiftCardWhiteIcon
			: GiftCardBlackIcon;
	const EditIcon =
		deviceState.isMobile || deviceState.isTablet ? EditWhiteIcon : EditBlueIcon;
	const TrashIcon =
		deviceState.isMobile || deviceState.isTablet ? TrashWhiteIcon : TrashBlueIcon;
	const AcceptIcon =
		deviceState.isMobile || deviceState.isTablet
			? AcceptWhiteIcon
			: AcceptBlueIcon;
	const CancelIcon =
		deviceState.isMobile || deviceState.isTablet
			? CancelWhiteIcon
			: CancelBlueIcon;
	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);
	const giftCardPrice = Number(currentPrice);
	const isAboveMinimum = GIFT_CARD_MINIMUM < giftCardPrice;
	const isBelowMaximum = total >= giftCardPrice;
	const errorMessage = !isAboveMinimum
		? translate("giftCartRow_errorMessage_belowMinimum")
		: !isBelowMaximum
		? translate("giftCartRow_errorMessage_aboveMaximum")
		: "";

	const onEditPress = () => {
		setIsEdit(true);
	};

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
		if (isAboveMinimum && isBelowMaximum) {
			typeof onUpdate === "function" &&
				onUpdate(uuid, currentPrice, () => setIsEdit(false));
		}
	};

	const onDeletePress = () => {
		typeof onDelete === "function" && onDelete(uuid);
	};
	const floatingPrice = Number(currentPrice).toFixed(displayDecimalPoint);

	return (
		<div className={styles["gift-card-row-item"]}>
			<div className={styles["gift-card-right"]}>
				<div className={styles["gift-card-icon-digits"]}>
					<div className={styles["gift-card-icon"]}>
						<img
							src={GiftCardIcon.src}
							alt=""
						/>
					</div>
					<span className={styles["gift-card-digits"]}>{lastFourDigits}</span>
				</div>
				{!isEdit ? (
					<Price
						value={floatingPrice}
						extraStyles={styles}
					/>
				) : (
					<TextInput
						autoFocus
						showError={!isAboveMinimum || !isBelowMaximum}
						errorMessage={errorMessage}
						className={styles["price-input-wrapper"]}
						inputClassName={styles["price-input"]}
						onChange={(e) => handleChangeText(e)}
						type="number"
						value={currentPrice}
						name={"price-input"}
						extraStyles={styles}
					/>
				)}
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
						<div
							onClick={onUpdatePrice}
							className={styles["gift-card-edit"]}>
							<img src={AcceptIcon.src} />
						</div>
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
