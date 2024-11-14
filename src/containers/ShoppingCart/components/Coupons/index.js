import React from "react";
import LanguageDirectionService from "../../../../services/LanguageDirectionService";
import { useDispatch, useSelector } from "react-redux";
import * as popupTypes from "constants/popup-types";

// Assets
import CouponIcon from "/public/assets/icons/coupon.svg";
import WhiteArrow from "/public/assets/icons/small_white_arrow.svg";
import TrashIcon from "/public/assets/icons/multipleOptionsIndicator/trash.svg";

// Components
import Separator from "../../../../components/common/separator";
import Price from "../../../../components/Price";

import styles from "./index.module.scss";
import Actions from "../../../../redux/actions";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
const Coupons = (props) => {
	const isRTL = LanguageDirectionService.isRTL() ? styles["rtl"] : styles["ltr"];
	const deviceState = useSelector((store) => store.deviceState);
	const dispatch = useDispatch();
	const translate = useTranslate();

	const addCoupon = () => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.COUPON,
				payload: {},
			}),
		);
	};
	return (
		<button
			className={styles["coupons-wrap"]}
			onClick={addCoupon}>
			<div className={clsx(styles["add-coupon"], styles["coupon-ticket"])}>
				<img
					className={clsx(styles["icon"], styles["coupon"])}
					src={CouponIcon.src}
					alt={"icon"}
					aria-hidden={true}
				/>
				<span className={styles["add-coupon-text"]}>
					{translate("coupon_cart_another_coupon")}
				</span>
				<img
					className={clsx(styles["icon"], styles["arrow"])}
					src={WhiteArrow.src}
					alt={"icon"}
					aria-hidden={true}
				/>
			</div>
		</button>
	);
};

export default Coupons;
