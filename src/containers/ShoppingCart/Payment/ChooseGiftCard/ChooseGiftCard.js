import React, { useState, useEffect } from "react";
import styles from "./ChooseGiftCard.module.scss";
import useTranslate from "hooks/useTranslate";

import { useSelector } from "react-redux";
import { getFullMediaUrl } from "utils/functions";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";

function ChooseGiftCard({
	paymentMethods,
	setStack = () => {},
	onGiftCardSelect,
}) {
	const payments = useSelector((store) => store.payments);
	const translate = useTranslate();
	const [giftCardsTypes, setGiftCardsTypes] = useState([]);

	useEffect(() => {
		const paymentsMenu = payments.paymentsMenu;
		const paymentTypes = payments.paymentTypes;

		const digitalPaymentsMenu = paymentsMenu.find(
			(menu) => menu.id === "" || menu.id === "digitalPayments",
		);
		const giftCardsPaymentsMenu = paymentsMenu.find(
			(menu) => menu.id === "giftMenu",
		);

		if (digitalPaymentsMenu && giftCardsPaymentsMenu) {
			const subMenuElement = digitalPaymentsMenu.elements.find(
				(element) => element.actionType === "subMenu",
			);

			if (subMenuElement) {
				const subMenu = paymentsMenu.find((menu) => menu.id === subMenuElement.id);

				if (subMenu && subMenu.elements) {
					const matchedPaymentTypes = subMenu.elements
						.map((subElement) => {
							return paymentTypes.find(
								(paymentType) => paymentType.id === subElement.id,
							);
						})
						.filter((paymentType) => paymentType !== undefined);

					setGiftCardsTypes(matchedPaymentTypes);
				}
			}
		}
	}, [payments]);

	const handleGiftCardSelect = (item) => {
		const payload = {
			type: PAYMENT_SCREEN_TYPES.GIFT_CARD,
			params: { method: item },
		};
		setStack(payload);
		onGiftCardSelect(item);
	};

	return (
		<div className={styles["choose-gift-card-wrapper"]}>
			<h1
				className={styles["choose-gift-card-title"]}
				tabIndex={0}>
				{translate("choose_gift_card_title")}
			</h1>
			<div className={styles["gift_card_list"]}>
				{giftCardsTypes?.map((giftCardType) => (
					<GiftCardItem
						key={giftCardType.id}
						item={giftCardType}
						itemMenu={giftCardType}
						onSelect={handleGiftCardSelect}
					/>
				))}
			</div>
		</div>
	);
}

export default ChooseGiftCard;

function GiftCardItem({ item, itemMenu, onSelect }) {
	const imgUrl = getFullMediaUrl(
		itemMenu,
		MEDIA_TYPES.MENU,
		MEDIA_ENUM.SELECTED_WEB,
	);

	return (
		<button
			className={styles["gift_card_item"]}
			onClick={() => onSelect(item)}>
			<div className={styles["gift_card_item_img"]}>
				<img
					src={imgUrl}
					alt={item?.nameUseCases?.name || "Gift Card"}
				/>
			</div>
			<div className={styles["gift_card_item_name"]}>{item?.name}</div>
		</button>
	);
}
