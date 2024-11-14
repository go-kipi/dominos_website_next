import { useSelector } from "react-redux";

function useDisclaimers() {
	const cartItems = useSelector((store) => store.cartData.items);
	const catalog = useSelector((store) => store.menusData.catalogProducts);

	for (const index in cartItems) {
		const item = cartItems[index];
		if (Array.isArray(item.disclaimers) && item.disclaimers.length > 0) {
			const productId = item.productId;
			const product = catalog[productId];

			const isDiscountCoupon = product.meta === "discountCoupon";
			const isCouponItem = product.meta === "coupon";
			const isCoupon = isDiscountCoupon || isCouponItem;

			return { itemWithDisclaimers: item, isCoupon };
		}
	}
	return { itemWithDisclaimers: undefined, isCoupon: undefined };
}

export default useDisclaimers;
