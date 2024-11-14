import React, { useEffect, useState } from "react";
import {
	generateUniqueId,
	getAllToppingsFromSubitems,
	getFullMediaUrl,
	isPizzaItem,
	isSaleItem,
	parseCartItem,
} from "utils/functions";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import * as popupTypes from "constants/popup-types";
import * as popupsTypes from "constants/popup-types";
import * as Routes from "constants/routes";
import CartService from "services/CartService";
import Api from "api/requests";

// Components
import HeaderCart from "../components/HeaderCart";

import DeliveryTime from "../components/DeliveryTime";
import Coupons from "../components/Coupons";
import Item from "../components/Item";
import BlueButton from "../components/BlueButton";
import EmptyCart from "../EmptyCart";

// Assets
import AddIcon from "/public/assets/icons/plus.svg";
import MotorcycleIcon from "/public/assets/icons/motorcycle.svg";
import PickupIcon from "/public/assets/icons/pickup-home.svg";
import TrashIcon from "/public/assets/icons/black-trash.svg";
import DuplicateIcon from "/public/assets/icons/black-duplicate.svg";
import EditIcon from "/public/assets/icons/black-edit.svg";

import styles from "./index.module.scss";
import { useRouter } from "next/router";
import SHOPPING_CART_SCREEN_TYPES from "constants/ShoppingCartScreenTypes";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import TWO_ACTION_TYPES from "constants/two-actions-popup-types";
import clsx from "clsx";
import PizzaTreeService from "services/PizzaTreeService";
import doughMatrixEnum from "constants/doughMatrixEnum";
import { MENUS } from "constants/menu-types";
import useTranslate from "hooks/useTranslate";
import useOrder from "hooks/useOrder";
import OrderStatusService from "services/OrderStatusService";
import { NO_ORDER_STATUS } from "constants/OrderStatus";
import DiscountItem from "../components/DiscountItem";
import useCartInMenu from "hooks/useCartInMenu";
import DeliveryFee from "../components/DeliveryFee/DeliveryFee";
import { TRIGGER } from "constants/trigger-enum";
import CouponsAndBenefits from "services/CouponsAndBenefits";
import { META_ENUM } from "constants/menu-meta-tags";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import useDisclaimers from "hooks/useDisclaimers";
import FloatingActionButton from "components/FloatingActionButton";
import SimpleCartItem from "../components/SimpleCartItem/SimpleCartItem";
import DealCartItem from "../components/DealCartItem/DealCartItem";
import useShowMarketing from "hooks/useShowMarketing";
import dynamic from "next/dynamic";
import CartDisclaimer from "components/CartDisclaimer/CartDisclaimer";
import { ITEM_CATEGORY, ITEM_CATEGORY2 } from "constants/AnalyticsTypes";
import { PROMO_MENU } from "constants/operational-promo-popups-state";
import usePromotionalAndOperationalPopups from "hooks/usePromotionalAndOperationalPopups";
import PizzaBuilderService from "services/PizzaBuilderService";
import { update } from "@react-spring/web";
import useCartItem from "hooks/useCartItem";

const BurgerMenu = dynamic(() => import("containers/header/BurgerMenu"), {
	loading: () => <div />,
});

const EDIT_NAME = "edit";
const DUPLICATE_NAME = "duplicate";
const DELETE_NAME = "delete";

const RenderShoppingCart = (props) => {
	const deviceState = useSelector((store) => store.deviceState);
	const { setStack, isEmptyBasket, params, isCountItemIsZero } = props;
	const { openMinimumPricePopup } = params;
	const translate = useTranslate();

	const catalogProducts = useSelector(
		(store) => store.menusData?.catalogProducts,
	);
	const cartItems = useSelector((store) => store.cartData);
	const menus = useSelector((store) => store.menusData.menus);
	const haveOrder = false;
	const order = useSelector((store) => store.order);
	const dispatch = useDispatch();
	const user = useSelector((store) => store.userData);
	const router = useRouter();
	const { hasOrder, didntReachMinimumPrice } = useOrder();
	const { itemWithDisclaimers, isCoupon } = useDisclaimers();
	const showMarketing = useShowMarketing();

	useEffect(() => {
		dispatch(Actions.setIsInitialRender(false));
		if (
			cartItems.hasOwnProperty("items") &&
			Array.isArray(cartItems?.items) &&
			cartItems?.items.length > 0
		) {
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
							const toppings = isPizza
								? getAllToppingsFromSubitems(item.subItems)
								: "";
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

			const listData = {
				value: cartItems.total,
				currency: "ILS",
			};
			AnalyticsService.viewCart(items, listData);
		}
	}, []);

	useEffect(() => {
		if (!hasOrder) {
			OrderStatusService.getStatusFromUserData(
				NO_ORDER_STATUS,
				null,
				onDisallowed,
			);

			function onDisallowed(status) {
				dispatch(
					Actions.addPopup({
						type: popupsTypes.CONTINUE_ACTIVE_ORDER,
						payload: {},
					}),
				);
			}
		}
	}, []);

	useEffect(() => {
		if (!menus && hasOrder) {
			const payload = { menuId: MENUS.DIGITAL_MENU };
			Api.getMenus({ payload });
		}
		if (hasOrder) {
			PizzaTreeService.init();
		}
	}, []);

	const handleSpecialRequest = () => {
		const payload = {};
		dispatch(
			Actions.addPopup({
				type: popupTypes.SPECIAL_REQUEST_CART,
				payload,
			}),
		);
	};

	const renderDeletePopup = () => {
		const payload = {
			title: translate("modal_cart_delete_all_items"),
			addTitle: "",
			subTitle: "",
			mainBtnText: translate("modal_cart_yes_delete"),
			subBtnText: translate("modal_cart_no_delete"),
			isLottie: true,
			mainBtnFunc: () => handleDeleteItems(),
			subBtnFunc: () => {},
			type: TWO_ACTION_TYPES.GARBAGE,
		};

		renderPopup(payload);
	};

	const renderDuplicatePopup = () => {
		const payload = {
			title: translate("duplicate_modal_title_full_price"),
			addTitle: translate("duplicate_modal_oneTimeSale_only"),
			subTitle: translate("duplicate_modal_coupon_grant"),
			mainBtnText: translate("duplicate_modal_main_btn"),
			subBtnText: translate("shoppingCart_popup_no_thanks"),
			isLottie: false,
			mainBtnFunc: () => handleDuplicate(),
			subBtnFunc: () => {},
			type: TWO_ACTION_TYPES.DUPLICATE,
		};
		renderPopup(payload);
	};

	function renderDeleteCoupon(uuid) {
		const payload = {
			title: translate("cart_delete_coupon"),
			addTitle: "",
			subTitle: "",
			mainBtnText: translate("modal_cart_yes_delete"),
			subBtnText: translate("modal_cart_no_delete"),
			isLottie: true,
			mainBtnFunc: () => handleDeleteItem(uuid),
			subBtnFunc: () => {},
			type: TWO_ACTION_TYPES.GARBAGE,
		};
		renderPopup(payload);
	}

	const renderDeleteItem = (uuid, isSale = false, data) => {
		const title = isSale
			? translate("cart_delete_meal")
			: translate("cart_delete_item");

		const payload = {
			title: title,
			addTitle: "",
			subTitle: "",
			mainBtnText: translate("modal_cart_yes_delete"),
			subBtnText: translate("modal_cart_no_delete"),
			isLottie: true,
			mainBtnFunc: () => handleDeleteItem(uuid, data),
			subBtnFunc: () => {},
			type: TWO_ACTION_TYPES.GARBAGE,
		};
		renderPopup(payload);
	};

	const renderDeleteSubItem = (callback) => {
		const payload = {
			title: translate("cart_delete_item"),
			addTitle: "",
			subTitle: "",
			mainBtnText: translate("modal_cart_yes_delete"),
			subBtnText: translate("modal_cart_no_delete"),
			isLottie: true,
			mainBtnFunc: callback,
			subBtnFunc: () => {},
			type: TWO_ACTION_TYPES.GARBAGE,
		};
		renderPopup(payload);
	};

	const renderUnresolvedCartItems = () => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.UNRESOLVED_CART_ITEMS,
				payload: {
					text: isCoupon
						? translate("unresolvedCouponsModal_description")
						: itemWithDisclaimers.disclaimers.join(" "),
				},
			}),
		);
	};

	const renderPopup = (payload) => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.TWO_ACTION,
				payload,
			}),
		);
	};

	function showIdentificationPopup(callback) {
		const onSuccess = deviceState.notDesktop ? callback : () => {};

		dispatch(
			Actions.addPopup({
				type: popupTypes.IDENTIFICATION,
				payload: {
					onSuccess,
				},
			}),
		);
	}

	function onFinish() {
		if (user.approvedTerms) {
			showMarketing(goToPayment);
		} else {
			showIdentificationPopup(() => showMarketing(goToPayment));
		}
	}

	const showUpSales = () => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.UPSALE,
				payload: {
					onFinish: () => {
						setTimeout(() => {
							onFinish();
						}, 400);
					},
				},
			}),
		);
	};

	const handlePaymentPress = () => {
		if (didntReachMinimumPrice) {
			return (
				typeof openMinimumPricePopup === "function" && openMinimumPricePopup()
			);
		} else if (itemWithDisclaimers) {
			return renderUnresolvedCartItems();
		}
		if (order?.isShownedUpSales) {
			onFinish();
		} else {
			showUpSales();
		}
		dispatch(Actions.setCartApproved(true));
	};

	const goToScreen = (screen) => {
		router.push(screen);
	};

	const navigationHelper = (select) => {
		switch (select) {
			case SHOPPING_CART_SCREEN_TYPES.EDIT:
				break;
			case SHOPPING_CART_SCREEN_TYPES.PAYMENT:
				handlePaymentPress();
				break;
			case SHOPPING_CART_SCREEN_TYPES.PRODUCT:
				goToScreen(Routes.menu);
				break;
			default:
				break;
		}
	};

	const handleDeleteItems = () => {
		CartService.emptyBasket();
	};

	const getCartItemLevels = (cartItem) => {
		let levels = 1;
		const subitems = cartItem?.subitems;
		if (Array.isArray(subitems) && subitems.length > 0) {
			levels++;
			const hasMoreLevels = subitems?.some(
				(parentSubitem) =>
					Array.isArray(parentSubitem?.subitems) &&
					parentSubitem?.subitems.length > 0,
			);
			if (hasMoreLevels) levels++;
		}
		return levels;
	};

	const getProductAndList = (product, idx, isPizza) => {
		const listData = {
			value: product.price,
			currency: "ILS",
		};
		const validItemCategory =
			product.triggeredBy === "recommendedKit"
				? ITEM_CATEGORY.SPECIAL
				: product.triggeredBy === "savedKit"
				? ITEM_CATEGORY.SPECIAL
				: null;
		const toppings =
			isPizza && Array.isArray(product.subItems) && product.subItems.length > 0
				? product.subItems
						.map((si) => catalogProducts[si.productId].name)
						.join(", ")
				: 0;

		const combinedProduct = Object.assign(
			{ index: idx, item_variant: toppings, item_category: validItemCategory },
			product,
		);
		return [combinedProduct, listData];
	};

	const addToCartEvent = (item, idx, isPizza) => {
		const product = {
			...catalogProducts[item.productId],
			...item,
		};
		const [combinedProduct, listData] = getProductAndList(product, idx, isPizza);
		AnalyticsService.addToCart(combinedProduct, listData);
	};

	const removeFromCartEvent = (item, idx, isPizza) => {
		const product = {
			...catalogProducts[item.productId],
			...item,
		};
		const [combinedProduct, listData] = getProductAndList(product, idx, isPizza);
		AnalyticsService.removeFromCart(combinedProduct, listData);
	};

	const extractItem = (items, itemId) => {
		return items.find((item) => item.productId === itemId);
	};

	const handleDuplicate = (item, idx, isPizza = false) => {
		const onSuccess = (res) => {
			const itemWithTrigger = extractItem(res.items, item.productId);
			addToCartEvent(itemWithTrigger, idx, isPizza);
		};
		CartService.copyBasketItem(item.uuid, onSuccess);
	};

	const handleEditItem = (item, index) => {
		dispatch(Actions.setIsUserAgreeToReset(false));
		PizzaTreeService.init(() => {
			const cartItem = parseCartItem(item);
			const fatherId = cartItem.productId;
			const subItems = cartItem.subitems;
			const cartItemLevels = getCartItemLevels(cartItem);
			// Check if not sale object and if not pizza
			const isItemTypeIsPizza = cartItemLevels >= 1 && isPizzaItem(cartItem);
			const getEditType = (id) => {
				const templateId = catalogProducts?.[id]?.templateId;
				const onSuccess = (res) => {
					const isSale = Array.isArray(res.steps);
					const isPizzaItemOrSale =
						(cartItemLevels >= 2 && isSale) || isItemTypeIsPizza;
					const isPizza = isPizzaItem(
						isSale ? cartItem?.subitems?.[index] : cartItem,
					);
					let pizzaId;
					let possiblePizzas;
					if (isPizza) {
						pizzaId = isSale ? item?.subItems?.[index].productId : fatherId;
						possiblePizzas = PizzaTreeService.getPossiblePizzasById(pizzaId);
					}

					dispatch(
						Actions.addPopup({
							type: popupTypes.BUILDER,
							payload: {
								saleId: isSale || !isItemTypeIsPizza ? fatherId : undefined,
								isSale,
								itemId: !isSale || !isItemTypeIsPizza ? fatherId : undefined,
								templateId: isSale ? templateId : undefined,
								fatherEntity: cartItem,
								isEdit: true,
								editIndex: index,
								isPizzaTypeItem: isPizzaItemOrSale,
								trigger: TRIGGER.BASKET,
								itemSubItems: !isItemTypeIsPizza && !isSale ? subItems : undefined,
								possiblePizzas,
								showBackOnFirst: true,
							},
						}),
					);
					dispatch(Actions.setCartItem(cartItem));
				};
				const props = {
					onSuccess,
					payload: {
						id: templateId,
					},
				};
				Api.getProductTemplate(props);
			};
			if (!catalogProducts?.[fatherId]) {
				const props = {
					onSuccess: (res) => getEditType(fatherId),
					payload: {
						productIds: [fatherId],
					},
				};
				Api.getProducts(props);
			} else {
				getEditType(fatherId);
			}
		});
	};

	const handleDeleteItem = (uuid, data) => {
		const onSuccess = (res) => {
			if (data) {
				const { item, index, isPizzaItem } = data;
				removeFromCartEvent(item, index, isPizzaItem);
			}
		};
		CartService.deleteBasketItem(uuid, onSuccess);
	};

	const handleDeleteUpgrades = (saleObj, upgradeId, stepIndex = 0) => {
		const onSuccess = ({ item }) => {
			const { productId } = saleObj;
			const product = catalogProducts[productId];
			const isMeal = product.hasOwnProperty("isMeal") && product.isMeal;
			delete item.upgrades;
			const updatedSaleObj = PizzaBuilderService.removeTopping(
				item,
				stepIndex,
				upgradeId,
				isMeal,
			);

			const payload = {
				insteadOf: saleObj.uuid,
				item: { ...updatedSaleObj },
			};

			CartService.addToCart(payload, null, () => {}, true, TRIGGER.BASKET);
		};
		renderDeleteSubItem(() => {
			CartService.validateAddToCart({ item: saleObj }, onSuccess);
		});
	};

	const getItems = () => {
		const checkIfPizzaItem = (item) => isPizzaItem(item);
		const couponInCart =
			(Array.isArray(cartItems?.items) &&
				cartItems.items.length > 0 &&
				cartItems?.items.some(
					(subitem) => catalogProducts?.[subitem?.productId]?.meta === "coupon",
				)) ||
			false;

		return (
			Array.isArray(cartItems?.items) &&
			cartItems.items.map((item, index) => {
				const isPizzaItem = checkIfPizzaItem(item);

				const isSale = isSaleItem(item.productId);
				const data = { item, index, isPizzaItem };
				const options = [
					{
						name: DUPLICATE_NAME,
						id: generateUniqueId(8),
						img: DuplicateIcon,
						text: translate("tooltip_duplicate"),
						onPress: () =>
							item.duplicateNoCoupon
								? renderDuplicatePopup()
								: handleDuplicate(item, index, isPizzaItem),
					},
					{
						name: EDIT_NAME,
						id: generateUniqueId(8),
						img: EditIcon,
						text: translate("tooltip_edit"),
						onPress: () => handleEditItem(item),
					},
					{
						name: DELETE_NAME,

						id: generateUniqueId(8),
						img: TrashIcon,
						text: translate("tooltip_delete"),
						onPress: () => renderDeleteItem(item.uuid, isSale, data),
					},
				];

				return (
					<RenderItem
						key={`cart-item-${item.uuid}`}
						item={item}
						options={options}
						isCouponIncluded={couponInCart}
						handleDelete={renderDeleteCoupon}
						onRemoveUpgrade={(subItem, index) =>
							handleDeleteUpgrades(item, subItem, index)
						}
						onEditItem={handleEditItem}
					/>
				);
			})
		);
	};

	function goToPayment() {
		setStack({ type: SHOPPING_CART_SCREEN_TYPES.PAYMENT, params: {} });
		beginCheckoutEvent();
	}

	const beginCheckoutEvent = () => {
		const [items, listData] = getItemsAndListData();
		AnalyticsService.beginCheckout(items, listData);
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
			value: cartItems.total,
			coupon: coupons ? coupons : 0,
			currency: "ILS",
		};

		return [items, listData];
	}

	return (
		<>
			{/*    HEADER    */}
			<HeaderCart
				deleteItems={renderDeletePopup}
				isEmptyBasket={isEmptyBasket}
			/>
			<BurgerMenu />

			<div
				className={clsx(
					styles["shopping-cart-body"],
					hasOrder ? styles["has-order"] : "",
					hasOrder && !isEmptyBasket ? styles["has-items"] : "",
				)}>
				<>
					{hasOrder && (
						<DeliveryTime
							icon={order?.isPickup ? PickupIcon : MotorcycleIcon}
							promiseTime={
								order?.isPickup
									? order?.pickup?.promiseTime
									: order?.delivery?.promiseTime
							}
							timedTo={
								order?.isPickup ? order?.pickup?.timedto : order?.delivery?.timedto
							}
							address={
								order?.isPickup ? order?.pickup?.storeName : order?.delivery?.address
							}
							specialRequest={handleSpecialRequest}
							deleteItems={renderDeletePopup}
							haveOrder={haveOrder}
							isPickup={order?.isPickup}
						/>
					)}
					{hasOrder && <Coupons />}
					{isEmptyBasket ? (
						<EmptyCart
							onClick={() => navigationHelper(SHOPPING_CART_SCREEN_TYPES.PRODUCT)}
						/>
					) : (
						<>
							{isCountItemIsZero && deviceState.isDesktop ? (
								<>
									{getItems()}
									<EmptyCart
										onClick={() => navigationHelper(SHOPPING_CART_SCREEN_TYPES.PRODUCT)}
										isCountItemIsZero={isCountItemIsZero}
									/>
								</>
							) : (
								<>
									{/* ITEMS */}
									{getItems()}

									{/* ADD ITEMS */}
									{!deviceState.isDesktop && (
										<FloatingActionButton
											onClick={() => navigationHelper(SHOPPING_CART_SCREEN_TYPES.PRODUCT)}
											className={styles["more-items"]}>
											<div className={styles["icon-wrapper"]}>
												<img
													className={styles["icon"]}
													src={AddIcon.src}
													aria-hidden={true}
													alt="add"
												/>
											</div>
											<span className={styles["more-items-label"]}>
												{translate("cat_another_thing")}
											</span>
										</FloatingActionButton>
									)}
								</>
							)}
						</>
					)}
				</>
				{/*    BUTTON    */}
				{deviceState.notDesktop && !isEmptyBasket ? (
					<div className={styles["actions"]}>
						<BlueButton
							className={styles["blue-btn-wrap"]}
							text={translate("cart_to_order")}
							isEmptyBasket={isEmptyBasket}
							onClick={() => navigationHelper(SHOPPING_CART_SCREEN_TYPES.PAYMENT)}
							price={cartItems?.totalBeforeDiscount}
							priceAfterSale={cartItems?.total}
							showPriceBeforeDiscount={cartItems?.showTotalBeforeDiscount}
						/>
						<CartDisclaimer />
						<div className={styles["gradient"]}></div>
					</div>
				) : null}
			</div>
		</>
	);
};

export default RenderShoppingCart;

function RenderItem(props) {
	const { item, options, handleDelete, onRemoveUpgrade, onEditItem } = props;
	const product = useMenus(item?.productId, ActionTypes.PRODUCT);
	const [quantity] = useCartInMenu(item.productId);
	const [adjustedOptions, setAdjustedOptions] = useState(options);

	const isCouponItem = product.meta === "coupon";
	const isBenefitItem = product.meta === "Gift";

	const currentMeta = product.meta;

	const image = getFullMediaUrl(
		product,
		MEDIA_TYPES.PRODUCT,
		MEDIA_ENUM.IN_MENU,
		"png",
	);

	useEffect(() => {
		// Remove duplicate option if item is coupon or benefit.
		// remove dulipcate on item with 1 in maxPerSale
		let temp = [...options];

		if (
			!item.canBeCopied ||
			product?.quantity?.maxPerSale === 1 ||
			quantity >= product?.quantity?.maxPerSale
		) {
			temp = temp.filter((t) => t.name !== DUPLICATE_NAME);
		}

		if (product?.quantity?.minPerSale === 1) {
			temp = temp.filter((t) => t.name !== DELETE_NAME);
		}

		if (
			!product.templateId ||
			product.meta === META_ENUM.DEALS ||
			product.meta === META_ENUM.COUPON
		) {
			temp = temp.filter((t) => t.name !== EDIT_NAME);
		}

		setAdjustedOptions(temp);
	}, [
		item.canBeCopied,
		options,
		quantity,
		product?.quantity?.maxPerSale,
		product?.quantity?.minPerSale,
	]);
	switch (currentMeta) {
		case "deliveryFee": {
			return (
				<DeliveryFee
					text={product.nameUseCases?.Title}
					price={item?.total}
				/>
			);
		}
		case "discountCoupon": {
			return (
				<DiscountItem
					id={item.productId}
					uuid={item.uuid}
					price={item?.total}
					onDelete={handleDelete}
					text={product.nameUseCases?.Title}
					disclaimers={item.disclaimers}
				/>
			);
		}
		case "coupon":
		case "Gift": {
			return (
				<Item
					image={image}
					isCouponItem={isCouponItem}
					isBenefitItem={isBenefitItem}
					price={item?.totalBeforeDiscount}
					newPrice={item?.total}
					subItems={item.subItems}
					subText={item.extraData}
					text={product.nameUseCases?.Title}
					options={adjustedOptions}
					showPriceBeforeDiscount={item.showPriceBeforeDiscount}
					onRemoveUpgrade={onRemoveUpgrade}
					onEditItem={(index) => onEditItem(item, index)}
				/>
			);
		}
		case META_ENUM.DEALS:
			return (
				<DealCartItem
					price={item?.totalBeforeDiscount}
					disclaimers={item?.disclaimers}
					newPrice={item?.total}
					subItems={item.subItems}
					subText={item.extraData}
					text={product.nameUseCases?.Title}
					options={adjustedOptions}
					showPriceBeforeDiscount={item.showPriceBeforeDiscount}
					onRemoveUpgrade={onRemoveUpgrade}
					onEditItem={(index) => onEditItem(item, index)}
				/>
			);

		default:
			return (
				<SimpleCartItem
					image={image}
					price={item?.totalBeforeDiscount}
					disclaimers={item?.disclaimers}
					newPrice={item?.total}
					subItems={item.subItems}
					subText={item.extraData}
					text={product.nameUseCases?.Title}
					options={adjustedOptions}
					showPriceBeforeDiscount={item.showPriceBeforeDiscount}
					onRemoveUpgrade={onRemoveUpgrade}
					onEditItem={(index) => onEditItem(item, index)}
				/>
			);
	}
}
