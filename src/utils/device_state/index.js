import Actions from "redux/actions";
import { Store } from "redux/store";

export default class deviceState {
	constructor() {
		this.debounce_delay = 250; // debounce delay in milliseconds
		this.start();
	}

	getScreenBasedOnMediaQuery = () => {
		const mobile = window.matchMedia("(max-width:767px)").matches;
		const tablet = window.matchMedia(
			"(min-width:768px) and (max-width:1199px)",
		).matches;
		const desktop = window.matchMedia(
			"(min-width:1200px) and (max-width:1499px)",
		).matches;
		const desktopLarge = window.matchMedia(
			"(min-width:1500px) and (max-width:1919px)",
		).matches;
		const desktopMax = window.matchMedia("(min-width:1920px").matches;

		return {
			device: "",
			isMobile: mobile,
			isTablet: tablet,
			isLaptop: desktop,
			isDesktopLarge: desktopLarge,
			isDesktopMax: desktopMax,
			isDesktop: desktop || desktopLarge || desktopMax,
			notDesktop: !desktop && !desktopLarge && !desktopMax,
			notMobile: !mobile,
		};
	};

	getDevice = () => {
		// determine current device

		return this.getScreenBasedOnMediaQuery();
		// if (deviceState.isMobile) {
		//   deviceState.device = "mobile";
		//   return deviceState;
		// } else if (deviceState.isTablet) {
		//   deviceState.device = "tablet";
		//   return deviceState;
		// } else if (deviceState.isLaptop) {
		//   deviceState.device = "desktop";
		//   return deviceState;
		// } else if (deviceState.isDesktopLarge) {
		//   deviceState.device = "desktop_large";
		//   return deviceState;
		// } else if (deviceState.isDesktopMax) {
		//   deviceState.device = "desktop_max";
		//   return deviceState;
		// }
	};

	updateDevice = () => {
		const payload = this.getDevice();
		if (Store) {
			Store.dispatch(Actions.setDeviceState(payload));
		}
	};

	start = () => {
		// Listen for screen resize with a debounce
		const response = this.debounce(this.updateDevice, this.debounce_delay, false);

		window.addEventListener("resize", response);

		response();
	};

	// Debounce the device state function so that it is called only once every 250ms
	debounce(func, wait, immediate) {
		let timeout;
		return function () {
			const context = this;
			const args = arguments;
			const later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
}
