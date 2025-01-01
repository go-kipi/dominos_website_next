import React, { useEffect, useRef } from "react";
import FullScreenPopup from "popups/Presets/FullScreenPopup";
import styles from "./index.module.scss";
import CloseIcon from "/public/assets/icons/x-icon-white.svg";
import { useDispatch, useSelector } from "react-redux";
import MobileBG from "/public/assets/menu/mobile-background.png";
import Actions from "redux/actions";
import useTranslate from "hooks/useTranslate";
import RenderPromoProduct from "components/PromoProduct";
import { getFullMediaUrl } from "utils/functions";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import { TRIGGER } from "constants/trigger-enum";
import * as popupTypes from "constants/popup-types";
import CartService from "services/CartService";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import PizzaTreeService from "services/PizzaTreeService";
import DynamicLink from "components/dynamic_link";
import Button from "components/button";

function PromotionalImagePopup(props) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const isMobile = deviceState.isMobile || deviceState.isTablet;
	const ref = useRef();
	const {
		id,
		isProductPopup = false,
		assetVersion,
		subtext,
		btnText,
		hideCloseButton = false,
		enableClickOutside = true,
		productsIds = [],
		disclaimer,
		linkBehavior,
		linkUrl = "",
		animateCallback,
	} = props.payload;
	const item = { id, assetVersion };
	const imgUseCase = isMobile ? MEDIA_ENUM.MOBILE : MEDIA_ENUM.WEB;
	const img = getFullMediaUrl(item, MEDIA_TYPES.POPUP, imgUseCase);

	const shouldRenderTwoProducts = productsIds?.length > 1;

	useEffect(() => {
		if (hideCloseButton) {
			dispatch(Actions.setIsBackButtonBlocked(true));
		}
		return () => {
			dispatch(Actions.setIsBackButtonBlocked(false));
		};
	}, []);

	const animateOutCallback = () => {
		ref.current.animateOut(() => {
			removePromo();
		});
	};

	function removePromo() {
		typeof animateCallback === "function" && animateCallback();
		dispatch(Actions.removePromoPopup());
	}

	const handleOnClick = (product) => {
		let callback = null;
		if (product) {
			const isDiscountProduct =
				product?.meta === "discountCoupon" || !product?.isMeal;
			const isCoupon = product?.meta === "coupon";
			const hasTemplate =
				typeof product?.templateId === "string" && product.templateId.length > 0;
			const benefitId = isCoupon ? product?.id : null;
			const item = CartItemEntity.getObjectLiteralItem(
				product?.id,
				1,
				[],
				null,
				null,
				null,
				benefitId,
			);
			if (isDiscountProduct) {
				callback = () => {
					const payload = { item };
					CartService.addToCart(payload, null, null, true, TRIGGER.MENU);
				};
			} else if (hasTemplate) {
				callback = () => {
					PizzaTreeService.init(() => {
						dispatch(Actions.setCartItem(item));
						dispatch(
							Actions.addPopup({
								type: popupTypes.BUILDER,
								payload: {
									templateId: product.templateId,
									saleId: product.id,
									shouldSkipSize: true,
									trigger: TRIGGER.MENU,
									endOfSaleAddToCart: true,

									onClose: () => {
										removePromo();
									},
								},
							}),
						);
					});
				};
			}
			ref.current.animateOut(() => {
				if (!hasTemplate) {
					removePromo();
				}
				typeof callback === "function" && callback();
			});
		}
	};

	const renderDisclaimer = () => {
		return (
			<span
				className={styles["promo-disclaimer"]}
				tabIndex={0}>
				{translate(disclaimer)}
			</span>
		);
	};

	const renderImage = () => {
		const dynamicLinkItem = {
			linkBehavior,
			url: linkUrl,
		};
		return (
			<div className={styles["image-wrapper"]}>
				<div className={styles["product-img-wrapper"]}>
					<img src={img} />
				</div>
				<DynamicLink
					link={dynamicLinkItem}
					className={styles["button"]}>
					<Button
						autoFocus={true}
						onClick={animateOutCallback}
						text={btnText}
					/>
				</DynamicLink>
			</div>
		);
	};

	const renderTwoProducts = () => {
		return (
			<div className={styles["products-wrapper"]}>
				{productsIds.map((product, index) => {
					return (
						<RenderPromoProduct
							key={"promo" + index}
							onClick={handleOnClick}
							btnText={btnText}
							productId={product}
						/>
					);
				})}
			</div>
		);
	};

	const renderSingleProduct = () => {
		const product = productsIds[0];
		return (
			<div className={styles["products-wrapper"]}>
				<RenderPromoProduct
					onClick={handleOnClick}
					btnText={btnText}
					productId={product}
					isSingleProduct
				/>
			</div>
		);
	};

	const renderPopupByType = () => {
		if (isProductPopup) {
			return shouldRenderTwoProducts ? renderTwoProducts() : renderSingleProduct();
		} else return renderImage();
	};

	return (
		<FullScreenPopup
			id={props.id}
			ref={ref}
			background={""}
			className={styles["promo-image-popup-wrapper"]}>
			{!hideCloseButton ? (
				<button
					className={"close-icon-wrapper"}
					onClick={animateOutCallback}
					aria-label={translate("accessibility_aria_close")}>
					<img
						src={CloseIcon.src}
						alt={""}
					/>
				</button>
			) : null}
			{renderPopupByType()}
			{renderDisclaimer()}
		</FullScreenPopup>
	);
}

export default PromotionalImagePopup;
