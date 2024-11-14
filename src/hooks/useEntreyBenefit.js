import { useSelector } from "react-redux";
import BENEFITS_TYPES from "constants/BenefitsTypes";

function useEntryBenefit(shouldUseCartItemCount = false) {
	const userData = useSelector((store) => store.userData);
	const cartData = useSelector((store) => store.cartData);

	const cartItems = cartData?.items;
	const itemCount = cartData?.itemCount ?? 0;

	const benefits = userData?.benefits || [];

	const entreyBenefit = benefits.find(
		(benefit) => benefit.benefitType === BENEFITS_TYPES.ENTREY,
	);

	if (entreyBenefit) {
		const productId = entreyBenefit.productID;
		const benefitCartItem = cartItems?.find(
			(item) => item.productId === productId,
		);

		if ((shouldUseCartItemCount && itemCount > 0) || benefitCartItem) {
			return false;
		}
	}
	return entreyBenefit;
}
export default useEntryBenefit;
