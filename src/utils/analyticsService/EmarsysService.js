/**
 * EmarsysService - A utility module for integrating Emarsys tracking and analytics.
 *
 * This module encapsulates methods that facilitate interaction with Emarsys's tracking
 * and analytics capabilities using the ScarabQueue API. It enables seamless integration
 * of customer ID setting, language configuration, item viewing and cart management,
 * category navigation, purchase recording, custom tag handling and more..
 *
 * Usage of this module assumes that ScarabQueue is initialized and available globally
 * within the application environment.
 */

import { Store } from "redux/store";

const EmarsysService = (function () {
	const testModeEnabled = parseInt(process.env.NEXT_PUBLIC_EMARSYS_TEST_MODE);

	//-----------------------LOCAL-------------------------//
	function _setDefaultInfo() {
		const state = Store.getState();

		const uuid = state?.userData?.uuid;
		const lang = state?.generalData?.lang;

		if (uuid) {
			_setId(uuid);
		}

		if (lang) {
			_setLang(lang);
		} else {
			console.error("Language is undefined.");
		}
		go();
	}

	function _setId(uuid) {
		push("setCustomerId", uuid);
	}

	function _setLang(lang) {
		push("language", lang);
	}

	function _getProductIdByIdx(items, productIndex) {
		const productId = items[productIndex]?.productId;
		return productId;
	}

	function _checkIfNeedTestMode() {
		if (testModeEnabled) {
			setMode();
		}
	}

	function _processItemsRecursive(items, itemProcessor) {
		const processedItems = [];

		function process(items) {
			items.forEach((item) => {
				const subItems = item.subItems;
				if (Array.isArray(subItems) && subItems.length > 0) {
					process(subItems); // Recursive call for sub-items
				}
				processedItems.push(itemProcessor(item));
			});
		}

		process(items);
		return processedItems;
	}

	function _filterCouponItemsFromCart(items) {
		const validMetaValues = ["discountCoupon", "coupon", "Gift"];
		const cartProducts = Store.getState()?.cartData?.products;

		if (
			typeof cartProducts === "object" &&
			Object.keys(cartProducts).length > 0
		) {
			const filteredItems = items.filter((item) => {
				const metaValue = cartProducts[item.productId]?.meta;
				const isValidMeta = validMetaValues.includes(metaValue);

				if (isValidMeta) {
					setTag("Coupons", metaValue, item.benefitId);
				}

				return !isValidMeta;
			});

			return filteredItems;
		} else {
			return [];
		}
	}

	//-----------------------PUBLIC-------------------------//
	//------------------------------------------------//
	const setMode = () => {
		ScarabQueue.push(["testMode"]);
	};

	//------------------------------------------------//
	function setViewSimple(item) {
		const itemId = item.id;
		push("view", itemId);
		_setDefaultInfo();
	}
	//------------------------------------------------//
	function setViewSideDishComplex(item) {
		const itemId = item.productId || item.id;
		push("view", itemId);
		_setDefaultInfo();
	}

	//------------------------------------------------//
	function setViewUpgradePizza(items, isMeal = false, productIndex) {
		if (isMeal && items.length > 0) {
			const pizzaId = _getProductIdByIdx(items, productIndex);
			push("view", pizzaId);
		} else {
			const pizzaId = items?.[productIndex]?.productId;
			push("view", pizzaId);
		}
		_setDefaultInfo();
	}

	//------------------------------------------------//
	function setViewBundle(items, bundleItemId) {
		push("view", bundleItemId);
		_setDefaultInfo();
	}

	//------------------------------------------------//
	function setCart(items) {
		const filtredItems = _filterCouponItemsFromCart(items);
		const cartItems = _processItemsRecursive(filtredItems, (item) => ({
			item: item.productId,
			price: item.price,
			quantity: item.quantity,
		}));

		push("cart", cartItems);
		_setDefaultInfo();
	}

	//------------------------------------------------//
	function setEmptyCart() {
		push("cart", []);
		_setDefaultInfo();
	}

	//------------------------------------------------//
	function setCategory(categoryPath) {
		push("category", categoryPath);
		_setDefaultInfo();
	}

	//------------------------------------------------//
	function setPurchase(orderId, items) {
		const filtredItems = _filterCouponItemsFromCart(items);
		const purchaseItems = _processItemsRecursive(filtredItems, (item) => ({
			item: item.productId,
			price: item.price,
			quantity: item.quantity?.default || 1,
		}));

		const descriptor = { orderId, items: purchaseItems };
		push("purchase", descriptor);
		_setDefaultInfo();
	}

	//------------------------------------------------//
	function setTag(tagName, tagAttributes, exstaData) {
		const attributes = exstaData
			? { tagAttributes, benefitId: exstaData }
			: { tagAttributes };
		push(tagName, attributes, true);
		_setDefaultInfo();
	}

	//------------------------------------------------//
	function push(name, args, tag = false) {
		if (tag) {
			ScarabQueue.push(["tag", name, args]);
		} else {
			ScarabQueue.push([name, args]);
		}
	}

	//------------------------------------------------//
	function go() {
		_checkIfNeedTestMode();
		ScarabQueue.push(["go"]);
	}

	//------------------------------------------------//
	return {
		setViewSimple,
		setViewSideDishComplex,
		setCart,
		setCategory,
		setPurchase,
		go,
		setMode,
		setTag,
		setViewUpgradePizza,
		setViewBundle,
		setEmptyCart,
	};
})();

export default EmarsysService;
