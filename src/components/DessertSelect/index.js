import React from "react";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import LanguageDirectionService from "../../services/LanguageDirectionService";
import VeganFriendly from "/public/assets/icons/vegan-friendly.svg";
import RedCheckBox from "../RedCheckBox";
import { getCurrencySign } from "../../utils/functions";
import clsx from "clsx";
import builderTypes from "constants/builder-types";
import useTranslate from "hooks/useTranslate";

const DessertSelect = (props) => {
	const {
		id,

		title,
		image,
		label,
		labelColor,
		description,
		quantity,
		extraCost,

		currency = "shekel",
		isVegan = false,

		isSelected = false,
		onChange = () => {},

		role = "",
	} = props;

	const deviceState = useSelector((store) => store.deviceState);
	const { notDesktop } = deviceState;
	const translate = useTranslate();

	const handleSelect = () => {
		onChange(id, index);
	};

	const selectedClass = isSelected ? styles["selected"] : "";
	const isRTL = LanguageDirectionService.isRTL() ? styles["rtl"] : "";
	return (
		<button
			className={clsx(styles["dessert-select-external-wrapper"], isRTL)}
			onClick={handleSelect}
			role={role}
			aria-checked={isSelected}>
			<div
				className={clsx(styles["dessert-select-wrapper"], selectedClass, isRTL)}>
				<div className={styles[`top-left-icons-wrapper`]}>
					{isVegan && notDesktop && (
						<img
							src={VeganFriendly.src}
							alt="vegan friendly"
							className={styles["vegan-icon"]}
						/>
					)}
				</div>
				{isVegan && !notDesktop && (
					<img
						src={VeganFriendly.src}
						alt="vegan friendly"
						className={`vegan-icon`}
					/>
				)}
				{label && (
					<div className={styles[`label-wrapper`]}>
						<div
							className={styles["label"]}
							style={{ backgroundColor: labelColor }}>
							{label}
						</div>
					</div>
				)}
				<div className={styles["image-wrapper"]}>
					<img
						src={image.src}
						alt="product"
						className={styles["dessert-image"]}
					/>
				</div>
				<div className={styles["leftSide"]}>
					<div className={styles["top"]}>
						<div className={styles["title"]}>{title}</div>
						{!deviceState.isMobile && quantity && (
							<div className={styles["units"]}>
								{`${quantity} ${translate("dessertSelect_units")}`}
								{extraCost && (
									<span className={styles["extra-cost"]}>
										{`[`}
										<span className={styles["currency"]}>
											{getCurrencySign(currency)}
										</span>
										{`${extraCost} +]`}
									</span>
								)}
							</div>
						)}
						<div className={styles["description"]}>{description}</div>
					</div>
					<div className={styles["bottom"]}>
						<RedCheckBox
							className={styles["dessert-select-radio"]}
							id={id}
							onChange={onChange}
							value={isSelected}
						/>
					</div>
				</div>
			</div>
		</button>
	);
};

export default DessertSelect;
