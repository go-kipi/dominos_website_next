import Api from "api/requests";
import { Store } from "../redux/store";

import ORDER_STATUS from "constants/OrderStatus";

import * as Routes from "constants/routes";

import Router from "next/router";

const OrderStatusService = (function () {
	function getStatus(allowed, onAllowed, onDisallowed) {
		function onSuccess(data) {
			const status = data.orderStatus.toLowerCase();

			if (allowed.includes(status)) {
				typeof onAllowed === "function" && onAllowed(status);
			} else {
				typeof onDisallowed === "function" && onDisallowed(status);
			}
		}

		Api.getOrderStatus({
			onSuccess: onSuccess,
		});
	}

	function getStatusFromUserData(allowed, onAllowed, onDisallowed) {
		const status =
			Store.getState().userData?.activeOrderStatus?.status?.toLowerCase();

		if (allowed.includes(status)) {
			typeof onAllowed === "function" && onAllowed();
		} else {
			typeof onDisallowed === "function" && onDisallowed();
		}
	}

	function goToScreen() {
		let timeout;
		const user = Store.getState().userData;
		const userOrders = user.submittedOrders ?? [];
		const status = user.activeOrderStatus.status.toLowerCase();

		switch (status) {
			case ORDER_STATUS.BASKET:
				timeout = setTimeout(() => {
					Router.push(Routes.cart).then(() => {
						clearTimeout(timeout);
					});
				}, 250);
				break;

			case ORDER_STATUS.IN_PAYMENT:
				timeout = setTimeout(() => {
					Router.push(
						{
							pathname: Routes.cart,
							query: { showPayment: true },
						},
						undefined,
						{ shallow: true },
					).then(() => {
						clearTimeout(timeout);
					});
				}, 250);
				break;

			case ORDER_STATUS.IN_MENU:
				timeout = setTimeout(() => {
					Router.push(Routes.menu).then(() => {
						clearTimeout(timeout);
					});
				}, 250);

				break;
			case ORDER_STATUS.TRACKER:
				timeout = setTimeout(() => {
					const saleHash = Store.getState().order.saleIdHash ?? "";
					Router.push(
						`${Routes.tracker}/[orderHash]`,
						`${Routes.tracker}/${saleHash}`,
					).then(() => {
						clearTimeout(timeout);
					});
				}, 250);

				break;

			case ORDER_STATUS.NO_ORDER:
			default:
				Router.push(Routes.root);
				break;
		}
	}

	return {
		getStatus,
		getStatusFromUserData,
		goToScreen,
	};
})();

export default OrderStatusService;
