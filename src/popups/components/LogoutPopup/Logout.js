import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Routes from "constants/routes";

import Api from "api/requests";

import LogoutIcon from "/public/assets/icons/logout.svg";
import styles from "./Logout.module.scss";

import { AnimatedCapsule } from "components/AnimatedCapsule/AnimatedCapsule";
import SlidePopup from "popups/Presets/SlidePopup";
import { useRouter } from "next/router";
import Actions from "redux/actions";
import LanguageDirectionService from "services/LanguageDirectionService";
import useTranslate from "hooks/useTranslate";
import useOrder from "hooks/useOrder";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { USER_PROPERTIES } from "constants/user-properties";

function LogoutPopup(props) {
	const ref = useRef();
	const dispatch = useDispatch();
	const generalData = useSelector((store) => store.generalData);

	const refreshToken = generalData.tokenData?.refreshToken;

	const translate = useTranslate();
	const gpsstatus = useSelector((store) => store.generalData?.gpsstatus);

	const router = useRouter();

	function Logout() {
		function onLogoutSuccess() {
			AnalyticsService.personalAreaLogoutPopupConfirm("logout");

			Api.connect(onSuccess);

			function onSuccess() {
				const payload = {
					gpsstatus,
				};
				dispatch(Actions.resetMenus());
				dispatch(Actions.setCart({}));
				dispatch(Actions.resetOrder());
				dispatch(Actions.clearAllPath());

				Api.getCustomerDetails({
					payload,
					onSuccessCB: onGetCustomerDetailsSuccess,
				});

				function onGetCustomerDetailsSuccess(res) {
					dispatch(Actions.resetUser());
					dispatch(Actions.setUser(res.data));

					AnalyticsService.setUserProperties({
						[USER_PROPERTIES.REGISTERED]: USER_PROPERTIES.values.YES,
					});
					ref.current.animateOut(() => {});
					setTimeout(() => {
						router.push(Routes.root);
					}, 300);
				}
			}
		}

		const payload = { refreshToken };
		Api.logOut({ payload, onSuccess: onLogoutSuccess });
	}

	return (
		<SlidePopup
			id={props.id}
			className={styles["logoutPopup"]}
			ref={ref}>
			<div className={styles["logout-wrapper"]}>
				<div className={styles["image-title-wrapper"]}>
					<div className={styles["logout-image-wrapper"]}>
						<img
							src={LogoutIcon.src}
							alt="logout"
						/>
					</div>
					<div
						className={styles["title-wrapper"]}
						aria-live={"polite"}
						role={"alert"}>
						<span
							className={styles["title"]}
							tabIndex={0}>
							{translate("personalArea_logout_title")}
						</span>
						<div className={styles["subtitle-wrapper"]}>
							<span
								className={styles["subtitle"]}
								tabIndex={0}>
								{translate("personalArea_logout_subtitle1")}
								<span className={styles["subtitle bolder"]}>
									{translate("personalArea_logout_subtitle2")}
								</span>
							</span>
						</div>
					</div>
				</div>
				<AnimatedCapsule
					bluePillText={translate("personalArea_logout_declineButton")}
					redPillText={translate("personalArea_logout_acceptButton")}
					bluePillOnPress={() => ref.current.animateOut()}
					redPillOnPress={Logout}
					className={styles["button"]}
				/>
			</div>
		</SlidePopup>
	);
}

export default LogoutPopup;
