import * as popupTypes from "constants/popup-types";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import {
	PROMO_MENU,
	PROMO_PAYMENT,
} from "constants/operational-promo-popups-state";
import useEntryBenefit from "./useEntreyBenefit";

function usePromotionalAndOperationalPopups(allowedStatus = [], callback) {
	const promoPopupsState = useSelector((store) => store.promoPopupsState);
	const order = useSelector((store) => store.order);
	const user = useSelector((store) => store.userData);
	const selectedBenefit = useSelector((store) => store.selectedBenefit);
	const benefit = useEntryBenefit(true);
	const dispatch = useDispatch();
	const promotionalAndOperationalPopups = useSelector(
		(store) => store.promoPopups,
	);
	const deepLinkCoupon = useSelector((store) => store.deepLinkCoupon);

	const openPopup = (popupIndex) => {
		const popup = promotionalAndOperationalPopups[popupIndex];
		if (typeof popup === "object") {
			const {
				id,
				behavior = "text",
				btnText = "",
				title = "",
				subTitle = "",
				disclaimer = "",
				linkUrl = "",
				assetVersion = 1,
				hideCloseButton = false,
				productIds,
				flowStopper,
				linkBehavior,
			} = popup;
			const popupCallback =
				promotionalAndOperationalPopups.length === 1 ? callback : null;
			const hasProducts = Array.isArray(productIds) && productIds.length > 0;
			if (behavior === "text") {
				openTextPopup(
					id,
					title,
					subTitle,
					btnText,
					linkUrl,
					linkBehavior,
					flowStopper,
					hideCloseButton,
					popupCallback,
				);
			} else if (behavior === "image") {
				openImagePopup(
					id,
					title,
					subTitle,
					btnText,
					linkUrl,
					linkBehavior,
					flowStopper,
					productIds,
					disclaimer,
					assetVersion,
					hasProducts,
					hideCloseButton,
					popupCallback,
				);
			}
		}
	};

	const openTextPopup = (
		id,
		text,
		subTitle,
		btnText,
		linkUrl,
		linkBehavior,
		isFlowStopper,
		hideCloseButton,
		callback,
	) => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.GENERAL_MESSAGE,
				payload: {
					id,
					text,
					subtext: subTitle,
					btnText,
					linkUrl,
					linkBehavior,
					enableClickOutside: !isFlowStopper,
					hideCloseButton: hideCloseButton,
					animateCallback: callback,
					isPromo: true,
				},
				priority: 3,
			}),
		);
	};

	const openImagePopup = (
		id,
		text,
		subTitle,
		btnText,
		linkUrl,
		linkBehavior,
		isFlowStopper,
		products,
		disclaimer,
		assetVersion,
		isProducts = false,
		hideCloseButton = false,
		callback,
	) => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.PROMOTIONAL_IMAGE_POPUP,
				payload: {
					id,
					text,
					subtext: subTitle,
					btnText,
					linkUrl,
					linkBehavior,
					productsIds: products,
					enableClickOutside: !isFlowStopper,
					disclaimer,
					assetVersion,
					isProductPopup: isProducts,
					hideCloseButton: hideCloseButton,
					animateCallback: callback,
				},
				priority: 3,
			}),
		);
	};

	const showPopups = useCallback(() => {
		if (promotionalAndOperationalPopups.length) {
			openPopup(0);
		}
	}, [promotionalAndOperationalPopups.length]);

	const getPopups = useCallback(() => {
		if (allowedStatus.includes(promoPopupsState)) {
			if (PROMO_PAYMENT.includes(promoPopupsState)) {
				if (
					typeof order === "object" &&
					order?.isShownedUpSales &&
					user?.approvedTerms
				) {
					return showPopups();
				}
			} else if (PROMO_MENU.includes(promoPopupsState)) {
				if (selectedBenefit || benefit || deepLinkCoupon) {
					return null;
				}
			}

			showPopups();
		}
	}, [
		selectedBenefit,
		benefit,
		promoPopupsState,
		order?.isShownedUpSales,
		user?.approvedTerms,
		showPopups,
		allowedStatus,
		deepLinkCoupon,
	]);

	useEffect(() => {
		if (promotionalAndOperationalPopups.length) {
			getPopups();
		}
	}, [promotionalAndOperationalPopups.length, getPopups]);

	return null;
}

export default usePromotionalAndOperationalPopups;
