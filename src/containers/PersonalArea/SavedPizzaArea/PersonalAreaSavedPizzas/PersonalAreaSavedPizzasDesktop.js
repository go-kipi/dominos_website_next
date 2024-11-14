import { generateUniqueId } from "utils/functions";
import React from "react";
import { useSelector } from "react-redux";
import SavedPizzaCard from "../SavedPizzaCard/SavedPizzaCard";

import styles from "./PersonalAreaSavedPizzasDesktop.module.scss";
import PizzaPlaceholder from "/public/assets/icons/placeholder.svg";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";

function PersonalAreaSavedPizzasDesktop(props) {
	const { savedPizzas = {} } = props;
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const NUMBER_OF_PIZZAS_IN_ROW =
		deviceState.isDesktopLarge || deviceState.isDesktopMax ? 8 : 6;
	const MIN_NUMBER_OF_PIZZAS =
		deviceState.isDesktopLarge || deviceState.isDesktopMax ? 16 : 12;

	function renderSavedPizzas() {
		const components = [];

		Object.values(savedPizzas).map((pizza, index) => {
			const component = (
				<div
					className={styles["saved-pizza-item"]}
					key={"saved-pizza-" + index}>
					<SavedPizzaCard name={pizza.name} />
				</div>
			);
			components.push(component);
			return null;
		});

		const length = components.length;

		if (MIN_NUMBER_OF_PIZZAS - length > 0) {
			for (let i = 0; i < MIN_NUMBER_OF_PIZZAS - length; i++) {
				const placeholder = (
					<div
						aria-hidden={true}
						className={styles["saved-pizza-item"]}
						key={generateUniqueId(9)}>
						<div className={styles["placeholder"]}>
							<img
								src={PizzaPlaceholder.src}
								alt={translate("alt_pizzaPlaceholder")}
							/>
						</div>
					</div>
				);
				components.push(placeholder);
			}
		} else {
			const divied = length / NUMBER_OF_PIZZAS_IN_ROW;
			const numberOfRows = Math.ceil(divied);
			const totalItems = numberOfRows * NUMBER_OF_PIZZAS_IN_ROW;
			const leftItems = totalItems - length;
			for (let i = 0; i < leftItems; i++) {
				const placeholder = (
					<div
						className={styles["saved-pizza-item"]}
						key={generateUniqueId(9)}>
						<div className={styles["placeholder"]}>
							<img
								src={PizzaPlaceholder.src}
								alt={translate("alt_pizzaPlaceholder")}
							/>
						</div>
					</div>
				);
				components.push(placeholder);
			}
		}

		return components;
	}

	return (
		<div
			className={styles["personal-area-saved-pizza-desktop-wrapper"]}
			aria-label={`${translate(
				"personalArea_savedPizzas_title_desktop_1",
			)} ${translate("personalArea_savedPizzas_title_desktop_2")}`}>
			<div className={styles["title-wrapper"]}>
				<h1 className={styles["saved-pizzas-title"]}>
					{translate("personalArea_savedPizzas_title_desktop_1")}{" "}
					{translate("personalArea_savedPizzas_title_desktop_2")}
				</h1>
			</div>
			<div className={styles["personal-area-saved-pizza-desktop"]}>
				{renderSavedPizzas()}
			</div>
		</div>
	);
}

export default PersonalAreaSavedPizzasDesktop;
