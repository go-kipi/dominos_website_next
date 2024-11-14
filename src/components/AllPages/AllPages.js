import { useCallback, useEffect, useRef, useState } from "react";

import Api from "api/requests";
import { isOnClient, notEmptyObject, parseJTW } from "utils/functions";
import { GeneralService } from "services/GeneralService";
import { LocationService } from "services/LocationService";
import LanguageDirectionService from "services/LanguageDirectionService";
import Actions from "redux/actions";
import LocalStorageService from "services/LocalStorageService";
import { GPS_STATUS } from "constants/gps-status";
import * as Routes from "constants/routes";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reduxWrapper, Store } from "redux/store";

import ORDER_STATUS from "constants/OrderStatus";
import Splash from "containers/splash/Splash";

import Loader from "components/common/loaders/screen";

import MetaTags from "components/MetaTags/MetaTags";
import { LANGUAGES } from "constants/Languages";
import AnalyticsService from "../../utils/analyticsService/AnalyticsService";
import { USER_PROPERTIES } from "../../constants/user-properties";
import { PROMO_POPUP_STATE_ENUM } from "constants/operational-promo-popups-state";
import useTranslate from "hooks/useTranslate";
import * as popups from "constants/popup-types";
import dynamic from "next/dynamic";
import deviceState from "utils/device_state";
import getConfig from "next/config";
import GET_POPUP_DETAILS_STAGES from "constants/get-popup-details-stages";
import { LOCAL_STORAGE } from "constants/LocalStorage";
import EmarsysService from "utils/analyticsService/EmarsysService";
import DeepLinkCoupon from "services/DeepLinkCoupon";

const Popups = dynamic(() => import("popups"), {
	loading: () => <Loader shouldAnimate={false} />,
});

const FlipDevice = dynamic(() => import("components/FlipDevice/FlipDevice"), {
	loading: () => <Loader shouldAnimate={false} />,
});

if (isOnClient()) {
	new deviceState();
}

function AllPages(props) {
	const router = useRouter();
	const [NATSCon, setNATSCon] = useState();
	const apiData = useSelector((store) => store.apiData);
	const generalData = useSelector((store) => store.generalData);
	const refershToken = generalData?.tokenData?.refreshToken;
	const dispatch = useDispatch();
	const globalParams = useSelector((store) => store.globalParams);
	const translations = useSelector((store) => store.translations);
	const links = useSelector((store) => store.links);
	const user = useSelector((store) => store?.userData);
	const userOrders = user?.submittedOrders;
	const burgerState = useSelector((store) => store?.burgerState);
	const popupsArray = useSelector((store) => store.popupsArray);
	const isBackButtonBlocked = useSelector((store) => store.isBackButtonBlocked);
	const isBit = router.asPath === Routes.bit;
	const deviceStateSelector = useSelector((store) => store.deviceState);
	const cart = useSelector((store) => store.cartData);
	const isInit = useRef(true);

	const initialRequestsDone = isBit
		? !!apiData && notEmptyObject(translations) && notEmptyObject(links)
		: !!apiData && notEmptyObject(translations) && !!globalParams;

	const handlePopState = useCallback(() => {
		if (burgerState || popupsArray.length > 0) {
			burgerState && dispatch(Actions.setBurger(false));
			popupsArray.length > 0 &&
				!isBackButtonBlocked &&
				dispatch(Actions.removePopup());
			router.push(router.asPath);
		}
	}, [burgerState, popupsArray.length, router.asPath, isBackButtonBlocked]);

	useEffect(() => {
		window.addEventListener("online", hideNoInternetPopup);
		window.addEventListener("offline", showNoInternetPopup);

		return () => {
			window.removeEventListener("online", hideNoInternetPopup);
			window.removeEventListener("offline", showNoInternetPopup);
		};
	}, []);

	useEffect(() => {
		if (notEmptyObject(cart) && cart.items) {
			EmarsysService.setCart(cart.items);
		} else {
			EmarsysService.setEmptyCart();
		}
	}, [router.asPath, cart.items]);

	useEffect(() => {
		window.history.pushState(null, null, window.location.href);

		return () => {
			window.onpopstate = null;
		};
	}, []);

	useEffect(() => {
		if (Store && window && !deviceStateSelector) {
			new deviceState();
		}
	}, [Store, deviceStateSelector]);

	useEffect(() => {
		window.onpopstate = handlePopState;
	}, [handlePopState]);

	useEffect(() => {
		// Every entering to new page
		if (!refershToken) return;
		const userId = getUserId();
		if (userId) {
			sendUserIdAnalytics(userId, () => {
				AnalyticsService.setUserProperties({
					[USER_PROPERTIES.USER_ID]: userId,
				});
			});
		}
	}, [router.pathname, refershToken]);

	useEffect(() => {
		// When website load up
		if (!refershToken) {
			return;
		}
		const isLoggedIn = getUserId();
		AnalyticsService.setUserProperties({
			[USER_PROPERTIES.REGISTERED]: isLoggedIn
				? USER_PROPERTIES.values.YES
				: USER_PROPERTIES.values.NO,
		});
	}, [refershToken]);

	useEffect(() => {
		// When website load up
		if (userOrders === undefined) return;
		const hasValue = USER_PROPERTIES.values.YES;
		const noValue = USER_PROPERTIES.values.NO;
		if (Array.isArray(userOrders)) {
			const firstOrderParams = userOrders.length === 0 ? hasValue : noValue;

			const moreThanThreeOrdersParams = userOrders.length > 3 ? hasValue : noValue;

			AnalyticsService.setUserProperties({
				[USER_PROPERTIES.FIRST_ORDER]: firstOrderParams,
				[USER_PROPERTIES.THREE_ORDER]: moreThanThreeOrdersParams,
			});
		} else {
			AnalyticsService.setUserProperties({
				[USER_PROPERTIES.ADD_TO_FAVORITE]: noValue,
			});
			AnalyticsService.setUserProperties({
				[USER_PROPERTIES.PURCHASE]: noValue,
			});
			AnalyticsService.setUserProperties({
				[USER_PROPERTIES.COUPON_ORDER]: noValue,
			});
		}
	}, [userOrders]);

	useEffect(() => {
		for (const key in LANGUAGES) {
			const lang = LANGUAGES[key];
			if (lang.nextName === router.locale) {
				LanguageDirectionService.updateRtl(lang.name);
			}
		}

		const csrParam = new URLSearchParams(window.location.search).get("csr");
		if (csrParam) {
			dispatch(Actions.setUTMSource(`?csr=${csrParam}`));
		}
	}, []);

	useEffect(() => {
		if (deviceStateSelector && isInit.current) {
			isInit.current = false;
			sendInitialRequests();
		}
	}, [deviceStateSelector]);

	// useEffect(() => {
	// 	if (initialRequestsDone) {
	// 		NATSWebSocketService.connectToSocket()
	// 			.then((nc) => {
	// 				setNATSCon(nc);
	// 			})
	// 			.catch((err) => console.log("caught NATS error: ", err));
	// 	}
	// 	return () => {
	// 		if (typeof NATSCon === "object") {
	// 			NATSCon?.flush()
	// 				.then(() => {
	// 					console.log("Closed NATS connection");
	// 				})
	// 				.catch((err) => console.log("caught NATS error: ", err));
	// 		}
	// 	};
	// }, [initialRequestsDone]);

	useEffect(() => {
		if (refershToken && NATSCon) {
			const userId = getUserId();
			connectToGeneralMessages(userId);
		}
	}, [NATSCon, refershToken]);

	const sendUserIdAnalytics = (isLoggedIn, callback) =>
		isLoggedIn && typeof callback === "function" && callback();

	const getUserId = () => {
		const jwt = parseJTW(refershToken);
		const jwtData = JSON.parse(jwt.plainData);
		return jwtData.userId;
	};

	const connectToGeneralMessages = (userId) => {
		const env = apiData.envType;
		const channel = `consumer.${env?.toUpperCase()}.${userId}`;
		console.log("connecting to channel", channel);
		// NATSCon?.subscribe(channel, {
		// 	callback: (err, msg) => {
		// 		if (err) {
		// 			console.log("err connecting to channel:", channel);
		// 		}
		// 		const data = JSON.parse(NATSWebSocketService.decodeData(msg.data));
		// 		console.log("nats data", data);
		// 	},
		// });
	};

	const sendInitialRequests = () => {
		LanguageDirectionService.init();
		GeneralService.init();
		LocationService.init();
		DeepLinkCoupon.init();
		const { publicRuntimeConfig } = getConfig();
		const appVersion = publicRuntimeConfig?.version;

		const uuid = process.env["NEXT_PUBLIC_APP_UUID"] ?? "";
		const envType = process.env["NEXT_PUBLIC_ENV_TYPE"] ?? "";
		const payload = {
			payload: {
				deviceType: "web",
				appVersion,
			},
		};

		if (envType !== "prod") {
			payload["payload"] = { ...payload["payload"], UUID: uuid, envType };
		}
		Api.getServerValidateVersion(payload).then((response) => {
			function onSuccess() {
				if (isBit) {
					return;
				}
				connectIfNeeded();
			}

			if (notEmptyObject(translations)) {
				onSuccess();
			} else {
				// we dont want to add local translations on bit;
				Api.getAllTranslations(Store.getState().generalData?.lang, onSuccess);
			}
			if (!notEmptyObject(links)) {
				Api.getLinks(Store.getState().generalData?.lang);
			}
		});
	};
	function getPopupEntry() {
		const userSawEntryPopup = sessionStorage.getItem(
			LOCAL_STORAGE.USER_SAW_ENTRY_POPUP,
		);

		if (!userSawEntryPopup) {
			Api.getPopupDetails({
				payload: { stage: GET_POPUP_DETAILS_STAGES.GET_CUSTOMER_DETAILS },
				onSuccess: () => {
					sessionStorage.setItem(LOCAL_STORAGE.USER_SAW_ENTRY_POPUP, true);
				},
			});
		}
	}

	const getGlobalParamsFromBE = () => {
		if (!globalParams) {
			const payload = {};
			Api.getGlobalParams({
				payload,
			});
		}
	};

	const connectIfNeeded = () => {
		const token = LocalStorageService.getItem("refreshToken", null);

		const onSuccessCB = (data) => {
			getCustomerDetails();
		};

		if (token) {
			return Api.refreshToken(onSuccessCB, token, false, true);
		} else {
			return Api.connect(onSuccessCB, undefined, false, true);
		}
	};

	const getCustomerDetails = () => {
		setLang(() => getGlobalParamsFromBE());
		const payload = {
			gpsstatus: Store.getState().generalData?.gpsstatus ?? GPS_STATUS.OFF,
			url: window.location.href,
		};

		function onSuccess(res) {
			dispatch(Actions.setUser(res.data));
			const status = res.data?.activeOrderStatus?.status.toLowerCase();
			if (router.route === Routes.menu && status === ORDER_STATUS.NO_ORDER) {
				router.replace(Routes.root);
			}
			const promoPopups = res.data?.popups;
			if (Array.isArray(promoPopups) && promoPopups.length > 0) {
				dispatch(Actions.setPromoPopups(promoPopups));
			}

			getPopupEntry();
		}

		Api.getCustomerDetails(
			{
				payload,
				onSuccessCB: onSuccess,
			},
			false,
		);
	};

	const showNoInternetPopup = () => {
		const translations = Store.getState().translations;

		const payload = {
			text: translations.networkErrorPopup_text,
			enableClickOutside: false,
			showCloseIcon: false,
			button1Text: "",
		};
		dispatch(
			Actions.addPopup({
				type: popups.API_ERROR,
				payload,
			}),
		);
	};

	function hideNoInternetPopup() {
		dispatch(Actions.removePopup());
	}

	const setLang = (callback) => {
		const lang = Store.getState().generalData.lang ?? "he";
		Api.setLang(
			{
				payload: { lang },
				onSuccess: () => {
					typeof callback === "function" && callback();
				},
			},
			false,
		);
	};

	return initialRequestsDone ? (
		<>
			{props.children}
			<MetaTags path={props.path} />
			<RenderPopups />
			<FlipDevice />
			<ScreenLoader />
		</>
	) : (
		<>
			<MetaTags path={props.path} />
			<Splash />
		</>
	);
}

export default AllPages;

function RenderPopups() {
	const popupsArray = useSelector((store) => store.popupsArray);
	const hasPopups = popupsArray?.length > 0;
	const shouldShowPopups = hasPopups && isOnClient();

	return shouldShowPopups ? <Popups /> : null;
}

const ANIMATION_CLASSNAMES = {
	animateIn: "animate-in",
	animateOut: "animate-out",
};

function ScreenLoader() {
	const loaderState = useSelector((store) => store.loaderState);
	const [showLoader, setShowLoader] = useState(false);
	const [minTimeReached, setMinTimeReached] = useState(false);
	const [animationClassName, setAnimationClassName] = useState(
		ANIMATION_CLASSNAMES.animateIn,
	);
	const minimum_loader_time = 1000;

	//enforce minimum appearance time
	useEffect(() => {
		if (loaderState) {
			setMinTimeReached(false);
			setShowLoader(true);
			setAnimationClassName(ANIMATION_CLASSNAMES.animateIn);

			const timeout = setTimeout(() => {
				setMinTimeReached(true);
				clearTimeout(timeout);
			}, minimum_loader_time);
		}

		if (!loaderState && minTimeReached) {
			setAnimationClassName(ANIMATION_CLASSNAMES.animateOut);
		}
	}, [loaderState, minTimeReached]);

	function onAnimationEnd() {
		if (!loaderState && minTimeReached) {
			setMinTimeReached(false);
			setShowLoader(false);
		}
	}

	return showLoader ? (
		<Loader
			className={animationClassName}
			onAnimationEnd={onAnimationEnd}
			shouldAnimate={true}
		/>
	) : (
		<></>
	);
}
