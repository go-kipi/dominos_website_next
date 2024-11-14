import useMenus from "hooks/useMenus";
import Button from "components/button";
import ActionTypes from "constants/menus-action-types";
import React, { useRef } from "react";
import styles from "./index.module.scss";
import BlurPopup from "../../Presets/BlurPopup";
import { PizzaWithToppings } from "animations-manager/animations/MovingSavedPizza";

const MixInfoPopup = (props) => {
	const ref = useRef();
	const { payload = {} } = props;
	const { id, primaryBtnText = "" } = payload;
	const item = useMenus(id, ActionTypes.PRODUCT);

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

	const topping = {
		id,
		coverage: {
			q1: 1,
			q2: 1,
			q3: 1,
			q4: 1,
		},
		quantity: 1,
		assetVersion: item.assetVersion,
	};

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			showCloseIcon
			className={styles["mix-info-popup"]}>
			<div className={styles["mix-info-wrapper"]}>
				<div className={styles["pizza-image-wrapper"]}>
					<PizzaWithToppings toppings={[topping]} />
				</div>

				<div className={styles["content"]}>
					<div className={styles["title-wrapper"]}>
						<div
							className={styles["mix-info-name"]}
							tabIndex={0}>
							{item?.nameUseCases?.Title}
						</div>
						<div className={styles["seperator"]} />
						<div
							className={styles["mix-description"]}
							tabIndex={0}>
							{item?.nameUseCases?.SubTitle}
						</div>
					</div>
					<Button
						className={styles["add-mix-btn"]}
						text={primaryBtnText}
						onClick={handleOnPrimaryPress}
					/>
				</div>
			</div>
		</BlurPopup>
	);
};

export default MixInfoPopup;
