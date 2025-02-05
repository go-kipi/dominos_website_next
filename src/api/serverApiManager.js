import axios from "axios";
import moment from "moment";
import Actions from "redux/actions";

const ServerApiManager = (function () {
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

	const apiData = {
		url: "",
		cdn: "",
		accessToken: "",
	};

	function setApiUrl(url) {
		apiData.url = url;
	}

	function setCdn(cdn) {
		apiData.cdn = cdn;
	}
	function setAccessToken(token) {
		apiData.accessToken = token;
	}

	function buildUrl(methodName, overrideUrl, useCdn = false) {
		// Determine the base URL: use overrideUrl if provided, otherwise use either CDN or the default API URL
		const baseUrl = overrideUrl || (useCdn ? apiData.cdn : apiData.url);

		// Return the full URL
		return `${baseUrl}${methodName}`;
	}

	function generateRequest(payload, settings, methodName, method) {
		// Construct URL based on methodName and settings
		let url = buildUrl(methodName, settings?.url, settings?.useCdn);
		const addAccessToken = !!apiData.accessToken;
		const headers = { isSeo: "true", ...settings?.headers }; // Merge any extra headers
		if (addAccessToken) {
			headers["token"] = apiData.accessToken;
		}

		const config = {
			url,
			method: method.toUpperCase(),
			headers,
		};

		// Append query parameters for GET, or set body for POST
		if (method.toUpperCase() === "GET") {
			config.params = payload; // Axios will automatically serialize params for GET
		} else {
			config.data = payload; // Axios automatically handles JSON.stringify
		}

		return config;
	}

	async function execute({ payload, settings }, methodName, method = "post") {
		const config = generateRequest(payload, settings, methodName, method);
		const timeStamp = moment().toString();
		dispatch(Actions.addApiCall({ methodName, timeStamp }));

		console.log("url", config.url);

		try {
			const response = await axios(config);
			if (response?.status === 200) {
				dispatch(
					Actions.addApiResponse({ methodName, timeStamp, data: response.data }),
				);
			}
			return response;
		} catch (error) {
			console.error("Error in execute:", error);
			return error;
		}
	}

	return { execute, setApiUrl, setCdn, setAccessToken, setGlobalStore };
})();

export default ServerApiManager;
