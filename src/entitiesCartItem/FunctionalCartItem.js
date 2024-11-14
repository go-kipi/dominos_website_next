const CartItemEntity = (() => {
	let cartItem = {
		productId: "",
		quantity: 1,
		subitems: [],
		quarters: null,
		triggerProductId: null,
		uuid: null,
		benefitId: null,
	};

	const getItem = () => cartItem;

	const getObjectLiteralItem = (
		productId = "",
		quantity = 1,
		subitems = [],
		quarters = null,
		triggerProductId = null,
		uuid = null,
		benefitId = null,
	) => {
		return {
			productId,
			quantity,
			subitems,
			quarters: quarters,
			triggerProductId: triggerProductId,
			uuid: uuid,
			benefitId: benefitId,
		};
	};

	const init = (
		productId = "",
		quantity = 1,
		subitems = [],
		quarters = null,
		triggerProductId = null,
		uuid = null,
		benefitId = null,
	) => {
		cartItem.productId = productId;
		cartItem.quantity = quantity;
		cartItem.subitems = subitems;
		cartItem.quarters = quarters;
		cartItem.triggerProductId = triggerProductId;
		cartItem.uuid = uuid;
		cartItem.benefitId = benefitId;
	};

	const updateItem = (
		productId,
		quantity,
		subitems,
		quarters,
		triggerProductId,
		uuid,
		benefitId,
	) => {
		let updatedCartItem;
		if (productId) {
			updatedCartItem = { ...cartItem, productId };
			cartItem = updatedCartItem;
		} else if (quantity) {
			updatedCartItem = { ...cartItem, quantity };
			cartItem = updatedCartItem;
		} else if (subitems) {
			updatedCartItem = { ...cartItem, subitems };
			cartItem = updatedCartItem;
		} else if (quarters) {
			updatedCartItem = { ...cartItem, subitems };
			cartItem = updatedCartItem;
		} else if (triggerProductId) {
			updatedCartItem = { ...cartItem, triggerProductId };
			cartItem = updatedCartItem;
		} else if (uuid) {
			updatedCartItem = { ...cartItem, subitems };
			cartItem = updatedCartItem;
		} else if (benefitId) {
			updatedCartItem = { ...cartItem, benefitId };
			cartItem = updatedCartItem;
		}
		updatedCartItem = null;
	};

	const parseValidateRes = (res) => {
		const item = res?.item;
		return {
			productId: item?.productId,
			quantity: item?.quantity,
			subitems: item?.subitems,
			quarters: item?.quarters,
			benefitId: item?.benefitId,
		};
	};

	return {
		getItem,
		getObjectLiteralItem,
		init,
		updateItem,
		parseValidateRes,
	};
})();

export default CartItemEntity;
