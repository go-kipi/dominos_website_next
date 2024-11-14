import { useEffect, useState } from "react";
import Actions from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { META_ENUM } from "constants/menu-meta-tags";
import { notEmptyObject } from "utils/functions";

export default function useSetMenuPath(useMenus = false) {
	const [selectedMenuId, setSelcetedMenuId] = useState("");
	const menus = useSelector((store) => store.menusData.menus);
	const mainMenu = useSelector(
		(store) => store.globalParams.DefaultMenus.result.main,
	);
	const isPizzas = menus?.[selectedMenuId]?.meta === META_ENUM.MID_AREA_SECTIONS;
	const hasElements = menus && notEmptyObject(menus);
	const promotionalAndOperationalPopups = useSelector(
		(store) => store.promoPopups,
	);
	const dispatch = useDispatch();

	/**
	 *
	 * @param {string} child
	 * @param {string} parent
	 * @returns {boolean} if menuId was found.
	 */
	const isChildMenuInMenu = (child, parent) => {
		if (child && parent) {
			const parentMenu = menus[parent];
			if (typeof menus[parent] === "object") {
				const parentElements = parentMenu.elements;

				const target = parentElements.find((c) => c.id === child);
				return !!target;
			} else return false;
		}
	};
	/**
	 *
	 * @param {string | Array} menuIdOrArray a menu id or an array of menu ids.
	 * @returns {object} parsed menu path.
	 */
	const parseMenuIdOrArrayToMenuPath = (menuIdOrArray) => {
		const isPizzasMenu =
			typeof menuIdOrArray === "string"
				? menus[menuIdOrArray]?.meta === META_ENUM.MID_AREA_SECTIONS
				: false;
		if (Array.isArray(menuIdOrArray)) {
			return menuIdOrArray.map((menuId) => {
				return { menuId, meta: menus[menuId].meta };
			});
		} else if (isPizzas || isPizzasMenu) {
			const menusArray = [];
			const pizzasMenus = getAncestorMenus(menuIdOrArray);
			for (const i in pizzasMenus) {
				if (menus[i]?.meta) {
					menusArray.push({ menuId: pizzasMenus[i], meta: menus[i]?.meta });
				} else
					menusArray.push({
						menuId: pizzasMenus[i],
						meta: META_ENUM.MID_AREA_SECTIONS,
					});
			}
			return menusArray;
		} else if (typeof menuIdOrArray === "string" && menuIdOrArray.length > 0) {
			let id = menuIdOrArray;
			const menusArray = [];
			while (id) {
				const childMenu = menus[id];
				const childMenuData = { menuId: id, meta: childMenu?.meta };
				menusArray.push(childMenuData);
				id = getChildMenuId(id);
			}
			return menusArray;
		} else console.warn("invalid menu id or array");
	};

	const getAncestorMenus = (menuId) => {
		let selected = [];
		const ancestor = menus[mainMenu]?.elements?.filter((m) => m.id === menuId)[0];
		if (!ancestor) {
			menus[mainMenu]?.elements?.forEach((m) => {
				const fatherId = m.id;
				if (isChildMenuInMenu(menuId, fatherId)) {
					selected.push(m.id);
					selected.push(menuId);
					return;
				}
			});
			return selected;
		} else {
			selected.push(menuId);
			return selected;
		}
	};

	const getChildMenuId = (parentMenuId) => {
		const isSame = selectedMenuId === parentMenuId;
		if (isSame) {
			return menus[selectedMenuId]?.defaultElement;
		}
		if (isPizzas) {
			return menus[selectedMenuId]?.defaultElement;
		}
		if (isChildMenuInMenu(selectedMenuId, parentMenuId)) {
			return selectedMenuId;
		} else if (isChildMenuInMenu(parentMenuId, selectedMenuId)) {
			return menus[parentMenuId]?.defaultElement;
		} else return undefined;
	};

	useEffect(() => {
		const menuId = mainMenu;
		if (hasElements && menuId && selectedMenuId) {
			let childMenuIdOrMenuArray = getChildMenuId(menuId);
			if (!childMenuIdOrMenuArray) {
				childMenuIdOrMenuArray = getAncestorMenus(selectedMenuId);
			}
			const restOfMenus = parseMenuIdOrArrayToMenuPath(childMenuIdOrMenuArray);
			const menusArray = [{ menuId, meta: menus[menuId]?.meta }, ...restOfMenus];

			dispatch(Actions.setPath(menusArray));
		}
	}, [hasElements, selectedMenuId]);

	function setPath(menuId = "") {
		if (menuId) {
			setSelcetedMenuId(menuId);
		} else {
			// setTimeout(() => {
			setSelcetedMenuId(mainMenu);
			// }, 1600);
		}
	}

	return setPath;
}
