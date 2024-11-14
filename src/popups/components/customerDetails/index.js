import React, { useEffect, useRef, useState } from "react";

import styles from "./index.module.scss";
// Animation
import SlidePopup from "popups/Presets/SlidePopup";
import XIcon from "/public/assets/icons/x-icon.svg";
import { useSelector } from "react-redux";

import Ticket from "./ticket";
import useTranslate from "hooks/useTranslate";
export default function OrderDetailsPopup(props) {
	const { payload = {} } = props;
	const { title, guestCheckNo } = payload;
	const translate = useTranslate();

	const branches = useSelector((store) => store.branches);

	const trackerOrderDetails = useSelector((store) => store.trackerOrderDetails);
	const order = trackerOrderDetails.order;
	const isPickup = order.isPickup;
	const orderPickup = order?.pickup;
	const orderDelivery = order?.delivery;
	const orderId = guestCheckNo || trackerOrderDetails.order.orderId;
	const cartItems = trackerOrderDetails.cartData;

	const storeId = orderDelivery?.storeId ?? orderPickup?.storeId;
	const branchAddress = branches.find(
		(branch) => branch.id === storeId,
	)?.storeAddress;

	const address = orderDelivery?.address;

	const ref = useRef();

	const animateOut = () => ref.current.animateOut();

	function getHourAndMin() {
		const order = isPickup ? orderPickup : orderDelivery;

		const date = new Date(order?.promiseTime);

		const hour = date.getHours();
		const minute =
			date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

		return hour + ":" + minute;
	}

	return (
		<SlidePopup
			id={props.id}
			showCloseIcon={true}
			className={styles["customer-details-popup"]}
			ref={ref}>
			<div className={styles["head-wrap"]}>
				<h1
					className={styles["head-title"]}
					tabIndex={0}>
					{title}
				</h1>
			</div>
			<div
				className={styles["body"]}
				aria-live={"polite"}>
				<Ticket
					title={translate("trackerScreen_orderDetailsPopup_orderNumber")}
					value={orderId}
				/>
				{isPickup ? (
					<Ticket
						title={translate("trackerScreen_orderDetailsPopup_pickup")}
						value={
							branchAddress +
							(orderPickup.promiseTime
								? ",  " +
								  translate("trackerScreen_orderDetailsPopup_timedTo") +
								  " " +
								  getHourAndMin()
								: "")
						}
					/>
				) : (
					<>
						<Ticket
							title={translate("trackerScreen_orderDetailsPopup_delivery")}
							value={
								address +
								(orderDelivery.promiseTime
									? ",  " +
									  translate("trackerScreen_orderDetailsPopup_timedTo") +
									  " " +
									  getHourAndMin()
									: "")
							}
						/>

						<Ticket
							title={translate("orderDetails_delivery_branchName")}
							value={branchAddress}
						/>
					</>
				)}
				<Ticket
					className={styles["order-details-title"]}
					title={translate("trackerScreen_orderDetailsPopup_orderDetails") + ":"}
				/>

				{Object.values(cartItems.items).map((item) => {
					return (
						<Ticket
							key={"ticket-" + item.uuid}
							separator
							basketItem={item}
						/>
					);
				})}
				<Ticket
					title={translate("trackerScreen_orderDetailsPopup_total")}
					total={cartItems.total}
				/>
			</div>
		</SlidePopup>
	);
}
