import TWO_ACTION_TYPES from "constants/two-actions-popup-types";
import * as popups from "popups/popup-types.js";
import { useDispatch, useSelector } from "react-redux";
import useTranslate from "./useTranslate";
import Api from "api/requests";
import Actions from "redux/actions";
import { useEffect, useRef, useState } from "react";
import { Store } from "redux/store";
import { areStringsEqual } from "utils/functions";
import MARKETING_TYPES from "constants/Marketing-types";

function useShowMarketing() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const user = useSelector((store) => store.userData);

	const openMarketingPopup = (modalType, callback) => {
		const handleCallback = () => {
			typeof callback === "function" && callback();
		};
		if (modalType === MARKETING_TYPES.SUGGEST_PRESENT_POPUP) {
			dispatch(Actions.setDontShowPeresntMarketingModal(true));
			dispatch(
				Actions.addPopup({
					type: popups.MARKETING_SUBSCRIPTION,
					payload: {
						type: modalType,
						title: translate("marketing_benefit_title"),
						subTitle: translate("marketing_benefit_text"),
						mainBtnText: translate("marketing_benefit_main-btn"),
						subBtnText: translate("marketing_benefit_secondery-btn"),
						mainBtnFunc: () => {
							function onSuccess(res) {
								handleCallback();
							}
							const payload = { allowMarketing: true };
							Api.setSubscriptionStatus({ payload, onSuccess });
						},
						subBtnFunc: () => handleCallback(),
					},
				}),
			);
		} else {
			dispatch(Actions.setDontShowMarketingModal(true));
			dispatch(
				Actions.addPopup({
					type: popups.TWO_ACTION,
					payload: {
						type: TWO_ACTION_TYPES.UPDATE,
						title: translate("updatePopup_title"),
						addTitle: "",
						subTitle: "",
						mainBtnText: translate("updatePopup_updateMe"),
						subBtnText: translate("updatePopup_noThanks"),
						mainBtnFunc: () => {
							function onSuccess(res) {
								handleCallback();
							}
							const payload = { allowMarketing: true };
							Api.setSubscriptionStatus({ payload, onSuccess });
						},
						subBtnFunc: () => handleCallback(),
					},
				}),
			);
		}
	};

	const getModalType = (isEligble, subscriptionStatus) => {
		const isUnsubscribed =
			areStringsEqual(subscriptionStatus, "notListed") ||
			areStringsEqual(subscriptionStatus, "unsubscribed");

		if (isUnsubscribed) {
			if (isEligble && !user.dontShowPresentMarketingModal) {
				return MARKETING_TYPES.SUGGEST_PRESENT_POPUP;
			} else if (!isEligble && !user.dontShowMarketingModal) {
				return MARKETING_TYPES.REGULAR_POPUP;
			}
		}

		return null;
	};

	const checkIfShouldShowMarketing = (callback) => {
		const user = Store.getState().userData;
		const onSuccess = (res) => {
			const { subscriptionStatus, eligible } = res;

			const modalType = getModalType(eligible, subscriptionStatus);

			if (modalType) {
				openMarketingPopup(modalType, callback);
			} else {
				typeof callback === "function" && callback();
			}
		};
		if (user.email) {
			const payload = { email: user.email };
			Api.getOneTimeBenefit({ payload, onSuccess });
		} else {
			typeof callback === "function" && callback();
		}
	};
	return checkIfShouldShowMarketing;
}

export default useShowMarketing;
