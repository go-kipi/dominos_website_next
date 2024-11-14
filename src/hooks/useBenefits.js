import { useSelector } from "react-redux";
import BENEFITS_TYPES from "constants/BenefitsTypes";

function useBenefits() {
	const userData = useSelector((store) => store.userData);
	const cartItems = useSelector((store) => store.cartData.items);

	const benefits = userData?.benefits || [];

	const benefitsArray = [];
	for (const key in cartItems) {
		const cartItem = cartItems[key];
		if (cartItem.benefitId) {
			benefitsArray.push(cartItem.benefitId);
		}
	}

	const restBenefits = benefits.filter(
		(benefit) =>
			benefit.benefitType !== BENEFITS_TYPES.ENTREY &&
			!benefitsArray.includes(benefit.id),
	);
	return restBenefits || [];
}
export default useBenefits;
