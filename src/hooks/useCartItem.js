import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import useStackNavigation from "./useStackNavigation";
import { META_ENUM } from "constants/menu-meta-tags";
import STACK_TYPES from "constants/stack-types";

function useCartItem() {
	const saleObj = useSelector((store) => store.cartItem);

	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const stackNavigation = useStackNavigation(STACK_TYPES.BUILDER, true);

	const stepIndex = stackNavigation.current.main;

	const isSaleItem = useMemo(() => isSale(), [saleObj, catalogProducts]);

	function getToppings() {}

	function getPizzaId() {}

	function getDough() {}

	function getSpecialRequests() {}

	function getSubItems() {
		if (isSaleItem) {
			return saleObj.subitems[stepIndex].subitems;
		} else {
			return saleObj.subitems;
		}
	}

	function isSale() {
		if (saleObj.productId) {
			const productId = saleObj.productId;
			const product = catalogProducts[productId];
			if (product.isMeal) {
				return true;
			}
		}
		return false;
	}

	function filterSpecialRequests() {
		const subItems = getSubItems();

		const items = [];
		if (Array.isArray(subItems)) {
			for (const item of subItems) {
				const productId = item.productId;
				const product = catalogProducts[productId];
				if (product && product.meta !== META_ENUM.PIZZA_PREP) {
					items.push(item);
				}
			}
		}
		return items;
	}

	return {
		filterSpecialRequests,
		getToppings,
		getPizzaId,
		getDough,
		getSpecialRequests,
		getSubItems,
		isSale,
	};
}

export default useCartItem;
