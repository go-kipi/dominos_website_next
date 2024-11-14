import { Store } from "redux/store";
import Actions from "../redux/actions";
import LocalStorageService from "./LocalStorageService";
import { LOCAL_STORAGE } from "constants/LocalStorage";

export const GeneralService = {
	init: () => {
		GeneralService.didOnBoarding();
		GeneralService.getPhoneNumber();
		GeneralService.getKosherPreference();
	},

	didOnBoarding: () => {
		LocalStorageService.getItem("didOnboarding", "0", (val) => {
			const didOnBoarding = val === "1";
			return Store.dispatch(Actions.setOnBoarding(didOnBoarding));
		});
	},

	setDidOnBoarding: (callback) => {
		LocalStorageService.setItem("didOnboarding", "1", () => {
			Store.dispatch(Actions.setOnBoarding(true));
			return typeof callback === "function" && callback();
		});
	},

	setKosherPreference: (val) => {
		LocalStorageService.setItem("kosher", val, () => {
			return Store.dispatch(Actions.setKosher(parseInt(val, 10)));
		});
	},
	getKosherPreference: () => {
		LocalStorageService.getItem("kosher", 0, (val) => {
			return Store.dispatch(Actions.setKosher(parseInt(val, 10)));
		});
	},
	setPhoneNumber: (val) => {
		LocalStorageService.setItem(LOCAL_STORAGE.PHONE, val, () => {
			return Store.dispatch(Actions.setPhoneNum(val));
		});
	},
	getPhoneNumber: () => {
		LocalStorageService.getItem(LOCAL_STORAGE.PHONE, "", (val) => {
			return Store.dispatch(Actions.setPhoneNum(val));
		});
	},
};
