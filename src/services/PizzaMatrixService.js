import { Store } from "redux/store";
import doughMatrixEnum from "../constants/doughMatrixEnum";
import { MENUS } from "constants/menu-types";

const PizzaMatrixService = (() => {
	let _pizzasMatrix;
	function init() {
		const pizzaSelection = Store?.getState()?.pizzaSelection;
		if (
			!pizzaSelection ||
			(Array.isArray(pizzaSelection) && pizzaSelection.length === 0)
		) {
			import("api/requests").then((res) => {
				const onSuccess = (res) => {
					_pizzasMatrix = res;
				};
				const payload = { menuId: MENUS.DIGITAL_MENU };

				const Api = res.default;
				Api.pizzaProductSelection({ payload, onSuccess });
			});
		} else {
			_pizzasMatrix = pizzaSelection;
		}
	}

	function getPossiblePizzasById(pizzaId) {
		const currentPizza = getPizza(pizzaId);
		if (currentPizza) {
			return _pizzasMatrix.filter(
				(pizza) =>
					pizza[doughMatrixEnum.SIZE] === currentPizza[doughMatrixEnum.SIZE] &&
					pizza[doughMatrixEnum.TYPE] === currentPizza[doughMatrixEnum.TYPE] &&
					pizza[doughMatrixEnum.CRUST] === currentPizza[doughMatrixEnum.CRUST] &&
					pizza[doughMatrixEnum.CRUST_FLAVOR] ===
						currentPizza[doughMatrixEnum.CRUST_FLAVOR],
			);
		}
	}

	function getPossiblePizzasFromMenu(menu = []) {
		const menuPizzas = menu.map((pizza) => pizza.id);
		return _pizzasMatrix.filter((pizza) =>
			menuPizzas.includes(pizza[doughMatrixEnum.ID]),
		);
	}

	function hasDifferentSizePizza(menu = []) {
		const releventPizzas = getPossiblePizzasFromMenu(menu);
		if (releventPizzas.length > 0) {
			let originalSize = releventPizzas[0][doughMatrixEnum.SIZE];
			releventPizzas.forEach((pizza) => {
				if (pizza[doughMatrixEnum.SIZE] !== originalSize) {
					return true;
				}
			});
			return false;
		}
	}

	function getVeganOption(pizzaId) {
		const currentPizza = getPizza(pizzaId);
		if (currentPizza) {
			return getPossiblePizzasById(pizzaId).filter(
				(pizza) => pizza !== currentPizza,
			)?.[0];
		}
	}

	function getPizza(pizzaId) {
		return _pizzasMatrix?.filter(
			(pizza) => pizza[doughMatrixEnum.ID] === pizzaId,
		)?.[0];
	}

	function isPizzaVegan(pizzaId) {
		const currentPizza = getPizza(pizzaId);
		if (currentPizza) {
			return currentPizza[doughMatrixEnum.VEGAN] === "vegan";
		}
		return false;
	}

	function hasVeganOption(pizzaId) {
		const otherPizza = getVeganOption(pizzaId);
		return otherPizza !== undefined;
	}

	return {
		init,
		getPossiblePizzasFromMenu,
		getPossiblePizzasById,
		getVeganOption,
		isPizzaVegan,
		pizzaSelection: _pizzasMatrix,
		hasVeganOption,
		getPizza,
		hasDifferentSizePizza,
	};
})();

export default PizzaMatrixService;
