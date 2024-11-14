import Beverage from "components/Beverage";
import React, { useEffect, useState } from "react";

import styles from "./Beverages.module.scss";

import useMenus from "hooks/useMenus";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import {
	getFullMediaUrl,
	notEmptyObject,
	optimisticCart,
} from "../../utils/functions";
import { MEDIA_TYPES } from "../../constants/media-types";
import { MEDIA_ENUM } from "../../constants/media-enum";

import useCartInMenu from "hooks/useCartInMenu";
import animationTypes from "../../constants/animationTypes";
import { META_ENUM } from "constants/menu-meta-tags";
import useGetMenuByMeta from "hooks/useGetMenuByMeta";
import useTranslate from "hooks/useTranslate";
import useTags from "hooks/useTags";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import EmarsysService from "utils/analyticsService/EmarsysService";

function Beverages(props) {
	const beveragesSubMenu = useGetMenuByMeta(META_ENUM.BEVERAGES);

	const hasElementsBeverages =
		beveragesSubMenu &&
		beveragesSubMenu.elements &&
		notEmptyObject(beveragesSubMenu.elements);

	const items = hasElementsBeverages ? beveragesSubMenu.elements : [];
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const menuPath = useSelector((store) => store.menuPath);
	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const listName = topNav?.elements?.find((el) => el.id === topNavId)?.label;

	useEffect(() => {
		if (hasElementsBeverages) {
			const products = items.map((item, index) =>
				Object.assign({ index }, catalogProducts[item?.id]),
			);
			addViewProductListEvent(products);
		}
	}, [hasElementsBeverages]);

	const addViewProductListEvent = (products) => {
		const listItem = {
			id: topNavId,
			name: listName,
		};
		AnalyticsService.viewItemList(products, listItem);
	};

	function RenderItem(item, index) {
		return (
			<div
				className={styles["item"]}
				key={"beverage-" + index}>
				<RenderBeverage
					item={item}
					index={index}
				/>
			</div>
		);
	}

	return (
		<div className={styles["beverages-wrapper"]}>
			<div
				className={styles["list-wrapper"]}
				role={"tabpanel"}>
				{items.map((item, index) => RenderItem(item, index))}
			</div>
		</div>
	);
}

export default Beverages;

function RenderBeverage({ item, index }) {
	const Product = useMenus(item.id, item.actionType);
	const imgUrl = getFullMediaUrl(item, MEDIA_TYPES.PRODUCT, MEDIA_ENUM.IN_MENU);
	const [quantity, addToBasket, removeFromBasket] = useCartInMenu(item.id);
	const [isCounterDisabled, setIsCounterDisabled] = useState(false);
	const menuPath = useSelector((store) => store.menuPath);
	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const listName = topNav?.elements?.find((el) => el.id === topNavId)?.label;

	const dispatch = useDispatch();
	const translate = useTranslate();
	const { url, label } = useTags(Product.tags);

	const selectItemEvent = () => {
		const listItem = {
			id: topNavId ? topNavId : 0,
			name: listName ? listName : 0,
		};
		const combinedItem = Object.assign(
			{ index },
			Product,
		);
		EmarsysService.setViewSimple(Product);
		AnalyticsService.selectItem(combinedItem, listItem);
	};

	function Increment(id, rect) {
		onChange(quantity + 1, rect, () => onRemoveFromBasket(rect, true));
	}

	function Decrement(id, rect) {
		onChange(quantity - 1, rect, () => onSuccessAddToBasket(rect, true));
	}

	function onRemoveFromBasket(rect, isRejection = false) {
		const cartIcon = document.getElementById("cart-icon").getBoundingClientRect();
		const from = {
			py: cartIcon.y,
			width: cartIcon.width,
			height: cartIcon.height,
			right: cartIcon.right,
			left: cartIcon.left,
		};
		const to = {
			...rect,
		};
		dispatch(
			Actions.addAnimation({
				type: animationTypes.MOVING_IMAGE,
				payload: {
					from,
					to,
					image: imgUrl,
				},
			}),
		);
		setIsCounterDisabled(false);
		if (isRejection) optimisticCart(item.id, -1, true);
		removeFromCartEvent();
	}

	function onSuccessAddToBasket(rect, isRejection = false) {
		const cartIcon = document.getElementById("cart-icon").getBoundingClientRect();
		const to = {
			py: cartIcon.y,
			width: cartIcon.width,
			height: cartIcon.height,
			right: cartIcon.right,
			left: cartIcon.left,
		};
		const from = {
			...rect,
		};
		dispatch(
			Actions.addAnimation({
				type: animationTypes.MOVING_IMAGE,
				payload: {
					from,
					to,
					image: imgUrl,
				},
			}),
		);
		setIsCounterDisabled(false);
		if (isRejection) optimisticCart(item.id, 1);
		addToCartEvent();
	}

	const getProductAndList = () => {
		const list = {
			value: Product.price,
			currency: "ILS",
		};
		const combinedProduct = Object.assign(
			{
				index,
				item_list_id: topNavId,
				item_list_name: list,
				coupon: 0,
			},
			Product,
		);
		return [combinedProduct, list];
	};

	const addToCartEvent = () => {
		const [combinedProduct, list] = getProductAndList();
		AnalyticsService.addToCart(combinedProduct, list);
	};

	const removeFromCartEvent = () => {
		const [combinedProduct, list] = getProductAndList();
		AnalyticsService.removeFromCart(combinedProduct, list);
	};

	function onChange(currentQuantity, rect, onRejection) {
		setIsCounterDisabled(true);
		if (currentQuantity > quantity) {
			const diff = currentQuantity - quantity;
			onSuccessAddToBasket(rect);
			addToBasket(diff, null, null, null, onRejection);
		} else if (currentQuantity < quantity) {
			const decrementBy = quantity - currentQuantity;
			onRemoveFromBasket(rect);
			removeFromBasket(decrementBy, null, onRejection);
		}
	}

	return (
		<Beverage
			alt={Product?.name}
			title={Product?.nameUseCases?.Title ?? Product?.name}
			description={Product?.nameUseCases?.SubTitle}
			price={Product.price}
			oldPrice={Product.priceBeforeDiscount}
			showPriceBeforeDiscount={Product.showPriceBeforeDiscount}
			image={imgUrl}
			onIncrement={Increment}
			onDecrement={Decrement}
			counter={quantity}
			id={item.id}
			outOfStock={Product.outOfStock}
			min={0}
			max={Product?.quantity?.maxPerSale}
			label={label}
			isCounterDisabled={isCounterDisabled}
			productClick={selectItemEvent}
		/>
	);
}
