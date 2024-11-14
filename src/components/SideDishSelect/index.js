import React from "react";
import styles from "./index.module.scss";
import Expand from "/public/assets/icons/outline-expand.svg";
import VeganFriendly from "/public/assets/icons/vegan-friendly.svg";
import { useDispatch, useSelector } from "react-redux";
import * as popupTypes from "constants/popup-types";
import builderTypes from "constants/builder-types";
import LanguageDirectionService from "../../services/LanguageDirectionService";
import RedCheckBox from "../RedCheckBox";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "../../utils/analyticsService/AnalyticsService";
import CheckboxIsInStock from "components/checkbox";

const SideDishSelect = (props) => {
	const {
		id,
		outOfStock = false,
		title,
		image,
		label,
		comment,
		labelColor,
		description,
		isComplex = false,
		isVegan = false,
		isSelected = false,

		onChange = () => {},
		templateId = "",

		priceOverride,
		role = "",
		index,
	} = props;

	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);
	const deviceState = useSelector((store) => store.deviceState);
	const shouldShowProductScreen = isComplex && templateId;
	const { notDesktop } = deviceState;
	const translate = useTranslate();
	const hasPriceOverride = priceOverride > 0;
	const isRTL = LanguageDirectionService.isRTL();

	const handleSelect = () => {
		if (!outOfStock) {
			onChange(id, index);
		}
	};

	const selectedClass = isSelected ? styles["selected"] : "";
	const rtlStyle = isRTL ? styles["rtl"] : "";
	return (
		<button
			className={`${styles["side-dish-select-external-wrapper"]}`}
			onClick={handleSelect}
			role={role}
			aria-checked={isSelected}>
			<div
				className={clsx(
					styles["side-dish-select-wrapper"],
					outOfStock ? styles["pointer-none"] : "",
					selectedClass,
					rtlStyle,
				)}>
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
						className={styles[`vegan-icon`]}
					/>
				)}
				{label && (
					<div className={`label-wrapper`}>
						<div
							className={styles["label"]}
							style={{ backgroundColor: labelColor }}>
							{label}
						</div>
					</div>
				)}
				<div className={styles["image-wrapper"]}>
					<img
						src={image}
						alt="product"
						className={styles["side-dish-image"]}
					/>
				</div>
				<div className={styles["leftSide"]}>
					<div className={styles["top"]}>
						<div className={styles["title"]}>{title}</div>
						{!notDesktop && hasPriceOverride ? (
							<div className={styles["price-override"]}>
								{isRTL ? (
									<>
										<span className={styles["price"]}>
											{"[ " + priceOverride.toFixed(displayDecimalPoint)}
										</span>
										<span className={styles["currency"]}>{"₪ +" + " ]"}</span>
									</>
								) : (
									<>
										<span className={styles["currency"]}>
											{(!notDesktop ? "[ " : "") + "+ ₪"}
										</span>
										<span className={styles["price"]}>
											{priceOverride + (!notDesktop ? " ]" : "")}
										</span>
									</>
								)}
							</div>
						) : null}
						<div className={styles["description"]}>{description}</div>
						{notDesktop && hasPriceOverride ? (
							<div className={styles["price-override"]}>
								{isRTL ? (
									<>
										<span className={styles["price"]}>{"" + priceOverride}</span>
										<span className={styles["currency"]}>{"₪ +" + ""}</span>
									</>
								) : (
									<>
										<span className={styles["currency"]}>{"" + "+ ₪"}</span>
										<span className={styles["price"]}>
											{priceOverride + (!notDesktop ? " ]" : "")}
										</span>
									</>
								)}
							</div>
						) : null}
						{deviceState.isMobile && comment && (
							<div className={styles["comment-wrapper"]}>
								<div className={styles["title"]}>
									{translate("pizzaBuilder_saleBuilder_sideDishComment_on_the_side")}
								</div>
								<div className={styles["comment"]}>{comment}</div>
							</div>
						)}
					</div>
					<div className={styles["bottom"]}>
						<CheckboxIsInStock
							isOutOfStock={outOfStock}
							extraStyles={styles}
							id={id}
							onChange={shouldShowProductScreen ? null : onChange}
							isSelected={isSelected}
						/>
					</div>
				</div>
			</div>
		</button>
	);
};

export default SideDishSelect;
