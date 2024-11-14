import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import SideDishScreen from "containers/SideDishScreen/SideDishScreen";
import Meals from "containers/Meals/Meals";
import Pizzas from "containers/Pizzas/Pizzas";
import Beverages from "containers/Beverages/Beverages";

import { META_ENUM } from "constants/menu-meta-tags";

function RenderScreen(props) {
	const menuPath = useSelector((store) => store.menuPath);
	const selectedMeta = menuPath.selected[menuPath.selected.length - 1];
	const selectedTabId = menuPath[META_ENUM.MAIN_NAV];

	useEffect(() => {
		if (selectedTabId) {
			window.scrollTo(0, 0);
		}
	}, [selectedTabId, selectedMeta]);

	function RenderScreen() {
		switch (selectedMeta) {
			case META_ENUM.DEALS:
				return <Meals />;
			case META_ENUM.MID_AREA_SECTIONS:
				return <Pizzas />;
			case META_ENUM.SIDEDISH:
				return <SideDishScreen />;
			case META_ENUM.BEVERAGES:
				return <Beverages />;

			default:
				return <></>;
		}
	}
	return RenderScreen();
}

export default RenderScreen;
