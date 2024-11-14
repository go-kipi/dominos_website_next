import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import addTitleToPizza, {
	getLatLngBounds,
	getMobileOperatingSystem,
	getSimpleMediaUrl,
	notEmptyObject,
	stopVideo,
} from "utils/functions";
import Header from "containers/header";
import Api from "api/requests";
import { useDispatch, useSelector } from "react-redux";
import NATSWebSocketService from "services/NATSWebSocketService";
import LottieAnimation from "components/LottieAnimation";
import { handleNavigation } from "utils/functions";
import { VARIANTS, POST_TRACKING_VARIANTS } from "constants/TrackerVariants";
import Map from "components/Map";
import Button from "components/button";
import TrackerProgressBar from "components/TrackerProgressBar";
import MapMarker from "components/Map/components/MapMarker";
import { skipToContent } from "utils/functions";
import Actions from "redux/actions";
import * as popups from "constants/popup-types";
import SavedPizzaAnim from "animations/tracker/saved-pizza-anim.json";
import useNatsConnection from "hooks/useNatsConnection";
import styles from "./index.module.scss";
import * as Routes from "constants/routes";

/* assets */
import MapPin from "/public/assets/icons/dominos-map-marker.svg";
import DeliveryIcon from "/public/assets/icons/tracker/delivery-bike-icon.svg";
import NavigationIcon from "/public/assets/icons/tracker/tracker-navigation-icon.svg";
import CurrentLocationMarker from "/public/assets/icons/current-location-marker.svg";
import BlueExclamationIcon from "/public/assets/icons/blue-circular-exclamation.svg";
import BlueNavigationIcon from "/public/assets/icons/blue-circular-navigation.svg";
import HourGlassIcon from "/public/assets/icons/tracker/hourglass.svg";
import OrderCancelledIcon from "/public/assets/icons/tracker/order-cancelled-icon.svg";
import PickupDoneIcon from "/public/assets/icons/tracker/pickup-done.svg";

import { useRouter } from "next/router";
import clsx from "clsx";

import useUserLocation from "hooks/useUserLocation";
import useTranslate from "hooks/useTranslate";
import { GPS_STATUS } from "constants/gps-status";
import HiddenContent from "../../components/accessibility/hiddenContent/hiddenContent";
import TrackerMap from "/public/assets/bg-images/trackermap.png";
import PizzaTreeService from "services/PizzaTreeService";
import { TRACKER_STATUS_ENUM } from "constants/tracker-status-id";
import TrackerMessage from "./TrackerMessage";
import TrackerNotification from "./TrackerNotification";
import usePromotionalAndOperationalPopups from "hooks/usePromotionalAndOperationalPopups";
import {
	PROMO_POPUP_STATE_ENUM,
	PROMO_TRACKER,
} from "constants/operational-promo-popups-state";
import { DELIVERY_TYPES } from "constants/TrackerOrderEnum";
import { MEDIA_ENUM } from "constants/media-enum";
import MARKETING_TYPES from "constants/Marketing-types";

function Tracker(props) {
	const videoName = "test_background_video.mp4";
	const defaultVid = getSimpleMediaUrl(`Marketing/${videoName}`);
	const { saleHash = "", isDeepLink = false } = props;
	usePromotionalAndOperationalPopups(PROMO_TRACKER);
	const router = useRouter();
	const { query = {} } = router;
	const { isFromDrawer = false, guestCheckNo } = query;
	const dispatch = useDispatch();
	const videoRef = useRef();
	const getNC = useNatsConnection();
	const nc = getNC();
	const promotionalAndOperationalPopups = useSelector(
		(store) => store.promoPopups,
	);
	const envType = useSelector((store) => store.apiData).envType;
	const deviceState = useSelector((store) => store.deviceState);
	const lang = useSelector((store) => store.generalData.lang);
	const userData = useSelector((store) => store.userData);
	const usersOrders = userData.submittedOrders ?? [];
	const trackerOrderDetails = useSelector((store) => store.trackerOrderDetails);
	const generalData = useSelector((store) => store.generalData);
	const [pizzas, setPizzas] = useState([]);
	const isIOS = getMobileOperatingSystem() === "iOS";
	const hasPizzas = pizzas.length > 0;
	const [isInvalidOrder, setIsInvalidOrder] = useState(false);
	const [orderHash, setOrderHash] = useState(
		(isFromDrawer && !saleHash) || isDeepLink ? "" : saleHash,
	);
	const [orderData, setOrderData] = useState();
	const [carrierData, setCarrierData] = useState();
	const [isFutureOrder, setIsFutureOrder] = useState(false);
	const isOrderDelivered =
		orderData?.statusId === TRACKER_STATUS_ENUM.DELIVERED ||
		orderData?.statusId === TRACKER_STATUS_ENUM.READY;
	const isOrderCancelled = orderData?.statusId === TRACKER_STATUS_ENUM.CANCELLED;
	const mapRef = useRef();
	const didAnimate = useRef(false);
	const [ETA, setETA] = useState();
	const [zoom, setZoom] = useState(12);
	const [center, setCenter] = useState();
	const [userLocation] = useUserLocation(setCenter);
	const translate = useTranslate();
	const cartData = useSelector((store) => store.cartData);
	const [startTime, setStartTime] = useState("");
	const [showSavedPizzaAnim, setShowSavedPizzaAnim] = useState(false);
	const isSmallScreen = deviceState.isMobile && window.innerHeight < 700;
	const isInRoute = typeof orderData === "object" && orderData?.showDriverOnMap;
	const isPickup =
		typeof orderData === "object" && orderData?.subServiceId === "pu";
	const prize = useSelector((store) => store.orderPrize);
	const orderDetails = trackerOrderDetails.order;
	const order = useSelector((store) => store.order);
	const branches = useSelector((store) => store.branches);
	const startDate = useRef(getCurrentTime());
	const isArrivingSoon =
		orderData?.statusId === TRACKER_STATUS_ENUM.ARRIVING_SOON;
	const trackerMessagesTranslations = useSelector(
		(store) => store.trackerMessagesTranslations,
	);
	const [videoSrc, setVideoSrc] = useState(defaultVid);

	if (process.env.NODE_ENV !== "production") {
		// console.log("orderData: ", orderData);
	}

	const exitRoletaModal = () => {
		dispatch(
			Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.SUBMIT_ACTIVE_ORDER),
		);
	};

	let branchLat, branchLng;
	if (orderDetails && branches) {
		const branch = branches?.find(
			(branch) => branch.id === orderDetails?.pickup?.storeId,
		);
		branchLat = branch?.lat;
		branchLng = branch?.lng;
	}

	useLayoutEffect(() => {
		const isMessagesExist = Object.keys(trackerMessagesTranslations).length > 0;
		if (!isMessagesExist) {
			const fe = generalData?.latestVersion?.fe;
			const cdnUrl = Api.getCdnUrl();
			const getUrl = `${cdnUrl}dictionary/trackerStatusMessages.v${fe}.json`;
			const trackerConfig = { method: "get", path: getUrl, executeNow: true };
			const payload = { domain: process.env.NEXT_PUBLIC_CDN_DOMAIN };
			Api.getTrackerTranslations({ payload, config: trackerConfig });
		}
	}, []);

	useEffect(() => {
		const status = orderData?.statusId;
		if (status && typeof trackerMessagesTranslations[status] === "object") {
			const { assetVersion = 0 } = trackerMessagesTranslations[status];
			const newVidSrc =
				Api.getCdnUrl() +
				`trackerMedia/${status}/V${assetVersion}/${MEDIA_ENUM.IN_TRACKER}.mp4`;
			checkIfVideoExist(newVidSrc).then((isExist) => {
				if (isExist) {
					setVideoSrc(newVidSrc);
				}
			});
		}
	}, [orderData?.statusId]);

	useEffect(() => {
		dispatch(Actions.resetTrackerOrder());
		dispatch(Actions.hideFooter());
		findOrderFromOrderHash(orderHash);
	}, []);

	useEffect(() => {
		const costumerDetailsPayload = {
			gpsstatus: generalData?.gpsstatus ?? GPS_STATUS.OFF,
		};
		Api.getCustomerDetails({ payload: costumerDetailsPayload, onSuccessCB });
		const storeListPayload = { lang };
		Api.getStoreList({ payload: storeListPayload });

		function onSuccessCB(res) {
			dispatch(Actions.setUser(res.data));
			if (
				Array.isArray(res.data.submittedOrders) &&
				res.data.submittedOrders.length > 0 &&
				orderHash
			) {
				const currentOrder = res.data.submittedOrders.find(
					(order) => order.saleIdHash === orderHash,
				);
				setOrderDetailsInRedux(currentOrder);
			}
		}
	}, []);

	useEffect(() => {
		function onSuccess(data) {
			setPizzas(addTitleToPizza(data.savedBasketItems ?? []));
		}

		if (orderHash && !isDeepLink) {
			Api.getOptionalNewKits({ payload: { SaleIdHash: orderHash }, onSuccess });
		}
	}, [orderHash, isDeepLink]);

	useEffect(() => {
		if (notEmptyObject(cartData)) {
			dispatch(Actions.updateTrackerOrder({ key: "cartData", value: cartData }));
			dispatch(Actions.setCart({}));
		}
		if (notEmptyObject(order)) {
			dispatch(Actions.updateTrackerOrder({ key: "order", value: order }));
			dispatch(Actions.resetOrder());
		}
	}, [cartData, order]);

	async function checkIfVideoExist(vidSrc) {
		const req = new Request(vidSrc);
		const res = await fetch(req);
		const isExist = res.status === 200;
		return isExist;
	}

	function findOrderFromOrderHash(hash) {
		if (usersOrders.length > 0 && hash) {
			const order = usersOrders.find((o) => o.saleIdHash === hash);
			setOrderDetailsInRedux(order);
		}
	}

	function setOrderDetailsInRedux(order) {
		if (order) {
			setStartTime(order?.submittedAt);
			setOrderHash(order.saleIdHash);
			dispatch(
				Actions.updateTrackerOrder({
					key: "cartData",
					value: order.details.basket,
				}),
			);
			const orderDetails = {
				...order.details,
				promiseTime: order.promiseTime,
				orderId: order.guestCheckNo,
			};

			updateOrderSlice(orderDetails);
			if (order.details.basket?.products) {
				dispatch(Actions.addCatalogProducts(order.details.basket?.products));
			}
		}
	}

	useEffect(() => {
		if (typeof nc === "object" && orderHash && orderHash.length > 0) {
			const channel = "tracker." + envType?.toUpperCase() + "." + orderHash;
			console.log("channel: " + channel);
			nc.subscribe(channel, {
				callback: (err, msg) => {
					if (err) {
						console.log("err connecting to channel:", channel);
					}
					const isInTracker =
						window.location.pathname.includes(Routes.tracker) ||
						window.location.pathname.includes("/tracklink");
					if (!isInTracker) return;
					const order = JSON.parse(NATSWebSocketService.decodeData(msg.data));
					const payload = {
						hash: orderHash,
						data: order.data,
					};
					dispatch(Actions.setUserOrderData(payload));
					const { data, action } = order;
					if (typeof data === "object") {
						if (action === "orderStatus") {
							setOrderData(data);
							setIsFutureOrder(data.statusId === TRACKER_STATUS_ENUM.FUTURE);
							setETA(Math.ceil(data.etaMinutes));
						} else if (action === "carrierLocation") {
							setCarrierData(data?.carrierLocation);
						}
					}
				},
			});
			if (!isDeepLink) {
				trackOrder(orderHash);
			}
		}
		return async () => {
			if (typeof nc === "object") {
				await nc?.closed();
				console.log("NATS CLOSED!");
			}
		};
	}, [nc, orderHash]);

	useEffect(() => {
		if (!isFromDrawer && prize && !orderDetails?.isShownedRoleta) {
			if (prize.meta === MARKETING_TYPES.ONE_TIME_PRIZE) {
				dispatch(
					Actions.addPopup({
						type: popups.MARKETING_SUBSCRIPTION,
						payload: {
							type: MARKETING_TYPES.PRESENT_POPUP,
							title: translate("marketing_get_benefit_title"),
							addTitle: translate("marketing_get_benefit_add_title"),
							subTitle: translate("marketing_get_benefit_disclaimer"),
							mainBtnText: translate("marketing_get_benefit_btn"),
							isLottie: true,
							mainBtnFunc: exitRoletaModal,
						},
					}),
				);
			} else {
				dispatch(
					Actions.addPopup({
						type: popups.ROLETA,
						payload: {
							exitRoletaModal: exitRoletaModal,
						},
					}),
				);
			}
		}
	}, [orderDetails?.isShownedRoleta, prize]);

	useEffect(() => {
		if (isDeepLink) {
			const payload = { deepLink: saleHash };
			Api.trackOrder({
				payload,
				onSuccess: (res) => {
					setOrderHash(res?.saleHash);
					findOrderFromOrderHash(res?.saleHash);
				},
				onRejection: (res) => {
					const isInvalidOrderHash = res.message.id === "InvalidTrackingOrderId";
					setIsInvalidOrder(isInvalidOrderHash);
				},
			});
		}
	}, []);

	useEffect(() => {
		if (mapRef.current && isInRoute && !didAnimate.current) {
			const { storeLocation, orderLocation } = orderData;
			const newBounds = getLatLngBounds(
				storeLocation.latitude,
				storeLocation.longitude,
				orderLocation.latitude,
				orderLocation.longitude,
			);
			typeof mapRef.current?.fitBounds === "function" &&
				mapRef.current?.fitBounds(newBounds, 100);
			didAnimate.current = true;
		}
	}, [orderData, mapRef.current, isInRoute]);

	const handleOnVideoClick = () => {
		if (videoRef?.current?.paused) {
			videoRef.current?.play();
		} else {
			videoRef.current?.pause();
		}
	};

	const trackOrder = (hash) => {
		const payload = { saleHash: hash };
		Api.trackOrder({
			payload,
			onSuccess: (res) => {
				setOrderHash(res?.saleHash);
			},
			onRejection: (res) => {
				const isInvalidOrderHash = res.message.id === "InvalidTrackingOrderId";
				setIsInvalidOrder(isInvalidOrderHash);
			},
		});
	};

	const getOrderTime = (eta) => {
		return eta?.split(" ")[1].substr(0, 5);
	};

	function updateOrderSlice(activeOrder) {
		const isPickup = activeOrder.subService === "pu";

		const payload = {};
		payload.isPickup = isPickup;

		if (isPickup) {
			const pickup = {
				timedto: activeOrder.timedTo,
				storeId: activeOrder.storeId,
				promiseTime: activeOrder.promiseTime,
			};
			payload.pickup = pickup;
		} else {
			const delivery = {
				address: activeOrder.address.address,
				eliveryInstructions: activeOrder.address.deliveryInstructions,
				timedto: activeOrder.timedTo,
				promiseTime: activeOrder.promiseTime,
				storeId: activeOrder.storeId,
			};
			payload.delivery = delivery;
		}
		payload.orderId = activeOrder.orderId;
		dispatch(Actions.updateTrackerOrder({ key: "order", value: payload }));
	}

	const handleSavePizzaPress = () => {
		setShowSavedPizzaAnim((prev) => !prev);
		Api.getSavedKits();
	};

	const handleOnCenterChanged = (event) => {
		const { center } = event;
		setCenter(center);
	};

	const handleOnGoogleMapsApiLoaded = (maps) => {
		const { map } = maps;
		mapRef.current = map;
	};

	const showSavePizzaPopup = () => {
		PizzaTreeService.init(() => {
			dispatch(
				Actions.addPopup({
					type: popups.SAVE_PIZZA,
					payload: {
						pizzas,
						onPizzaSaved: () => {
							handleSavePizzaPress();
						},
					},
				}),
			);
		});
	};

	const renderTopSection = () => {
		if (isInvalidOrder || isOrderCancelled) {
			return null;
		}
		return isFutureOrder
			? renderFutureOrderTopSection()
			: isOrderDelivered
			? renderFinishedOrderTopSection()
			: renderOrderTopSection();
	};

	const renderFutureOrderTopSection = () => {
		const orderType = orderData.subServiceId;
		const orderTime = getOrderTime(orderData.eta);
		const title = VARIANTS.future[orderType].PRE_TRACKING_TITLE;
		const subtitle = VARIANTS.future[orderType].PRE_TRACKING_SUBTITLE;
		const lottie = VARIANTS.future[orderType].PRE_TRACKING_ANIM;
		const defaultOptions = {
			loop: false,
			autoplay: true,
			animation: lottie,
		};
		const finalTitle = translate(title).replace("{time}", orderTime);
		return (
			<>
				<Icons
					isPickup={isPickup}
					onClickNavigate={onClickNavigate}
					onClickDetails={onClickDetails}
					BlueNavigationIcon={BlueNavigationIcon}
					BlueExclamationIcon={BlueExclamationIcon}
				/>
				<div className={styles["pre-order-lottie"]}>
					<img src={HourGlassIcon.src} />
				</div>
				<div aria-live={"polite"}>
					<h1
						className={styles["future-order-title"]}
						tabIndex={0}>
						{finalTitle}
					</h1>
					<h2
						className={styles["future-order-subtitle"]}
						tabIndex={0}>
						{translate(subtitle)}
					</h2>
				</div>
			</>
		);
	};

	const getAddressType = () => {
		const order = usersOrders.find((o) => o.saleIdHash === orderHash);
		if (order) {
			const { details } = order;
			const { addressType } = details?.address;
			switch (addressType) {
				case "address/apt":
					return DELIVERY_TYPES.APT;
				case "address/office":
					return DELIVERY_TYPES.OFFICE;
				case "address/poi":
					return DELIVERY_TYPES.POI;
				case "address/home":
					return DELIVERY_TYPES.HOME;
				default:
					return DELIVERY_TYPES.HOME;
			}
		} else return DELIVERY_TYPES.HOME;
	};

	const onClickNavigate = () => {
		if (!branchLng || !branchLng) {
			console.log("error");
			return;
		}
		typeof handleNavigation === "function" &&
			handleNavigation(branchLat, branchLng);
	};

	const onClickDetails = () => {
		if (orderDetails) {
			dispatch(
				Actions.addPopup({
					type: popups.ORDER_DETAILS,
					payload: {
						guestCheckNo: guestCheckNo,
						title: translate("trackerScreen_orderDetailsPopup_title"),
					},
				}),
			);
		}
	};

	const renderArrivingSoon = () => {
		return (
			<>
				<h1 className={styles["arriving-title"]}>
					{translate("trackerScreen_activeTracker_arrivingSoonTitle")}
				</h1>
				<h2 className={styles["arriving-subtitle"]}>
					{translate("trackerScreen_activeTracker_arrivingSoonSubTitle")}
				</h2>
			</>
		);
	};

	const renderETATime = () => {
		const arrivalTime =
			!isPickup && orderData?.eta.length > 0
				? orderData?.eta?.split(" ")?.[1]?.substr(0, 5)
				: "";
		const title = !isPickup
			? "trackerScreen_activeTracker_deliveryTitle"
			: "trackerScreen_activeTracker_pickupTitle";
		return (
			<>
				<div className={styles["eta-wrapper"]}>
					<span className={styles["eta-number-style"]}>{parseInt(ETA)}</span>
					<span className={styles["minutes-style"]}>
						{translate("trackerScreen_activeTracker_minutes")}
					</span>
				</div>
				<span className={styles["eta-arrival"]}>
					{isPickup
						? translate("trackerScreen_eta_pickup_subtitle")
						: translate("trackerScreen_eta_subtitle")}
				</span>
				{/* {arrivalTime.length > 0 ? ( */}
				{/* ) : null} */}
			</>
		);
	};

	const renderOrderTopSection = () => {
		return (
			<>
				<Icons
					isPickup={isPickup}
					onClickNavigate={onClickNavigate}
					onClickDetails={onClickDetails}
					BlueNavigationIcon={BlueNavigationIcon}
					BlueExclamationIcon={BlueExclamationIcon}
				/>
				<div
					aria-live={"polite"}
					tabIndex={0}>
					{!isArrivingSoon ? renderETATime() : renderArrivingSoon()}
				</div>
			</>
		);
	};

	const renderInvalidOrder = () => {
		return (
			<div className={styles["invalid-order-wrapper"]}>
				<div className={styles["hourglass-icon"]}>
					<img src={HourGlassIcon.src} />
				</div>
				<span
					className={styles["invalid-order-title"]}
					tabIndex={0}>
					{translate("trackerScreen_invalidOrder_title")}
				</span>
				<Button
					text={translate("trackerScreen_invalidOrder_btnLabel")}
					className={styles["invalid-order-btn"]}
					onClick={() => router.push("/")}
				/>
			</div>
		);
	};

	const renderCancelledOrder = () => {
		return (
			<div className={styles["cancelled-order-wrapper"]}>
				<div className={styles["cancelled-icon"]}>
					<img src={OrderCancelledIcon.src} />
				</div>
				<span
					className={styles["cancelled-order-title"]}
					tabIndex={0}>
					{translate("trackerScreen_cancelledOrder_title")}
				</span>
				<Button
					text={translate("trackerScreen_cancelledOrder_btnLabel")}
					className={styles["cancelled-order-btn"]}
					onClick={() => router.push("/")}
				/>
			</div>
		);
	};

	const renderFinishedOrderTopSection = () => {
		return (
			<>
				<Icons
					isPickup={isPickup}
					onClickNavigate={onClickNavigate}
					onClickDetails={onClickDetails}
					BlueNavigationIcon={BlueNavigationIcon}
					BlueExclamationIcon={BlueExclamationIcon}
				/>
				<div
					className={styles["order-finished-bonappetit"]}
					aria-live={"polite"}
					tabIndex={0}>
					{translate("trackerScreen_finishedOrder_bonAppetit")}
				</div>
			</>
		);
	};
	const renderSavePizza = () => {
		const defaultOptions = {
			loop: false,
			autoplay: true,
			animation: SavedPizzaAnim,
		};
		const meanwhileText = !showSavedPizzaAnim
			? "trackerScreen_savePizza_title_meanwhile"
			: "trackerScreen_savePizza_title_weSavedYourPizza";
		const savePizzaText = !showSavedPizzaAnim
			? "trackerScreen_savePizza_doYouWantToSaveYourPizza_question"
			: "trackerScreen_savePizza_afterSavePizzaLabel";
		return deviceState.isMobile ? (
			<div
				className={clsx(
					styles["linear-gradient"],
					styles["linear-gradient-bottom"],
				)}>
				<div className={styles["text-wrapper"]}>
					<div
						className={styles["meanwhile-text"]}
						tabIndex={0}>
						{translate(meanwhileText)}
					</div>
					<div
						className={styles["save-pizza-text"]}
						tabIndex={0}>
						{translate(savePizzaText)}
					</div>
				</div>
				{!showSavedPizzaAnim ? (
					<Button
						onClick={() => showSavePizzaPopup()}
						className={styles["save-pizza-btn"]}
						text={translate(
							"trackerScreen_savePizza_doYouWantToSaveYourPizza_btnLabel",
						)}
					/>
				) : (
					<div
						className={clsx(
							styles["save-pizza-lottie"],
							showSavedPizzaAnim ? styles["saved"] : "",
						)}>
						<LottieAnimation {...defaultOptions} />
					</div>
				)}
			</div>
		) : (
			<div
				className={clsx(
					styles["save-pizza-wrapper"],
					!isPickup && isOrderDelivered ? styles["done"] : "",
				)}>
				<div
					className={styles["text-wrapper"]}
					id={"meanwhile"}>
					<div
						className={styles["meanwhile-text"]}
						tabIndex={0}>
						{translate(meanwhileText)}
					</div>
					<div
						className={styles["save-pizza-text"]}
						tabIndex={0}>
						{translate(savePizzaText)}
					</div>
				</div>
				{!showSavedPizzaAnim ? (
					<Button
						onClick={() => showSavePizzaPopup()}
						className={styles["save-pizza-btn"]}
						text={translate(
							"trackerScreen_savePizza_doYouWantToSaveYourPizza_btnLabel",
						)}
					/>
				) : (
					<div className={styles["save-pizza-lottie"]}>
						<LottieAnimation {...defaultOptions} />
					</div>
				)}
			</div>
		);
	};

	const renderFinishedOrder = () => {
		const branch = branches?.find(
			(branch) =>
				branch.id === orderDetails?.[isPickup ? "pickup" : "delivery"]?.storeId,
		);
		const addressType = getAddressType();
		const pickupText = translate(
			"trackerScreen_finishedOrder_pickupReadySubText",
		).replace("{name}", branch?.storeAddress);
		const lottieAnim = isPickup
			? POST_TRACKING_VARIANTS.pu.POST_TRACKING_ANIM
			: POST_TRACKING_VARIANTS[orderData?.subServiceId][addressType]
					.POST_TRACKING_ANIM;
		const defaultOptions = {
			loop: false,
			autoplay: true,
			animation: lottieAnim,
		};
		return (
			<div
				className={clsx(
					styles["finished-order-wrapper"],
					isPickup ? styles["pickup"] : "",
				)}>
				{!deviceState.isMobile && isPickup ? (
					<div className={styles["finished-animation"]}>
						<img src={PickupDoneIcon.src} />
					</div>
				) : (
					<LottieAnimation
						className={styles["finished-animation"]}
						{...defaultOptions}
					/>
				)}
				{orderDetails?.isPickup && (
					<div
						className={styles["pickup-ready-wrapper"]}
						tabIndex={0}>
						<div className={styles["pickup-ready-text"]}>
							{translate("trackerScreen_finishedOrder_pickupReadyText")}
						</div>
						<div className={styles["pickup-ready-subtext"]}>{pickupText}</div>
					</div>
				)}
			</div>
		);
	};

	function getCurrentTime() {
		const now = new Date();

		const year = now.getFullYear();
		const month = ("0" + (now.getMonth() + 1)).slice(-2);
		const day = ("0" + now.getDate()).slice(-2);

		const hours = ("0" + now.getHours()).slice(-2);
		const minutes = ("0" + now.getMinutes()).slice(-2);
		const seconds = ("0" + now.getSeconds()).slice(-2);

		const formattedTime =
			year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

		return formattedTime;
	}

	const renderChildren = () => {
		return (
			<div
				className={clsx(
					styles["tracker-modal"],
					isOrderDelivered ? styles["done"] : "",
					isOrderCancelled ? styles["cancel"] : "",
				)}>
				<div className={styles["wrapper"]}>
					<>
						<div className={styles["filler"]} />
						<div className={styles["tracker-map-image"]}>
							<img src={TrackerMap.src} />
						</div>
					</>
					<div className={styles["content"]}>
						<div
							id={"target"}
							className={clsx(
								styles["tracker-top-section"],
								isArrivingSoon || !isSmallScreen ? styles["arriving"] : "",
							)}>
							{renderTopSection()}
						</div>
						{isInvalidOrder ? renderInvalidOrder() : null}
						{isOrderCancelled ? renderCancelledOrder() : null}
						{isOrderDelivered ? renderFinishedOrder() : null}
						{!isOrderCancelled &&
						!isOrderDelivered &&
						typeof orderData === "object" ? (
							<TrackerProgressBar
								startTime={startTime ? startTime : startDate.current}
								stepSeconds={orderData?.stageSeconds}
								secondsRemaining={orderData?.stageSecondsRemaining}
								ETA={ETA}
								status={orderData?.statusId}
								orderType={orderData?.subServiceId}
								isActive={!isFutureOrder}
							/>
						) : null}
						{hasPizzas && orderHash && !isOrderCancelled ? renderSavePizza() : null}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div
			draggable={false}
			className={clsx(styles["tracker-wrapper"], isIOS ? styles["ios"] : "")}>
			<HiddenContent
				elements={[
					{
						onClick: () => skipToContent("target"),
						text: translate("accessibility_skipToMainContent"),
					},
					{
						onClick: () => stopVideo("tracker-video"),
						text: translate("accessibility_stopVideo"),
					},
				]}
			/>
			<Header
				title={
					deviceState?.isMobile ? translate("trackerScreen_header_title") : null
				}
			/>
			{typeof orderData?.message === "string" && orderData?.message.length > 0 && (
				<TrackerNotification msg={orderData?.message} />
			)}
			{orderData?.statusId && <TrackerMessage status={orderData?.statusId} />}
			{!isInRoute ? (
				<video
					id={"tracker-video"}
					ref={videoRef}
					onClick={() => handleOnVideoClick()}
					className={styles["video-background"]}
					src={videoSrc}
					controls={false}
					muted
					loop
					playsInline
					autoPlay
				/>
			) : (
				<div className={clsx(styles["map-container"])}>
					{deviceState.isMobile && (
						<video
							ref={videoRef}
							onClick={() => handleOnVideoClick()}
							className={styles["video-background"]}
							src={videoSrc}
							controls={false}
							muted
							loop
							autoPlay
						/>
					)}
					<Map
						onChange={(e) => handleOnCenterChanged(e)}
						showBackToLocation={false}
						zoom={zoom}
						center={center}
						isDark
						onGoogleApiLoaded={(maps) => handleOnGoogleMapsApiLoaded(maps)}>
						{typeof carrierData === "object" ? (
							<MapMarker
								className={styles["delivery-marker"]}
								lat={carrierData?.latitude}
								lng={carrierData?.longitude}
								icon={DeliveryIcon}
							/>
						) : null}
						<MapMarker
							className={styles["store-marker"]}
							lat={orderData?.storeLocation?.latitude}
							lng={orderData?.storeLocation?.longitude}
							icon={MapPin}
						/>
						<MapMarker
							className={styles["target-marker"]}
							lat={orderData?.orderLocation?.latitude}
							lng={orderData?.orderLocation?.longitude}
							icon={CurrentLocationMarker}
						/>
					</Map>
				</div>
			)}
			{typeof orderData === "object" || isFromDrawer || isInvalidOrder
				? renderChildren()
				: null}
		</div>
	);
}

export default Tracker;

function Icons({
	isPickup,
	onClickNavigate,
	onClickDetails,
	BlueNavigationIcon,
	BlueExclamationIcon,
}) {
	const translate = useTranslate();
	return (
		<div className={styles["icons-container"]}>
			<button
				onClick={onClickDetails}
				aria-label={translate("accessibility_trackerScreen_details")}>
				<img
					className={styles["icon"]}
					src={BlueExclamationIcon.src}
					alt={""}
				/>
			</button>
			{isPickup && (
				<button
					onClick={onClickNavigate}
					aria-label={translate("accessibility_trackerScreen_navigate")}>
					<img
						className={styles["icon"]}
						src={BlueNavigationIcon.src}
						alt={""}
					/>
				</button>
			)}
		</div>
	);
}
