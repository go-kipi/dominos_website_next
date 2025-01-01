import axios from "axios/index";
import Actions from "redux/actions";
import * as popups from "popups/popup-types.js";
import QueueManager from "./queue_manager";
import { STATUS } from "constants/response-status-types";
import {
	areStringsEqual,
	checkIfTokenExpired,
	getCurrentTs,
	getOS,
	isOnClient,
	parseJTW,
} from "utils/functions";
import LocalStorageService from "services/LocalStorageService";
import getConfig from "next/config";
import { getRecaptchaToken } from "utils/functions";
import { LANGUAGES } from "constants/Languages";
import { GeneralService } from "services/GeneralService";
import { publish } from "services/events";
import { EVENTS } from "constants/events";
import { HTTP_STATUS } from "constants/httpStatus";

const DEFAULT_REQUEST_HEADERS = {
	"Content-Type": "application/json",
};

const { publicRuntimeConfig } = getConfig();
const version = publicRuntimeConfig?.version;
const recaptchaMethods = [
	"verifyOtp",
	"validateCoupon",
	"setCustomerDetails",
	"contactUs",
	"addPayment",
	"submitActiveOrder",
	"sendOtp",
];

class ApiManager {
	/* ------ private variables ------- */
	#api = false;
	#methodListSkipRefershToken = [];

	requestingArrayUUID;
	unFulfilledErrorCodes = [];

	tokens;
	global;

	constructor() {
		this.#api = {
			https: true,
			baseUrl: process.env.NEXT_PUBLIC_APP_HOST,
			requestNum: 0,
		};

		this.tokens = {
			accessToken: undefined,
			refreshToken: undefined,
			delta: 0,
		};

		this.unFulfilledErrorCodes = [401];

		this.requestingArrayUUID = [];

		this.#methodListSkipRefershToken = [
			"connect",
			"refreshToken",
			"getServerValidateVersion",
			"",
		];
		this.global = {
			store: null,
		};
	}

	/* ------ private methods ------- */
	setStore(store) {
		this.global.store = store;
	}

	#buildBaseUrl = () => {
		return this.global.store?.getState()?.apiData?.api
			? this.global.store.getState().apiData?.api
			: this.#api.baseUrl;
	};

	#incrementRequestNum = () => {
		this.#api.requestNum += 1;
	};

	#callNextInQueue = async (statusCode, uuid, shouldTryAgain = false) => {
		if (uuid) {
			this.requestingArrayUUID.pop();

			if (statusCode && this.unFulfilledErrorCodes.includes(statusCode)) {
				setTimeout(() => {
					this.#tryToCall();
				}, 10000);
			} else {
				if (!shouldTryAgain) {
					QueueManager.removeRequestFromQueue(uuid);
				}
				this.#tryToCall();
			}
		}
	};

	#call = async (
		{
			settings,
			onSuccess,
			onFailure,
			onRejection,
			callback,
			shouldUseDefault500 = true,
		},
		uuid = undefined,
		callName,
	) => {
		if (settings.method !== "get" && Object.isExtensible(settings.data)) {
			settings.data.requestNum = this.#api.requestNum;
		}

		const { methodName } = QueueManager.getNextRequest();

		const apiCallName = uuid ? methodName : callName;

		if (!this.#methodListSkipRefershToken.includes(apiCallName)) {
			settings.headers.token = this.tokens.accessToken;
		}

		if (isOnClient() && !navigator.onLine) {
			publish(EVENTS.HTTP_REQUEST, HTTP_STATUS.END);
			this.global.store.dispatch(Actions.setLoader(false));
			this.#callNextInQueue(200, uuid);
		}

		if (recaptchaMethods.includes(apiCallName)) {
			let recaptcha_token = await getRecaptchaToken();
			if (!settings.data) {
				settings.data = {};
			}
			settings.data.Grecaptcha = recaptcha_token
				? recaptcha_token
				: "recaptcha failed to load";
		}

		const res = axios(settings)
			.then((response) => {
				if (isOnClient()) {
					publish(EVENTS.HTTP_REQUEST, HTTP_STATUS.END);
					this.global.store.dispatch(Actions.setLoader(false));
				}
				if (response.status === 200) {
					if (settings.method === "get" && !response.data?.status) {
						onSuccess ? onSuccess(response.data) : this.#onSuccess();

						typeof callback === "function" && callback(response);
						this.#callNextInQueue(response.status, uuid);

						return response;
					} else if (response.data?.status === STATUS.SUCCESS) {
						this.#incrementRequestNum();
						onSuccess ? onSuccess(response.data) : this.#onSuccess();
						typeof callback === "function" && callback(response);
						this.#callNextInQueue(response.status, uuid);

						return response;
					} else if (response.data.status === STATUS.REJECTED) {
						publish(EVENTS.HTTP_REQUEST, HTTP_STATUS.REJECT);
						if (areStringsEqual(response.data.message.id, "temporarysubmiterror")) {
							return this.handleTemporarySubmitError(uuid, response.data.message.id);
						} else if (
							areStringsEqual(response.data.message.id, "ActiveOrderDoesNotExist")
						) {
							onRejection ? onRejection(response.data) : this.onFailure(response.data);
							return this.handleActiveOrderDoesNotExist(uuid);
						} else if (
							areStringsEqual(response.data.message.id, "ProductOutOfStock")
						) {
							return this.handleProductOutOfStock(
								uuid,
								response.data?.message?.values?.productIds,
							);
						}

						onRejection
							? onRejection(response.data, response.data.message.id)
							: this.onFailure(response.data);

						this.#callNextInQueue(response.status, uuid);

						typeof callback === "function" && callback(response);

						return response;
					}
				} else {
					typeof callback === "function" && callback(response);

					onFailure ? onFailure(response.data) : this.onFailure(response.data);

					this.#callNextInQueue(response.status, uuid);
					return response;
				}
			})
			.catch((error) => {
				if (isOnClient()) {
					publish(EVENTS.HTTP_REQUEST, HTTP_STATUS.FAILED);
					this.global.store.dispatch(Actions.setLoader(false));
				}

				if (error?.response?.status >= 500 && shouldUseDefault500) {
					if (parseInt(process.env["NEXT_PUBLIC_API_MODAL_ENABLED"])) {
						const generalFailurePayload = {
							methodName: settings?.url,
							error: JSON.stringify(error),
						};
						this.onFailureServer(generalFailurePayload);
					} else {
						switch (methodName) {
							case "submitActiveOrder":
								return this.hande500Submit(uuid);

							case "trackOrder":
								return this.handle500TrackOrder(uuid);

							default:
								return this.handle500(uuid);
						}
					}
				}

				if (parseInt(process.env["NEXT_PUBLIC_API_MODAL_ENABLED"])) {
					const generalFailurePayload = {
						methodName,
						error: JSON.stringify(error),
						type: "SERVER",
					};
					this.onFailureServer(generalFailurePayload);
				} else {
					onFailure
						? onFailure(error?.response?.data ?? error.message)
						: this.onFailure(error?.response?.data ?? error.message);
				}

				typeof callback === "function" && callback(error);

				this.#callNextInQueue(error?.response?.status, uuid);
				return error;
			});

		return res;
	};

	async #tryToCall() {
		if (this.requestingArrayUUID.length === 0) {
			const { requestData, uuid } = QueueManager.getNextRequest();
			if (requestData) {
				this.requestingArrayUUID.push(1);
				const { methodName } = QueueManager.getNextRequest();

				await this.#refreshTokenIfNeeded(methodName);

				this.#call(requestData, uuid);
			}
		}
	}

	#generateRequest = (
		request,
		params = {},
		method = "post",
		timeout = false,
	) => {
		const requestUrl = request;
		let data = {};
		const settings = {};

		// build form data
		if (!(Object.entries(params).length === 0 && params.constructor === Object)) {
			data = params;
		}

		settings.method = method;
		settings.url = requestUrl;
		settings.timeout = timeout || 1000 * 60 * 2;
		// settings.withCredentials = true;
		settings.headers = { ...DEFAULT_REQUEST_HEADERS };

		method === "post" ? (settings.data = data) : (settings.params = params);

		return settings;
	};

	refreshToken = async (
		callBack,
		token = undefined,
		executeNow = false,
		shouldSendUrl = false,
	) => {
		const lang = this.global.store.getState().generalData.lang ?? "he";
		const deviceState = this.global.store.getState().deviceState;
		const browser = navigator.userAgent.match(
			/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
		)[1];
		const referrerUrl = document.referrer;
		const referrerName = referrerUrl.match(/\/\/(?:www\.)?(.*?)\./)?.[1];
		const onSuccess = (res) => {
			this.setTokens(res.data);

			if (isOnClient()) {
				LocalStorageService.setItem("refreshToken", res.data.refreshToken);
			}

			typeof callBack === "function" && callBack(res.data);
		};
		const onRejection = (error) => {
			if (error.message.id === "NeedToReconnect") {
				if (isOnClient()) {
					LocalStorageService.clearAllKeys();
					GeneralService.init();
				}
			}

			console.log("eorrr", error);

			this.connect(callBack, undefined, false, shouldSendUrl);
		};
		const onFailure = () => {
			this.connect(callBack, undefined, false, shouldSendUrl);
		};

		const payload = {
			refreshToken: token,
			lang: lang,
			hardware: deviceState.isMobile ? "Phone" : "PC",
			runtime: "browser",
			appVersion: version,
			browserType: browser,
			os: getOS(),
			deviceModel: "",
			referrer: referrerName ?? "",
		};

		if (shouldSendUrl) {
			payload.url = window.location.href;
		}

		const props = { payload, config: { executeNow } };

		return this._execute(
			props,
			"refreshToken",
			onSuccess,
			onFailure,
			onRejection,
		);
	};

	connect = async (
		callBack,
		optionalProps,
		executeNow = false,
		shouldSendUrl = false,
	) => {
		const onSuccess = (res) => {
			this.setTokens(res.data);

			if (isOnClient()) {
				LocalStorageService.setItem("refreshToken", res.data.refreshToken);
			}

			typeof callBack === "function" && callBack(res.data);
		};
		let props = {};
		if (optionalProps) {
			props = optionalProps;
		} else {
			const lang = this.global.store.getState().generalData.lang ?? "he";
			const deviceState = this.global.store.getState().deviceState;
			const browser = navigator.userAgent.match(
				/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
			)[1];
			const referrerUrl = document.referrer;
			const referrerName = referrerUrl.match(/\/\/(?:www\.)?(.*?)\./)?.[1];
			const payload = {
				lang: lang,
				hardware: deviceState.isMobile ? "Phone" : "PC",
				runtime: "browser",
				appVersion: version,
				browserType: browser,
				os: getOS(),
				deviceModel: "",
				referrer: referrerName ?? "",
			};
			if (shouldSendUrl) {
				payload.url = window.location.href;
			}

			props = { payload, config: { executeNow } };
		}
		return this._execute(props, "connect", onSuccess);
	};

	#refreshTokenIfNeeded = (methodName) => {
		if (!this.#methodListSkipRefershToken.includes(methodName)) {
			const accessToken = this.tokens?.accessToken;
			const jwt = parseJTW(accessToken);
			const isExpired = checkIfTokenExpired(jwt.exp, this.tokens.delta);

			if (isExpired) {
				const refreshToken = isOnClient()
					? LocalStorageService.getItem("refreshToken")
					: this.tokens?.refreshToken;

				const refreshTokenJWT = parseJTW(refreshToken);
				const isExpiredRefresh = checkIfTokenExpired(
					refreshTokenJWT.exp,
					this.tokens.delta,
				);

				if (!isExpiredRefresh) {
					return this.refreshToken(null, refreshToken, true);
				} else {
					return this.connect();
				}
			}
		}
	};

	#onSuccess = () => {};

	onFailure = (response) => {
		let text = "";
		if (typeof response === "string") {
			text = response;
		} else {
			const translations = this.global.store.getState().translations;

			const id = response?.message?.id;
			text = translations[id] || id || "תקלת שרת, אנא נסה שנית מאוחר יותר";

			const payload = { text };
			this.openErrorPopup(payload);
		}
	};

	handle500 = (uuid = undefined) => {
		const translations = this.global.store.getState().translations;

		const onClick = (tryAgain = false) => {
			this.#callNextInQueue(500, uuid, tryAgain);
		};

		const cancel = () => {
			this.#callNextInQueue(500, uuid);
		};

		const payload = {
			title: translations.errorPopup_title,
			text: translations.errorPopup_generalMessage,
			button1Text: translations.errorPopup_tryAgain,
			button2Text: translations.errorPopup_abort,
			button1OnClick: () => onClick(true),
			button2OnClick: () => onClick(false),
			animateOutCallback: cancel,
		};
		this.openErrorPopup(payload);
	};

	hande500Submit = (uuid) => {
		const translations = this.global.store.getState().translations;

		const tryAgain = () => {
			this.#callNextInQueue(500, uuid, true);
		};

		const cleanOrder = () => {
			this.#callNextInQueue(500, uuid, false);

			const onSuccess = () => {
				this.#routeToHomePage();
			};

			this._execute(
				{
					payload: {
						ignoreIfNotActive: true,
					},
				},
				"cleanActiveOrder",
				onSuccess,
			);
		};

		const payload = {
			text: translations.errorPopup_submitActiveOrder_fail,
			button1Text: translations.errorPopup_tryAgain,
			button2Text: translations.errorPopup_submitActiveOrder_cleanOrder,
			button1OnClick: tryAgain,
			button2OnClick: cleanOrder,
			enableClickOutside: false,
			showCloseIcon: false,
		};
		this.openErrorPopup(payload);
	};

	handle500TrackOrder = (uuid) => {
		const translations = this.global.store.getState().translations;

		const tryAgain = () => {
			this.#callNextInQueue(500, uuid, true);
		};

		const cancel = () => {
			this.#callNextInQueue(500, uuid);
		};

		const backHome = () => {
			this.#routeToHomePage();
		};

		const payload = {
			text: translations.errorPopup_trackOrder_fail,
			button1Text: translations.errorPopup_tryAgain,
			button2Text: translations.errorPopup_backHome,
			button1OnClick: tryAgain,
			button2OnClick: backHome,
			animateOutCallback: cancel,
		};
		this.openErrorPopup(payload);
	};

	handleActiveOrderDoesNotExist = () => {
		const translations = this.global.store.getState().translations;
		const payload = {
			text: translations.errorPopup_noActiveOrder,
			button1OnClick: () => this.#routeToHomePage(),
			enableClickOutside: false,
			showCloseIcon: false,
		};
		this.openErrorPopup(payload);
	};
	handleProductOutOfStock = (uuid, productIds = []) => {
		const products =
			this.global.store.getState()?.menusData?.catalogProducts ?? {};
		const translations = this.global.store.getState().translations;

		const okButton = () => {
			this.#callNextInQueue(200, uuid, false);
		};
		let text = translations.productOutOfStock_reject;

		for (const index in productIds) {
			const productId = productIds[index];
			const product = products[productId];

			let title = "";

			if (product) {
				title = product?.nameUseCases?.Title;
			}

			if (title) {
				text += `\n ${title}`;
			}
		}

		const payload = {
			text: text,
			button1OnClick: okButton,
			enableClickOutside: false,
			showCloseIcon: false,
		};
		this.openErrorPopup(payload);
	};

	handleTemporarySubmitError = (uuid, errorId) => {
		const translations = this.global.store.getState().translations;

		const tryAgain = () => {
			this.#callNextInQueue(500, uuid, true);
		};

		const cleanOrder = () => {
			this.#callNextInQueue(500, uuid, false);

			const onSuccess = () => {
				this.#routeToHomePage();
			};

			this._execute(
				{
					payload: {
						ignoreIfNotActive: true,
					},
				},
				"cleanActiveOrder",
				onSuccess,
			);
		};

		const payload = {
			text: translations[errorId],
			button1Text: translations.errorPopup_tryAgain,
			button2Text: translations.errorPopup_submitActiveOrder_cleanOrder,
			button1OnClick: tryAgain,
			button2OnClick: cleanOrder,
			enableClickOutside: false,
			showCloseIcon: false,
		};
		this.openErrorPopup(payload);
	};

	openErrorPopup = (payload) => {
		publish(EVENTS.HTTP_REQUEST, HTTP_STATUS.END);

		this.global.store.dispatch(Actions.setLoader(false));

		this.global.store.dispatch(
			Actions.addPopup({
				type: popups.API_ERROR,
				payload,
			}),
		);
	};

	getLocaleFromLang = (currentLang) => {
		for (const key in LANGUAGES) {
			const lang = LANGUAGES[key];
			if (lang.name === currentLang) {
				return lang.nextName;
			}
		}
		return currentLang;
	};

	#routeToHomePage = () => {
		const currentLang = this.global.store.getState()?.generalData?.lang;

		const locale = this.getLocaleFromLang(currentLang);

		window.location.href = "/" + locale;
	};

	/* ------ protected methods ------- */

	_execute = async (
		props,
		methodName,
		onSuccess = false,
		onFailure = false,
		onRejection = false,
	) => {
		if (isOnClient()) {
			publish(EVENTS.HTTP_REQUEST, HTTP_STATUS.START);
			this.global.store.dispatch(Actions.requestStarted());
		}
		let request, method;

		method = "post";
		request = this.#buildBaseUrl() + methodName;

		const overridePath = props?.config?.path !== undefined;
		const overrideMethod = props?.config?.method !== undefined;
		if (overrideMethod) {
			method = props.config.method;
		}
		if (overridePath) {
			request = props.config.path + methodName;
		}
		const shouldExecuteNow = props?.config?.executeNow === true;
		const shouldUseDefault500 = props?.config?.shouldUseDefault500 ?? true;

		//add recaptcha token to relevant requests

		const settings = this.#generateRequest(request, props.payload, method);

		settings.headers = {
			...settings.headers,
			...props?.config?.headers,
		};

		const requestData = {
			settings,
			onSuccess,
			onFailure,
			onRejection,
			callback: props.callback,
			shouldUseDefault500: shouldUseDefault500,
		};
		if (!shouldExecuteNow) {
			QueueManager.addRequestToQueue(requestData, methodName);
			this.#tryToCall();
		} else {
			return this.#call(requestData, null, methodName);
		}
	};

	setTokens = (data) => {
		this.tokens.refreshToken = data.refreshToken;
		this.tokens.accessToken = data.accessToken;

		const jwt = parseJTW(data.accessToken);
		const iatServer = jwt.iat;
		const currentTime = getCurrentTs();
		this.tokens.delta = iatServer - currentTime;
		if (isOnClient()) {
			// no need to save tokens on redux on isr
			this.global.store.dispatch(Actions.setTokens(data));
		}
	};
}
export default ApiManager;
