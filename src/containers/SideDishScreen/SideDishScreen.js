import React, { useEffect } from "react";
import RenderSideDishComponent from "containers/Menu/components/RenderSideDishComponent";
import styles from "./SideDishScreen.module.scss";
import useGetMenuByMeta from "hooks/useGetMenuByMeta";
import { META_ENUM } from "constants/menu-meta-tags";
import { useSelector } from "react-redux";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { notEmptyObject } from "utils/functions";

function SideDishScreen(props) {
	const sideDishSubMenu = useGetMenuByMeta(META_ENUM.SIDEDISH);

	const menus = useSelector((store) => store.menusData)?.menus;
	const mainMenuId = useSelector((store) => store.globalParams)?.DefaultMenus
		?.result?.main;
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const mainMenu = menus[mainMenuId];
	const menuPath = useSelector((store) => store.menuPath);
	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const selectedTabId = menuPath.mainNav;
	const listName = topNav?.elements?.find((el) => el.id === topNavId)?.label;
	const selectedMenu = mainMenu.elements.find((el) => el.id === selectedTabId);
	const isSideDishMenu =
		selectedMenu.id.includes("near") || selectedMenu.id.includes("sandwiches");
	const hasElementsSideDish =
		sideDishSubMenu &&
		sideDishSubMenu.elements &&
		notEmptyObject(sideDishSubMenu.elements);

	useEffect(() => {
		if (hasElementsSideDish) {
			const products = items.map((item) =>
				Object.assign({
					...catalogProducts[item?.id],
				}),
			);
			addViewProductListEvent(products);
		}
	}, [hasElementsSideDish, topNavId]);

	const addViewProductListEvent = (products) => {
		const listItem = {
			id: topNavId,
			name: listName,
		};
		AnalyticsService.viewItemList(products, listItem);
	};
	const items = hasElementsSideDish ? sideDishSubMenu.elements : [];

	function RenderItem(item, index) {
		return (
			<div
				className={styles["item"]}
				key={"side-dish-" + index}>
				<RenderSideDishComponent
					item={item}
					isSideDish={isSideDishMenu}
					index={index}
				/>
			</div>
		);
	}

	return (
		<div className={styles["side-dish-screen-wrapper"]}>
			<div className={styles["list-wrapper"]}>
				{items.map((item, index) => RenderItem(item, index))}
			</div>
		</div>
	);
}

export default SideDishScreen;
