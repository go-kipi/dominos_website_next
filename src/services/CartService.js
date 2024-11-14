import Api from "api/requests";
import { Store } from "redux/store";
import { optimisticCart } from "utils/functions";

const CartService = {
	addToCart: (
		payload,
		validateCallback,
		addToBasketCallback,
		addToCart = true,
		trigger,
	) => {
		if (!payload) return;
		const uuid = Store.getState().cartItem?.uuid;
		if (uuid) {
			payload.insteadOf = uuid;
		}
		CartService.validateAddToCart(
			{
				item: { ...payload.item, quantity: 1, triggeredBy: trigger },
				insteadOf: payload?.insteadOf,
				step: payload?.step,
			},
			onSuccess,
			trigger,
		);
		function onSuccessAddToBasket(data) {
			typeof addToBasketCallback === "function" && addToBasketCallback(data);
		}

		function onSuccess(data) {
			typeof validateCallback === "function" && validateCallback(data);
			if (!data.overallstatus && addToCart) {
				Api.addBasketItem({
					payload: {
						item: { quantity: 1, ...payload.item, triggeredBy: trigger },
						insteadOf: payload?.insteadOf,
						step: payload?.step,
					},
					shouldHideLoader: true,
					onSuccess: onSuccessAddToBasket,
				});
			}
		}
	},

	validateAddToCart: (payload, onSuccess, trigger) => {
		const item = { ...payload.item };
		delete item.pricingBalance;
		Api.validateAddBasketItem({
			payload: {
				item: { ...item, quantity: 1, triggeredBy: trigger },
				insteadOf: payload?.insteadOf,
				step: payload?.step,
			},
			onSuccess: (res) => {
				typeof onSuccess === "function" && onSuccess(res);
			},
		});
	},

	changeBasketItemQuantity: (uuid, quantity, callback) => {
		const payload = { uuid, quantity };
		Api.changeBasketItemQuantity({ payload, onSuccess });
		function onSuccess(data) {
			typeof callback === "function" && callback(data);
		}
	},
	deleteBasketItem: (uuid, callback) => {
		const payload = { uuid };
		Api.deleteBasketItem({ payload, shouldHideLoader: true, onSuccess });
		function onSuccess(data) {
			typeof callback === "function" && callback(data);
		}
	},
	emptyBasket: (callback) => {
		const payload = {};
		Api.emptyBasket({ payload, onSuccess });
		function onSuccess(data) {
			typeof callback === "function" && callback(data);
		}
	},

	copyBasketItem: (uuid, callback) => {
		const payload = { uuid };
		Api.copyBasketItem({ payload, onSuccess });
		function onSuccess(data) {
			typeof callback === "function" && callback(data);
		}
	},
	optimisticAddToCart: (payload, callback, onRejection) => {
		const { item } = payload;
		const { productId, quantity } = item;
		optimisticCart(productId, quantity);
		const anim = setTimeout(() => {
			Api.addBasketItem({
				payload,
				shouldHideLoader: true,
				onSuccess: onSuccessAddToBasket,
				onFailure: gracefulRejection,
				onRejection: gracefulRejection,
			});
		}, 600);
		function gracefulRejection() {
			const timeout = setTimeout(() => {
				typeof onRejection === "function" && onRejection();
				clearTimeout(timeout);
			}, 1000);
		}
		function onSuccessAddToBasket(data) {
			typeof callback === "function" && callback(data);
			clearTimeout(anim);
		}
	},
	optimisticDeleteBasketItem: (uuid, callback, onRejection) => {
		const payload = { uuid: uuid };
		const productId = Store.getState().cartData?.items?.filter(
			(item) => item.uuid === uuid,
		)[0]?.productId;
		optimisticCart(productId, -1, true);
		Api.deleteBasketItem({
			payload,
			shouldHideLoader: true,
			onSuccess,
			onFailure: gracefulRejection,
			onRejection: gracefulRejection,
		});
		function gracefulRejection() {
			const timeout = setTimeout(() => {
				typeof onRejection === "function" && onRejection();
				clearTimeout(timeout);
			}, 1000);
		}
		function onSuccess(data) {
			typeof callback === "function" && callback(data);
		}
	},
};

export default CartService;
