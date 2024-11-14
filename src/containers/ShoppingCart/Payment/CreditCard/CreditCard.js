import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Api from "api/requests";
import Actions from "redux/actions";
import styles from "./index.module.scss";
import PAYMENT_METHODS from "constants/PaymentMethods";
import Button from "components/button";
import LottieAnimation from "components/LottieAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper";
import CreditCardItem from "./CreditCardItem/CreditCardItem";
import LoadingAnim from "animations/loading.json";
import TextOnlyButton from "components/text_only_button";
import * as popups from "constants/popup-types";
import * as Routes from "constants/routes";
import { useRouter } from "next/router";
import clsx from "clsx";
import GarbageIcon from "/public/assets/icons/blue-trash.svg";
import SlideRight from "components/SlideRight/SlideRight";
import LanguageDirectionService from "services/LanguageDirectionService";
import TWO_ACTION_TYPES from "constants/two-actions-popup-types";
import useTranslate from "hooks/useTranslate";
import SRContent from "../../../../components/accessibility/srcontent";

const CARD_SIZE = 284;

function CreditCard(props) {
	const cardNumReplacement = "{cardNum}";
	const swiperRef = useRef();
	const deviceState = useSelector((store) => store.deviceState);
	const {
		leftToPay = 0,
		currency = "nis",
		onAddCreditCard,
		params = {},
		submitOrder,
	} = props;
	const { newCardUsed = false } = params;
	const userData = useSelector((store) => store.userData);
	const [savedCreditCards, setSavedCreditCards] = useState(
		userData.savedCreditCards ?? [],
	);
	const [shouldFadeTitle, setShouldFadeTitle] = useState(false);
	const [showLoading, setShowLoading] = useState(newCardUsed);
	const [showDone, setShowDone] = useState(false);
	const [selectedCreditCard, setSelectedCreditCard] = useState(-1);
	const creditCardListRef = useRef(null);
	const dispatch = useDispatch();
	const isRTL = LanguageDirectionService.isRTL();
	const translate = useTranslate();

	const loadingDefaultOptions = {
		loop: true,
		autoplay: true,
		animation: LoadingAnim,
	};

	const doneDefaultOptions = {
		loop: false,
		autoplay: true,
		// animation: lottie,
	};

	useEffect(() => {
		if (savedCreditCards.length > 0) {
			setSelectedCreditCard(savedCreditCards[0]);
		}
		return () => {
			dispatch(Actions.setIsCreditModalOpen(false));
		};
	}, []);

	function getCardIndex(offset, isSingleCard = false, cardsLength) {
		if (isSingleCard) {
			return Math.abs(offset) >= CARD_SIZE ? -1 : 0;
		}

		let index = Math.abs(Math.round(offset / CARD_SIZE));
		return Math.min(index, cardsLength);
	}

	function handleOnScroll(e) {
		const isSingleCard = savedCreditCards.length === 1;
		const { nativeEvent } = e;
		const { target } = nativeEvent;
		const offset = target.scrollLeft;
		const cardIndex = getCardIndex(offset, isSingleCard, savedCreditCards.length);
		const selectAddCardCondition =
			cardIndex === savedCreditCards.length || cardIndex === -1;
		const selectCreditCardCondition = cardIndex !== -1;
		if (selectAddCardCondition) {
			setSelectedCreditCard(-1);
		} else if (selectCreditCardCondition) {
			setSelectedCreditCard(savedCreditCards[cardIndex]);
		}
	}

	function payWithCreditCard(card) {
		setShouldFadeTitle(true);
		const payload = {
			paymentMethod: PAYMENT_METHODS.CREDIT_CARD,
			amount: leftToPay,
			currency,
			extraData: { token: card.token },
		};
		setShowLoading(true);

		Api.addPayment({ payload, onSuccess });

		function onSuccess(data) {
			dispatch(
				Actions.addPayment({
					data,
					paymentMethod: PAYMENT_METHODS.CREDIT_CARD,
					currency,
					extraData: { token: card.token },
				}),
			);
			typeof submitOrder === "function" && submitOrder();
		}
	}

	function onAddCreditCardPress() {
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

	function onCreditCardSelect(card) {
		setSelectedCreditCard(card);
		if (typeof card === "object") {
			if (!card.expired && !showLoading) {
				payWithCreditCard(card);
			}
		}
	}

	function deleteCard(token) {
		const payload = { token };
		Api.deleteCustomerCreditCard({
			payload,
			onSuccess: () => {
				const filtered = Object.values(savedCreditCards).filter(
					(card) => card.token !== token,
				);
				setSavedCreditCards(filtered);
				Api.getCustomerSavedCards();
			},
		});
	}

	function onCreditCardDelete(cardToken) {
		const payload = {
			title: translate("personalArea_creditCard_deleteCard_title"),
			addTitle: "",
			subTitle: "",
			mainBtnText: translate("personalArea_creditCard_deleteCard_yes"),
			subBtnText: translate("personalArea_creditCard_deleteCard_no"),
			isLottie: true,
			mainBtnFunc: () => {
				deleteCard(cardToken);
			},
			subBtnFunc: () => {},
			type: TWO_ACTION_TYPES.GARBAGE,
		};
		dispatch(
			Actions.addPopup({
				type: popups.TWO_ACTION,
				payload: payload,
			}),
		);
	}

	function renderAddCreditCard() {
		return (
			<button
				className={styles["add-credit-card-wrapper"]}
				onClick={onAddCreditCardPress}>
				<span
					className={styles["add-credit-plus-sign"]}
					aria-label={translate("creditCard_payment_addNewCard_btnLabel")}
					aria-hidden={selectedCreditCard !== -1}>
					+
				</span>
			</button>
		);
	}

	function renderButtonOrLottie() {
		if (!showLoading) {
			return (
				<>
					{selectedCreditCard?.expired && (
						<SRContent
							role={"alert"}
							message={`${selectedCreditCard?.brand} ${
								selectedCreditCard?.lastFourDigits
							}, ${translate("creditCard_payment_addNewCard_btnErrorLabel")}`}
						/>
					)}
					<Button
						onClick={() =>
							selectedCreditCard === -1
								? onAddCreditCardPress()
								: payWithCreditCard(selectedCreditCard)
						}
						className={styles["pay-btn"]}
						errorText={translate("creditCard_payment_addNewCard_btnErrorLabel")}
						isError={selectedCreditCard !== -1 && selectedCreditCard?.expired}
						disabled={selectedCreditCard?.expired}
						text={
							selectedCreditCard === -1
								? translate("creditCard_payment_addNewCard_btnLabel")
								: translate("creditCard_payment_payWithCard_btnLabel").replace(
										cardNumReplacement,
										selectedCreditCard?.lastFourDigits,
								  )
						}
					/>
				</>
			);
		} else
			return (
				<LottieAnimation
					className={styles["lottie-anim"]}
					{...loadingDefaultOptions}
				/>
			);
	}

	function renderMobile() {
		return (
			<React.Fragment>
				<span
					className={clsx(
						styles["credit-card-title"],
						shouldFadeTitle ? styles["fade"] : "",
					)}>
					{translate("creditCard_payment_whichCard_title")}
				</span>
				<div className={styles["credit-card-list-wrapper"]}>
					<SlideRight
						offset={350}
						delay={10}>
						<div
							ref={creditCardListRef}
							className={styles["credit-card-list"]}
							onScroll={(e) => handleOnScroll(e)}
							role={"list"}
							tabIndex={0}>
							{savedCreditCards.map((item) => (
								<CreditCardItem
									key={`credit-card-${item.token}`}
									canShowDelete
									isSelected={
										selectedCreditCard !== -1 && selectedCreditCard.token === item.token
									}
									onSelect={() => onCreditCardSelect(item)}
									onDeleteCard={(token) => onCreditCardDelete(token)}
									item={item}
								/>
							))}
							{renderAddCreditCard()}
						</div>
					</SlideRight>
				</div>
				{renderButtonOrLottie()}
				{showDone ? (
					<LottieAnimation
						className={styles["lottie-anim"]}
						{...doneDefaultOptions}
					/>
				) : null}
			</React.Fragment>
		);
	}

	function renderDesktop() {
		const hasMultipleCards =
			Array.isArray(savedCreditCards) && savedCreditCards.length > 1;
		const swiperOptions = {
			// dir: LanguageDirectionService.isRTL() ? 'rtl':'ltr',
			effect: "cards",
			grabCursor: false,
			className: styles["credit-card-swiper"],
			cardsEffect: {
				slideShadows: false,
				rotate: false,
				perSlideOffset: 15,
			},
			onActiveIndexChange: (swiper) => {
				setSelectedCreditCard(savedCreditCards[swiper.activeIndex]);
			},
			onInit: (swiper) => {
				setSelectedCreditCard(savedCreditCards[swiper.activeIndex]);
			},
			modules: [EffectCards],
		};

		return (
			<React.Fragment>
				{!newCardUsed && (
					<>
						<span
							className={clsx(
								styles["credit-card-title"],
								shouldFadeTitle ? styles["fade"] : "",
							)}>
							{translate("creditCard_payment_whichCard_title")}
						</span>
						<div className={styles["cards-swiper-wrapper"]}>
							{savedCreditCards && (
								<Swiper
									{...swiperOptions}
									dir={isRTL ? "rtl" : "ltr"}
									onSwiper={(instance) => (swiperRef.current = instance)}>
									{Array.isArray(savedCreditCards) &&
										savedCreditCards.map((card, idx) => (
											<SwiperSlide key={`credit-card-${card.token}`}>
												<CreditCardItem
													isSelected={
														selectedCreditCard !== -1 &&
														selectedCreditCard.token === card.token
													}
													canShowDelete
													onDeleteCard={(token) => onCreditCardDelete(token)}
													onSelect={() => onCreditCardSelect(card)}
													item={card}
												/>
											</SwiperSlide>
										))}
								</Swiper>
							)}
							<button
								className={clsx(styles["prev-credit-card"], styles["arrow"])}
								aria-label={translate("accessibility_creditCard_slider_previousCard")}
								onClick={() => {
									swiperRef.current?.slidePrev();
								}}
							/>
							<button
								className={clsx(styles["next-credit-card"], styles["arrow"])}
								aria-label={translate("accessibility_creditCard_slider_nextCard")}
								onClick={() => {
									swiperRef.current?.slideNext();
								}}
							/>
						</div>
						<div className={styles["card-pay-options"]}>
							{selectedCreditCard !== -1 && (
								<div
									className={styles["pay-with-description"]}
									aria-live={"polite"}>
									<span>{selectedCreditCard?.brand}</span>
									<span>{` ${selectedCreditCard?.lastFourDigits}`}</span>
								</div>
							)}
							{deviceState.isDesktop &&
								selectedCreditCard !== -1 &&
								true &&
								selectedCreditCard?.expired && (
									<button
										aria-label={translate("accessibility_imageAlt_deleteCreditCard")}
										onClick={() => onCreditCardDelete(selectedCreditCard?.token)}
										className={styles["delete-card"]}>
										<img
											src={GarbageIcon.src}
											alt={""}
										/>
									</button>
								)}
						</div>
					</>
				)}
				{renderButtonOrLottie()}
				{!newCardUsed && (
					<TextOnlyButton
						className={styles["add-new-card-btn"]}
						text={translate("creditCard_payment_addNewCard_btnLabel")}
						onClick={onAddCreditCardPress}
					/>
				)}
			</React.Fragment>
		);
	}

	return (
		<div className={styles["pay-with-credit-card-wrapper"]}>
			{deviceState.notDesktop ? renderMobile() : renderDesktop()}
		</div>
	);
}
export default CreditCard;
