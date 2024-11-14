import Actions from "redux/actions";
import { Store } from "redux/store";
import Api from "api/requests";
import { TRIGGER } from "constants/trigger-enum";
import * as popupTypes from "constants/popup-types";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import { STEPS } from "constants/validation-steps-enum";

const DeepLinkCoupon = (function () {
	function init() {
		const urlParams = new URLSearchParams(window.location.search);
		const couponId = urlParams.get("deepLinkCouponId");

		if (couponId) {
			Store.dispatch(Actions.setDeepLinkCoupon(couponId));
		}
	}

	function validateCoupon(couponId, onSuccessCB) {
		if (couponId) {
			const payload = { couponId };

			function onSuccess(res) {
				Store.dispatch(
					Actions.addPopup({
						type: popupTypes.COUPON,
						payload: { deepLinkCouponResult: res, onSuccessCB: onFinish },
					}),
				);

				function onFinish() {
					Store.dispatch(Actions.resetDeepLinkCoupon());
				}
			}
			function onFailure(res) {
				openErrorPopup(res.message.id, onSuccessCB);
			}
			function onRejection(res) {
				openErrorPopup(res.message.id, onSuccessCB);
			}

			Api.validateCoupon({ payload, onSuccess, onFailure, onRejection });
		}
	}

	function openErrorPopup(errorId, callBack) {
		const translations = Store.getState().translations;

		const payload = {
			text: translations[errorId],
			button1Text: translations.errorPopup_ok,
			button1OnClick: onButtonClick,
		};

		function onButtonClick() {
			Store.dispatch(Actions.resetDeepLinkCoupon());
			typeof callBack === "function" && callBack();
		}

		Store.dispatch(
			Actions.addPopup({
				type: popupTypes.API_ERROR,
				payload,
			}),
		);
	}

	function openDeepLinkCoupon(onSuccess) {
		const couponId = Store.getState().deepLinkCoupon;
		if (couponId) {
			validateCoupon(couponId, onSuccess);
		} else {
			typeof onSuccess === "function" && onSuccess();
		}
	}

	return {
		init,
		openDeepLinkCoupon,
	};
})();

export default DeepLinkCoupon;
