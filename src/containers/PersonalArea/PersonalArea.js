import React, { useEffect, useLayoutEffect, useState } from "react";

import styles from "./PersonalArea.module.scss";
import * as Routes from "constants/routes";

import PersonalAreaDesktop from "./PersonalAreaDesktop/PersonalAreaDesktop";
import { useSelector } from "react-redux";
import PersonalAreaMobile from "./PersonalAreaMobile/PersonalAreaMobile";
import { useRouter } from "next/router";
import useTranslate from "hooks/useTranslate";
import { useDispatch } from "react-redux";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import Actions from "redux/actions";
import * as popups from "constants/popup-types";
import TWO_ACTION_TYPES from "constants/two-actions-popup-types";
import Api from "api/requests";
import { GPS_STATUS } from "constants/gps-status";

function PersonalArea({ children }) {
	const deviceState = useSelector((store) => store.deviceState);
	const router = useRouter();
	const user = useSelector((store) => store.userData);
	const translate = useTranslate();
	const dispatch = useDispatch();

	const generalData = useSelector((store) => store.generalData);

	const refreshToken = generalData.tokenData?.refreshToken;

	useEffect(() => {
		if (deviceState.isDesktop) {
			router.replace(Routes.personalAreaSavedPizza);
		}
		if (user.type === "new") {
			router.replace(Routes.root);
		}
	}, []);

	function onDeleteUser() {
		const payload = {};
		Api.deleteCustomer({
			payload,
			onSuccess: () => {
				AnalyticsService.personalAreaDeleteAccountPopupConfirm("delete account");
				const payload = { refreshToken };
				Api.logOut({ payload, onSuccess: onLogoutSuccess });
				function onLogoutSuccess() {
					Api.connect(onConnectSuccess);
					function onConnectSuccess() {
						Api.getCustomerDetails({
							payload: { gpsstatus: GPS_STATUS.OFF },
							onSuccessCB: onGetCustomerDetailsSuccess,
						});
						function onGetCustomerDetailsSuccess(res) {
							dispatch(Actions.resetUser());
							dispatch(Actions.setUser(res.data));
							setTimeout(() => {
								router.push(Routes.root);
							}, 300);
						}
					}
				}
			},
		});
	}

	function openDeleteUser() {
		const payload = {
			title: translate("removeUserModal_title"),
			addTitle: "",
			subTitle: translate("removeUserModal_explanation_text"),
			mainBtnText: translate("removeUserModal_okBtn_label"),
			subBtnText: translate("removeUserModal_declineBtn_label"),
			mainBtnFunc: onDeleteUser,
			subBtnFunc: () => {},
			type: TWO_ACTION_TYPES.DELETE_USER,
		};
		dispatch(
			Actions.addPopup({
				type: popups.TWO_ACTION,
				payload,
				disablePromot: true,
			}),
		);
		AnalyticsService.personalAreaDeleteAccount("delete account");
	}

	return (
		<div className={styles["personal-area-page-wrapper"]}>
			{deviceState.isDesktop ? (
				<PersonalAreaDesktop deleteCustomer={openDeleteUser}>
					{children}
				</PersonalAreaDesktop>
			) : (
				<PersonalAreaMobile deleteCustomer={openDeleteUser} />
			)}
		</div>
	);
}

export default PersonalArea;
