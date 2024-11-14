import React, { useRef } from "react";
import basic from "./index.module.scss";
import { useSelector } from "react-redux";
import Button from "components/button";
import TextOnlyButton from "components/text_only_button";
import BlurPopup from "../../Presets/BlurPopup";
import { META_ENUM } from "../../../constants/menu-meta-tags";
import { Pizza } from "../builder/Pizza";

const SwitchMixPopup = (props) => {
	const ref = useRef();
	const { payload = {} } = props;

	const {
		id,
		title,
		primaryBtnText,
		secondaryBtnText,
		stepIndex,
		extraStyles = {},
		pizzaId,
	} = payload;
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const deviceState = useSelector((store) => store.deviceState);
	const coverages = useSelector((store) => store.builder.toppings[stepIndex]);

	const toppings = replaceMixToppingItem(coverages, id);

	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};

	function replaceMixToppingItem(toppings, newId) {
		const newCoverages = JSON.parse(JSON.stringify(toppings));
		const toppingsArray = Object.keys(toppings);
		for (const toppingId of toppingsArray) {
			const topping = catalogProducts[toppingId];
			if (topping && topping.meta === META_ENUM.MIX_TOPPING_ITEM) {
				const newTopping = catalogProducts[newId];
				if (newTopping) {
					newCoverages[newId] = {
						assetVersion: newTopping.assetVersion,
						coverage: { q1: 1, q2: 1, q3: 1, q4: 1 },
						isMix: true,
					};
					delete newCoverages[toppingId];
				}
			}
		}
		return newCoverages;
	}

	const handleOnPrimaryPress = () => {
		const { onAdd } = payload;
		const topping = {
			id,
			coverage: {
				q1: 1,
				q2: 1,
				q3: 1,
				q4: 1,
			},
			isMix: true,
		};
		typeof onAdd === "function" && onAdd(topping);
		ref.current?.animateOut();
	};

	const handleOnSecondaryPress = () => {
		ref.current?.animateOut();
	};

	const renderButtons = () => {
		return (
			<div className={basic["buttons-wrapper"]}>
				<Button
					className={basic["continue_button"]}
					text={primaryBtnText}
					onClick={handleOnPrimaryPress}
				/>
				<TextOnlyButton
					className={basic["another-time"]}
					text={secondaryBtnText}
					onClick={handleOnSecondaryPress}
				/>
			</div>
		);
	};

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			className={styles("switch-mix-popup")}
			showCloseIcon>
			<div className={styles("mix-right-side")}>
				<div
					className={styles("header-title")}
					tabIndex={0}>
					{title}
				</div>
				{deviceState.notDesktop && (
					<div className={styles("mix-img-wrapper")}>
						<Pizza
							coverages={toppings}
							pizzaId={pizzaId}
							extraStyles={basic}
						/>
					</div>
				)}
				{renderButtons()}
			</div>
			{!deviceState.notDesktop && (
				<div className={styles("mix-left-side")}>
					<div className={styles("mix-img-wrapper")}>
						<Pizza
							coverages={toppings}
							pizzaId={pizzaId}
							extraStyles={basic}
						/>
					</div>
				</div>
			)}
		</BlurPopup>
	);
};

export default SwitchMixPopup;
