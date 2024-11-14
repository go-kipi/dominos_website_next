import SlidePopup from "popups/Presets/SlidePopup";
import React, { useEffect, useRef } from "react";
import Api from "api/requests";
import styles from "./index.module.scss";

import MealIcon from "/public/assets/icons/continue-where-you-left-off.svg";
import Button from "components/button";
import TextOnlyButton from "components/text_only_button";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import OrderStatusService from "services/OrderStatusService";
import useTranslate from "hooks/useTranslate";
import { useRouter } from "next/router";
import * as Routes from "constants/routes";
import PizzaTreeService from "services/PizzaTreeService";

function ContinueActiveOrderPopup(props) {
	const { payload = {} } = props;
	const { onDeclineCallback } = payload;
	const ref = useRef();
	const translate = useTranslate();
	const router = useRouter();

	const dispatch = useDispatch();
	const gpsstatus = useSelector((store) => store.generalData?.gpsstatus);

	useEffect(() => {
		{
			/*For accessibility reasons, so focus-visible wont be triggered*/
		}
		const btn = document.getElementById("btn");
		btn.style.display = "none";
	}, []);

	const handleContinueOrder = () => {
		Api.getCustomerActiveOrder({
			payload: {},
			onSuccess,
		});

		function onSuccess(data) {
			const activeOrder = data;

			const coupons = activeOrder?.approvedCoupons ?? [];
			if (activeOrder.basket?.products) {
				dispatch(Actions.addCatalogProducts(activeOrder.basket.products));
			}

			dispatch(Actions.setCart(activeOrder.basket));
		}

		animateOut(() => {
			PizzaTreeService.init(() => {
				OrderStatusService.goToScreen();
			});
		});
	};

	const handleStartOver = () => {
		Api.cleanActiveOrder({
			payload: {
				ignoreIfNotActive: true, // todo: remove this
			},
			onSuccess: () => {
				dispatch(Actions.resetMenus());
				dispatch(Actions.setCart({}));
				dispatch(Actions.resetOrder());
				dispatch(Actions.clearAllPath());

				function onSuccess(res) {
					animateOut(() => {
						typeof onDeclineCallback === "function" && onDeclineCallback();
					});
					if (router.pathname !== Routes.root) {
						setTimeout(() => {
							router.push(Routes.root);
						}, 300);
					}
				}

				Api.getOrderStatus({ onSuccess });
			},
		});
	};

	const animateOut = (callback) => ref.current.animateOut(callback);

	return (
		<SlidePopup
			id={props.id}
			className={styles["continue-active-order"]}
			ref={ref}
			enableClickOutside={false}
			role={"dialog"}>
			<button
				id={"btn"}
				aria-hidden={true}
			/>
			{/*For accessibility reasons, so focus-visible wont be triggered*/}
			<div className={styles["continue-active-order-wrapper"]}>
				<div className={styles["continue-active-order-img"]}>
					<img
						src={MealIcon.src}
						alt="meal-icon"
					/>
				</div>
				<span
					aria-live={"polite"}
					className={styles["nice-to-be-back"]}
					tabIndex={0}>
					{translate("continueOrderPopup_gladYouCameBack_title")}
				</span>
				<h1
					aria-live={"polite"}
					className={styles["want-to-continue"]}
					tabIndex={0}>
					{translate("continueOrderPopup_wantToContinue_title")}
				</h1>
				<Button
					className={styles["continue-order-btn"]}
					text={translate("continueOrderPopup_continueBtn_label")}
					onClick={handleContinueOrder}
					ariaDescribedBy={translate("continueOrderPopup_continueBtn_label")}
				/>
				<TextOnlyButton
					className={styles["start-over-order-btn"]}
					onClick={() => handleStartOver()}
					text={translate("continueOrderPopup_startOverBtn_label")}
					ariaDescribedBy={translate("continueOrderPopup_startOverBtn_label")}
				/>
			</div>
		</SlidePopup>
	);
}

export default ContinueActiveOrderPopup;
