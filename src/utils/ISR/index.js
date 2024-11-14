import Api from "api/requests";

import Actions from "redux/actions";
import { areStringsEqual, getLanguageFromLocale } from "utils/functions";
import getConfig from "next/config";
import localTranslations from "translations.json";

const headers = { isSeo: "true" };

const ISR = (() => {
	let globalStore;

	function setGlobalStore(store) {
		globalStore = store;
		Api.setGlobalStore(store);
	}

	const ApiServer = async (saveDataOnRedux) => {
		const { publicRuntimeConfig } = getConfig();
		const appVersion = publicRuntimeConfig?.version;
		const uuid = process.env["NEXT_PUBLIC_APP_UUID"] ?? "";
		const envType = process.env["NEXT_PUBLIC_ENV_TYPE"] ?? "";
		const serverValidatePayload = {
			payload: {
				deviceType: "web",
				appVersion: appVersion,
			},
		};

		if (envType !== "prod") {
			serverValidatePayload["payload"] = {
				...serverValidatePayload["payload"],
				UUID: uuid,
				envType,
			};
		}

		const resData = await retryApiCall(() =>
			Api.getServerValidateVersion(serverValidatePayload, saveDataOnRedux),
		);

		const res = resData.data;

		const apiURL = res.data.servers?.api;
		const cdnUrl = res.data.servers?.cdn;

		await retryApiCall(() => Api.ApiConnect(apiURL, headers));

		return { apiURL, cdnUrl };
	};

	const sharedRequests = async (locale = "he") => {
		await ApiServer(true);

		const language = getLanguageFromLocale(locale);

		if (globalStore) {
			globalStore.dispatch(Actions.setLanguage(language));
		}

		getTranslations(language);

		await getLinks(language);
		await retryApiCall(() =>
			Api.getGlobalParams({
				payload: {},
				config: { executeNow: true, headers: headers },
			}),
		);

		await retryApiCall(() =>
			Api.setLang({
				payload: { lang: language },
				config: { executeNow: true, headers: headers },
			}),
		);
	};

	const getTranslations = async (language) => {
		if (process.env.NODE_ENV === "development" && globalStore) {
			globalStore.dispatch(Actions.setTranslations(localTranslations));
		}

		await retryApiCall(() => Api.getFETranslations(language));

		await retryApiCall(() => Api.getBETranslations(language));

		await retryApiCall(() => Api.getTrackerTranslationsAction());
	};

	const BranchesCities = async (saveDataOnRedux = true, locale = "he") => {
		const { apiURL } = await ApiServer(false);

		const language = getLanguageFromLocale(locale);

		await retryApiCall(() =>
			Api.setLang({
				payload: { lang: language },
				config: { executeNow: true, path: apiURL, headers: headers },
			}),
		);

		let branches = undefined;
		let cities = undefined;
		const citiesRes = await retryApiCall(() =>
			Api.getCities(
				{
					config: { executeNow: true, path: apiURL, headers: headers },
				},
				saveDataOnRedux,
			),
		);

		cities = citiesRes.data.data.cities;

		const branchesRes = await retryApiCall(() =>
			Api.getStoreList(
				{
					config: { executeNow: true, path: apiURL, headers: headers },
				},
				saveDataOnRedux,
			),
		);
		branches = branchesRes.data.data;

		if (cities && branches) {
			return { cities, branches };
		}
		return { cities: false, branches: false };
	};

	const GetStoreDetails = (id) => {
		const payload = { id };

		return retryApiCall(() =>
			Api.getStoreDetails({
				payload,
				config: { executeNow: true, headers: headers },
			}),
		);
	};

	const loadBranchData = async (url, cityUrl, locale = "he") => {
		const { branches, cities } = await BranchesCities(true, locale);

		let branchFound = undefined;

		if (branches) {
			for (const b of branches) {
				if (url && cityUrl) {
					if (b.url === url && b.cityUrl === cityUrl) {
						branchFound = b;
					}
				} else if (!url && cityUrl) {
					if (b.url === cityUrl && !b.cityUrl) {
						branchFound = b;
					}
				} else if (url && !cityUrl) {
					if (b.url === url && !b.cityUrl) {
						branchFound = b;
					}
				}
			}
		}

		const cityFound =
			cities && cities?.find((cityData) => cityData.url === cityUrl);

		if (branchFound) {
			await GetStoreDetails(branchFound.id);

			await getStoreMetaTag(
				locale,
				branchFound.id,
				branchFound.url,
				branchFound.cityUrl,
			);
		} else if (cityFound) {
			await getCityMetaTag(locale, cityFound.id, cityFound.url);
		}
		return { branchFound, cityFound };
	};

	const getStoreMetaTag = async (locale, branchid) => {
		const language = getLanguageFromLocale(locale);

		const path = `store/${branchid}`;

		if (branchid) {
			const props = { payload: { path, language } };

			return await retryApiCall(() => Api.getMetaTags(props));
		}
	};

	const getCityMetaTag = async (locale, cityId) => {
		const language = getLanguageFromLocale(locale);

		const path = `city/${cityId}`;

		if (cityId) {
			const props = { payload: { path, language } };
			return await retryApiCall(() => Api.getMetaTags(props));
		}
	};

	const getGeneralMetaTags = async (locale, url) => {
		const language = getLanguageFromLocale(locale);

		let path = `static${url}`;

		const props = { payload: { path, language } };

		return await retryApiCall(() => Api.getMetaTags(props));
	};

	const getContentPage = async (locale, contentId, route) => {
		const language = getLanguageFromLocale(locale);

		return await retryApiCall(() =>
			Api.getContentPage(language, contentId, route),
		);
	};

	const getLinks = async (
		language = "he",
		shouldSaveOnRedux = true,
		cdnUrl = "",
	) => {
		return await retryApiCall(() =>
			Api.getLinks(language, shouldSaveOnRedux, cdnUrl),
		);
	};

	async function retryApiCall(
		apiCall,
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

		const attemptCall = async () => {
			try {
				const res = await apiCall();
				const status = res.status ?? res.response?.status ?? 500;
				const isSuccessfulStatus =
					(status >= 200 && status < 300) || status === 404;
				const isSuccessData =
					res.data && res.data.hasOwnProperty("status")
						? areStringsEqual(res.data.status, "success")
						: true;

				if (isSuccessfulStatus && isSuccessData) {
					return res;
				}

				console.log(`Request failed with status: ${status}`);
				return null;
			} catch (error) {
				console.error("API call error:", error);
				return null;
			}
		};

		let response = null;
		let attempts = 0;

		while (attempts < maxAttempts) {
			response = await attemptCall();

			if (response !== null) {
				return response;
			}

			attempts++;

			if (attempts < maxAttempts) {
				console.log(`Retry attempt ${attempts} of ${maxAttempts}`);
				await delay(retryDelay);
			}
		}

		throw new Error(`The API call failed after ${maxAttempts} attempts.`);
	}

	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	return {
		ApiServer,
		BranchesCities,
		GetStoreDetails,
		loadBranchData,
		sharedRequests,
		getGeneralMetaTags,
		getContentPage,
		getLinks,
		setGlobalStore,
	};
})();

export default ISR;
