import React, { useRef } from "react";
import styles from "./index.module.scss";
import SlidePopup from "popups/Presets/SlidePopup";
import { useRouter } from "next/router";
import * as routes from "constants/routes";

import CouponErrorIcon from "/public/assets/icons/coupon-error-img.svg";

import useTranslate from "hooks/useTranslate";
import Button from "components/button";

function UnresolvedCartItemsPopup(props) {
	const ref = useRef();
	const router = useRouter();
	const goToMenu = () => router.push(routes.cart);
	const animateOut = (callback) => ref.current.animateOut(callback);
	const translate = useTranslate();
	const { payload = {} } = props;
	const { text = translate("unresolvedCouponsModal_description") } = payload;
	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={styles["unresolved-coupons-popup"]}
			showCloseIcon={true}>
			<div className={styles["unresolved-coupons-wrapper"]}>
				<div className={styles["unresolved-coupons-img"]}>
					<img
						src={CouponErrorIcon.src}
						alt={""}
					/>
				</div>
				<span
					className={styles["unresolved-coupons-desc"]}
					tabIndex={0}>
					{text}
				</span>
				<Button
					text={translate("unresolvedCouponsModal_btn_label")}
					className={styles["go-to-menu-btn"]}
					onClick={() => animateOut()}
				/>
			</div>
		</SlidePopup>
	);
}

export default UnresolvedCartItemsPopup;
