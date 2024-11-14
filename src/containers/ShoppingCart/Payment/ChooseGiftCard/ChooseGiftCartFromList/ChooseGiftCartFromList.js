import { useEffect } from "react";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";

function ChooseGiftCartFromList(props) {
	const { setStack, giftCard } = props;
	useEffect(() => {
		renderGiftCardFrame();
	}, [giftCard.id]);

	const renderGiftCardFrame = () => {
		const payload = {
			type: PAYMENT_SCREEN_TYPES.GIFT_CARD,
			params: { method: giftCard },
		};

		if (payload) {
			setStack(payload);
		}
	};

	return null;
}

export default ChooseGiftCartFromList;
