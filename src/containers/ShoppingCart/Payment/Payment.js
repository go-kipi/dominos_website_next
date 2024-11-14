import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import Price from "components/Price";
import Free from "./Free/Free";
import ChoosePayment from "./ChoosePayment/ChoosePayment";
import Cash from "./Cash/Cash";
import AddCreditCard from "./AddCreditCard";
import * as Routes from "constants/routes";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";
import Api from "api/requests";

import { PAYMENT_METHODS_ACTIONS } from "constants/payments-methods-types";
import styles from "./Payment.module.scss";

import BackBlack from "/public/assets/icons/back-black.svg";
import Logo from "/public/assets/logos/dominos-logo.svg";
import CreditCard from "./CreditCard/CreditCard";
import Actions from "redux/actions";
import NoUser from "./NoUser/NoUser";
import clsx from "clsx";
import useIsSafari from "hooks/useIsSafari";
import useTranslate from "hooks/useTranslate";
import GiftCard from "./GiftCard/GiftCard";
import GiftCardRowItem from "../components/GiftCardRowItem";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import AnalyticsService from "../../../utils/analyticsService/AnalyticsService";
import {
	getAllToppingsFromSubitems,
	getCurrencySign,
	isPizzaItem,
	notEmptyObject,
} from "../../../utils/functions";
import CartItemEntity from "../../../entitiesCartItem/FunctionalCartItem";
import { USER_PROPERTIES } from "../../../constants/user-properties";
import useDisclaimers from "hooks/useDisclaimers";
import {
	PROMO_PAYMENT,
	PROMO_POPUP_STATE_ENUM,
} from "constants/operational-promo-popups-state";
import usePromotionalAndOperationalPopups from "hooks/usePromotionalAndOperationalPopups";
import useGetMenuByMeta from "../../../hooks/useGetMenuByMeta";
import { META_ENUM } from "../../../constants/menu-meta-tags";
import PaymentLoader from "./PaymentLoader/PaymentLoader";
import BitPaymentDone from "./BitDonePayment";
import Bit from "./Bit";
import { createAccessibilityText } from "../../../components/accessibility/acfunctions";
import ApplePay from "./ApplePay/ApplePay";
import EmarsysService from "utils/analyticsService/EmarsysService";
import { ITEM_CATEGORY, ITEM_CATEGORY2 } from "constants/AnalyticsTypes";

function Payment(props) {
	const deviceState = useSelector((store) => store.deviceState);
	usePromotionalAndOperationalPopups(PROMO_PAYMENT);
	const dispatch = useDispatch();
	const router = useRouter();
	const { showPayment = false } = router.query;
	const cartItems = useSelector((store) => store.cartData);
	const { goBackShoppingCart = () => {}, params = {} } = props;
	const { openMinimumPricePopup } = params;
	const [currentScreen, setStack, goBack, _, resetStack] = useStack(
		STACK_TYPES.PAYEMNT,
	);
	const isSafari = useIsSafari();
	const cart = useSelector((store) => store.cartData);
	const [giftCardMethod, setGiftCardMethod] = useState();
	const [paidGiftCards, setPayedGiftCards] = useState([]);
	const [currency, setCurrency] = useState();
	const user = useSelector((store) => store.userData);
	const userOrders = user?.submittedOrders;
	const order = useSelector((store) => store.order);
	const specialRequestCart = useSelector((store) => store.specialRequestCart);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const promoPopupsState = useSelector((store) => store.promoPopupsState);
	const [getPaymentsPopups, setGetPaymentsPopups] = useState([]);
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const selectedMethod = useSelector((store) => store.selectedMethod);
	const [shouldCheckStatus, setShouldCheckStatus] = useState(false);
	const translate = useTranslate();
	const isOnGiftCard = currentScreen.type === PAYMENT_SCREEN_TYPES.GIFT_CARD;

	const inPayment = !(
		currentScreen.type === PAYMENT_SCREEN_TYPES.FREE ||
		currentScreen.type === PAYMENT_SCREEN_TYPES.NO_USER ||
		currentScreen.type === PAYMENT_SCREEN_TYPES.NO_BASKET
	);
	const isFirstPage =
		!inPayment ||
		currentScreen.type === PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT ||
		currentScreen.type === PAYMENT_SCREEN_TYPES.LOADER;
	const bitUUID = currentScreen.params?.bitUUID ?? "";
	const payments = useSelector((store) => store.payments);
	const leftToPay = payments.leftToPay;
	const paymentMethods = payments.paymentTypes || [];
	const { itemWithDisclaimers } = useDisclaimers();
	const didAddGetPaymentsPopups =
		promoPopupsState === PROMO_POPUP_STATE_ENUM.GET_PAYMENTS;
	const isEmptyBasket = cart?.itemCount === undefined || cart?.itemCount === 0;
	const isCartApproved = useSelector((store) => store.cartApproved);

	useEffect(() => {
		return () => {
			dispatch(Actions.resetPromoPopupState());
			// dispatch(Actions.removePromoPopup());
		};
	}, []);

	useEffect(() => {
		if (deviceState.isDesktop && isCartApproved) {
			dispatch(Actions.setCartApproved(false));
		}
	}, [cartItems, deviceState]);

	useEffect(() => {
		const screen = currentScreen.type;
		const isBitDone = screen === PAYMENT_SCREEN_TYPES.BIT_DONE;
		if (!isBitDone && notEmptyObject(cart)) {
			getPayments();
			// Api.getCustomerActiveOrder();
		}
	}, [cart]);

	useEffect(() => {
		if (!isEmptyBasket) {
			if (
				order?.isShownedUpSales &&
				user.approvedTerms &&
				!itemWithDisclaimers &&
				isCartApproved
			) {
				if (typeof leftToPay === "number") {
					if (leftToPay === 0) {
						setStack({ type: PAYMENT_SCREEN_TYPES.FREE, params: {} });
					} else {
						setStack({
							type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
							params: {},
						});
					}
				}
			} else {
				if (!paidGiftCards.length || !isCartApproved) {
					setStack({ type: PAYMENT_SCREEN_TYPES.NO_USER, params: {} });
				} else if (typeof leftToPay === "number") {
					if (leftToPay === 0) {
						setStack({ type: PAYMENT_SCREEN_TYPES.FREE, params: {} });
					} else {
						setStack({
							type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
							params: {},
						});
					}
				}
			}
		} else {
			setStack({ type: PAYMENT_SCREEN_TYPES.NO_BASKET, params: {} });
		}
	}, [
		leftToPay,
		user,
		order,
		itemWithDisclaimers,
		isEmptyBasket,
		isCartApproved,
	]);

	useEffect(() => {
		if (user.approvedTerms) {
			const payload = {};

			Api.getCustomerSavedCards({
				payload,
				onSuccess: (res) => {
					if (Array.isArray(res.creditCards) && res.creditCards.length > 0) {
						dispatch(Actions.setUserCards(res.creditCards));
					}
				},
			});
		}
	}, [user.approvedTerms]);

	useEffect(() => {
		if (
			!didAddGetPaymentsPopups &&
			order.isShownedUpSales &&
			getPaymentsPopups.length &&
			currentScreen.type === PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT
		) {
			dispatch(Actions.setPromoPopups(getPaymentsPopups));
		}
	}, [getPaymentsPopups, currentScreen.type]);

	useEffect(() => {
		const isLoader = currentScreen.type === PAYMENT_SCREEN_TYPES.LOADER;
		if (
			deviceState.isMobile &&
			isLoader &&
			bitUUID?.length > 0 &&
			shouldCheckStatus
		) {
			const intervalId = setInterval(() => {
				getBitPaymentStatus(bitUUID, (res) => {
					const { status } = res.extraData;
					if (status === "authorized") {
						setShouldCheckStatus(false);
						setStack({
							type: PAYMENT_SCREEN_TYPES.BIT_DONE,
							params: { bitUUID },
						});
						clearInterval(intervalId);
					}
				});
			}, 2500);
			return () => {
				clearInterval(intervalId);
			};
		}
	}, [currentScreen, shouldCheckStatus]);

	useEffect(() => {
		if (bitUUID?.length > 0) {
			document.addEventListener("visibilitychange", handleVisibilityChange);
		}
		return () => {
			bitUUID?.length > 0 &&
				document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [bitUUID]);

	function handleVisibilityChange(e) {
		if (document.visibilityState === "visible") {
			setShouldCheckStatus(true);
		}
	}

	const beginCheckoutEvent = () => {
		const [items, listData] = getItemsAndListData();
		AnalyticsService.beginCheckout(items, listData);
		// goBackToChoosePayment();
	};

	function getItemsAndListData() {
		const items =
			Array.isArray(cartItems.items) && cartItems.items.length > 0
				? cartItems.items.map((item, idx) => {
						const validItemCategory =
							item.triggeredBy === "recommendedKit"
								? ITEM_CATEGORY.SPECIAL
								: item.triggeredBy === "savedKit"
								? ITEM_CATEGORY.FAVORITE
								: null;
						const isPizza = isPizzaItem(item);
						const isSale =
							Array.isArray(item.subItems) && item.subItems.length > 0 && !isPizza;
						const toppings = isPizza ? getAllToppingsFromSubitems(item.subItems) : "";
						return Object.assign(
							{
								index: idx,
								item_category: validItemCategory,
								item_category2: isSale
									? ITEM_CATEGORY2.DEAL
									: ITEM_CATEGORY2.SINGLE_PRODUCT,
								item_variant: toppings,
							},
							catalogProducts[item.productId],
						);
				  })
				: [];
		const coupons = items
			.filter((item) => item?.meta === "coupon" || item?.meta === "discountCoupon")
			.map((item) => item?.nameUseCases?.Title)
			.join(", ");

		const listData = {
			value: cart.total,
			currency: "ILS",
			coupon: coupons ? coupons : 0,
		};

		return [items, listData];
	}

	const getPayments = () => {
		const payload = {};
		Api.getPayments({ payload, onSuccess });

		function onSuccess(data) {
			const promoPopups = data?.popups;
			if (Array.isArray(data.paid)) {
				const giftCards = data.paid.filter(
					(paymentMethod) => paymentMethod.method === "giftCard",
				);
				setPayedGiftCards(giftCards);
			}
			let giftCardMethod = data.paymentTypes?.filter(
				(method) => method.action === PAYMENT_METHODS_ACTIONS.GIFT_CARD,
			)[0];
			setGiftCardMethod(giftCardMethod);
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
				// getPayments();
			},
		});
	}

	function onGiftCardUpdate(uuid, price, callback) {
		const payload = { uuid, total: Number(price) };
		Api.changePaymentSum({
			payload,
			onSuccess: () => {
				typeof callback === "function" && callback();
				// getPayments();
			},
		});
	}

	const onAddCreditCardChange = (iframeUrl) => {
		setStack({
			type: PAYMENT_SCREEN_TYPES.ADD_CREDIT_CARD,
			params: { iframeUrl },
		});
	};

	const onClickFreeOrder = () => {
		setStack({
			type: PAYMENT_SCREEN_TYPES.LOADER,
			params: {},
		});
		submitOrder();
	};

	const handleUserPropertyEvents = (hasPizzaInItems, hasCouponInItems) => {
		const hasValue = USER_PROPERTIES.values.YES;
		const noValue = USER_PROPERTIES.values.NO;
		if (Array.isArray(userOrders)) {
			const firstOrderParams = userOrders.length === 0 ? hasValue : noValue;

			const moreThanThreeOrdersParams = userOrders.length > 3 ? hasValue : noValue;

			AnalyticsService.setUserProperties({
				[USER_PROPERTIES.FIRST_ORDER]: firstOrderParams,
				[USER_PROPERTIES.THREE_ORDER]: moreThanThreeOrdersParams,
			});
		}
		const hasPizza = hasPizzaInItems ? hasValue : noValue;
		const hasCoupon = hasCouponInItems ? hasValue : noValue;

		AnalyticsService.setUserProperties({
			[USER_PROPERTIES.PURCHASE]: hasPizza,
		});
		AnalyticsService.setUserProperties({
			[USER_PROPERTIES.COUPON_ORDER]: hasCoupon,
		});
	};

	const onPaymentDone = (res) => {
		const saleHash = res.saleIdHash;
		const [items, listData] = getItemsAndListData();
		const paymentList = JSON.parse(JSON.stringify(cartItems));
		let shippingCostItem;
		if (!order?.isPickup) {
			const cartProductsArr = Object.values(cart?.products);
			shippingCostItem = cartProductsArr.find(
				(product) => product.meta.toLowerCase() === "deliveryfee",
			);
		}

		const newList = {
			...listData,
			transaction_id: saleHash,
			tax: res?.tax,
			currency: currency,
			shipping:
				typeof shippingCostItem === "object" &&
				shippingCostItem.hasOwnProperty("price")
					? shippingCostItem.price
					: 0,
			payment_type: selectedMethod,
			items: null,
		};

		const hasPizza = items?.some((item) =>
			isPizzaItem(
				CartItemEntity.getObjectLiteralItem(item.productId, 1, item?.subItems),
			),
		);
		const hasCoupon = items.some(
			(item) => item?.meta === "coupon" || item?.meta === "discountCoupon",
		);
		handleUserPropertyEvents(hasPizza, hasCoupon);

		const timeout = setTimeout(() => {
			AnalyticsService.purchase(items, newList);
			userOrders;
			EmarsysService.setPurchase(res.guestCheckNo, paymentList.items);
			dispatch(Actions.resetPromoPopupState());
			goToTracker(res);
			resetStack();
			clearTimeout(timeout);
		}, 500);
	};

	function getBitPaymentStatus(uuid, onSuccess, onFailure) {
		const payload = {
			paymentMethod: "bit",
			uuid,
		};
		return Api.getPaymentStatus({
			payload,
			config: { executeNow: true },
			onSuccess,
			onFailure,
		});
	}

	function goToTracker(res) {
		const saleHash = res.saleIdHash;
		const guestCheckNo = res.guestCheckNo;

		router.push(
			{
				pathname: `${Routes.tracker}/${saleHash}`,
				query: { guestCheckNo: guestCheckNo },
			},
			undefined,
			{ shallow: true },
		);
	}

	function RenderPayment() {
		switch (currentScreen.type) {
			case PAYMENT_SCREEN_TYPES.FREE:
				return (
					<Free
						params={currentScreen.params}
						hasGiftCards={hasGiftCards}
						onClick={() => onClickFreeOrder()}
					/>
				);
			case PAYMENT_SCREEN_TYPES.BIT_DONE:
				return <BitPaymentDone submitOrder={submitOrder} />;
			case PAYMENT_SCREEN_TYPES.BIT:
				return (
					<Bit
						getBitPaymentStatus={getBitPaymentStatus}
						goBackToChoosePayment={goBackToChoosePayment}
						setStack={setStack}
						params={currentScreen.params}
					/>
				);
			case PAYMENT_SCREEN_TYPES.APPLE_PAY:
				return (
					<ApplePay
						setStack={setStack}
						params={currentScreen.params}
						submitOrder={submitOrder}
					/>
				);
			case PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT:
				return (
					<ChoosePayment
						params={currentScreen.params}
						setStack={setStack}
						getPaymentsPopups={getPaymentsPopups}
						paymentMethods={paymentMethods}
						setCurrency={setCurrency}
						currency={currency}
						hasGiftCards={paidGiftCards.length > 0}
						leftToPay={leftToPay}
						goToTracker={goToTracker}
						onPaymentDone={(res) => onPaymentDone(res)}
						onAddCreditCard={onAddCreditCardChange}
						getItemsAndListData={getItemsAndListData}
						submitOrder={submitOrder}
					/>
				);
			case PAYMENT_SCREEN_TYPES.CASH:
				return (
					<Cash
						submitOrder={submitOrder}
						goBackToChoosePayment={goBackToChoosePayment}
						params={currentScreen.params}
						leftToPay={leftToPay}
						currency={currency}
					/>
				);
			case PAYMENT_SCREEN_TYPES.CREDIT_CARD:
				return (
					<CreditCard
						params={currentScreen.params}
						goBackToChoosePayment={goBackToChoosePayment}
						leftToPay={leftToPay}
						currency={currency}
						onAddCreditCard={onAddCreditCardChange}
						goToTracker={goToTracker}
						submitOrder={submitOrder}
					/>
				);
			case PAYMENT_SCREEN_TYPES.ADD_CREDIT_CARD:
				return (
					<AddCreditCard
						submitOrder={submitOrder}
						params={currentScreen.params}
						setStack={setStack}
						goBackToChoosePayment={goBackToChoosePayment}
					/>
				);
			case PAYMENT_SCREEN_TYPES.GIFT_CARD:
				return (
					<GiftCard
						params={currentScreen.params}
						goBackToChoosePayment={() => {
							goBackToChoosePayment();
							// getPayments();
						}}
						method={giftCardMethod}
						leftToPay={leftToPay}
					/>
				);
			case PAYMENT_SCREEN_TYPES.NO_USER:
				return (
					<NoUser
						openMinimumPricePopup={openMinimumPricePopup}
						beginCheckoutEvent={beginCheckoutEvent}
					/>
				);
			case PAYMENT_SCREEN_TYPES.LOADER:
				return (
					<PaymentLoader
						setStack={setStack}
						params={currentScreen.params}
					/>
				);

			default:
				return null;
		}
	}

	function renderGiftCards() {
		if (
			currentScreen.type === PAYMENT_SCREEN_TYPES.NO_USER &&
			paidGiftCards.length === 0
		)
			return null;
		return paidGiftCards.length > 0 ? (
			<div className={styles["gift-cards-list"]}>
				{paidGiftCards.map((gc, index) => {
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
		) : null;
	}

	function onBackClick() {
		if (isFirstPage) {
			goBackShoppingCart(goBackToChoosePayment);
		} else {
			goBack();
		}
	}

	function goBackToChoosePayment() {
		setStack({ type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT, params: {} });
	}

	function submitOrder() {
		const payload = {
			specialComments: {},
		};

		if (specialRequestCart.fullName) {
			payload["specialComments"]["contactPerson"] = specialRequestCart.fullName;
		}
		if (specialRequestCart.phone) {
			payload["specialComments"]["contactPersonPhone"] = specialRequestCart.phone;
		}
		if (specialRequestCart.order) {
			payload["specialComments"]["orderComments"] = specialRequestCart.order;
		}

		if (specialRequestCart.delivery_person) {
			payload["specialComments"]["deliveryInstructions"] =
				specialRequestCart.delivery_person;
		}

		dispatch(Actions.resetSpecialRequest());

		Api.submitActiveOrder({
			payload,
			onSuccess: (res) => {
				dispatch(Actions.setLoader(false));
				dispatch(Actions.setDontShowMarketingModal(false));
				dispatch(Actions.setDontShowPeresntMarketingModal(false));
				typeof onPaymentDone === "function" && onPaymentDone(res);
			},
			onRejection: () => {
				setStack({
					type: PAYMENT_SCREEN_TYPES.FREE,
					params: {},
				});
			},
		});
	}

	const shouldHideTop =
		currentScreen.type !== PAYMENT_SCREEN_TYPES.BIT_DONE &&
		currentScreen.type !== PAYMENT_SCREEN_TYPES.GIFT_CARD &&
		currentScreen.type !== PAYMENT_SCREEN_TYPES.ADD_CREDIT_CARD;

	const shouldShowLogoOnDesktop =
		currentScreen.type === PAYMENT_SCREEN_TYPES.NO_USER;

	const shouldShowLogo =
		deviceState.notDesktop || (deviceState.isDesktop && shouldShowLogoOnDesktop);
	const hasGiftCards = paidGiftCards?.length >= 1;
	const safariStyle = isSafari
		? hasGiftCards
			? styles["is-safari-with-gc"]
			: styles["is-safari"]
		: "";

	function onBackClick() {
		if (isFirstPage) {
			goBackShoppingCart();
		} else {
			goBack();
		}
	}
	const srText = createAccessibilityText(
		translate("shoppingCart_payment_sum"),
		cart.showTotalBeforeDiscount &&
			createAccessibilityText(
				translate("accessibility_srContent_insteadOf"),
				`${cart.totalBeforeDiscount}${getCurrencySign("shekel")}`,
			),
		leftToPay && `${leftToPay}${getCurrencySign("shekel")}`,
	);

	return (
		<div
			className={clsx(
				styles["payment-wrapper"],
				styles[`screen-${currentScreen.type}`],
			)}
			aria-description={srText}>
			<div className={styles["payment-conatiner"]}>
				{deviceState.notDesktop && (
					<GeneralHeader
						title={!isOnGiftCard ? "" : translate("addGiftCard_screen_headerTitle")}
						back
						backOnClick={onBackClick}
					/>
				)}

				{deviceState.isDesktop && inPayment && (
					<div className={styles["header-desktop"]}>
						{!isFirstPage && (
							<button
								className={styles["payment-header-wrapper"]}
								onClick={onBackClick}>
								<div className={styles["payment-back-button"]}>
									<img
										src={BackBlack.src}
										alt={translate("accessibility_alt_arrowBack")}
									/>
								</div>
							</button>
						)}
					</div>
				)}

				{shouldHideTop ? (
					<>
						{shouldShowLogo && (
							<div className={styles["payment-logo-wrapper"]}>
								<img
									src={Logo.src}
									alt="logo"
								/>
							</div>
						)}
						<h5
							className={`${styles["payment-sum-title"]} ${
								shouldShowLogo ? styles["payment-sum-title-with-logo"] : ""
							}`}>
							{translate("shoppingCart_payment_sum")}
						</h5>
						<div className={styles["payment-old-price-wrapper"]}>
							{deviceState.isDesktop && cart.showTotalBeforeDiscount && (
								<Price
									value={cart.totalBeforeDiscount}
									className={`${styles["payment-price"]} ${styles["old-payment-price"]}`}
									extraStyles={styles}
									mark={true}
									readPrice={true}
								/>
							)}
						</div>
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
						<button
							className={styles["payment-details-wrapper"]}
							onClick={() => {
								if (showPayment) {
									router.replace(Routes.cart, undefined, { shallow: true });
								}
								typeof goBackShoppingCart === "function" && goBackShoppingCart();
							}}>
							<span className={styles["payment-details"]}>
								{translate("shoppingCart_payment_details")}
							</span>
						</button>
					</>
				) : null}

				{deviceState.isMobile && isFirstPage ? renderGiftCards() : null}
				<div
					className={clsx(
						styles["payment-content"],
						hasGiftCards && !isSafari ? styles["has-gift-cards"] : "",
						safariStyle,
						isOnGiftCard ? styles["in-gift-card"] : "",
					)}>
					{deviceState.isDesktop && isFirstPage ? renderGiftCards() : null}
					{RenderPayment()}
				</div>
			</div>
		</div>
	);
}

export default Payment;
