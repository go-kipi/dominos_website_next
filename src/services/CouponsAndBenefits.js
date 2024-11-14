import Api from "api/requests";
import { Store } from "../redux/store";

import Actions from "redux/actions";
import { TRIGGER } from "constants/trigger-enum";
import { STEPS } from "constants/validation-steps-enum";

import * as popupTypes from "constants/popup-types";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import AnalyticsService from "../utils/analyticsService/AnalyticsService";
import animationTypes from "constants/animationTypes";

const CouponsAndBenefits = (function () {
	function openBuilderWithBenefit(selectedBenefitId, imageUrl, imageSize) {
		const user = Store.getState().userData;
		const benefits = user?.benefits || [];
		if (selectedBenefitId) {
			const benefit = benefits.find((b) => b.id === selectedBenefitId);
			const templateId = benefit.productTemplateId;

			openBuilderPopup(
				templateId,
				benefit.productID,
				onClose,
				onFinish,
				selectedBenefitId,
				true,
				imageUrl,
				imageSize,
			);
		}

		function onClose() {
			Store.dispatch(Actions.resetBenefit());
			Store.dispatch(Actions.setIsBuilderActive(false));
		}

		function onFinish() {
			Store.dispatch(Actions.resetBenefit());
		}
	}

	function openBuilderWithCoupon(addCoupon, callback) {
		const onFinish = () => {
			typeof callback === "function" && callback();
		};

		const onClose = () => {
			typeof callback === "function" && callback();
		};

		const { product, coupon } = addCoupon;

		const templateId = product?.templateId;

		if (typeof templateId === "string" && templateId.length > 0) {
			openBuilderPopup(
				templateId,
				product.id,
				onClose,
				onFinish,
				coupon.id,
				false,
			);
		} else {
			const saleEntity = CartItemEntity.getObjectLiteralItem(
				product.id,
				1,
				[],
				null,
				null,
				null,
				coupon.id,
			);
			const payload = {
				step: `${STEPS.ADD_SALE} - ${saleEntity.productId}`,
				item: { ...saleEntity, triggeredBy: TRIGGER.COUPON },
			};

			Api.addBasketItem({
				payload,
				onSuccess: () => {
					onFinish(coupon.id);
				},
			});
		}
	}

	function openBuilderPopup(
		templateId,
		id,
		onClose,
		onFinish,
		benefitId = null,
		isBenefit = false,
		imageUrl = "",
		imageSize = null,
	) {
		const saleEntity = CartItemEntity.getObjectLiteralItem(
			id,
			1,
			[],
			null,
			null,
			null,
			benefitId,
		);
		const payload = {
			step: `${STEPS.ADD_SALE} - ${saleEntity.productId}`,
			item: saleEntity,
		};
		Api.validateAddBasketItem({
			payload,
			onSuccess: () => {
				Store.dispatch(
					Actions.addPopup({
						type: popupTypes.BUILDER,
						payload: {
							templateId: templateId,
							saleId: id,
							fatherEntity: saleEntity,
							onClose,
							onFinish,
							endOfSaleAddToCart: true,
							isBenefitItem: typeof benefitId === "string",
							trigger: isBenefit ? TRIGGER.BENEFIT : TRIGGER.COUPON,
							onEndOfSaleAddCallback: () => {
								if (imageUrl) {
									animate(imageUrl, imageSize);
								}
							},
						},
					}),
				);
				Store.dispatch(Actions.setCartItem(saleEntity));
				if (isBenefit) {
					const user = Store.getState()?.userData;
					const benefits = user?.benefits || [];
					const benefit = benefits.find((b) => b.id === benefitId);
					if (benefit) {
						const product = Object.assign(
							{ name: benefit.description, id: benefit.productID },
							benefit,
						);
						AnalyticsService.selectPromotion(product, {});
					}
				}
			},
		});
	}

	const getBoundingClientRectByElement = (elementId) => {
		const element = document.getElementById(`${elementId}`);
		const { y, width, height, right, left } = element.getBoundingClientRect();

		return {
			py: y,
			width,
			height,
			right,
			left,
		};
	};

	function animate(imgUrl, imageSize) {
		const burgerIconPos = getBoundingClientRectByElement("burger-icon");
		const from = {
			py: burgerIconPos.py,
			left: burgerIconPos.left - imageSize.width,
			right: burgerIconPos.right,
			width: imageSize.width,
			height: imageSize.height,
		};

		const cartIconBoundingPos = getBoundingClientRectByElement("cart-icon");
		const to = {
			...cartIconBoundingPos,
		};

		Store.dispatch(
			Actions.addAnimation({
				type: animationTypes.MOVING_IMAGE,
				payload: {
					from,
					to,
					image: imgUrl,
				},
			}),
		);
	}

	return {
		openBuilderWithBenefit,
		openBuilderWithCoupon,
	};
})();

export default CouponsAndBenefits;
