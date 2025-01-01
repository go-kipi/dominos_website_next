import { META_ENUM } from "constants/menu-meta-tags";
import { cart } from "constants/routes";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import CartService from "services/CartService";
import PizzaBuilderService from "services/PizzaBuilderService";

export const useDipsManager = (
	stepIndex = 0,
	isSale,
	TRIGGER,
	userInteractWithDips,
	isEdit = false,
) => {
	const dispatch = useDispatch();
	const cartItem = useSelector((store) => store.cartItem);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const currentProductTemplate = useSelector(
		(store) => store.currentProductTemplate,
	);
	const defaultDipsSelection = currentProductTemplate?.components?.find(
		(cmp) => cmp.meta === META_ENUM.PIZZA_DIPS,
	)?.defaultProducts;
	const clonedCartItem = useRef(JSON.parse(JSON.stringify(cartItem)));

	useEffect(() => {
		clonedCartItem.current = JSON.parse(JSON.stringify(cartItem));
	}, [cartItem]);

	const dipsAmountInCart = getDipsAmount();

	useEffect(() => {
		if (userInteractWithDips || isEdit) return;

		if (dipsAmountInCart === 0 && defaultDipsSelection?.length > 0) {
			return processDipsSequentially(defaultDipsSelection, 0);
		}

		if (dipsAmountInCart > 0 && defaultDipsSelection?.length) {
			resetDefaultDips(() => {
				processDipsSequentially(defaultDipsSelection, 0);
			});
		}

		if (dipsAmountInCart > 0 && !defaultDipsSelection?.length) {
			resetDefaultDips();
		}
	}, [defaultDipsSelection]);

	function processDipsSequentially(dipsArray, index) {
		if (index >= dipsArray.length) {
			dispatch(Actions.setCartItem(clonedCartItem.current));
			return;
		}
		const { productId, qtty } = dipsArray[index];
		const currProduct = catalogProducts[productId];

		onAutoIncrement(currProduct, qtty, () => {
			processDipsSequentially(dipsArray, index + 1);
		});
	}

	function resetDefaultDips(callback) {
		const updatedCartItem = PizzaBuilderService.setSubItems(
			clonedCartItem.current,
			[],
			stepIndex,
			isSale,
		);

		CartService.validateAddToCart(
			{ item: updatedCartItem },
			(res) => {
				const { item } = res;
				clonedCartItem.current = item;
				dispatch(Actions.setCartItem(clonedCartItem.current));
				callback();
			},
			TRIGGER,
		);
	}

	function onAutoIncrement(autoSelectedProduct, amount, callback) {
		if (amount === 0) {
			typeof callback === "function" && callback();
			return;
		}

		const updatedCartItem = PizzaBuilderService.addDip(
			clonedCartItem.current,
			stepIndex,
			autoSelectedProduct,
			isSale,
		);

		CartService.validateAddToCart(
			{ item: updatedCartItem },
			(res) => {
				const { item } = res;
				clonedCartItem.current = item;
				onAutoIncrement(autoSelectedProduct, amount - 1, callback);
			},
			TRIGGER,
		);
	}

	function getDipsAmount() {
		const pizzaToppingsAndDips = isSale
			? cartItem?.subitems?.[stepIndex].subitems
			: cartItem?.subitems;
		const itemQuantity = pizzaToppingsAndDips?.filter((item) => {
			const checkedProduct = catalogProducts[item.productId];
			return checkedProduct?.meta === META_ENUM.PIZZA_DIP;
		});
		return itemQuantity?.length || 0;
	}

	function getCurrentDips() {
		const pizzaToppingsAndDips = isSale
			? cartItem?.subitems?.[stepIndex].subitems
			: cartItem?.subitems;

		return (
			pizzaToppingsAndDips?.filter((item) => {
				const checkedProduct = catalogProducts[item.productId];
				return checkedProduct?.meta === META_ENUM.PIZZA_DIP;
			}) || []
		);
	}
};
