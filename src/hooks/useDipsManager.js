import { META_ENUM } from "constants/menu-meta-tags";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import CartService from "services/CartService";
import PizzaBuilderService from "services/PizzaBuilderService";

export const useDipsManager = (stepIndex = 0, isSale, TRIGGER) => {
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
	const dipsAmountInCart = getDipsAmount();

	useEffect(() => {
		if (dipsAmountInCart === 0 && defaultDipsSelection?.length) {
			processDipsSequentially(defaultDipsSelection, 0);
		}
	}, [defaultDipsSelection?.length]);

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

	function onAutoIncrement(autoSelectedProduct, amount, callback) {
		if (amount === 0) {
			callback();
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
};
