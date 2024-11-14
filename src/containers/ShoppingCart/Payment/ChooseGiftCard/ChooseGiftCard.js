import React, { useState, useEffect } from "react";
import styles from "./ChooseGiftCard.module.scss";
import useTranslate from "hooks/useTranslate";
import ChooseGiftCartFromList from "./ChooseGiftCartFromList/ChooseGiftCartFromList";
import { useSelector } from "react-redux";

function ChooseGiftCard({ paymentMethods, setStack = () => {} }) {
	const payments = useSelector((store) => store.payments);
	const translate = useTranslate();
	const [giftCards, setGiftCards] = useState([]);
	const [selectedGiftCard, setSelectedGiftCard] = useState(null);

	// useEffect(() => {
	// 	const paymentsMenu = payments.paymentsMenu;
	// 	const paymentTypes = payments.paymentTypes;

	// 	console.log("paymentsMenu", paymentsMenu);
	// 	console.log("paymentTypes", paymentTypes);
	// 	const digitalPayments = paymentsMenu.find((menu) => menu.id === "giftMenu");

	// 	let giftMenuElements = [];

	// 	if (digitalPayments) {
	// 		const subMenu = digitalPayments.elements.find(
	// 			(element) => element.actionType === "subMenu",
	// 		);
	// 		if (subMenu) {
	// 			const giftMenuId = subMenu.id;
	// 			const giftMenu = paymentsMenu.find((menu) => menu.id === giftMenuId);
	// 			if (giftMenu) {
	// 				giftMenuElements = giftMenu.elements;
	// 			}
	// 		}
	// 	}

	// 	const matchedPaymentTypes = giftMenuElements
	// 		.map((giftElement) => {
	// 			const matchingPaymentType = paymentTypes.find((paymentType) => {
	// 				return paymentType.id === giftElement.id;
	// 			});
	// 			return matchingPaymentType;
	// 		})
	// 		.filter((paymentType) => paymentType !== undefined);

	// 	setGiftCards(matchedPaymentTypes);
	// }, []);

	useEffect(() => {
		const paymentsMenu = payments.paymentsMenu;
		const paymentTypes = payments.paymentTypes;

		const digitalPaymentsMenu = paymentsMenu.find(
			(menu) => menu.id === "" || menu.id === "digitalPayments",
		);

		if (digitalPaymentsMenu) {
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

					setGiftCards(matchedPaymentTypes);
				}
			}
		}
	}, [payments]);

	const handleGiftCardSelect = (item) => {
		setSelectedGiftCard(item);
	};

	return (
		<div className={styles["choose-gift-card-wrapper"]}>
			<h1
				className={styles["choose-gift-card-title"]}
				tabIndex={0}>
				{translate("choose_gift_card_title")}
			</h1>
			<div className={styles["gift_card_list"]}>
				{giftCards?.map((giftCard) => (
					<GiftCardItem
						key={giftCard.id}
						item={giftCard}
						onSelect={handleGiftCardSelect}
					/>
				))}
			</div>
			{selectedGiftCard && (
				<ChooseGiftCartFromList
					giftCard={selectedGiftCard}
					setStack={setStack}
				/>
			)}
		</div>
	);
}

export default ChooseGiftCard;

function GiftCardItem({ item, onSelect }) {
	const imgUrl = "https://cdn.aboohi.net/media/buyme.png";

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
