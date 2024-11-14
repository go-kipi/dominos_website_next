import React from "react";
import clsx from "clsx";
import Price from "components/Price";
import Checkbox from "components/forms/checkbox";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";

import InfoIcon from "/public/assets/icons/mix-info-icon.svg";
import FullCheckbox from "/public/assets/icons/full-radio.svg";
import EmptyCheckbox from "/public/assets/icons/empty-radio.svg";
import styles from "./index.module.scss";
import useTranslate from "hooks/useTranslate";
import * as popups from "constants/popup-types";
import { useDispatch } from "react-redux";
import Actions from "redux/actions";

function PizzaUpgradeOption(props) {
	const { option, index, isSelected, onChangeHandler } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const productId = option.upgradeToProductId;
	const upgradeItem = useMenus(productId, ActionTypes.PRODUCT);

	const onOpenDescriptionModal = () => {
		dispatch(
			Actions.addPopup({
				type: popups.GENERAL_MESSAGE,
				payload: {
					text: upgradeItem.nameUseCases?.ToolTip,
					btnText: translate("pizzaNotInMealModal_button_label"),
				},
			}),
		);
	};

	return (
		<div
			className={clsx(
				styles["pizza-upgrade-option"],
				isSelected ? styles["selected"] : "",
			)}>
			<div className={styles["upgrade-checkbox-wrapper"]}>
				<Checkbox
					className={clsx(styles["upgrade-checkbox"])}
					id={index}
					name={index}
					label={upgradeItem?.nameUseCases?.Title}
					value={isSelected}
					emptyImage={EmptyCheckbox}
					checkedImage={FullCheckbox}
					overrideVariant
					onChange={onChangeHandler}
					extraStyles={styles}
					tabIndex={0}
					// onFocus={onFocus}
					// onBlur={onBlur}
					outOfStockText={translate("outOfStock")}
				/>
			</div>
			<div className={styles["price-and-info"]}>
				<Price
					value={option.price}
					className={styles["upgrade-price"]}
					extraStyles={styles}
				/>
				<button
					onClick={onOpenDescriptionModal}
					className={styles["info-icon"]}>
					<img src={InfoIcon.src} />
				</button>
			</div>
		</div>
	);
}

export default PizzaUpgradeOption;
