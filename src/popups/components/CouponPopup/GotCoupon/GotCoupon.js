import React, { useEffect, useState } from "react";

import LottieAnimation from "components/LottieAnimation";
import styles from "./GotCoupon.module.scss";
import CouponAnimation from "animations/coupon.json";
import Button from "components/button";
import { useDispatch, useSelector } from "react-redux";

import useTranslate from "hooks/useTranslate";
import { getCouponHasWraning } from "utils/functions";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import Actions from "redux/actions";

function GotCoupon(props) {
	const { params, addCoupon } = props;
	const { subtitle = "", primaryBtnText = "", product, coupon } = params;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const cancelledCoupon = translate("coupon_modal_cancelled_coupon");
	const onlyAtPickup = translate("coupon_subTitle_subService_pickup");
	const onlyAtDelivery = translate("coupon_subTitle_subService_delivery");
	const [updatedText, setUpdatedText] = useState([]);
	const [terms, setTerms] = useState([]);
	const hasProduct = typeof product === "object";
	const productSubServices = hasProduct ? product?.subServices : null;
	const title = hasProduct ? product?.nameUseCases?.Title : "";
	const hasWraning = getCouponHasWraning(coupon);
	const lang = useSelector((store) => store.generalData.lang);

	const isLimitedToSubService =
		Array.isArray(productSubServices) && productSubServices.length > 0;

	const defaultOptions = {
		loop: false,
		autoplay: true,
		animation: CouponAnimation,
	};

	useEffect(() => {
		if (hasWraning || isLimitedToSubService) {
			updateSubtitle();
		}
		addTerms();
	}, []);

	const handleCouponEvent = () => {
		AnalyticsService.enterCouponCodeSuccess(
			Object.values(product)[0]?.name,
			"add to cart",
			"coupon",
		);
	};

	function useCouponHandler() {
		handleCouponEvent();
		typeof addCoupon === "function" &&
			addCoupon({ coupon: coupon, product: product });
		if (coupon?.allowingDouble && !coupon?.isUnique) {
			dispatch(Actions.setAddDoublingCoupon(true));
		} else if (coupon?.isUnique) {
			dispatch(Actions.setAddUniqueCoupon(true));
		}
	}

	function updateSubtitle() {
		let text = [];
		if (hasWraning) {
			const cancelledCoupons = coupon.warning?.values;
			// const products = catalogProducts
			// 	.filter((c) => cancelledCoupons.includes(c.coupon.triggerProductId))
			// 	.map((c) => c.product);
			// products.forEach((product) => {
			// 	let subtitleProduct = "";
			// 	subtitleProduct = cancelledCoupon
			// 		.replace("{coupon}", product?.name)
			// 		.replace("{price}", product?.price);
			// 	text.push(subtitleProduct);
			// 	setUpdatedText(text);
			// });
		} else if (isLimitedToSubService) {
			if (productSubServices[0] === "dlv") {
				text.push(onlyAtDelivery);
			} else if (productSubServices[0] === "pu") {
				text.push(onlyAtPickup);
				// check branch id
			}
			setUpdatedText(text);
		}
	}

	function addTerms() {
		const terms = [];
		const productTerms = product.terms;
		if (productTerms.length === 0) return;

		productTerms.forEach((term) => {
			terms.push(term);
		});
		setTerms(terms);
	}

	function getTerms() {
		return (
			<>
				{terms.map((term, index) => (
					<h5
						className={styles["subtitle"]}
						key={"subtitle" + index}
						tabIndex={0}>
						{term?.consumerNotice?.[lang] ?? ""}
					</h5>
				))}
			</>
		);
	}

	function getSubtitle() {
		return (
			<>
				{updatedText.map((subText, index) => (
					<h5
						className={styles["subtitle"]}
						key={"subtitle" + index}
						tabIndex={0}>
						{subText}
					</h5>
				))}
			</>
		);
	}

	return (
		<div className={styles["got-coupon-wrapper"]}>
			<div className={styles["content"]}>
				<div className={styles["lottie-wrapper-coupon"]}>
					<LottieAnimation {...defaultOptions} />
				</div>
				<div className={styles["titles-wrapper"]}>
					<h1
						className={styles["title"]}
						aria-live={"polite"}
						tabIndex={0}>
						{title}
					</h1>

					{subtitle && (
						<h5
							className={styles["subtitle"]}
							tabIndex={0}>
							{subtitle}
						</h5>
					)}
					{getSubtitle()}
					{getTerms()}
				</div>
			</div>
			<div className={styles["actions"]}>
				<Button
					text={primaryBtnText}
					onClick={useCouponHandler}
					className={styles["accept-btn"]}
				/>
			</div>
		</div>
	);
}

export default GotCoupon;
