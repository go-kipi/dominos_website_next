import axios from "axios";
import { LANGUAGES } from "constants/Languages";
import { Store } from "redux/store";

const MAPA_URL =
	"https://gismap.map.co.il/dm/addrsearch_{lang}.php?psw=ABCD0123456789&in={q}";
const AutoCompleteService = (() => {
	const sendAutoCompleteRequest = (query) => {
		const lang = Store.getState().generalData.lang;
		const languageSelected = Object.values(LANGUAGES).find(
			(langua) => langua.name === lang,
		);
		const path = MAPA_URL.replace("{lang}", languageSelected.mapName).replace(
			"{q}",
			query,
		);
		return axios.get(path);
	};
	/**
	 *
	 * @param {String} query
	 * @returns {Promise}
	 */
	const getAutocompleteResults = (query) => {
		return sendAutoCompleteRequest(query);
	};

	return {
		getAutocompleteResults,
	};
})();

export default AutoCompleteService;
