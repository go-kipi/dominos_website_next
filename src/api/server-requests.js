import getConfig from "next/config";
import ServerApiManager from "./serverApiManager";
import Actions from "redux/actions";
import { areStringsEqual } from "utils/functions";
import moment from "moment";
const { publicRuntimeConfig } = getConfig();
const version = publicRuntimeConfig?.version;

const ServerRequests = (function () {
	const globalData = {
		store: null,
	};

	function setGlobalStore(store) {
		globalData.store = store;
	}

	function dispatch(action) {
		if (globalData.store && action) {
			globalData.store.dispatch(action);
		}
	}

	function getData(response) {
		const status = response.status ?? response.response?.status ?? 500;

		if (status >= 200 && status < 300) {
			const data = response.data;
			if (
				data.hasOwnProperty("status") &&
				areStringsEqual(data.status, "success")
			) {
				return data.data;
			}
			return data;
		}

		const logData = { status: status, url: response.config.url };
		dispatch(Actions.addLog(logData));
		throw new Error("ISR Failed");
	}

	async function getServerValidateVersion() {
		const uuid = process.env["NEXT_PUBLIC_APP_UUID"] ?? "";
		const envType = process.env["NEXT_PUBLIC_ENV_TYPE"] ?? "";
		const serverValidatePayload = {
			payload: {
				deviceType: "web",
				appVersion: version,
			},
			settings: {
				url: process.env["NEXT_PUBLIC_APP_HOST"],
			},
		};

		if (envType !== "prod") {
			serverValidatePayload["payload"] = {
				...serverValidatePayload["payload"],
				UUID: uuid,
				envType,
			};
		}

		const apiCall = () =>
			ServerApiManager.execute(serverValidatePayload, "getServerValidateVersion");

		const res = await retryApiCall(
			apiCall,
			"getServerValidateVersion",
			serverValidatePayload,
		);

		const data = getData(res);

		ServerApiManager.setApiUrl(data.servers.api);
		ServerApiManager.setCdn(data.servers.cdn);

		dispatch(Actions.setApiData({ ...data.servers, envType: data.envType }));

		return data;
	}

	async function connect() {
		const connectPayload = {
			payload: {
				lang: "he",
				hardware: "PC",
				runtime: "browser",
				appVersion: version,
				browserType: "browser",
				os: "macOS",
				deviceModel: "",
				referrer: "",
			},
		};
		const apiCall = () => ServerApiManager.execute(connectPayload, "connect");
		const res = await retryApiCall(apiCall, "connect", connectPayload);
		const data = getData(res);
		ServerApiManager.setAccessToken(data.accessToken);
		return data;
	}

	async function getGlobalParams() {
		const props = { payload: {} };
		const apiCall = () => ServerApiManager.execute(props, "getGlobalParamsForFe");
		const res = await retryApiCall(apiCall, "getGlobalParamsForFe", props);
		const data = getData(res);
		dispatch(Actions.setGlobalParams(data));
		return data;
	}

	async function setLang(lang) {
		const props = { payload: { lang } };
		const apiCall = () => ServerApiManager.execute(props, "setLang");
		const res = await retryApiCall(apiCall, "setLang", props);
		const data = getData(res);
		return data;
	}

	async function getTranslations(lang = "he", platform = "fe") {
		const version = await getLatestDictionaryVersionByPlatform(platform);
		const method = `dictionary/dictionary.${lang}.${platform}.v${version}.json`;
		const translationsProps = { payload: {}, settings: { useCdn: true } };
		const apiCall = () =>
			ServerApiManager.execute(translationsProps, method, "get");
		const res = await retryApiCall(apiCall, method, translationsProps);
		const data = getData(res);
		dispatch(Actions.setTranslations(data));
		return data;
	}

	async function getTrackerTranslations() {
		const version = await getLatestDictionaryVersionByPlatform("fe");
		const method = `dictionary/trackerStatusMessages.v${version}.json`;
		const translationsProps = { payload: {}, settings: { useCdn: true } };
		const apiCall = () =>
			ServerApiManager.execute(translationsProps, method, "get");
		const res = await retryApiCall(apiCall, method, translationsProps);
		const data = getData(res);
		dispatch(Actions.setTranslations(data));
		return data;
	}

	async function getLatestDictionaryVersionByPlatform(platform = "fe") {
		const method = `dictionary/${platform}.ver`;
		const translationsProps = { payload: {}, settings: { useCdn: true } };
		const res = await ServerApiManager.execute(translationsProps, method, "get");
		const data = getData(res);
		return data;
	}

	async function getLatestSeoDataVersion() {
		const method = "seodata/versions";
		const props = { payload: {}, settings: { useCdn: true } };
		const res = await ServerApiManager.execute(props, method, "get");
		const data = getData(res);
		return data;
	}

	async function getMetaTags(language = "he", path = "") {
		const version = await getLatestSeoDataVersion();
		const method = `seodata/V${version}/static/${path}.${language}.json`;
		const props = { payload: {}, settings: { useCdn: true } };
		const apiCall = () => ServerApiManager.execute(props, method, "get");
		const res = await retryApiCall(apiCall, method, props);
		const data = getData(res);
		dispatch(Actions.setMetaTags(data));
		return data;
	}

	async function getLinks(lang = "he") {
		const version = await getLatestLinksVersion();
		const method = `url/urls.${lang}.v${version}.json`;
		const props = { payload: {}, settings: { useCdn: true } };
		const apiCall = () => ServerApiManager.execute(props, method, "get");
		const res = await retryApiCall(apiCall, method, props);
		const data = getData(res);
		dispatch(Actions.setLinks(data));
		return data;
	}

	async function getLatestLinksVersion() {
		const method = "url/url.ver";
		const props = { payload: {}, settings: { useCdn: true } };
		const res = await ServerApiManager.execute(props, method, "get");
		const data = getData(res);
		return data;
	}

	async function retryApiCall(
		apiCall,
		apiName,
		payload,
		CustomeMaxRetries = 3,
		CustomeRetryDelay = 1000,
	) {
		if (typeof apiCall !== "function") {
			throw new TypeError("The provided argument must be a function.");
		}

		const maxAttempts =
			parseInt(process.env["NEXT_PUBLIC_ISR_MAX_RETRIES"]) || CustomeMaxRetries;
		const retryDelay =
			parseInt(process.env["NEXT_PUBLIC_ISR_RETRY_DELAY"]) || CustomeRetryDelay;

		let failureResponse;
		const attemptCall = async (attempts) => {
			const res = await apiCall();
			const status = res?.status ?? res?.response?.status ?? 500;
			const isSuccessfulStatus = (status >= 200 && status < 300) || status === 404;
			const isReject = isSuccessfulStatus && res.data.status === "rejected";
			const isSuccessData =
				res.data && res.data.hasOwnProperty("status")
					? areStringsEqual(res.data.status, "success")
					: true;

			if (isSuccessfulStatus && isSuccessData) {
				return res;
			}

			console.log(`Request failed with status: ${status}`);

			if (attempts === maxAttempts) {
				if (isReject) {
					failureResponse = {
						...res.headers,
						status: res.data.status,
						message: res.data.message,
					};
				}

				if (!isSuccessfulStatus) {
					failureResponse = { ...res.response.headers, status: res.response.status };
				}
			}

			return null;
		};

		let response = null;
		let attempts = 1;

		while (attempts <= maxAttempts) {
			response = await attemptCall(attempts);

			if (response !== null) {
				return response;
			}

			attempts++;

			if (attempts <= maxAttempts) {
				console.log(`Retry attempt ${attempts} of ${maxAttempts}`);
				await delay(retryDelay);
			}
		}

		logApiFailure(apiName, payload, failureResponse);

		throw new Error(`The API call failed after ${maxAttempts} attempts.`);
	}

	function logApiFailure(apiName, payload, response) {
		const timestamp = moment().toString();
		const logData = {
			apiName,
			timestamp,
			payload,
			response,
		};

		dispatch(Actions.addApiFailureLog(logData));
	}

	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	return {
		getServerValidateVersion,
		setGlobalStore,
		connect,
		getTranslations,
		getTrackerTranslations,
		getGlobalParams,
		setLang,
		getMetaTags,
		dispatch,
		getLinks,
	};
})();

export default ServerRequests;
