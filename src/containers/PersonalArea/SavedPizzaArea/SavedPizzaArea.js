import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import NoSavedPizzaDesktop from "../NoSavedPizzaDesktop/NoSavedPizzaDesktop";
import NoSavedPizzasMobile from "../NoSavedPizzasMobile/NoSavedPizzasMobile";
import PersonalAreaSavedPizzasMobile from "./PersonalAreaSavedPizzasMobile/PersonalAreaSavedPizzasMobile";
import PersonalAreaSavedPizzasDesktop from "./PersonalAreaSavedPizzas/PersonalAreaSavedPizzasDesktop";

import Api from "api/requests";
import { notEmptyObject } from "utils/functions";

function SavedPizzaArea(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const savedPizzas = useSelector((store) => store.menusData.savedKits);
	const hasSavedPizza = savedPizzas && notEmptyObject(savedPizzas);

	useEffect(() => {
		// if (!hasSavedPizza)
		Api.getSavedKits();
	}, []);

	if (!hasSavedPizza) {
		return deviceState.isDesktop ? (
			<NoSavedPizzaDesktop />
		) : (
			<NoSavedPizzasMobile />
		);
	} else {
		return deviceState.isDesktop ? (
			<PersonalAreaSavedPizzasDesktop savedPizzas={savedPizzas} />
		) : (
			<PersonalAreaSavedPizzasMobile savedPizzas={savedPizzas} />
		);
	}
}

export default SavedPizzaArea;
