import ApiManager from "api/index";
import Actions from "redux/actions";
import { PROMO_POPUP_STATE_ENUM } from "constants/operational-promo-popups-state";
import LocalStorageService from "services/LocalStorageService";
import { META_ENUM } from "constants/menu-meta-tags";
import localTranslations from "translations.json";
import { areStringsEqual, isOnClient, notEmptyObject } from "utils/functions";
import LogRocket from "logrocket";
import getConfig from "next/config";
import GET_POPUP_DETAILS_STAGES from "constants/get-popup-details-stages";
import EmarsysService from "utils/analyticsService/EmarsysService";
import { SHIPPING_OPTION } from "constants/emarsysTypes";

const { publicRuntimeConfig } = getConfig();
const version = publicRuntimeConfig?.version;

// TODO: Send loader off with the api calls from continue order modal (getMenus,pizzaProductSelection)
class ApiService extends ApiManager {
	constructor() {
		super();

		if (!ApiService.instance) {
			ApiService.instance = this;
		}

		return (ApiService.instance = this);
	}
	setGlobalStore(store) {
		this.setStore(store);
	}

	getCdnUrl(cdnUrl) {
		if (cdnUrl) {
			return cdnUrl;
		}
		const cdn = this.global.store.getState().apiData.cdn;
		if (process.env.NODE_ENV === "development" && isOnClient()) {
			// proxy does not work on server side
			return "/assets/";
		}
		return cdn;
	}

	getConfig() {
		return {
			headers: {
				token: this.global.store.getState()?.generalData?.tokenData?.accessToken,
			},
		};
	}

	getDefaultMenu = (id) => {
		return {
			menus: [
				{
					id,
					elements: [],
					meta: "",
					defaultElement: "",
				},
			],
		};
	};

	getDefaultStore = () => {
		return {
			assetVersion: 1,
			cityName: "",
			description: "",
			directPhone: "",
			email: "",
			lat: 32.067063,
			lng: 34.793734,
			name: "",
			openingHoursTextual: "",
			storeAddress: "",
			tags: null,
			url: "",
		};
	};

	handleRefreshMenus = (data) => {
		const shouldRefreshMenus = data?.refreshMenu;
		if (shouldRefreshMenus) {
			const mainMenu =
				this.global.store.getState().globalParams.DefaultMenus.result.main;
			const payload = { menuId: mainMenu };

			this.getMenus({ payload });
			this.pizzaProductSelection({ payload });
		}
	};

	getAllTranslations = async (lang = "he", onSuccess) => {
		if (process.env.NODE_ENV === "development") {
			this.global.store.dispatch(Actions.setTranslations(localTranslations));
		}

		await this.getFETranslations(lang);
		await this.getBETranslations(lang);
		await this.getTrackerTranslationsAction();

		typeof onSuccess === "function" && onSuccess();
	};

	getFETranslations = async (lang = "he") => {
		const { fe } = await this.getLatestDictionaryVersions();

		const cdnUrl = this.getCdnUrl();

		const getUrl = cdnUrl + `dictionary/dictionary.${lang}.fe.v${fe}.json`;
		return await this.getTranslations({
			config: { method: "get", path: getUrl, executeNow: true },
			payload: { domain: process.env.NEXT_PUBLIC_CDN_DOMAIN },
		});
	};

	getBETranslations = async (lang = "he") => {
		const { be } = await this.getLatestDictionaryVersions();

		const cdnUrl = this.getCdnUrl();

		const getUrl = cdnUrl + `dictionary/dictionary.${lang}.be.v${be}.json`;
		return await this.getTranslations({
			config: { method: "get", path: getUrl, executeNow: true },
			payload: { domain: process.env.NEXT_PUBLIC_CDN_DOMAIN },
		});
	};

	getTrackerTranslationsAction = async (lang = "he") => {
		const { fe } = await this.getLatestDictionaryVersions();

		const cdnUrl = this.getCdnUrl();

		const getUrl = cdnUrl + `dictionary/trackerStatusMessages.v${fe}.json`;
		return await this.getTranslations({
			config: { method: "get", path: getUrl, executeNow: true },
			payload: { domain: process.env.NEXT_PUBLIC_CDN_DOMAIN },
		});
	};

	getTrackerTranslations = (props = {}) => {
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setTrackerTranslations(res));
			typeof props.onSuccessCB === "function" && props.onSuccessCB();
		};

		return this._execute(props, "", onSuccess);
	};

	getTranslations = (props = {}) => {
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setTranslations(res));

			typeof props.onSuccessCB === "function" && props.onSuccessCB();
		};

		return this._execute(props, "", onSuccess);
	};

	getLinks = async (lang = "he", shouldSaveOnRedux = true, cdnUrl = "") => {
		const props = {};

		const version = await this.getLatestLinksVersion(shouldSaveOnRedux, cdnUrl);

		const getUrl = this.getCdnUrl(cdnUrl) + `url/urls.${lang}.v${version}.json`;

		props["config"] = { method: "get", path: getUrl, executeNow: true };
		props["payload"] = {
			...(props["payload"] ?? {}),
			domain: process.env.NEXT_PUBLIC_CDN_DOMAIN,
		};
		const onSuccess = (res) => {
			if (shouldSaveOnRedux) {
				this.global.store.dispatch(Actions.setLinks(res));
			}
		};

		return this._execute(props, "", onSuccess);
	};

	getLatestLinksVersion = async (shouldSaveOnRedux = true, cdnUrl = "") => {
		if (!shouldSaveOnRedux) {
			const response = await this.getLinksVersion(false, cdnUrl);
			return response.data;
		}
		if (!this.global.store.getState().generalData?.latestVersion?.links) {
			await this.getLinksVersion();
		}

		return this.global.store.getState().generalData?.latestVersion?.links;
	};

	getLinksVersion = async (shouldSaveOnRedux = true, cdnUrl = "") => {
		const domain = process.env.NEXT_PUBLIC_CDN_DOMAIN;
		const version = "url.ver";
		const getUrl = `${this.getCdnUrl(cdnUrl)}url/${version}`;

		const props = {
			config: {
				method: "get",
				path: getUrl,
				executeNow: true,
			},
			payload: { domain },
		};

		const onSuccess = (res) => {
			if (shouldSaveOnRedux) {
				this.global.store.dispatch(Actions.setLinksLastestVersion(res));
			}
		};

		return this._execute(props, "", onSuccess);
	};

	getContentPage = async (
		lang = "he",
		contentId = "",
		route = "",
		onFailure,
	) => {
		const props = {};

		const version = await this.getLatestContentVersion();

		const getUrl =
			this.getCdnUrl() +
			`staticPagesContent/${contentId}/V${version}/staticPagesContent.${lang}.json`;
		props["config"] = { method: "get", path: getUrl, executeNow: true };
		props["payload"] = {
			...(props["payload"] ?? {}),
			domain: process.env.NEXT_PUBLIC_CDN_DOMAIN,
		};

		const onSuccess = (res) => {
			this.global.store.dispatch(
				Actions.addContentPage({
					route,
					data: res,
				}),
			);
		};

		function onFail() {
			typeof onFailure === "function" && onFailure();
		}

		return this._execute(props, "", onSuccess, onFail, onFail);
	};

	getLatestContentVersion = async () => {
		if (!this.global.store.getState().generalData?.latestVersion?.content) {
			await this.getContentVersion();
		}

		return this.global.store.getState().generalData?.latestVersion?.content;
	};

	getContentVersion = () => {
		const props = {};
		const getUrl = this.getCdnUrl() + `staticPagesContent/versions`;
		props["config"] = { method: "get", path: getUrl, executeNow: true };
		props["payload"] = {
			...(props["payload"] ?? {}),
			domain: process.env.NEXT_PUBLIC_CDN_DOMAIN,
		};

		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setContentLastestVersion(res));
		};

		return this._execute(props, "", onSuccess);
	};

	getLatestDictionaryVersions = async () => {
		const versions = {};

		if (!this.global.store.getState().generalData?.latestVersion?.fe) {
			await this.getLatestDictionaryVersionByPlatform("fe");
		}
		versions.fe = this.global.store.getState().generalData?.latestVersion?.fe;

		if (!this.global.store.getState().generalData?.latestVersion?.be) {
			await this.getLatestDictionaryVersionByPlatform("be");
		}
		versions.be = this.global.store.getState().generalData?.latestVersion?.be;

		return versions;
	};

	getLatestDictionaryVersionByPlatform = (platform = "fe", onSuccess) => {
		const getUrl = this.getCdnUrl() + `dictionary/${platform}.ver`;
		const config = { method: "get", path: getUrl, executeNow: true };
		const payload = { platform, domain: process.env.NEXT_PUBLIC_CDN_DOMAIN };

		function onSuccesCB(res) {
			typeof onSuccess === "function" && onSuccess(res);
		}

		return this.getLatestDictionaryVersion({ config, payload, onSuccesCB });
	};

	getLatestDictionaryVersion = (props = {}) => {
		const onSuccess = (response) => {
			this.global.store.dispatch(
				Actions.setTranslationsLastestVersion({
					paltform: props.payload.platform,
					version: response,
				}),
			);

			typeof props.onSuccessCB === "function" && props.onSuccessCB(response.data);
		};

		return this._execute(props, "", onSuccess);
	};

	getMetaTags = async (props) => {
		await this.getSeoVersion();
		const version = this.global.store.getState().generalData?.latestVersion?.seo;
		const { payload = {} } = props;
		const { path, language = "he" } = payload;
		const getUrl =
			this.getCdnUrl() + `seodata/V${version}/${path}.${language}.json`;

		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setMetaTags(res));

			typeof props.onSuccessCB === "function" && props.onSuccessCB();
		};

		const config = { method: "get", path: getUrl, executeNow: true };

		return this._execute({ config }, "", onSuccess);
	};

	getLatestSeoDataVersion = () => {
		const onSuccess = (response) => {
			this.global.store.dispatch(Actions.setSeoLastestVersion(response));
		};

		const getUrl = this.getCdnUrl() + `seodata/versions`;
		const config = { method: "get", path: getUrl, executeNow: true };

		const props = { config };

		return this._execute(props, "", onSuccess);
	};

	getSeoVersion = async () => {
		if (!this.global.store.getState().generalData?.latestVersion?.seo) {
			await this.getLatestSeoDataVersion();
		}
	};

	getServerValidateVersion = (props = {}, saveDataOnRedux = true) => {
		const onSuccess = (response) => {
			if (saveDataOnRedux) {
				this.global.store.dispatch(
					Actions.setApiData({
						...response.data.servers,
						envType: response.data.envType,
					}),
				);
			}
		};

		props.config = {
			executeNow: true,
			path: process.env.NEXT_PUBLIC_APP_HOST,
		};

		return this._execute(props, "getServerValidateVersion", onSuccess);
	};

	sendOtp = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res);
		};

		return this._execute(props, "sendOtp", onSuccess);
	};

	verifyOtp = (props = {}) => {
		const onSuccess = (res) => {
			props.onSuccessCB();
			this.setTokens(res.data);
			LocalStorageService.setItem("refreshToken", res.data.refreshToken);
		};
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		function onRejection(res) {
			props.onRejectionCB(res);
		}

		function onFailure(res) {
			typeof props.onFailure === "function" && props.onFailure(res);
		}

		return this._execute(props, "verifyOtp", onSuccess, onFailure, onRejection);
	};

	// This api call is when selecting a dlv/pickup service and getting popups
	selectSubService = (props = {}) => {
		const onSuccess = (res) => {
			const promoPopups = res.data.popups;
			if (Array.isArray(promoPopups) && promoPopups.length > 0) {
				this.global.store.dispatch(Actions.setPromoPopups(promoPopups));
				this.global.store.dispatch(
					Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.SELECT_SUB_SERVICE),
				);
			}
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		return this._execute(props, "selectSubService", onSuccess);
	};

	getCustomerDetails = (props = {}, showLoader = true) => {
		const onSuccess = (res) => {
			if (process.env.NODE_ENV !== "development") {
				const phone = this.global.store.getState().generalData.phone || "no-user";
				const user = res.data;
				const hasOrder =
					Array.isArray(user.submittedOrders) && user.submittedOrders > 0;

				let lastOrderDate = "";
				if (hasOrder) {
					const orders = user.submittedOrders;
					const lastOrder = orders[orders.length - 1];
					lastOrderDate = lastOrder.submittedAt;
				}

				if (phone) {
					LogRocket.identify(phone, {
						name: user.firstName,
						email: user.email,
						approvedTerms: user.approvedTerms,
						type: user.type,
						hasOrder: hasOrder,
						lastOrderDate: lastOrderDate,
					});
				}
			}
			typeof props.onSuccessCB === "function" && props.onSuccessCB(res);
		};
		if (showLoader) {
			if (isOnClient()) {
				this.global.store.dispatch(Actions.setLoader(true));
			}
		}
		return this._execute(props, "getCustomerDetails", onSuccess);
	};

	setCustomerDetails = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res);
		};

		return this._execute(props, "setCustomerDetails", onSuccess);
	};

	logOut = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res);
		};

		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		return this._execute(props, "logOut", onSuccess);
	};

	getStoreList = (props = {}, saveDataOnRedux = true) => {
		const { config = {} } = props;
		const { showLoader = true } = config;
		const onSuccess = (res) => {
			if (props?.payload?.onlyvisited) {
				if (saveDataOnRedux) {
					this.global.store.dispatch(Actions.setUserBranches(res.data));
				}
			} else {
				if (saveDataOnRedux) {
					this.global.store.dispatch(Actions.setBranchesData(res.data));
				}
			}
			typeof props.onSuccessCB === "function" && props.onSuccessCB();
		};

		if (showLoader) {
			if (isOnClient()) {
				this.global.store.dispatch(Actions.setLoader(true));
			}
		}
		return this._execute(props, "getStoreList", onSuccess);
	};

	getCustomerAddresses = (props = {}) => {
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setUserAddresses(res.data));
			typeof props.onSuccess === "function" && props.onSuccess();
		};

		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		return this._execute(props, "getCustomerAddresses", onSuccess);
	};

	getPointsOfIntereset = (props = {}) => {
		return this._execute(props, "getPointsOfIntereset", props.onSuccess);
	};

	deletePayment = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "deletePayment", onSuccess);
	};

	changePaymentSum = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "changePaymentSum", onSuccess);
	};

	getMenus = (props = {}) => {
		// if (isOnClient()) {
		// 	this.global.store.dispatch(Actions.setLoader(true));
		// }
		const { isInBuilder = false } = props.payload;
		const onSuccess = (res) => {
			if (!Array.isArray(res.data.menus) || res.data.menus.length === 0) {
				res.data = this.getDefaultMenu(props.payload.menuId);
			}
			if (!isInBuilder) {
				this.global.store.dispatch(Actions.setMenu(res.data.menus));
				this.global.store.dispatch(Actions.setKits(res.data.savedKits));
				this.global.store.dispatch(
					Actions.setRecommendedKits(res.data.recommendedKits),
				);
			}
			this.global.store.dispatch(
				Actions.addCatalogProducts(res.data.catalogProducts),
			);
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		const onFailure = (res) => {
			const menus = this.getDefaultMenu(props.payload.menuId);
			this.global.store.dispatch(Actions.addMenu(menus.menus));
			this.onFailure(res);
		};

		return this._execute(props, "getMenus", onSuccess, onFailure, onFailure);
	};

	selectPickupStore = (props = {}) => {
		const onSuccess = (res) => {
			const promoPopups = res.data?.popups;
			let isStopper = false;
			if (Array.isArray(res.data?.popups) && res.data?.popups.length > 0) {
				this.global.store.dispatch(Actions.setPromoPopups(promoPopups));
				isStopper = promoPopups.some((pp) => pp.flowStopper == true);
				this.global.store.dispatch(Actions.setIsFlowStopper(isStopper));

				if (isStopper) {
					this.global.store.dispatch(
						Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.MENU_STOPPER),
					);
				} else {
					this.global.store.dispatch(
						Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.MENU),
					);
				}
			}
			props.onSuccessCB(res, isStopper);
			if (isStopper) return;
			EmarsysService.setTag("delivery", SHIPPING_OPTION.PICKUP);

			this.global.store.dispatch(
				Actions.updateOrder({
					hasActiveOrder: true,

					pickup: {
						...props.payload,
						promiseTime: props.payload.timedto ? "" : props.payload?.promiseTime,
						storeName: res.data.name,
					},
				}),
			);
		};
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		return this._execute(props, "selectPickupStore", onSuccess);
	};

	getAddressDeliverability = (props = {}) => {
		const onSuccess = (res) => {
			const openingHours = [...res.data.openingHours];

			openingHours.sort(function (a, b) {
				return new Date(a.date) - new Date(b.date);
			});
			res.data.openingHours = [...openingHours];
			this.global.store.dispatch(Actions.updateAddAddressForm(res.data));
			props.onSuccessCB(res.data);
		};
		const onRejection = (res) => {
			props.onRejectionCB(res);
		};

		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		return this._execute(
			props,
			"getAddressDeliverability",
			onSuccess,
			null,
			onRejection,
		);
	};

	setDeliveryDetails = (props = {}) => {
		const onSuccess = (res) => {
			const promoPopups = res.data?.popups;
			let isStopper = false;
			if (Array.isArray(promoPopups) && promoPopups.length > 0) {
				this.global.store.dispatch(Actions.setPromoPopups(promoPopups));

				isStopper = promoPopups.some((pp) => pp.flowStopper == true);
				this.global.store.dispatch(Actions.setIsFlowStopper(isStopper));

				if (isStopper) {
					this.global.store.dispatch(
						Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.MENU_STOPPER),
					);
				} else {
					this.global.store.dispatch(
						Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.MENU),
					);
				}
			}

			typeof props.onSuccessCB === "function" && props.onSuccessCB(res, isStopper);

			if (isStopper) return;
			this.global.store.dispatch(
				Actions.updateOrder({
					hasActiveOrder: true,
					delivery: { ...props.payload, ...res.data },
				}),
			);
			EmarsysService.setTag("delivery", SHIPPING_OPTION.DELIVERY);
		};
		const onRejection = (res) => {
			typeof props.onRejectionCB === "function" && props.onRejectionCB(res);
		};
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		return this._execute(
			props,
			"setDeliveryDetails",
			onSuccess,
			null,
			onRejection,
		);
	};

	getPopupDetails = (props = {}) => {
		const onSuccess = (res) => {
			const promoPopups = res.data?.popups;
			if (Array.isArray(promoPopups) && promoPopups.length > 0) {
				this.global.store.dispatch(Actions.setPromoPopups(promoPopups));

				switch (props.payload.stage) {
					case GET_POPUP_DETAILS_STAGES.GET_CUSTOMER_DETAILS:
					default:
						this.global.store.dispatch(
							Actions.setPromoPopupState(PROMO_POPUP_STATE_ENUM.ON_ENTRY),
						);
						break;
				}
			}
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		return this._execute(props, "getPopupDetails", onSuccess);
	};

	getPriceList = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.addToMenu(res.data));
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getMenu", onSuccess);
	};

	pizzaProductSelection = (props = {}) => {
		// if (isOnClient()) {
		// 	this.global.store.dispatch(Actions.setLoader(true));
		// }
		const onSuccess = (res) => {
			if (res.data) {
				this.global.store.dispatch(Actions.setPizzaSelection(res.data.result));
				// this.global.store.dispatch(Actions.setPriceList(res.data.menus[0]));
			}
			typeof props.onSuccess === "function" && props.onSuccess(res.data.result);
		};

		return this._execute(props, "pizzaProductSelection", onSuccess);
	};

	getMenu = (props = {}) => {
		const { config = {} } = props;
		const { showLoader = false } = config;
		if (showLoader) {
			if (isOnClient()) {
				this.global.store.dispatch(Actions.setLoader(true));
			}
		}
		const isInBuilder = props.payload.isInBuilder;
		const onSuccess = (res) => {
			res.data.menus.forEach((item, index) => {
				// removing the saved kits in the builder
				if (isInBuilder && item.meta === META_ENUM.KITS_UI_MENU) {
					res.data.menus.splice(index, 1);

					const step = props.payload.step;
					this.global.store.dispatch(
						Actions.updateBuilderSavedKits({ [step]: item }),
					);
				}

				if (!item.id) {
					item.id = props.payload.menuId;
				}
			});

			if (!Array.isArray(res.data.menus) || res.data.menus.length === 0) {
				res.data = this.getDefaultMenu(props.payload.menuId);
			}

			this.global.store.dispatch(Actions.addToMenu(res.data));
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		const onFailure = (res) => {
			typeof props.onFailure === "function" && props.onFailure();
			const menus = this.getDefaultMenu(props.payload.menuId);
			this.global.store.dispatch(Actions.addMenu(menus.menus));
			this.global.store.dispatch(Actions.setLoader(false));
			this.onFailure(res);
		};

		delete props.payload.isInBuilder;
		return this._execute(props, "getMenu", onSuccess, onFailure);
	};

	getGlobalParams = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setGlobalParams(res.data));
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getGlobalParamsForFe", onSuccess);
	};

	getProductTemplate = (props = {}) => {
		const { config = {} } = props;
		const { showLoader = true } = config;
		if (showLoader) {
			if (isOnClient()) {
				// this.global.store.dispatch(Actions.setLoader(true)); remove loader
			}
		}
		const shouldOverride =
			typeof props?.shouldOverride !== "undefined" ? props?.shouldOverride : true;
		const onSuccess = (res) => {
			if (shouldOverride) {
				this.global.store.dispatch(Actions.setCurrentProductTemplate(res.data));
			}
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getProductTemplate", onSuccess);
	};

	validateAddBasketItem = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "validateAddBasketItem", onSuccess);
	};

	validateCoupon = (props = {}) => {
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.addCatalogProducts(res.data.product));
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		const onFailure = (res) => {
			typeof props.onFailure === "function" && props.onFailure(res);
		};
		const onRejection = (res) => {
			typeof props.onRejection === "function" && props.onRejection(res);
		};

		return this._execute(
			props,
			"validateCoupon",
			onSuccess,
			onFailure,
			onRejection,
		);
	};

	deleteCustomer = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "deleteCustomer", onSuccess);
	};

	addBasketItem = (props = {}) => {
		if (!props.shouldHideLoader) {
			if (isOnClient()) {
				this.global.store.dispatch(Actions.setLoader(true));
			}
		}
		const onSuccess = (res) => {
			// Filter coupons first before items
			this.global.store.dispatch(Actions.setCart(res.data));

			if (notEmptyObject(res.data)) {
				this.global.store.dispatch(Actions.addCatalogProducts(res.data.products));
			}

			this.handleRefreshMenus(res.data);

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		const onFailure = (res) => {
			typeof props.onFailure === "function" && props.onFailure(res);
		};

		return this._execute(props, "addBasketItem", onSuccess, onFailure);
	};

	deleteBasketItem = (props = {}) => {
		if (!props.shouldHideLoader) {
			if (isOnClient()) {
				this.global.store.dispatch(Actions.setLoader(true));
			}
		}
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setCart(res.data));

			if (notEmptyObject(res.data)) {
				this.global.store.dispatch(Actions.addCatalogProducts(res.data.products));
			}

			this.handleRefreshMenus(res.data);

			typeof props.onSuccess === "function" && props.onSuccess(res);
		};
		const onFailure = (res) => {
			typeof props.onFailure === "function" && props.onFailure(res);
		};

		return this._execute(props, "deleteBasketItem", onSuccess, onFailure);
	};

	changeBasketItemQuantity = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setCart(res.data));
			this.global.store.dispatch(Actions.addCatalogProducts(res.data.products));
			this.handleRefreshMenus(res.data);

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "changeBasketItemQuantity", onSuccess);
	};

	copyBasketItem = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setCart(res.data));

			if (notEmptyObject(res.data)) {
				this.global.store.dispatch(Actions.addCatalogProducts(res.data.products));
			}

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		const onFailure = (res) => {
			typeof props.onFailure === "function" && props.onFailure(res.data);
		};

		return this._execute(props, "copyBasketItem", onSuccess, onFailure);
	};

	emptyBasket = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setCart(res.data));
			this.handleRefreshMenus(res.data);

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "emptyBasket", onSuccess);
	};

	getPayments = (props = {}) => {
		// if (isOnClient()) {
		// 	this.global.store.dispatch(Actions.setLoader(true));
		// }
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setPayments(res.data));

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getPayments", onSuccess);
	};

	getPaymentStatus = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		const onFailure = (res) => {
			typeof props.onFailure === "function" && props.onFailure(res.data);
			this.onFailure(res);
		};

		return this._execute(
			props,
			"getPaymentStatus",
			onSuccess,
			onFailure,
			onFailure,
		);
	};

	getOneTimeBenefit = (props = {}) => {
		// if (isOnClient()) {
		// 	this.global.store.dispatch(Actions.setLoader(true));
		// }
		const onSuccess = (res) => {
			const phone = this.global.store.getState().generalData.phone || "no-user";
			const user = this.global.store.getState().userData;
			const { subscriptionStatus } = res.data;

			const hasOrder =
				Array.isArray(user.submittedOrders) && user.submittedOrders > 0;

			let lastOrderDate = "";
			if (hasOrder) {
				const orders = user.submittedOrders;
				const lastOrder = orders[orders.length - 1];
				lastOrderDate = lastOrder.submittedAt;
			}

			if (phone) {
				LogRocket.identify(phone, {
					name: user.firstName,
					email: user.email,
					approvedTerms: user.approvedTerms,
					type: user.type,
					hasOrder: hasOrder,
					lastOrderDate: lastOrderDate,
					subscriptionStatus: subscriptionStatus,
				});
			}

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getOneTimeBenefit", onSuccess);
	};

	setSubscriptionStatus = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess();
		};

		return this._execute(props, "setSubscriptionStatus", onSuccess);
	};

	renameSavedKit = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		return this._execute(props, "renameSavedKit", onSuccess);
	};

	getApplePaySession = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getApplePaySession", onSuccess);
	};

	submitActiveOrder = (props = {}) => {
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setPrize(res.data.retentionCoupon));

			const promoPopups = res.data.popups;
			if (Array.isArray(promoPopups) && promoPopups.length > 0) {
				this.global.store.dispatch(Actions.setPromoPopups(promoPopups));
			}
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		const onFailure = (res) => {
			this.onFailure(res);

			this.getPayments({ payload: {} });
		};
		const onRejection = (res, messageId) => {
			if (!areStringsEqual(messageId, "ProductOutOfStock")) {
				this.onFailure(res);
			}
			this.getPayments({ payload: {} });
			typeof props.onRejection && props.onRejection(res.data);
		};

		return this._execute(
			props,
			"submitActiveOrder",
			onSuccess,
			onFailure,
			onRejection,
		);
	};

	addPayment = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};
		const onFailure = (res) => {
			this.onFailure(res);
			typeof props.onFailure === "function" && props.onFailure(res.data);
		};
		const onRejection = (res) => {
			this.onFailure(res);
			typeof props.onRejection === "function" && props.onRejection();
		};

		return this._execute(props, "addPayment", onSuccess, onFailure, onRejection);
	};

	saveNewKit = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "saveNewKit", onSuccess);
	};

	getProducts = (props = {}) => {
		// if (isOnClient()) {
		// 	this.global.store.dispatch(Actions.setLoader(true));
		// }
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.addCatalogProducts(res.data.product));

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getProducts", onSuccess);
	};

	getCustomerSavedCards = (props = {}) => {
		// if (isOnClient()) {
		// 	this.global.store.dispatch(Actions.setLoader(true));
		// }
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setUserCards(res.data.creditCards));
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getCustomerSavedCards", onSuccess);
	};

	getCustomerActiveOrder = (props = {}) => {
		const onSuccess = (res) => {
			const activeOrder = res.data;

			const isPickup = activeOrder.subService === "pu";

			if (isPickup) {
				const pickup = {
					promiseTime: activeOrder.promiseTimeMinutes,
					timedto: activeOrder.timedTo,
					storeId: activeOrder.storeId,
					storeName: activeOrder.storeName,
				};
				this.global.store.dispatch(
					Actions.updateOrder({
						hasActiveOrder: true,
						isPickup,
						pickup,
						saleIdHash: activeOrder.saleIdHash,
						minSaleAmount: activeOrder.minSaleAmount,
						maxSaleAmount: activeOrder.maxSaleAmount,
					}),
				);
			} else {
				const delivery = {
					address: activeOrder.address.address,
					deliveryInstructions: activeOrder.address.deliveryInstructions,
					timedto: activeOrder.timedTo,
					promiseTime: activeOrder.promiseTimeMinutes,
				};
				this.global.store.dispatch(
					Actions.updateOrder({
						hasActiveOrder: true,
						isPickup,
						delivery,
						saleIdHash: activeOrder.saleIdHash,
						minSaleAmount: activeOrder.minSaleAmount,
						maxSaleAmount: activeOrder.maxSaleAmount,
					}),
				);
			}

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getCustomerActiveOrder", onSuccess);
	};

	cleanActiveOrder = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			// this.global.store.dispatch(Actions.setOrderTimeLeft(false));
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
			this.global.store.dispatch(Actions.resetPromoPopupState());
		};

		return this._execute(props, "cleanActiveOrder", onSuccess);
	};

	getBasket = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getBasket", onSuccess);
	};

	deleteCustomerCreditCard = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "deleteCustomerCreditCard", onSuccess);
	};

	createCustomerSavedCard = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "createCustomerSavedCard", onSuccess);
	};

	trackOrder = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		const onRejection = (res) => {
			props.onRejection(res);
		};

		const onFailure = (res) => {
			this.onFailure(res);
		};

		return this._execute(props, "trackOrder", onSuccess, onFailure, onRejection);
	};

	deleteSavedKit = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res);
		};

		return this._execute(props, "deleteSavedKit", onSuccess);
	};

	getSavedKits = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			if (res.data.kits) {
				this.global.store.dispatch(Actions.setSavedPizzas(res.data.kits));
				this.global.store.dispatch(Actions.setKits(res.data.kits));
			}
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getSavedKits", onSuccess);
	};

	getRecommendedKits = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			if (res.data.recommendedMixes) {
				this.global.store.dispatch(
					Actions.setRecommendedKits(res.data.recommendedMixes),
				);
			}
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getRecommendedKits", onSuccess);
	};

	getStoreDetails = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			this.global.store.dispatch(
				Actions.setBranchDetails({ [props.payload.id]: res.data }),
			);
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		const onFailure = (res) => {
			this.onFailure(res);
			const defaultBranch = this.getDefaultStore();
			this.global.store.dispatch(
				Actions.setBranchDetails({ [props.payload.id]: defaultBranch }),
			);
		};

		return this._execute(
			props,
			"getStoreDetails",
			onSuccess,
			onFailure,
			onFailure,
		);
	};

	deleteAddress = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			this.global.store.dispatch(
				Actions.deleteUserAddress({ id: props.payload.uniqueId }),
			);
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "deleteCustomerAddress", onSuccess);
	};

	getOrderStatus = (props = {}) => {
		const onSuccess = (res) => {
			this.global.store.dispatch(Actions.setOrderStatus(res.data.orderStatus));

			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getOrderingStatus", onSuccess);
	};

	setLang = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "setLang", onSuccess);
	};

	getCities = (props = {}, saveDataOnRedux = true) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			if (saveDataOnRedux) {
				this.global.store.dispatch(Actions.setCities(res.data.cities));
			}
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getCities", onSuccess);
	};
	getOptionalNewKits = (props = {}) => {
		if (isOnClient()) {
			this.global.store.dispatch(Actions.setLoader(true));
		}
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "getOptionalNewKits", onSuccess);
	};

	contactUs = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "contactUs", onSuccess);
	};

	setCustomerOnlyQA = (props = {}) => {
		const onSuccess = (res) => {
			typeof props.onSuccess === "function" && props.onSuccess(res.data);
		};

		return this._execute(props, "setCustomerOnlyQA", onSuccess);
	};

	ApiConnect = async (path = undefined, headers = {}) => {
		let deviceState = { isMobile: false };
		if (isOnClient()) {
			deviceState = this.global.store.getState().deviceState;
		}
		const connectPayload = {
			lang: "he",
			hardware: deviceState.isMobile ? "Phone" : "PC",
			runtime: "browser",
			appVersion: version,
			browserType: "browser",
			os: "macOS",
			deviceModel: "",
			referrer: "",
		};

		const props = {
			payload: connectPayload,
			config: { executeNow: true, path: path, headers: headers },
		};

		return this.connect(null, props);
	};

	generic = (props) => {
		return this._execute(props, "");
	};
}

const Api = new ApiService();
Object.freeze(Api);
export default Api;
