import Actions from "redux/actions";
import { getLanguageFromLocale } from "utils/functions";

import localTranslations from "translations.json";
import ServerRequests from "api/server-requests";
import ServerApiManager from "api/serverApiManager";

const ApiISR = (() => {
	async function init(store = undefined) {
		if (store) {
			ServerRequests.setGlobalStore(store);
			ServerApiManager.setGlobalStore(store);
			store.dispatch(Actions.startRedux(true));
		}

		await ServerRequests.getServerValidateVersion();
		await ServerRequests.connect();
	}

	async function sharedRequests(locale = "he") {
		const language = getLanguageFromLocale(locale);
		ServerRequests.dispatch(Actions.setLanguage(language));

		await getTranslations(language);

		await ServerRequests.getLinks(language);

		await ServerRequests.getGlobalParams();
		await ServerRequests.setLang(language);
	}

	async function getTranslations(language) {
		if (process.env.NODE_ENV === "development") {
			ServerRequests.dispatch(Actions.setTranslations(localTranslations));
		}

		await ServerRequests.getTranslations(language, "fe");
		await ServerRequests.getTranslations(language, "be");
		await ServerRequests.getTrackerTranslations();
	}

	async function getGeneralMetaTags(locale, url) {
		const language = getLanguageFromLocale(locale);
		await ServerRequests.getMetaTags(language, url);
	}

	return {
		init,
		sharedRequests,
		getGeneralMetaTags,
	};
})();

export default ApiISR;
