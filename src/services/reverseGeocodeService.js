import axios from "axios";
import { Store } from "redux/store";
import { LANGUAGES } from "constants/Languages";

const MAPA_URL = `https://gismap.map.co.il/dm/{method}_{lang}.php?psw=ABCD0123456789&lat={lat}&lon={lng}`;
// const MAPA_URL = `https://gismap.map.co.il/dm/{method}_he.php?psw=ABCD0123456789&lat={lat}&lon={lng}`;

const ReverseGeocodeService = (() => {
	const sendGetNearestAddress = (lat, lng) => {
		const method = "revgeocode";
		const currentLang = Store.getState().generalData.lang;
		const lang =
			currentLang === LANGUAGES.ENGLISH.name
				? LANGUAGES.ENGLISH.mapName
				: currentLang;
		const path = MAPA_URL.replace("{method}", method)
			.replace("{lang}", lang)
			.replace("{lat}", lat)
			.replace("{lng}", lng);
		// const path = MAPA_URL.replace('{method}', method).replace('{lat}', lat).replace('{lng}', lng);
		return axios.get(path);
	};

	const sendGetNearestAddressesList = (lat, lng) => {
		const method = "nearestpoints";
		const currentLang = Store.getState().generalData.lang;
		const lang =
			currentLang === LANGUAGES.ENGLISH.name
				? LANGUAGES.ENGLISH.mapName
				: currentLang;
		const path = MAPA_URL.replace("{method}", method)
			.replace("{lang}", lang)
			.replace("{lat}", lat)
			.replace("{lng}", lng);
		// const path = MAPA_URL.replace('{method}', method).replace('{lat}', lat).replace('{lng}', lng);
		return axios.get(path);
	};

	/**
	 *
	 * @param {Number} lat
	 * @param {Number} lng
	 * @returns {Promise}
	 */
	const getNearestAddress = (lat, lng) => {
		return sendGetNearestAddress(lat, lng);
	};

	/**
	 *
	 * @param {Number} lat
	 * @param {Number} lng
	 * @returns {Promise}
	 */
	const getNearestAddressesList = (lat, lng) => {
		return sendGetNearestAddressesList(lat, lng);
	};

	return {
		getNearestAddress,
		getNearestAddressesList,
	};
})();

export default ReverseGeocodeService;
