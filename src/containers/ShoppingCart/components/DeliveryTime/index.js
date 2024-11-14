import React, { useEffect, useState } from "react";
import { generateUniqueId, getStringTime } from "../../../../utils/functions";
import LanguageDirectionService from "../../../../services/LanguageDirectionService";
import TWO_ACTION_TYPES from "constants/two-actions-popup-types";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import Separator from "../../../../components/common/separator";
import WhiteBoard from "/public/assets/icons/multipleOptionsIndicator/white-board.svg";
import Trash from "/public/assets/icons/multipleOptionsIndicator/trash.svg";

import Pencil from "/public/assets/icons/white-pencil.svg";

import styles from "./index.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import Actions from "../../../../redux/actions";
import * as popups from "../../../../constants/popup-types";
import Api from "../../../../api/requests";
import * as Routes from "../../../../constants/routes";
import { useRouter } from "next/router";
import SRContent from "../../../../components/accessibility/srcontent";

const DeliveryTime = (props) => {
	const isRTL = LanguageDirectionService.isRTL() ? styles["rtl"] : styles["ltr"];
	const deviceState = useSelector((store) => store.deviceState);
	const { isDesktop } = deviceState;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const router = useRouter();

	const {
		icon,
		address,
		specialRequest,
		deleteItems,
		isPickup,
		promiseTime,
		timedTo,
	} = props;

	let time;
	if (timedTo) {
		time = new Date(timedTo);
		const minutes = getStringTime(time.getMinutes());
		const hours = getStringTime(time.getHours());
		time = hours + ":" + minutes;
	}

	const [toolTipVisible, setToolTipVisible] = useState(false);
	const [toolTipOption, setToolTipOption] = useState(0);
	const [toolTipText, setToolTipText] = useState("");

	useEffect(() => {
		setToolTipText(
			!toolTipOption
				? "cartScreen_specialRequest_hover"
				: "cartScreen_emptyCart_hover",
		);
	}, [toolTipOption]);

	const handleEditAddressClick = () => {
		dispatch(
			Actions.addPopup({
				type: popups.TWO_ACTION,
				payload: {
					title: translate("popup_change_address_text"),
					type: TWO_ACTION_TYPES.GARBAGE,
					mainBtnText: translate("popup_change_address_accept_text"),
					subBtnText: translate("popup_change_address_deny_text"),
					mainBtnFunc: handleAcceptEditAddressClick,
				},
			}),
		);
	};

	const handleAcceptEditAddressClick = () => {
		Api.cleanActiveOrder({
			payload: {
				ignoreIfNotActive: true,
			},
			onSuccess: () => {
				router.push(Routes.root);
				setTimeout(() => {
					dispatch(Actions.resetMenus());
					dispatch(Actions.setCart({}));
					dispatch(Actions.resetOrder());
					dispatch(Actions.clearAllPath());
					Api.getOrderStatus();
				}, 300);
			},
		});
	};

	return (
		<>
			<div className={clsx(styles["delivery-time-wrap"])}>
				{isDesktop ? (
					<SRContent
						message={translate("cart_your_order")}
						role={"alert"}
					/>
				) : null}
				<div className={styles["delivery-body"]}>
					{isDesktop ? (
						<h1 className={styles["title-desktop"]}>
							{translate("cart_your_order")}
						</h1>
					) : null}
					<div className={styles["delivery-details"]}>
						<div className={styles["order-info-wrapper"]}>
							<div
								className={styles["icon-text-wrap"]}
								tabIndex={0}>
								<img
									className={clsx(styles["icon"], isRTL)}
									src={icon.src}
									alt={"icon"}
									aria-hidden={true}
								/>
								<span className={styles["text-wrap"]}>
									{promiseTime && (
										<>
											{isPickup
												? translate("deliveryTime_pickup_in")
												: translate("delivery_in")}
											&nbsp;
											{promiseTime}
											&nbsp;
											{translate("deliveryTime_minutes")}
											.&nbsp;
										</>
									)}
									{time && (
										<>
											{isPickup
												? translate("deliveryTime_pickup_to")
												: translate("delivery_to")}
											&nbsp;
											{time}
										</>
									)}
									&nbsp;
									{isPickup ? translate("from") : translate("to")}
									{address}
								</span>
							</div>
							<button
								className={styles["edit-order"]}
								aria-label={translate("accessibility_cart_editAddress")}
								onClick={handleEditAddressClick}>
								<img
									src={Pencil.src}
									alt={""}
								/>
							</button>
						</div>
						{!isDesktop && (
							<button
								onClick={specialRequest}
								className={styles["special-request-title"]}>
								<span>
									{translate(
										isPickup
											? "shoppingCart_specialRequests_pickup"
											: "shoppingCart_specialRequests_delivery",
									)}
								</span>
							</button>
						)}
						{isDesktop ? (
							<div className={styles["icons-desktop-wrap"]}>
								<button
									aria-label={translate("accessibility_imageAlt_specialRequest")}
									onClick={() => specialRequest()}>
									<span className={styles["special-request-title"]}>
										{translate(
											isPickup
												? "shoppingCart_specialRequests_pickup"
												: "shoppingCart_specialRequests_delivery",
										)}
									</span>
								</button>
								<ToolTip
									id={generateUniqueId(8)}
									className={styles["tool-tip"]}
									text={translate(toolTipText)}
									isVisible={toolTipVisible}
									onClick={() => (!toolTipOption ? specialRequest() : deleteItems())}
									onMouseEnter={() => setToolTipVisible(true)}
									onMouseLeave={() => setToolTipVisible(false)}
								/>
								<button
									aria-label={translate("accessibility_imageAlt_deleteOrder")}
									onMouseEnter={() => {
										setToolTipVisible(true);
										setToolTipOption(1);
									}}
									onMouseLeave={() => {
										setToolTipVisible(false);
									}}
									onClick={() => deleteItems()}>
									<img
										className={styles["icon"]}
										src={Trash.src}
										alt={translate("accessibility_imageAlt_deleteOrder")}
										aria-hidden={true}
									/>
								</button>
							</div>
						) : null}
					</div>
				</div>
			</div>
			{isDesktop ? <Separator className={styles["custom"]} /> : null}
		</>
	);
};

export default DeliveryTime;

function ToolTip({
	id,
	className = "",
	onClick,
	text,
	isVisible,
	onMouseEnter,
	onMouseLeave,
}) {
	return (
		<>
			<div
				className={clsx(
					styles["tool-tip-background"],
					isVisible ? styles["visible"] : "",
				)}
				onMouseLeave={onMouseLeave}
				onMouseOver={onMouseEnter}
			/>
			<div
				id={id}
				className={clsx(className, isVisible ? styles["visible"] : "")}
				onClick={onClick}
				onMouseLeave={onMouseLeave}
				onMouseOver={onMouseEnter}>
				<div className={styles["triangle"]} />
				<span className={styles["tool-tip-text"]}>{text}</span>
			</div>
		</>
	);
}
