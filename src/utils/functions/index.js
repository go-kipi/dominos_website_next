import jwtDecode from "jwt-decode";

import builderTypes from "constants/builder-types";
import doughMatrixEnum from "constants/doughMatrixEnum";

import RegularEnd from "/public/assets/gifs/regular/end.png";
import SquareEnd from "/public/assets/gifs/square/end.png";
import VolcanoEnd from "/public/assets/gifs/volcano/end.png";

import PizzaTreeService from "services/PizzaTreeService";
import { META_ENUM } from "constants/menu-meta-tags";
import { QUARTERS } from "constants/quarters-enum";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import { LANGUAGES } from "constants/Languages";
import { Store } from "redux/store";
import { MEDIA_ENUM } from "constants/media-enum";

export function getFullMediaUrl(item, displayType, useCase, mime = "png") {
	const lang = Store.getState().generalData.lang ?? "he";
	if (
		typeof item === "object" &&
		notEmptyObject(item) &&
		item.assetVersion !== undefined &&
		typeof displayType === "string" &&
		displayType.length > 0 &&
		typeof useCase === "string" &&
		useCase.length > 0
	) {
		const mediaPath = Store.getState().apiData.cdn;
		const url = `${mediaPath}${lang}/${displayType}/${item.id}/V${item.assetVersion}/${useCase}.${mime}`;
		return url;
	}
	return "";
}

export function getSimpleMediaUrl(suffix) {
	const mediaPath = Store.getState().apiData.cdn;
	const { lang } = Store.getState().generalData;
	const url = `${mediaPath}${lang}/${suffix}`;
	return url;
}

export function getDoughImage(item) {
	if (item) {
		const { lang } = Store.getState().generalData;
		const mediaPath = Store.getState().apiData.cdn;
		const url = `${mediaPath}${lang}/Dough/${item}/V0/dough.svg`;

		return url;
	}
	return "";
}

// check for empty objects
export function notEmptyObject(obj) {
	let empty = true;
	if (obj) {
		if (Object.keys(obj).length === 0) {
			empty = false;
		}
	}
	return empty;
}

// Convert Object to sorted array by order_num
export function convertToSortedArray(obj) {
	let sortedArr = Object.keys(obj).map((key) => obj[key]);
	sortedArr = sortedArr.sort((a, b) => {
		return a.order_num - b.order_num;
	});
	return sortedArr;
}

// query browser for user location

// calculate distance in Km between 2 gps sets
export function calcDistance(p1, p2) {
	var R = 6371; // Radius of the earth in km
	var dLat = toRad(p1.lat - p2.lat); // Javascript functions in radians
	var dLon = toRad(p1.lng - p2.lng);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(p2.lat)) *
			Math.cos(toRad(p1.lat)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function toRad(num) {
	return (num * Math.PI) / 180;
}

// generate unique IDs
export function generateUniqueId(length) {
	const result = [];
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
	}
	return result.join("");
}

export function getCurrencySign(currency) {
	switch (currency) {
		case "dollar":
			return "$";
		case "euro":
			return "€";
		default:
			return "₪";
	}
}

export function parseJTW(jwt) {
	return jwtDecode(jwt);
}

export function isJTWExpired(exp) {
	return new Date().getTime() > exp * 1000;
}

export function getJWTDiff(exp) {
	const epoch = new Date().getTime();
	const diff = exp * 1000 - epoch;
	return diff - 1000; // 1 second before actual expiry.
}

export function getStringTime(value) {
	return value < 10 ? `0${value}` : value.toString();
}

export function shallowEqual(objA, objB) {
	if (Object.is(objA, objB)) {
		return true;
	}

	if (
		typeof objA !== "object" ||
		objA === null ||
		typeof objB !== "object" ||
		objB === null
	) {
		return false;
	}

	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
		return false;
	}

	for (let i = 0; i < keysA.length; i++) {
		if (
			!Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
			!Object.is(objA[keysA[i]], objB[keysA[i]])
		) {
			return false;
		}
	}

	return true;
}

export function deepEqual(obj1, obj2) {
	return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function removeDuplicates(arr) {
	const a = arr?.concat();
	if (a) {
		for (let i = 0; i < a.length; ++i) {
			for (let j = i + 1; j < a.length; ++j) {
				if (a[i] === a[j]) a.splice(j--, 1);
			}
		}

		return a;
	}
}

function toDeg(num) {
	return num * (180 / Math.PI);
}

export function getMiddlePointFromCoords(lat1, lng1, lat2, lng2) {
	// -- Longitude difference
	const dLng = toRad(lng2 - lng1);

	// -- Convert to radians
	lat1 = toRad(lat1);
	lat2 = toRad(lat2);
	lng1 = toRad(lng1);

	const bX = Math.cos(lat2) * Math.cos(dLng);
	const bY = Math.cos(lat2) * Math.sin(dLng);
	const lat3 = Math.atan2(
		Math.sin(lat1) + Math.sin(lat2),
		Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY),
	);
	const lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

	// -- Return result
	return [toDeg(lng3), toDeg(lat3)];
}

export function getLatLngBounds(lat1, lng1, lat2, lng2) {
	// Convert latitude and longitude values to radians
	const phi1 = (lat1 * Math.PI) / 180;
	const phi2 = (lat2 * Math.PI) / 180;
	const lambda1 = (lng1 * Math.PI) / 180;
	const lambda2 = (lng2 * Math.PI) / 180;

	// Calculate minimum and maximum latitudes and longitudes
	const minLat = Math.min(phi1, phi2);
	const maxLat = Math.max(phi1, phi2);
	const minLng = Math.min(lambda1, lambda2);
	const maxLng = Math.max(lambda1, lambda2);

	// Convert bounds back to degrees
	const north = (maxLat * 180) / Math.PI;
	const south = (minLat * 180) / Math.PI;
	const east = (maxLng * 180) / Math.PI;
	const west = (minLng * 180) / Math.PI;

	// Return an object with the latitude and longitude bounds
	return {
		north,
		south,
		east,
		west,
	};
}

export const relativeSize = (size, base = false) => {
	if (base) {
		return (size / base) * window.innerWidth;
	}
	const deviceState = Store.getState().deviceState;
	if (deviceState.isMobile) {
		return (size / 375) * window.innerWidth;
	}
	if (deviceState.isTablet) {
		return (size / 768) * window.innerWidth;
	}
	return (size / 1280) * window.innerWidth;
};

export function getOS() {
	if (isOnClient()) {
		const userAgent = window.navigator.userAgent;

		if (/android/i.test(userAgent)) {
			return "Android";
		} else if (/linux/i.test(userAgent)) {
			return "Linux";
		} else if (/iphone|ipad|ipod/i.test(userAgent)) {
			return "iOS";
		} else if (/macintosh/i.test(userAgent)) {
			return "Macintosh";
		} else if (/windows/i.test(userAgent)) {
			return "Windows";
		} else {
			return "Unknown"; // Return "Unknown" if the OS is not recognized
		}
	}
	return "";
}

export function getMobileOperatingSystem() {
	if (isOnClient()) {
		let userAgent = navigator.userAgent || navigator.vendor || window.opera;
		// Windows Phone must come first because its UA also contains "Android"
		if (/android/i.test(userAgent) || /windows phone/i.test(userAgent)) {
			return "Android";
		}

		// iOS detection from: http://stackoverflow.com/a/9039885/177710
		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			return "iOS";
		}
	}
	return undefined;
}

export const parser = {
	fetchValueFromJson: (json, key) =>
		json && json?.hasOwnProperty(key) ? json[key] : undefined,
};

export const conditionalClass = (className) => {
	return className ? `${className}` : "";
};

/*
  fill date with slashes '/'
*/
export const fillDate = (lastVal, currVal) => {
	let newDate = currVal;
	const DAY_LIMIT = 4;
	const MONTH_LIMIT = 2;
	const isDay = (index) => index <= 1;
	const isMonth = (index) => index >= 3 && index <= 4;

	const isFirstFieldChar = (callback, i, val, limit) =>
		callback(i) && val.length === 1 && val >= limit;

	const checkIfNumber = (val) => {
		let newDate = "";
		for (let i = 0; i < val.length; i++) {
			if (isFirstFieldChar(isDay, i, val, DAY_LIMIT)) {
				newDate = "0" + newDate;
			}

			let month = val.split("/")[1];
			if (isFirstFieldChar(isMonth, i, month, MONTH_LIMIT)) {
				newDate += "0";
			}

			if (!isNaN(val[i])) {
				newDate += val[i];
			}
			if (
				i === 1 ||
				i === 4 ||
				isFirstFieldChar(isDay, i, val, DAY_LIMIT) ||
				isFirstFieldChar(isMonth, i, month, MONTH_LIMIT)
			) {
				if (newDate.length > 1) newDate += "/";
			}
		}
		return newDate;
	};
	// Add char
	if (lastVal?.length <= currVal?.length) {
		newDate = checkIfNumber(currVal);
		return newDate;
	}
	return currVal;
};

export function checkIfTokenExpired(exp, delta) {
	return getCurrentTs() + delta > exp - 30;
}

export function getCurrentTs() {
	return Math.floor(Date.now() / 1000);
}

export function parseCartItem(item) {
	const newItem = CartItemEntity.getObjectLiteralItem(
		item.productId,
		item.quantity,
		[],
		item.quarters,
		item.triggerProductId,
		item.uuid,
		item?.benefitId,
	);
	const newSubItems =
		Array.isArray(item.subItems) && item.subItems.length > 0
			? item.subItems?.map((sub) => parseCartItem(sub))
			: [];
	newItem["subitems"] = newSubItems;
	return newItem;
}

export function getCartItemLevels(cartItem) {
	if (cartItem.getSubItems().length === 0) {
		return 1;
	}
	return 1 + getCartItemLevels(cartItem.getSubItem(0));
}

export function isPizzaItem(cartItem) {
	const productId = cartItem.productId;
	const pizza = PizzaTreeService.getPizza(productId);
	return typeof pizza !== "undefined";
}

/**
 *
 * @param {Array} steps
 * @param {number} currentStep
 * @return {number}
 * returns the maximum number of possible pizzas to duplicate
 */
export function getMaxAllowedDuplicate(steps, currentStep) {
	const canDuplicate = steps.some((step) => step?.allowCopyToNextSteps === true);
	if (!canDuplicate) return 1;
	const stepsFromCurrent = steps
		.map((s, idx) => {
			if (idx >= currentStep) {
				return s;
			}
		})
		.filter((step) => step?.meta === "pizzaMeta");
	return stepsFromCurrent.length;
}

export function getOnlyPizzaItemsFromCart(cartItems) {
	const translations = Store.getState().translations;
	let pizzas = [];
	cartItems.forEach((cartItem) => {
		if (isPizzaItem(cartItem)) {
			pizzas.push({
				title: `${translations["savePizzaModal_tab_pizza_item"]} ${
					pizzas.length + 1
				}`,
				...cartItem,
			});
		} else if (Array.isArray(cartItem.subItems) && cartItem.subItems.length > 0) {
			cartItem.subItems.forEach((subItem) => {
				if (isPizzaItem(subItem)) {
					pizzas.push({
						title: `${translations["savePizzaModal_tab_pizza_item"]} ${
							pizzas.length + 1
						}`,
						...subItem,
					});
				}
			});
		}
	});
	return pizzas;
}

export function isSaleItem(productId) {
	return (
		Store.getState().menusData.catalogProducts?.[productId]?.meta ===
		META_ENUM.DEALS
	);
}

export default function addTitleToPizza(cartItems) {
	const translations = Store.getState().translations;
	let pizzas = [];
	cartItems.forEach((cartItem) => {
		pizzas.push({
			title: `${translations["savePizzaModal_tab_pizza_item"]} ${
				pizzas.length + 1
			}`,
			...cartItem,
		});
	});
	return pizzas;
}

export function parseCoverage(coverage) {
	let parsedCoverage = null;
	if (coverage && typeof coverage === "object" && coverage.length > 0) {
		parsedCoverage = {};
		coverage.forEach((quarter) => {
			switch (quarter.toUpperCase()) {
				case QUARTERS.Q1:
					parsedCoverage[QUARTERS.Q1.toLowerCase()] = true;
					break;
				case QUARTERS.Q2:
					parsedCoverage[QUARTERS.Q2.toLowerCase()] = true;
					break;
				case QUARTERS.Q3:
					parsedCoverage[QUARTERS.Q3.toLowerCase()] = true;
					break;
				case QUARTERS.Q4:
					parsedCoverage[QUARTERS.Q4.toLowerCase()] = true;
					break;
				default:
					break;
			}
			return parsedCoverage;
		});
	}
	return parsedCoverage;
}

export function parseCoverageToQuarters(coverage) {
	return Object.keys(coverage).filter((k) => Number(coverage[k]) > 0);
}

/**
 *
 * @param {Object} topping
 * @param {Object} otherTopping
 * @return {boolean}
 * compares two toppings and returns a boolean
 */
function isSameTopping(topping, otherTopping) {
	if (
		!topping ||
		typeof topping !== "object" ||
		!otherTopping ||
		typeof otherTopping !== "object"
	)
		return false;
	if (topping.productId !== otherTopping.productId) return false;
	if (topping.quantity !== otherTopping.quantity) return false;
	if (topping.quarters.length !== otherTopping.quarters.length) return false;
	if (topping.quarters.length == otherTopping.quarters.length) {
		return topping.quarters.join("") === otherTopping.quarters.join("");
	}
	return true;
}

/**
 *
 * @param {Object} pizza
 * @param {Object} otherPizza
 * @return {boolean}
 * compares two pizzas and returns a boolean
 */
function isSamePizza(pizza, otherPizza) {
	if (
		!pizza ||
		typeof pizza !== "object" ||
		!otherPizza ||
		typeof otherPizza !== "object"
	)
		return false;
	if (pizza.productId !== otherPizza.productId) return false;
	if (!Array.isArray(pizza.subItems) || !Array.isArray(otherPizza.subItems))
		return false;
	if (pizza.subItems.length !== otherPizza.subItems.length) return false;
	if (pizza.subItems.length === otherPizza.subItems.length) {
		let isSame = true;
		for (let i = 0; i < pizza.subItems.length; i++) {
			if (!isSameTopping(pizza.subItems[i], otherPizza.subItems[i]))
				isSame = false;
		}
		return isSame;
	}
	return true;
}

function isDifferentPizzaFromSavedKits(pizza) {
	const savedKits = Object.values(Store.getState().menusData.savedKits ?? []);
	if (savedKits.length === 0 && typeof pizza === "object") return true;
	let isDifferent = true;
	savedKits.forEach((sk) => {
		if (isSamePizza(pizza, sk)) {
			isDifferent = false;
		}
	});
	return isDifferent;
}

/**
 *
 * @param {Object[]} pizzas
 * @returns {Object[]} the filtered pizzas that are different from the saved kits
 */
export function filterPizzasFromSavedKits(pizzas) {
	if (pizzas.length === 0) return pizzas;
	return pizzas.filter((pizza) => isDifferentPizzaFromSavedKits(pizza));
}

export function getInitialScreen(pizzaId) {
	let filteredPizzas = PizzaTreeService.getPossiblePizzasById(pizzaId);
	if (Array.isArray(filteredPizzas)) {
		const examplePizza = filteredPizzas[0];
		if (examplePizza) {
			for (const pizza of filteredPizzas) {
				if (pizza[doughMatrixEnum.SIZE] !== examplePizza[doughMatrixEnum.SIZE]) {
					return builderTypes.SIZE;
				}
			}
			if (
				PizzaTreeService.hasVeganOption(examplePizza[doughMatrixEnum.ID]) ||
				filteredPizzas.length === 1
			) {
				return builderTypes.TOPPINGS;
			}
		}
	}
	return builderTypes.DOUGH;
}

export function getPizzaImageByMeta(meta) {
	switch (meta) {
		case META_ENUM.SQUARE_PIZZA:
			return SquareEnd;

		case META_ENUM.VOLCANO_PIZZA:
			return VolcanoEnd;

		case META_ENUM.ROUND_PIZZA:
		case META_ENUM.EXTRA_PIZZA:
		case META_ENUM.PERSONAL_PIZZA:
		default:
			return RegularEnd;
	}
}

export function getPizzaToppingTypeByMeta(meta) {
	switch (meta) {
		case META_ENUM.SQUARE_PIZZA:
			return MEDIA_ENUM.TOPPINGS_SQUARE;

		case META_ENUM.VOLCANO_PIZZA:
		case META_ENUM.ROUND_PIZZA:
		case META_ENUM.EXTRA_PIZZA:
		case META_ENUM.PERSONAL_PIZZA:
		default:
			return MEDIA_ENUM.TOPPINGS_ROUND;
	}
}

export function getPizzaImage(type, size = "family") {
	const IMAGES = {
		family: {
			classic: RegularEnd,
			glutenFree: SquareEnd,
		},
		volcano: VolcanoEnd,
		extra: RegularEnd,
		personal: RegularEnd,
	};
	let pizzaImage = IMAGES[size];

	if (typeof pizzaImage === "object" && !pizzaImage.hasOwnProperty("src")) {
		return Object.keys(pizzaImage).includes(type)
			? pizzaImage[type]
			: IMAGES.family.classic;
	}
	return pizzaImage;
}

// export function isSafariBrowser() {
// 	const browser = navigator.userAgent.match(
// 		/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
// 	)[1];
// 	return browser.toLocaleLowerCase() === "safari";
// }

export function isSafariBrowser() {
	const userAgent = typeof navigator !== "undefined" && navigator.userAgent;
	if (userAgent) {
		const match = userAgent.match(
			/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
		);
		const browser = match ? match[1] : "";
		return browser.toLowerCase() === "safari";
	}
	return false;
}

async function getActions() {
	return await import("../../redux/actions").then((res) => {
		return res.default;
	});
}

export async function optimisticCart(productId, quantity, isRemove = false) {
	const Actions = await getActions();
	Store.dispatch(
		Actions.updateProduct({ productId: productId, quantity: quantity }),
	);
	if (isRemove) Store.dispatch(Actions.updateCartItemCount(quantity));
}

export function handleNavigation(latitude, longitude) {
	window.open(`http://maps.apple.com/?q=${latitude},${longitude}`, "_blank");
}

export function skipToContent(targetId) {
	const targetElement = document.getElementById(targetId);
	if (targetElement) {
		targetElement.tabIndex = -1;
		targetElement.focus();
	}
}

export function stopVideo(videoId) {
	const video = document.getElementById(videoId);
	video.pause();
}

export function resumeVideo(videoId) {
	const video = document.getElementById(videoId);
	video.play();
}

export function getCouponHasWraning(coupon) {
	const hasWraning =
		Array.isArray(coupon.warning?.values) && coupon.warning?.values.length > 0;

	return hasWraning;
}

export function defaultHYDRATE(state, action, key) {
	if (action.payload[key]) {
		if (Array.isArray(action.payload[key])) {
			return action.payload[key];
		} else {
			return {
				...state,
				...action.payload[key],
			};
		}
	}
	return state;
}

export function isOnClient() {
	return typeof window !== "undefined";
}

export function isObjectEqual(newObj, original, exclude = [], on = []) {
	const res = {};
	if (on.length > 0) {
		for (const key of on) {
			if (
				original[key] === newObj[key] ||
				(!newObj[key] && original[key] === "0")
			) {
				continue;
			}
			res[key] = original[key];
		}
		return Object.keys(res).length === 0;
	}

	for (const key of exclude) {
		res[key] = original[key];
	}
	for (const key in original) {
		if (!exclude.includes(key) && original[key] === newObj[key]) {
			continue;
		}
		res[key] = original[key];
	}
	const keys = Object.keys(res);
	for (const key of keys) {
		if (typeof res[key] === "undefined") {
			delete res[key];
		}
	}
	return Object.keys(res).length === Object.keys(original).length;
}

export function getRecaptchaToken() {
	return new Promise((resolve, reject) => {
		if (window.grecaptcha) {
			try {
				window.grecaptcha.ready(function () {
					// temp
					console.log("process.env.NEXT_PUBLIC_APP_CAPTCHA_KEY",process.env.NEXT_PUBLIC_APP_CAPTCHA_KEY)
					window.grecaptcha
						.execute(process.env.NEXT_PUBLIC_APP_CAPTCHA_KEY, { action: "submit" })
						.then((token) => {
							resolve(token);
						})
						.catch((err) => {
							resolve(false);
						});
				});
			} catch (e) {
				resolve(false);
			}
		} else {
			resolve(false);
		}
	});
}

export const VibrateDevice = (vibrationDuration) => {
	typeof window.navigator?.vibrate === "function" &&
		window.navigator.vibrate(vibrationDuration);
};

export function getQuartersText(quarters) {
	const numberOfItems = quarters.length;

	switch (numberOfItems) {
		case 1:
		case 3:
			return `${numberOfItems}/4`;
		case 2:
			const hasQ1 = quarters.includes("q1");
			const hasQ2 = quarters.includes("q2");
			const hasQ3 = quarters.includes("q3");
			const hasQ4 = quarters.includes("q4");

			if ((hasQ1 && hasQ3) || (hasQ2 && hasQ4)) {
				return "2/4";
			}

			return "1/2";
		default:
			return "1";
	}
}

export function isDomainAllowedToPostMessage(domain) {
	const allowedAsString =
		process.env.NEXT_PUBLIC_ALLOWED_DOMAINS_TO_POST_MESSAGE;
	const allowedDomainsArray = JSON.parse(allowedAsString);
	for (const key in allowedDomainsArray) {
		const alloweDomain = allowedDomainsArray[key];

		if (domain.includes(alloweDomain)) {
			return true;
		}
	}
	return false;
}
export function areStringsEqual(string1, string2) {
	if (typeof string1 !== "string" || typeof string2 !== "string") {
		console.warn("one of the strings is not of type string");
		return false;
	}

	return string1.toLowerCase() === string2.toLowerCase();
}

export function getAllToppingsFromSubitems(subitems) {
	const catalogProducts = Store.getState().menusData.catalogProducts;
	let toppingsStr = "NA";
	if (Array.isArray(subitems) && subitems.length > 0) {
		toppingsStr = "";
		subitems.forEach((item, index) => {
			const top = catalogProducts[item.productId];
			if (top) {
				toppingsStr += top.name;
				if (index !== subitems.length - 1) {
					toppingsStr += ", ";
				}
			}
		});
	}
	return toppingsStr;
}

export function getLanguageFromLocale(locale) {
	for (const key in LANGUAGES) {
		const lang = LANGUAGES[key];
		if (lang.nextName === locale) {
			return lang.name;
		}
	}
	return locale;
}

export function getBTHNLang(lang) {
	for (const key in LANGUAGES) {
		const language = LANGUAGES[key];
		if (language.name === lang) {
			return language.bthn;
		}
	}
	return lang;
}
