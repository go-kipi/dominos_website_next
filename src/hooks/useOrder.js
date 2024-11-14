import { useSelector } from "react-redux";

export default function useOrder() {
	const order = useSelector((store) => store.order);
	const cartData = useSelector((store) => store.cartData);

	const hasDisclaimers =
		Array.isArray(cartData?.disclaimers) && cartData.disclaimers.length > 0;

	const didntReachMinimumPrice =
		hasDisclaimers &&
		cartData.disclaimers.includes("BasketDidNotReachMinimumSum");

	const hasOrder = !!order?.hasActiveOrder;

	return { hasOrder, didntReachMinimumPrice };
}
