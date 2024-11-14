import { Store } from "redux/store";
import { MENUS } from "constants/menu-types";
import doughMatrixEnum from "constants/doughMatrixEnum";
import builderTypes from "../constants/builder-types";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import { notEmptyObject } from "utils/functions";

class PizzaTree {
	_pizzasTree;

	init(callback) {
		const pizzaSelection = Store?.getState()?.pizzaSelection;
		if (
			!pizzaSelection ||
			(typeof pizzaSelection === "object" && !notEmptyObject(pizzaSelection))
		) {
			import("api/requests").then((res) => {
				const onSuccess = (res) => {
					this._pizzasTree = res;
					typeof callback === "function" && callback();
				};
				const payload = { menuId: MENUS.DIGITAL_MENU };

				const Api = res.default;
				Api.pizzaProductSelection({ payload, onSuccess });
			});
		} else {
			this._pizzasTree = pizzaSelection;
			typeof callback === "function" && callback();
		}
	}

	getPossiblePizzasById(pizzaId) {
		return this.crawlToFinal({ subs: this._pizzasTree }, pizzaId);
	}

	getPossiblePizzasFromMenu(menu = []) {
		const res = [];
		menu.forEach((p) => {
			res.push(this.crawlToFinal({ subs: this._pizzasTree }, p.id));
		});
		return res;
	}

	hasOptions(root) {
		const subs = Object.keys(root.subs);
		return subs.length >= 1 && subs[0] !== "final";
	}

	hasDifferentSizePizza(menu = []) {}

	getVeganOption(pizzaId) {}

	getDoughTypes(size) {
		return this._pizzasTree[size].subs;
	}

	getDoughObjectWithId(pizzaId) {
		let dough = {};
		const path = this.getPizzaPathById(pizzaId);
		if (path) {
			dough["size"] = path[doughMatrixEnum.SIZE];
			dough["type"] = path[doughMatrixEnum.TYPE];
			dough["extra"] = path[doughMatrixEnum.CRUST];
			dough["option"] = path[doughMatrixEnum.CRUST_FLAVOR];
			dough["vegan"] = path[doughMatrixEnum.VEGAN];
		}
		return dough;
	}

	filterDoughSizes(pizzas) {
		const sizes = new Set();
		Object.values(pizzas).forEach((p) =>
			sizes.add(this.getParentSize(p.productId)),
		);
		if (sizes.has(undefined)) {
			sizes.delete(undefined);
		}
		return sizes.values().next().value;
	}

	filterDoughSizesFromArray(pizzas) {
		const sizes = new Set();
		pizzas.forEach((p) => sizes.add(this.getParentSize(p[doughMatrixEnum.ID])));
		if (sizes.has(undefined)) {
			sizes.delete(undefined);
		}
		return sizes.values().next().value;
	}

	filterDoughTypes(pizzas, size) {
		const types = new Set();
		const doughTypes = this._pizzasTree?.[size].subs;
		Object.values(pizzas).forEach((p) => {
			Object.keys(doughTypes).forEach((key) => {
				if (this.doesPizzaExists(doughTypes[key], p.productId)) {
					types.add(key);
				}
			});
		});
		if (types.has(undefined)) {
			types.delete(undefined);
		}
		const res = Array.from(types.values());
		return res;
	}

	filterDoughTypesByArray(pizzas, size) {
		const types = new Set();
		const doughTypes = this._pizzasTree[size].subs;
		pizzas.forEach((p) => {
			Object.keys(doughTypes).forEach((key) => {
				if (this.doesPizzaExists(doughTypes[key], p[doughMatrixEnum.ID])) {
					types.add(key);
				}
			});
		});
		if (types.has(undefined)) {
			types.delete(undefined);
		}
		const res = Array.from(types.values());
		return res;
	}

	filterDoughExtras(pizzas, size, types) {
		if (!Array.isArray(types)) return [];
		const extras = new Set();
		const possibleDoughExtras = [];
		types.forEach((type) => {
			possibleDoughExtras.push(this._pizzasTree[size].subs[type].subs);
		});
		possibleDoughExtras.forEach((extra) => {
			Object.keys(extra).forEach((key) => {
				Object.values(pizzas).forEach((p) => {
					if (this.doesPizzaExists(extra[key], p.productId)) {
						extras.add(key);
					}
				});
			});
		});
		if (extras.has(undefined)) {
			extras.delete(undefined);
		}
		const res = Array.from(extras.values());
		return res;
	}

	filterDoughExtrasByArray(pizzas, size, types) {
		if (!Array.isArray(types)) return [];
		const extras = new Set();
		const possibleDoughExtras = [];
		types.forEach((type) => {
			possibleDoughExtras.push(this._pizzasTree[size].subs[type].subs);
		});
		possibleDoughExtras.forEach((extra) => {
			Object.keys(extra).forEach((key) => {
				pizzas.forEach((p) => {
					if (this.doesPizzaExists(extra[key], p[doughMatrixEnum.ID])) {
						extras.add(key);
					}
				});
			});
		});
		if (extras.has(undefined)) {
			extras.delete(undefined);
		}
		const res = Array.from(extras.values());
		return res;
	}

	filterDoughOptions(pizzas, size, types, extras) {
		if (!Array.isArray(types) || !Array.isArray(extras)) return [];
		const options = new Set();
		const possibleDoughOptions = [];
		types.forEach((type) => {
			extras.forEach((extra) => {
				possibleDoughOptions.push(
					this._pizzasTree[size].subs[type].subs[extra].subs,
				);
			});
		});
		possibleDoughOptions.forEach((option) => {
			Object.keys(option).forEach((key) => {
				Object.values(pizzas).forEach((p) => {
					if (this.doesPizzaExists(option[key], p.productId)) {
						options.add(key);
					}
				});
			});
		});
		if (options.has(undefined)) {
			options.delete(undefined);
		}
		const res = Array.from(options.values());
		return res;
	}

	filterDoughOptionsByArray(pizzas, size, types, extras) {
		if (!Array.isArray(types) || !Array.isArray(extras)) return [];
		const options = new Set();
		const possibleDoughOptions = [];
		types.forEach((type) => {
			extras.forEach((extra) => {
				possibleDoughOptions.push(
					this._pizzasTree[size].subs[type].subs[extra]?.subs,
				);
			});
		});
		possibleDoughOptions.forEach((option) => {
			if (option) {
				Object.keys(option).forEach((key) => {
					pizzas.forEach((p) => {
						if (this.doesPizzaExists(option[key], p[doughMatrixEnum.ID])) {
							options.add(key);
						}
					});
				});
			}
		});
		if (options.has(undefined) || options.has("final")) {
			options.delete(undefined);
			options.delete("final");
		}
		const res = Array.from(options.values());
		return res;
	}

	getParentSize(pizzaId) {
		let size;
		Object.keys(this._pizzasTree).forEach((key) => {
			if (this.doesPizzaExists(this._pizzasTree[key], pizzaId)) {
				size = key;
			}
		});
		return size;
	}

	crawlToId(pizza, pizzaId) {
		if (pizza.productId === pizzaId) {
			return pizza;
		} else if (
			typeof pizza === "object" &&
			pizza.hasOwnProperty("subs") &&
			typeof pizza.subs === "object" &&
			Object.keys(pizza.subs).length === 0
		) {
			return undefined;
		}
		const result = Object.values(pizza.subs)
			.map((pizza) => this.crawlToId(pizza, pizzaId))
			.filter((pizza) => pizza !== undefined)[0];
		return result;
	}

	crawlToFinal(pizza, pizzaId) {
		if (this.isKeyFinal(pizza)) {
			if (
				Object.values(pizza.subs.final.subs).some((p) => p.productId === pizzaId)
			) {
				return pizza.subs.final.subs;
			} else undefined;
		} else if (
			typeof pizza === "object" &&
			pizza.hasOwnProperty("subs") &&
			typeof pizza.subs === "object" &&
			Object.keys(pizza.subs).length === 0
		) {
			return undefined;
		}
		const result = Object.keys(pizza.subs)
			.map((key) => this.crawlToFinal(pizza.subs[key], pizzaId))
			.filter((pizza) => pizza !== undefined)[0];
		return result;
	}

	getPizza(pizzaId) {
		if (typeof this._pizzasTree === "object") {
			return this.crawlToId({ subs: this._pizzasTree }, pizzaId);
		}
		// else this.init();
	}

	doesPizzaExists(pizza, pizzaId) {
		if (typeof this._pizzasTree === "object") {
			return this.crawlToId(pizza, pizzaId) !== undefined;
		}
		// else this.init();
	}

	isPizzaVegan(pizzaId) {
		return this.getPizzaPathById(pizzaId)?.[doughMatrixEnum.VEGAN] === "vegan";
	}

	hasVeganOption(pizzaId) {}

	isSingleDough(pizza) {
		return (
			typeof pizza === "object" &&
			pizza.subs &&
			Object.keys(pizza.subs).length === 1
		);
	}

	getPizzaFinalSubs(pizza) {
		if (typeof pizza === "object") {
			return this.isSingleDough(pizza) && !this.isKeyFinal(pizza)
				? this.getPizzaFinalSubs(pizza.subs[Object.keys(pizza.subs)[0]])
				: this.isKeyFinal(pizza)
				? pizza.subs.final.subs
				: undefined;
		}
	}

	findKeyByProductId(obj, targetId) {
		function search(currentObj, currentKey) {
			if (typeof currentObj !== "object" || currentObj === null) {
				return null;
			}

			if (currentObj.productId === targetId) {
				return currentKey;
			}

			for (let key in currentObj) {
				const result = search(currentObj[key], key);
				if (result) {
					return currentKey || result;
				}
			}

			return null;
		}

		for (let key in obj) {
			const result = search(obj[key], key);
			if (result) {
				return key;
			}
		}

		return null;
	}

	isKeyFinal(pizza) {
		return (
			typeof pizza === "object" &&
			typeof pizza.subs === "object" &&
			pizza.subs.hasOwnProperty("final")
		);
	}

	getTree() {
		return this._pizzasTree;
	}

	getPizzaPathById(id) {
		const res = (() => {
			let pizzaPath = [];
			let currentHead = this._pizzasTree;
			pizzaPath.splice(doughMatrixEnum.ID, 0, id);
			const size =
				currentHead &&
				Object.keys(currentHead).filter((key) =>
					this.doesPizzaExists(currentHead[key], id),
				)[0];
			if (!size) return pizzaPath;
			currentHead = currentHead[size].subs;
			pizzaPath.splice(doughMatrixEnum.SIZE, 0, size);
			const type = Object.keys(currentHead).filter((key) =>
				this.doesPizzaExists(currentHead[key], id),
			)[0];
			if (!type) return pizzaPath;
			currentHead = currentHead[type].subs;
			pizzaPath.splice(doughMatrixEnum.TYPE, 0, type);
			const extra = Object.keys(currentHead).filter((key) =>
				this.doesPizzaExists(currentHead[key], id),
			)[0];
			if (!extra) return pizzaPath;
			pizzaPath.splice(doughMatrixEnum.CRUST, 0, extra);
			currentHead = currentHead[extra]?.subs;
			const option = Object.keys(currentHead).filter((key) =>
				this.doesPizzaExists(currentHead[key], id),
			)[0];
			if (!option) return pizzaPath;
			pizzaPath.splice(
				doughMatrixEnum.CRUST_FLAVOR,
				0,
				option === "final" ? "" : option,
			);
			currentHead =
				option === "final"
					? currentHead[option]?.subs
					: currentHead[option].subs.final.subs;
			let vegan = "";
			Object.keys(currentHead).forEach((key) => {
				if (currentHead[key].productId === id) {
					vegan = key;
				}
			});

			pizzaPath.splice(doughMatrixEnum.VEGAN, 0, vegan);
			return pizzaPath;
		})();

		return res.length < 5 ? undefined : res;
	}

	getInitialScreen(
		productIds = [],
		stepIndex = 0,
		fatherEntity,
		isEdit = false,
	) {
		return import("../redux/actions").then(({ default: Actions }) => {
			const possiblePizzas = productIds
				.map((id) => this.getPizzaPathById(id))
				.filter((p) => p);
			if (
				!possiblePizzas ||
				!Array.isArray(possiblePizzas) ||
				possiblePizzas.length === 0
			) {
				return builderTypes.DOUGH;
			}

			const isEqual = (arr = []) => {
				return arr.every((value) => value === arr[0]);
			};

			const isEqualSize = (arr = []) => {
				const set = new Set(arr);
				return set.size === 1;
			};

			let allTheSame = true;
			let hasDifferentSizePizza = false;
			const fields = ["size", "type", "extra", "option", "vegan"];
			const pizzaSizes = possiblePizzas.map((p) => p[doughMatrixEnum.SIZE]);

			hasDifferentSizePizza = !isEqualSize(pizzaSizes);
			let pizzaObj = fatherEntity?.subitems?.[stepIndex];
			// If its edit we skip the dough update because we already have the data in redux.
			if (!isEdit) {
				const groups = [];
				for (let i = 0; i < possiblePizzas[0].length - 1; i++) {
					groups.push(possiblePizzas.map((pizza) => pizza[i]));
				}
				for (let i = 0; i < groups.length; i++) {
					if (fields[i] === "vegan" && !isEqual(groups[i])) {
						Store.dispatch(
							Actions.updateDough({
								step: stepIndex,
								data: {
									[fields[i]]: groups[i][0] === fields[i],
								},
							}),
						);
					} else if (isEqual(groups[i])) {
						Store.dispatch(
							Actions.updateDough({
								step: stepIndex,
								data: {
									[fields[i]]: groups[i][0],
								},
							}),
						);
					} else {
						allTheSame = false;
					}
				}
			}

			if (hasDifferentSizePizza) {
				return builderTypes.SIZE;
			}

			if (!allTheSame && !hasDifferentSizePizza) {
				return builderTypes.DOUGH;
			}

			if (
				typeof pizzaObj === "object" &&
				pizzaObj.productId !== possiblePizzas[0][doughMatrixEnum.ID]
			) {
				pizzaObj = CartItemEntity.getObjectLiteralItem(
					possiblePizzas[0][doughMatrixEnum.ID],
					1,
					pizzaObj.subitems,
				);

				let temp = JSON.parse(JSON.stringify(fatherEntity));
				temp.subitems[stepIndex] = pizzaObj;

				Store.dispatch(Actions.setCartItem(temp));
			}

			if (!pizzaObj) {
				pizzaObj = CartItemEntity.getObjectLiteralItem(
					possiblePizzas[0][doughMatrixEnum.ID],
				);
				const newSubItems = [...(fatherEntity?.subitems ?? []), pizzaObj];
				const newCartItem = { ...fatherEntity, subitems: newSubItems };
				Store.dispatch(Actions.setCartItem(newCartItem));
			}

			Store.dispatch(
				Actions.setPizzaId({
					step: stepIndex,
					id: pizzaObj.productId,
				}),
			);
			return builderTypes.TOPPINGS;
		});
	}

	//  getPizzaProdutId(pizza) {
	//   if (typeof pizza === 'object' ) {
	//     if (typeof pizza.productId === 'string' && pizza.productId.length > 0) {
	//       return pizza.productId
	//     }
	//     else if (typeof pizza.subs === 'object' && Object.keys(pizza.subs).length > 0) {
	//       const isSingle = isSinglePizza(pizza);
	//       if (isSingle) {
	//         return getPizzaProdutId(pizza[0])
	//       }
	//       else {

	//       }
	//     }
	//   }
	// }
}

const PizzaTreeService = new PizzaTree();

export default PizzaTreeService;
