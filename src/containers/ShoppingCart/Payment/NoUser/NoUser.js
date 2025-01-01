import Button from "components/button";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

import * as popupTypes from "constants/popup-types";

import styles from "./NoUser.module.scss";
import useTranslate from "hooks/useTranslate";
import useDisclaimers from "hooks/useDisclaimers";
import useOrder from "hooks/useOrder";
import CartDisclaimer from "components/CartDisclaimer/CartDisclaimer";
import useShowMarketing from "hooks/useShowMarketing";

function NoUser(props) {
	const { openMinimumPricePopup, beginCheckoutEvent } = props;
	const dispatch = useDispatch();
	const cartItems = useSelector((store) => store.cartData);
	const order = useSelector((store) => store.order);
	const minPrice = order?.minSaleAmount;
	const translate = useTranslate();
	const { didntReachMinimumPrice } = useOrder();
	const user = useSelector((store) => store.userData);
	const { itemWithDisclaimers, isCoupon } = useDisclaimers();
	const showMarketing = useShowMarketing();
	function showIdentificationPopup(onSuccess) {
		if (!user.approvedTerms) {
			dispatch(
				Actions.addPopup({
					type: popupTypes.IDENTIFICATION,
					payload: {
						onSuccess,
					},
				}),
			);
		}
	}

	function showUpSales() {
		dispatch(
			Actions.addPopup({
				type: popupTypes.UPSALE,
				payload: {
					onFinish: () => {
						if (didntReachMinimumPrice) {
							typeof openMinimumPricePopup === "function" && openMinimumPricePopup();
						} else {
							onFinish();
						}
					},
				},
			}),
		);
	}

	function renderUnresolvedCartItems() {
		dispatch(
			Actions.addPopup({
				type: popupTypes.UNRESOLVED_CART_ITEMS,
				payload: {
					text: isCoupon
						? translate("unresolvedCouponsModal_description")
						: itemWithDisclaimers.disclaimers.join(" "),
				},
			}),
		);
	}

	function onFinish() {
		if (user.approvedTerms) {
			showMarketing();
		} else {
			showIdentificationPopup(() => showMarketing());
		}
	}

	function onBtnClick() {
		if (itemWithDisclaimers) {
			return renderUnresolvedCartItems();
		}

		if (order?.isShownedUpSales) {
			if (didntReachMinimumPrice) {
				typeof openMinimumPricePopup === "function" && openMinimumPricePopup();
			} else {
				onFinish();
			}
		} else {
			showUpSales();
		}
		if (!didntReachMinimumPrice) {
			dispatch(Actions.setCartApproved(true));
		}

		typeof beginCheckoutEvent === "function" && beginCheckoutEvent();
	}

	return (
		<div className={styles["no-user-wrapper"]}>
			<Button
				text={translate("shoppignCart_payment_noUser")}
				onClick={onBtnClick}
			/>
			<CartDisclaimer />
		</div>
	);
}

export default NoUser;
