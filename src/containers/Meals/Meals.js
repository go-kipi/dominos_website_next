import Deal from "components/Deal";
import * as popupTypes from "constants/popup-types";
import React, { useEffect, useRef, useState } from "react";
import { getFullMediaUrl, isPizzaItem, notEmptyObject } from "utils/functions";
import useMenus from "hooks/useMenus";
import { MEDIA_ENUM } from "constants/media-enum";
import { MEDIA_TYPES } from "constants/media-types";
import { useDispatch, useSelector } from "react-redux";
import { STEPS } from "constants/validation-steps-enum";
import { VALIDATION_STATUS } from "constants/ValidationStatusEnum";
import Actions from "redux/actions";
import useCartInMenu from "hooks/useCartInMenu";
import CartService from "services/CartService";
import styles from "./Meals.module.scss";
import { META_ENUM } from "constants/menu-meta-tags";
import useGetMenuByMeta from "hooks/useGetMenuByMeta";
import { TRIGGER } from "constants/trigger-enum";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { ITEM_CATEGORY2 } from "constants/AnalyticsTypes";
import EmarsysService from "utils/analyticsService/EmarsysService";

function Meals(props) {
	const dealsSubMenu = useGetMenuByMeta(META_ENUM.DEALS);

	const menuPath = useSelector((store) => store.menuPath);
	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const listName = topNav?.elements?.find((el) => el.id === topNavId)?.label;
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);

	const hasElementsDeals =
		dealsSubMenu &&
		dealsSubMenu.elements &&
		notEmptyObject(dealsSubMenu.elements);

	const items = hasElementsDeals ? dealsSubMenu.elements : [];
	useEffect(() => {
		if (
			hasElementsDeals &&
			typeof catalogProducts === "object" &&
			Object.keys(catalogProducts).length
		) {
			const products = items.map((item, index) =>
				Object.assign({ index }, catalogProducts[item?.id], {
					item_category2: ITEM_CATEGORY2.DEAL,
				}),
			);
			addViewProductListEvent(products);
		}
	}, [hasElementsDeals]);

	const addViewProductListEvent = (products) => {
		const listItem = {
			id: topNavId,
			name: listName,
		};
		AnalyticsService.viewItemList(products, listItem);
	};

	return (
		<div className={styles["products-wrapper"]}>
			{typeof items === "object" &&
				items?.length > 0 &&
				items?.map((product, index) => {
					return (
						<RenderDeal
							key={"deal-" + index}
							product={product}
							item={product}
							index={index}
						/>
					);
				})}
		</div>
	);
}

export default Meals;

const RenderDeal = (props) => {
	const { item, index } = props;
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const dispatch = useDispatch();
	const [isCounterDisabled, setIsCounterDisabled] = useState(false);
	const product = useMenus(item?.id, item?.actionType);
	const deviceState = useSelector((store) => store.deviceState);
	const [quantity, addToBasket, removeFromBasket] = useCartInMenu(product.id);
	const menuPath = useSelector((store) => store.menuPath);
	const [disabledClick, setDisabledClick] = useState(false);
	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const imgUrl = getFullMediaUrl(
		product,
		MEDIA_TYPES.PRODUCT,
		deviceState.isDesktop ? MEDIA_ENUM.IN_MENU : MEDIA_ENUM.IN_MENU_MOBILE,
		"jpeg",
	);

	const defaultItem = {
		item_list_id: topNavId,
		item_category2: ITEM_CATEGORY2.DEAL,
		coupon: 0,
	};

	const getAllToppingsFromSubitems = (subitems) => {
		let toppingsStr = "NA";
		if (!Array.isArray(subitems) || subitems.length === 0) return toppingsStr;
		toppingsStr = "";
		subitems.forEach((item) => {
			const cartItem = CartItemEntity.getObjectLiteralItem(
				item.productId,
				1,
				item.subitems,
			);
			const toppings = cartItem.subitems;
			if (
				isPizzaItem(cartItem) &&
				Array.isArray(toppings) &&
				toppings.length > 0
			) {
				toppingsStr += toppings
					.map((si) => catalogProducts[si.productId]?.name)
					.join(", ");
			}
		});
		return toppingsStr;
	};

	const addToCartEvent = (payload) => {
		if (payload.item?.subitems) {
			const toppings = getAllToppingsFromSubitems(payload.item.subitems);
			const list = {
				value: product.price,
				currency: "ILS",
			};
			const combinedProduct = Object.assign(
				{
					...defaultItem,
					item_list_name: list,
					index,
					item_variant: toppings,
				},
				product,
			);
			AnalyticsService.addToCart(combinedProduct, list);
		}
	};

	const removeFromCartEvent = () => {
		const list = {
			value: product.price,
			currency: "ILS",
		};
		const combinedProduct = Object.assign(
			{
				...defaultItem,
				index,
				item_list_name: list,
			},
			product,
		);

		AnalyticsService.removeFromCart(combinedProduct, list);
	};

	function Decrement(rect) {
		onChange(quantity - 1, rect);
	}

	function onChange(
		currentQuantity,
		rect,
		closeBuilderCallback,
		optionalPayload = null,
	) {
		setIsCounterDisabled(true);
		if (currentQuantity > quantity) {
			const diff = currentQuantity - quantity;
			addToBasket(diff, null, onSuccessAddToBasket, optionalPayload);

			function onSuccessAddToBasket() {
				setIsCounterDisabled(false);
				typeof closeBuilderCallback === "function" && closeBuilderCallback();
			}
		} else if (currentQuantity < quantity) {
			const decrementBy = quantity - currentQuantity;
			removeFromBasket(decrementBy, onRemoveFromBasket);

			function onRemoveFromBasket() {
				setIsCounterDisabled(false);
				typeof closeBuilderCallback === "function" && closeBuilderCallback();
				removeFromCartEvent();
			}
		}
	}

	// function onChange(currentQuantity, callback = () => {}, optionalPayload = null) {
	//   setIsCounterDisabled(true);
	//   if (currentQuantity > quantity) {
	//     const diff = currentQuantity - quantity;
	//     addToBasket(diff, null, () => {
	//       typeof callback === 'function' && callback();
	//       setIsCounterDisabled(false);
	//     }, optionalPayload);
	//   } else if (currentQuantity < quantity) {
	//     const decrementBy = quantity - currentQuantity;
	//     removeFromBasket(decrementBy, () => {
	//       typeof callback === 'function' && callback();
	//       setIsCounterDisabled(false);
	//     });
	//   }
	// }
	const openBuilderModal = (saleEntity, rect, closeBuilderCallback) => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.BUILDER,
				payload: {
					templateId: product.templateId,
					saleId: product.id,
					fatherEntity: saleEntity,
					trigger: TRIGGER.MENU,
					onEndOfSaleAddCallback: (payload) => {
						addToCartEvent(payload);
						onChange(quantity + 1, rect, closeBuilderCallback, payload);
					},
					onEndOfSaleCartCallback: (payload) => {
						addToCartEvent(payload);
					},
				},
			}),
		);
		dispatch(Actions.setCartItem(saleEntity));
	};

	const addToCartHandler = (rect, onIncrementCallback) => {
		const saleEntity = CartItemEntity.getObjectLiteralItem(product.id);
		const payload = {
			step: `${STEPS.ADD_SALE} - ${saleEntity.productId}`,
			item: saleEntity,
		};
		CartService.addToCart(
			payload,
			(res) => {
				if (res.overallstatus === VALIDATION_STATUS.INCOMPLETE) {
					openBuilderModal(saleEntity, rect, onIncrementCallback);
					EmarsysService.setViewSideDishComplex(saleEntity);
				}
			},
			null,
			true,
			TRIGGER.MENU,
		);
	};

	return (
		<>
			<div
				className={styles["deal-product-wrapper"]}
				role={"tabpanel"}>
				<Deal
					id={item?.id}
					name={product?.name}
					price={product?.price}
					counter={quantity}
					oldPrice={product.priceBeforeDiscount}
					showPriceBeforeDiscount={product.showPriceBeforeDiscount}
					image={imgUrl}
					title={product?.nameUseCases?.Title}
					mark
					min={product?.quantity?.minPerSale}
					max={product?.quantity?.maxPerSale}
					outOfStock={product.outOfStock}
					isCounterDisabled={isCounterDisabled}
					onClick={(rect, onIncrementCallback) =>
						addToCartHandler(rect, onIncrementCallback)
					}
					onIncrement={(rect, onIncrementCallback) =>
						addToCartHandler(rect, onIncrementCallback)
					}
					onDecrement={(rect, onDecrementCallback) =>
						Decrement(rect, onDecrementCallback)
					}
					disabledClick={disabledClick}
				/>
			</div>
		</>
	);
};
