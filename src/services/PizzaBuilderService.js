import * as popupTypes from "constants/popup-types";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import Actions from "redux/actions";
import { Store } from "redux/store";
import { getPizzaImage, parseCoverageToQuarters } from "utils/functions";
import { META_ENUM } from "../constants/menu-meta-tags";

const PizzaBuilderService = (() => {
	const translate = (key = "") => {
		const translations = Store.getState().translations;
		return translations[key] || key;
	};
	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {number} stepIndexToCopy The step to start duplicating from.
	 * @param {number} amount The amount of duplications.
	 * @return {object} A new payload that contains the duplicated items.
	 */
	const duplicateItem = (saleObject, stepIndexToCopy, amount) => {
		const newPayload = { ...saleObject };
		const originalItem = newPayload.subitems[stepIndexToCopy];
		for (let i = 1; i < amount; i++) {
			newPayload.subitems[stepIndexToCopy + i] = originalItem;
		}
		return newPayload;
	};
	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {number} stepIndex The step to add a topping to.
	 * @param {object} topping The topping object that will be added.
	 * @return {object} A new payload that contains the changes.
	 */
	const addTopping = (
		saleObject,
		stepIndex,
		topping,
		isSale = true,
		shouldClearAllToppings = false,
	) => {
		const { promoProductId = "", id, coverage } = topping;
		const step = stepIndex ?? 0;
		const saleObj = saleObject ? saleObject : Store.getState().cartItem;
		let newPayload = { ...saleObj };
		const quarters = parseCoverageToQuarters(coverage);
		const newTopping = {
			productId: id,
			quantity: quarters.length / 4,
			quarters,
			triggerProductId: promoProductId,
		};
		const toppings = isSale
			? newPayload.subitems[step].subitems ?? []
			: newPayload.subitems ?? [];
		let newToppings = [...toppings, newTopping];
		if (shouldClearAllToppings) {
			newToppings = [newTopping];
		}
		let newSubItems;
		if (isSale) {
			newSubItems = [...newPayload.subitems];
			newSubItems[step] = { ...newSubItems[step], subitems: newToppings };
		}
		newPayload = {
			...newPayload,
			subitems: isSale ? newSubItems : newToppings,
		};
		return newPayload;
	};

	const addDip = (
		saleObject,
		stepIndex,
		dip,
		isSale = true,
		shouldClearAllToppings = false,
	) => {
		const { promoProductId = "", id } = dip;
		const step = stepIndex ?? 0;
		const saleObj = saleObject ? saleObject : Store.getState().cartItem;
		let newPayload = { ...saleObj };
		let quarters = null;

		const newDip = {
			productId: id,
			quantity: 1,
			quarters,
			triggerProductId: promoProductId,
		};

		const toppings = isSale
			? newPayload.subitems[step].subitems ?? []
			: newPayload.subitems ?? [];

		let newToppings = [...toppings, newDip];

		if (shouldClearAllToppings) {
			newToppings = [newDip];
		}

		let newSubItems;
		if (isSale) {
			newSubItems = [...newPayload.subitems];
			newSubItems[step] = { ...newSubItems[step], subitems: newToppings };
		}
		newPayload = {
			...newPayload,
			subitems: isSale ? newSubItems : newToppings,
		};
		return newPayload;
	};

	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {number} stepIndex The step to add a topping to.
	 * @param {object} topping The topping object that will be added.
	 * @return {object} A new payload that contains the changes.
	 */

	const updateTopping = (saleObject, stepIndex, topping, isSale = true) => {
		const { promoProductId = "", id, coverage } = topping;
		const step = stepIndex ?? 0;
		const saleObj = saleObject ? saleObject : Store.getState().cartItem;
		let newPayload = { ...saleObj };
		const quarters = parseCoverageToQuarters(coverage);
		const newTopping = {
			productId: id,
			quantity: quarters.length / 4,
			quarters,
			triggerProductId: promoProductId,
		};
		const toppings = isSale
			? newPayload.subitems[step].subitems ?? []
			: newPayload.subitems ?? [];

		const currentToppingIndex = toppings.findIndex((t) => t.productId === id);

		let newToppings = [...toppings];
		newToppings.splice(currentToppingIndex, 1, newTopping);
		let newSubItems;
		if (isSale) {
			newSubItems = [...newPayload.subitems];
			newSubItems[step] = { ...newSubItems[step], subitems: newToppings };
		}
		newPayload = {
			...newPayload,
			subitems: isSale ? newSubItems : newToppings,
		};
		return newPayload;
	};

	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {number} stepIndex The step to remove a topping from.
	 * @param {string} toppingId The topping id of the topping that will be removed.
	 * @return {object} A new payload that contains the changes.
	 */
	const removeTopping = (saleObject, stepIndex, toppingId, isSale = true) => {
		let newPayload = { ...saleObject };
		let newToppings;
		let newSubItems = isSale
			? [...newPayload.subitems]
			: newPayload.subitems.filter((subitem) => subitem.productId !== toppingId);
		if (isSale) {
			newToppings = newSubItems[stepIndex].subitems.filter(
				(subitem) => subitem.productId !== toppingId,
			);
			newSubItems[stepIndex] = {
				...newSubItems[stepIndex],
				subitems: newToppings,
			};
		}
		newPayload = { ...newPayload, subitems: newSubItems };
		return newPayload;
	};

	const removeDip = (saleObject, stepIndex, dipId, isSale = true) => {
		let newPayload = { ...saleObject };
		let newSubItems;

		if (isSale) {
			newSubItems = [...newPayload.subitems];
			let found = false;
			newSubItems[stepIndex] = {
				...newSubItems[stepIndex],
				subitems: newSubItems[stepIndex].subitems.filter((subitem) => {
					if (!found && subitem.productId === dipId) {
						found = true;
						return false;
					}
					return true;
				}),
			};
		} else {
			let found = false;
			newSubItems = newPayload.subitems.filter((subitem) => {
				if (!found && subitem.productId === dipId) {
					found = true;
					return false;
				}
				return true;
			});
		}

		newPayload = { ...newPayload, subitems: newSubItems };
		return newPayload;
	};
	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {number} stepIndex The step to replace the pizza id.
	 * @param {string} pizzaId The new pizza id.
	 * @return {object} A new payload that contains the changes.
	 */
	const switchPizzaId = (
		saleObject,
		stepIndex,
		pizzaId,
		triggerProductId = "",
		isSale = true,
		resetSubItem = false,
	) => {
		const saleObj = saleObject ? saleObject : Store.getState().cartItem;
		if (isSale) {
			const newToppingItems = [];
			saleObj?.subitems?.[stepIndex]?.subitems?.forEach((si) => {
				if (si.hasOwnProperty("triggerProductId") && si.triggerProductId) {
					const newSubitem = { ...si };
					newSubitem.triggerProductId = pizzaId;
					newToppingItems.push(newSubitem);
				} else newToppingItems.push(si);
			});
			let newPizza = CartItemEntity.getObjectLiteralItem(
				pizzaId,
				1,
				resetSubItem ? [] : newToppingItems ?? [],
				null,
				triggerProductId,
			);
			const newSubItems = [...saleObj.subitems];
			newSubItems[stepIndex] = newPizza;
			return CartItemEntity.getObjectLiteralItem(
				saleObj?.productId,
				1,
				newSubItems,
				null,
				saleObj?.triggerProductId,
				saleObj?.uuid,
				saleObj?.benefitId,
			);
		} else {
			const newSubItems = [];
			saleObj?.subitems?.forEach((si) => {
				if (si.hasOwnProperty("triggerProductId") && si.triggerProductId) {
					const newSubitem = { ...si };
					newSubitem.triggerProductId = pizzaId;
					newSubItems.push(newSubitem);
				} else newSubItems.push(si);
			});
			return CartItemEntity.getObjectLiteralItem(
				pizzaId,
				1,
				resetSubItem ? [] : newSubItems,
				null,
				triggerProductId,
				saleObj?.uuid,
				saleObj?.benefitId,
			);
		}
	};

	const switchMixTopping = (saleObject, stepIndex, toppingId, isSale = true) => {
		const saleObj = saleObject ? saleObject : Store.getState().cartItem;
		const catalogProducts = Store.getState().menusData.catalogProducts;
		if (isSale) {
			const pizzaObj = saleObject?.subitems[stepIndex];
			const oldMixTopping = pizzaObj.subitems?.filter(
				(topping) =>
					catalogProducts?.[topping.productId]?.meta === META_ENUM.MIX_TOPPING_ITEM,
			)?.[0];
			if (oldMixTopping) {
				const filteredToppings = pizzaObj.subitems?.filter(
					(topping) =>
						catalogProducts?.[topping.productId]?.meta !== META_ENUM.MIX_TOPPING_ITEM,
				);
				const newMixTopping = { ...oldMixTopping };
				newMixTopping.productId = toppingId;
				const newToppingItems = [...filteredToppings, newMixTopping];
				let newPizza = setSubItems(saleObj, newToppingItems, stepIndex, isSale);
				return newPizza;
			}
		} else {
			const oldMixTopping = saleObj.subitems?.filter(
				(topping) =>
					catalogProducts?.[topping.productId]?.meta === META_ENUM.MIX_TOPPING_ITEM,
			)?.[0];
			if (oldMixTopping) {
				const filteredToppings = saleObj.subitems?.filter(
					(topping) =>
						catalogProducts?.[topping.productId]?.meta !== META_ENUM.MIX_TOPPING_ITEM,
				);
				const newMixTopping = { ...oldMixTopping };
				newMixTopping.productId = toppingId;
				const newSubItems = [...filteredToppings, newMixTopping];
				return setSubItems(saleObj, newSubItems, stepIndex, isSale);
			}
		}
	};

	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {Array} newSubitems The new pizza id.
	 * @param {boolean} isSale if we are in a sale or not.
	 * @return {object} A new payload that contains the changes.
	 */
	const setSubItems = (saleObject, newSubitems, stepIndex, isSale = true) => {
		const step = stepIndex ?? 0;
		let newPayload = { ...saleObject };
		if (isSale) {
			const currentItem = CartItemEntity.getObjectLiteralItem(
				newPayload.subitems[step].productId,
				1,
				newSubitems,
			);
			newPayload = setSubItem(newPayload, stepIndex, currentItem);
		} else {
			newPayload.subitems = newSubitems;
		}
		return newPayload;
	};

	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {number} stepIndex The current step in the meal.
	 * @param {string} subItemId The subitem id.
	 * @return {object | undefined} returns undefined or the requested subitem.
	 */
	const getChild = (saleObject, subItemId) => {
		if (typeof saleObject === "object" && Array.isArray(saleObject.subitems)) {
			const subItem = saleObject.subitems.find(
				(sub) => sub.productId === subItemId,
			);
			return subItem;
		}
		return undefined;
	};

	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {number} stepIndex The current step in the meal.
	 * @param {string} subItemId The subitem id.
	 * @return {boolean} if the subitem exists or not.
	 */
	const isSubItemExists = (saleObject, stepIndex, subItemId) => {
		const subItem = PizzaBuilderService.getChild(
			saleObject,
			stepIndex,
			subItemId,
		);
		return typeof subItem !== "undefined";
	};

	const hasMix = (saleObject, stepIndex, catalogProducts) => {
		const pizzaObj = saleObject?.subitems[stepIndex];
		return pizzaObj?.subitems?.some(
			(topping) =>
				catalogProducts?.[topping.productId]?.meta === META_ENUM.MIX_TOPPING_ITEM,
		);
	};

	const removeMix = (saleObject, stepIndex, catalogProducts) => {
		if (!hasMix(saleObject, stepIndex, catalogProducts)) {
			return saleObject;
		}
		const newPayload = JSON.parse(JSON.stringify(saleObject));
		const pizzaObj = newPayload.subitems[stepIndex];
		const toppingsWithoutMix = pizzaObj.subitems?.filter(
			(topping) =>
				catalogProducts?.[topping.productId]?.meta !== META_ENUM.MIX_TOPPING_ITEM,
		);
		pizzaObj.subitems = toppingsWithoutMix;
		return newPayload;
	};

	const getCurrentStep = (saleObject, stepIndex, isSale = true) => {
		return isSale ? saleObject.subitems[stepIndex] : saleObject;
	};

	/**
	 * @param {object} saleObject The builder cart item; initial payload.
	 * @param {number} stepIndex The current step in the meal.
	 * @param {string} subItemId The subitem id.
	 * @return {boolean} if the subitem exists or not.
	 */
	const removeSubItem = (saleObject, stepIndex, subItemId) => {
		// let newPayload = {...saleObject};
		// const newToppings = newPayload.subitems[stepIndex]
		// return typeof subItem !== 'undefined';
	};

	const setSubItem = (saleObject, stepIndex, subItem) => {
		let newPayload = { ...saleObject };
		const newSubItems = [...(newPayload?.subitems ?? [])];
		newSubItems[stepIndex] = subItem;
		newPayload = { ...newPayload, subitems: newSubItems };
		return newPayload;
	};

	const onClickHandler = (
		toppingOrPizzaId,
		handleUpgradeByType,
		upgradeType,
		callback,
		onUpgradeEnd,
	) => {
		if (typeof handleUpgradeByType === "function") {
			const newItem = handleUpgradeByType(toppingOrPizzaId, upgradeType);
			Store.dispatch(Actions.setCartItem(newItem));
			if (typeof callback === "function") {
				const timeout = setTimeout(() => {
					callback();
					clearTimeout(timeout);
				}, 200);
			} else {
				typeof onUpgradeEnd === "function" && onUpgradeEnd(newItem);
			}
		}
	};

	const openUpgradePopup = (
		pizzaType = "classic",
		stepIndex,
		upgrades,
		callback,
		upgradeIndex,
		onUpgradeEnd,
		handleUpgradeByType,
		optionalCoverages = {},
	) => {
		const coverages =
			Store.getState().builder?.toppings?.[stepIndex] ?? optionalCoverages;
		const pizzaImg = getPizzaImage(pizzaType);
		const isLastUpgrade = upgrades?.length - 1 === upgradeIndex;
		const currentCartItem = Store.getState().cartItem;
		Store.dispatch(
			Actions.addPopup({
				type: popupTypes.PIZZA_UPGRADE,
				payload: {
					coverages: coverages,
					isSquare: pizzaType,
					pizzaImg: pizzaImg,
					stepIndex: stepIndex ?? 0,
					pizzaUpgrade: upgrades[upgradeIndex],
					primaryBtnOnPress: (toppingOrId) =>
						onClickHandler(
							toppingOrId,
							handleUpgradeByType,
							upgrades[upgradeIndex].type,
							callback,
							onUpgradeEnd,
						),
					secondaryBtnOnPress: () =>
						isLastUpgrade
							? onUpgradeEnd(currentCartItem)
							: typeof callback === "function" && callback(),
				},
			}),
		);
	};

	const getAlowedToppingsAddFromAllowedQuarters = (allowedQuarters) => {
		let allowedAdditions = {
			hideQuarters: false,
			hideHalfLeft: false,
			hideHalfRight: false,
			hideFullPizza: false,
		};
		if (Array.isArray(allowedQuarters) && allowedQuarters.length) {
			const halfRight = ["q1", "q2"];
			const halfLeft = ["q3", "q4"];
			const isFullPizzaAllowed = allowedQuarters.some(
				(quarters) => quarters.length === 4,
			);
			const isHalfRightAllowed = allowedQuarters
				.filter((quarters) => quarters.length === 2)
				.some(
					(combination) =>
						combination[0] === halfRight[0] && combination[1] === halfRight[1],
				);
			const isHalfLeftAllowed = allowedQuarters
				.filter((quarters) => quarters.length === 2)
				.some(
					(combination) =>
						combination[0] === halfLeft[0] && combination[1] === halfLeft[1],
				);

			const isQuartersAllowed =
				allowedQuarters.filter((quarters) => quarters.length === 1).length === 4;
			if (!isFullPizzaAllowed) {
				allowedAdditions["hideFullPizza"] = true;
			}
			if (!isHalfRightAllowed) {
				allowedAdditions["hideHalfRight"] = true;
			}
			if (!isHalfLeftAllowed) {
				allowedAdditions["hideHalfLeft"] = true;
			}
			if (!isQuartersAllowed) {
				allowedAdditions["hideQuarters"] = true;
			}
		}
		return allowedAdditions;
	};

	return {
		hasMix,
		removeMix,
		duplicateItem,
		setSubItem,
		addTopping,
		addDip,
		removeTopping,
		removeDip,
		switchPizzaId,
		isSubItemExists,
		getChild,
		setSubItems,
		removeSubItem,
		getCurrentStep,
		openUpgradePopup,
		getAlowedToppingsAddFromAllowedQuarters,
		updateTopping,
		switchMixTopping,
	};
})();

export default PizzaBuilderService;
