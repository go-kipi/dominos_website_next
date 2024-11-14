import useStack from "hooks/useStack";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SHOPPING_CART_SCREEN_TYPES from "constants/ShoppingCartScreenTypes";
import STACK_TYPES from "constants/stack-types";
import * as popupTypes from "constants/popup-types";
import * as popups from "constants/popup-types";
import RenderShoppingCart from "./RenderShoppingCart";
import Payment from "./Payment/Payment";
import useSetMenuPath from "hooks/useSetMenuPath";
import useArrayMissingProducts from "hooks/useArrayMissingProducts";
import useOrder from "hooks/useOrder";
import styles from "./index.module.scss";
import Api from "api/requests";
import Actions from "redux/actions";
import PizzaTreeService from "services/PizzaTreeService";
import { useRouter } from "next/router";
import * as Routes from "constants/routes";
import useTranslate from "hooks/useTranslate";
import AddItem from "./components/AddItem";
import useDisclaimers from "hooks/useDisclaimers";

const ShoppingCart = () => {
	const router = useRouter();
	const mainMenu = useSelector(
		(store) => store.globalParams.DefaultMenus.result.main,
	);
	const deviceState = useSelector((store) => store.deviceState);
	const cartItems = useSelector((store) => store.cartData);
	const menus = useSelector((store) => store.menusData.menus);
	const setPath = useSetMenuPath();
	const { hasOrder, didntReachMinimumPrice } = useOrder();
	const { showPayment = false } = router.query;
	const { isDesktop } = deviceState;
	const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.SHOPPING_CART);
	const stackState = useSelector(
		(store) => store.stackState[STACK_TYPES.SHOPPING_CART],
	);
	const getArrayProduct = useArrayMissingProducts();
	const coupons = useSelector((store) => store.coupons);
	const cart = useSelector((store) => store.cartData);
	const order = useSelector((store) => store.order);
	const user = useSelector((store) => store.userData);
	const benefits = user?.benefits || [];
	const addToBasketBenefits = useSelector((store) => store.addToBasketBenefits);
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { itemWithDisclaimers } = useDisclaimers();

	useEffect(() => {
		if (!menus && hasOrder) {
			const payload = { menuId: mainMenu };
			Api.getMenus({
				payload,
				onSuccess: () => {
					setPath();
				},
			});
		}
	}, [hasOrder, menus]);

	useEffect(() => {
		if (hasOrder) {
			PizzaTreeService.init();
		}
	}, []);

	useEffect(() => {
		if (
			(didntReachMinimumPrice || itemWithDisclaimers) &&
			deviceState.isDesktop
		) {
			dispatch(Actions.setCartApproved(false));
		}
	}, [didntReachMinimumPrice, itemWithDisclaimers, deviceState.isDesktop]);

	useEffect(() => {
		setStack({
			type:
				!isDesktop && showPayment
					? SHOPPING_CART_SCREEN_TYPES.PAYMENT
					: SHOPPING_CART_SCREEN_TYPES.SHOPPING_CART,
			params: {
				openMinimumPricePopup,
			},
		});
	}, []);

	useEffect(() => {
		const productIds = getArrayProduct(cart.items);

		if (addToBasketBenefits.length > 0 && order.hasOwnProperty("isPickup")) {
			for (const index in addToBasketBenefits) {
				const benefitId = addToBasketBenefits[index];
				const benefit = benefits.find((b) => b.id === benefitId);
				if (benefit) {
					productIds.push(benefit.productID);
				}
			}
		}

		if (productIds && productIds.length > 0) {
			const payload = { productIds: productIds };
			Api.getProducts({ payload });
		}
	}, [coupons, addToBasketBenefits]);

	const openMinimumPricePopup = () => {
		const payload = {};
		dispatch(
			Actions.addPopup({
				type: popupTypes.MINIMUM_PRICE,
				payload,
			}),
		);
	};

	function RenderScreen() {
		switch (currentScreen.type) {
			case SHOPPING_CART_SCREEN_TYPES.SHOPPING_CART:
				return (
					<RenderShoppingCart
						params={currentScreen.params}
						setStack={setStack}
						isEmptyBasket={isEmptyBasket}
						isCountItemIsZero={isCountItemIsZero}
					/>
				);
			case SHOPPING_CART_SCREEN_TYPES.PAYMENT:
				return (
					<Payment
						params={currentScreen.params}
						goBackShoppingCart={() => {
							const shouldAddShoppingCart =
								stackState.length === 1 &&
								currentScreen.type === SHOPPING_CART_SCREEN_TYPES.PAYMENT;
							typeof goBack === "function" && goBack();
							if (shouldAddShoppingCart) {
								setStack({
									type: SHOPPING_CART_SCREEN_TYPES.SHOPPING_CART,
									params: {},
								});
							}
						}}
					/>
				);

			default:
				return null;
		}
	}

	const isEmptyBasket = !(
		Array.isArray(cartItems?.items) && cartItems.items.length > 0
	);

	const isCountItemIsZero = cartItems?.itemCount === 0;
	return (
		<div className={styles["shopping-cart-wrapper"]}>
			{RenderScreen(SHOPPING_CART_SCREEN_TYPES.SHOPPING_CART)}
			{/*    PAYMENT DESKTOP   */}
			{isDesktop && hasOrder ? (
				<div className={styles["payment-wrap"]}>
					<div className={styles["payment"]}>
						<Payment
							params={currentScreen.params}
							goBackShoppingCart={(goBackCallback) => {
								typeof goBack === "function" && goBack();
								typeof goBackCallback === "function" && goBackCallback();
							}}
						/>
					</div>
					{!isEmptyBasket ? (
						<AddItem
							className={styles["item"]}
							text={translate("cat_another_thing")}
							onClick={() => router.push(Routes.menu)}
						/>
					) : null}
				</div>
			) : null}
			{/* ---------------------- */}
		</div>
	);
};

export default ShoppingCart;
