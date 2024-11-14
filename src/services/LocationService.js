import Actions from "../redux/actions";
import LocalStorageService from "./LocalStorageService";
import { GPS_STATUS } from "constants/gps-status";
import SYSTEM_GPS_STATUS from "constants/SystemGPSStatus";
import { Store } from "redux/store";
import { isOnClient } from "utils/functions";

const options = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0,
};

export const LocationService = {
	init: () => {
		LocalStorageService.getItem("showenLocationModal", "0", (val) => {
			Store.dispatch(Actions.setShowenLoactionModal(val));
		});

		LocationService.checkForUserPermission();
	},

	setGpsStatus: (val) => {
		return Store.dispatch(Actions.setGpsStatus(val));
	},

	setShowenModal: (val) => {
		LocalStorageService.setItem("showenLocationModal", val, () => {
			Store.dispatch(Actions.setShowenLoactionModal(val));
		});
	},

	checkForUserPermission: () => {
		if (isOnClient()) {
			try {
				navigator.permissions.query({ name: "geolocation" }).then((result) => {
					Store.dispatch(Actions.setSystemGPSStatus(result.state));

					if (result.state === SYSTEM_GPS_STATUS.GRANTED) {
						Store.dispatch(Actions.setGpsStatus(GPS_STATUS.ON));
					} else if (result.state === SYSTEM_GPS_STATUS.PROMPT) {
						Store.dispatch(Actions.setGpsStatus(GPS_STATUS.OFF));
					} else if (result.state === SYSTEM_GPS_STATUS.DENIED) {
						Store.dispatch(Actions.setGpsStatus(GPS_STATUS.OFF));
					}
				});
			} catch (error) {
				Store.dispatch(Actions.setSystemGPSStatus(SYSTEM_GPS_STATUS.PROMPT));

				Store.dispatch(Actions.setGpsStatus(GPS_STATUS.OFF));
			}
		}
	},
	getUserGeoLocation: (onSuccess, onFailure) => {
		if ("geolocation" in navigator) {
			// check if geolocation is supported/enabled on current browser
			navigator.geolocation.getCurrentPosition(
				function success(position) {
					// for when getting location is a success
					onSuccess(position);
				},
				function error(errorMessage) {
					// for when getting location results in an error
					// console.error('An error has occured while retrieving location', error_message);
					onFailure(errorMessage);
				},
				options,
			);
		} else {
			// geolocation is not supported
			// get your location some other way
			console.log("geolocation is not enabled on this browser");
		}
	},
};
