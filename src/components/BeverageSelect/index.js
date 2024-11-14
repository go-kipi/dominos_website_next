import React from "react";
import styles from "./index.module.scss";
import LanguageDirectionService from "services/LanguageDirectionService";
import ExpandIcon from "/public/assets/icons/outline-expand.svg";
import RedCheckBox from "components/RedCheckBox";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import { getFullMediaUrl } from "utils/functions";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import clsx from "clsx";
import CheckboxIsInStock from "components/checkbox";

const BeverageSelect = (props) => {
	const {
		id,

		showExpand = false,
		isSelected = false,
		onExpand = () => {},
		onChange = () => {},
		role = "",
		index,
	} = props;

	const item = useMenus(id, ActionTypes.PRODUCT);

	const handleSelect = () => {

		if(!item.outOfStock){

			onChange(id, index);
		}
	};

	const selectedClass = isSelected ? styles["selected"] : "";
	const isRTL = LanguageDirectionService.isRTL() ? styles["rtl"] : "";
	return (
		<button
			className={clsx(styles["beverage-select-external-wrapper"], isRTL)}
			onClick={handleSelect}
			role={role}
			aria-checked={isSelected}>
			<div
				className={clsx(styles["beverage-select-wrapper"], isRTL, selectedClass)}>
				{showExpand && (
					<img
						src={ExpandIcon.src}
						alt="expand"
						onClick={onExpand}
						className={styles["expand-icon"]}
					/>
				)}
				<div className={styles["beverage-image-wrapper"]}>
					<img
						src={getFullMediaUrl(item, MEDIA_TYPES.PRODUCT, MEDIA_ENUM.IN_MENU)}
						alt="beverage"
						className={styles["beverage-image"]}
					/>
				</div>
				<div className={styles["beverage-left-side"]}>
					<div className={styles["beverage-top"]}>
						<div className={styles["title"]}>{item["nameUseCases"]["Title"]}</div>
						<div className={styles["description"]}>
							{item["nameUseCases"]["SubTitle"]}
						</div>
					</div>
					<div className={styles["beverage-bottom"]}>
						<CheckboxIsInStock
							isBeverage={true}
							isOutOfStock={item.outOfStock}
							extraStyles={styles}
							onClickCheckbox={onChange}
							id={id}
							isSelected={isSelected}

						/>
					</div>
				</div>
			</div>
		</button>
	);
};

export default BeverageSelect;
