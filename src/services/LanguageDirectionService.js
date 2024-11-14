import LocalStorageService from "./LocalStorageService";
import Actions from "../redux/actions";
import { LANGUAGES } from "constants/Languages";

import Api from "api/requests";
import OrderStatusService from "./OrderStatusService";
import { NO_ORDER_STATUS } from "constants/OrderStatus";
import { isOnClient } from "utils/functions";
import { Store } from "redux/store";

let defaultLang = LANGUAGES.HEBREW.name;
let navigator;
if (isOnClient()) {
	// Client-side-only code
	navigator = window.navigator;
}

const LanguageDirectionService = (function () {
	let localStorageLang = LANGUAGES.HEBREW.name;
	const checkForLanguageInLocalStorage = () => {
		LocalStorageService.getItem("lang", defaultLang, (lang) => {
			localStorageLang = lang || localStorageLang;
			updateRtl(localStorageLang);
		});
	};
	const deviceLanguage =
		navigator?.languages && navigator?.languages?.length
			? navigator?.languages[0]
			: navigator?.language;
	const init = () => {
		checkForLanguageInLocalStorage();
	};
	const updateRtl = (lang) => {
		Store.dispatch(Actions.setLanguage(lang || localStorageLang));
		LocalStorageService.setItem("lang", lang || localStorageLang);
	};
	const changeLanguage = (lang) => {
		const language = Store.getState().generalData.lang ?? localStorageLang;
		const mainMenu = Store.getState().globalParams.DefaultMenus.result.main;

		if (lang !== language) {
			const payload = { lang: lang };
			Api.setLang({ payload, onSuccess });

			function onSuccess() {
				OrderStatusService.getStatus(NO_ORDER_STATUS, null, getMenus);

				function getMenus() {
					Api.getMenus({ payload: { menuId: mainMenu } });
				}
			}

			updateRtl(lang);
			Store.dispatch(Actions.changeLanguage(lang));
		}
	};
	const isRtlLanguage = (language) => {
		return language !== LANGUAGES.ENGLISH.name;
	};
	const isRTL = () => {
		const lang = Store.getState().generalData?.lang;
		return isRtlLanguage(lang);
	};
	return {
		init,
		isRTL,
		updateRtl,
		changeLanguage,
		localStorageLang,
		deviceLanguage,
		isRtlLanguage,
	};
})();

export default LanguageDirectionService;
