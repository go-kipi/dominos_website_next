import React, { useEffect, useRef } from "react";

import { TransitionGroup, CSSTransition } from "react-transition-group";
import Api from "api/requests";
import EnterCoupon from "./EnterCoupon/EnterCoupon";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import { COUPON_SCREEN_TYPES } from "constants/CouponScreenTypes";

import styles from "./Coupon.module.scss";
import GotCoupon from "./GotCoupon/GotCoupon";
import Loader from "./Loader/Loader";
import BranchCoupon from "./BranchCoupon";
import SlidePopup from "popups/Presets/SlidePopup";
import { useSelector } from "react-redux";

import ErrorCoupon from "./ErrorCoupon";
import useTranslate from "hooks/useTranslate";
import CouponsAndBenefits from "services/CouponsAndBenefits";
import { getCouponHasWraning } from "utils/functions";
import CartService from "services/CartService";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

function CouponPopup(props) {
	const { payload } = props;
	const { deepLinkCouponResult = undefined, onSuccessCB } = payload;
	const [currentScreen, setStack, _goBack, _, resetStack] = useStack(
		STACK_TYPES.COUPON,
	);
	const ref = useRef();
	const translate = useTranslate();
	const catalog = useSelector((store) => store.menusData.catalogProducts);
	const cartItems = useSelector((store) => store.cartData.items);

	const animateOut = (callback) => ref.current.animateOut(callback);

	useEffect(() => {
		if (deepLinkCouponResult) {
			navigateToGotCoupon(deepLinkCouponResult);
		} else {
			setStack({
				type: COUPON_SCREEN_TYPES.ENTER_COUPON,
				params: {},
			});
		}

		return () => {
			resetStack();
		};
	}, []);

	function getCataglogNames(valuesArr) {
		let text = "";
		for (const index in valuesArr) {
			const value = valuesArr[index];
			const name = catalog?.[value]?.nameUseCases?.Title;

			if (text && index !== 0 && name) {
				text += ", ";
			}
			if (name) {
				text += name;
			}
		}
		return text;
	}

	function getSubtitle(coupon) {
		const hasWraning = getCouponHasWraning(coupon);

		if (hasWraning) {
			const subtitle = translate(coupon.warning.id);
			const productNames = getCataglogNames(coupon.warning.values);

			return subtitle.replace("{contradictingCoupons}", productNames);
		} else {
			return "";
		}
	}

	function getBtnText(coupon) {
		const hasWraning = getCouponHasWraning(coupon);

		if (hasWraning) {
			return translate("coupon_modal_still_want_to_use_btnLabel");
		} else {
			return translate("couponPopup_buttonText_success_addToBasket");
		}
	}

	function removeCancelledCoupons(cancelledCoupons) {
		if (Array.isArray(cancelledCoupons) && Array.isArray(cartItems)) {
			for (const cI in cancelledCoupons) {
				const coupon = cancelledCoupons[cI];
				for (const iI in cartItems) {
					const cartItem = cartItems[iI];
					if (cartItem.productId === coupon) {
						CartService.deleteBasketItem(cartItem.uuid);
					}
				}
			}
		}
	}

	function addCoupon(couponData) {
		const callbackFn = () =>
			CouponsAndBenefits.openBuilderWithCoupon(couponData, onSuccessCB);
		animateOut(callbackFn);
	}

	function handleCouponRejection(id) {
		setStack({
			type: COUPON_SCREEN_TYPES.ERROR_COUPON,
			params: {
				errorId: id,
			},
		});
		AnalyticsService.enterCouponCodeFail("coupon code fail");
	}

	function handleNotValid() {
		setStack({
			type: COUPON_SCREEN_TYPES.ENTER_COUPON,
			params: { isValidParams: false },
		});
		AnalyticsService.enterCouponCodeFail("coupon code fail");
	}

	function navigateToGotCoupon(res) {
		if (res.coupon) {
			const { product, coupon } = res;

			const subTitle = getSubtitle(coupon);
			const btnText = getBtnText(coupon);

			const triggerProductId = coupon.triggerProductId;
			const productData = product[triggerProductId];

			setStack({
				type: COUPON_SCREEN_TYPES.GOT_COUPON,
				params: {
					product: productData,
					coupon,
					subtitle: subTitle,
					primaryBtnText: btnText,
				},
			});
		}
	}

	function VerifyCoupon(couponId) {
		setStack({ type: COUPON_SCREEN_TYPES.LOADER, params: {} });
		const onSuccess = (res) => {
			navigateToGotCoupon(res);
		};
		const onFailure = () => {
			return handleNotValid();
		};
		const onRejection = (res) => {
			if (res.message.id === "CouponDoesNotExist") {
				return handleNotValid();
			}
			handleCouponRejection(res.message.id);
		};
		const payload = { couponId };
		Api.validateCoupon({
			payload,
			onSuccess,
			onFailure: onFailure,
			onRejection,
			config: {
				shouldUseDefault500: false,
			},
		});
	}

	function onCouponError() {
		animateOut();
	}

	function RenderPopup() {
		switch (currentScreen.type) {
			case COUPON_SCREEN_TYPES.ENTER_COUPON:
				return (
					<CSSTransition
						key={currentScreen.type}
						timeout={0}
						classNames={styles["nothing"]}>
						<EnterCoupon
							params={currentScreen.params}
							VerifyCoupon={VerifyCoupon}
						/>
					</CSSTransition>
				);
			case COUPON_SCREEN_TYPES.LOADER:
				return (
					<CSSTransition
						key={currentScreen.type}
						timeout={350}
						classNames={styles["fade-out"]}>
						<Loader params={currentScreen.params} />
					</CSSTransition>
				);

			case COUPON_SCREEN_TYPES.GOT_COUPON:
				return (
					<CSSTransition
						key={currentScreen.type}
						timeout={350}
						classNames={styles["fade-out"]}>
						<GotCoupon
							addCoupon={addCoupon}
							animateOut={animateOut}
							params={currentScreen.params}
						/>
					</CSSTransition>
				);
			case COUPON_SCREEN_TYPES.BRANCH_COUPON:
				return (
					<CSSTransition
						key={currentScreen.type}
						timeout={350}
						classNames={styles["fade-out"]}>
						<BranchCoupon params={currentScreen.params} />
					</CSSTransition>
				);
			case COUPON_SCREEN_TYPES.ERROR_COUPON:
				return (
					<CSSTransition
						key={currentScreen.type}
						timeout={350}
						classNames={styles["fade-out"]}>
						<ErrorCoupon
							params={currentScreen.params}
							btnText={translate("couponError_btn_label")}
							onClick={animateOut}
						/>
					</CSSTransition>
				);
			case COUPON_SCREEN_TYPES.ALREADY_USED_COUPON:
				return (
					<CSSTransition
						key={currentScreen.type}
						timeout={350}
						classNames={styles["fade-out"]}>
						<ErrorCoupon
							params={currentScreen.params}
							onClick={onCouponError}
						/>
					</CSSTransition>
				);
			default:
				return null;
		}
	}

	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={`${styles["coupon-popup"]} ${currentScreen.type}`}
			showCloseIcon={true}>
			<TransitionGroup className={styles["transition-wrapper"]}>
				{RenderPopup()}
			</TransitionGroup>
		</SlidePopup>
	);
}

export default CouponPopup;
