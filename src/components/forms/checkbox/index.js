import clsx from "clsx";
import { CHECKBOX_VARAINTS } from "constants/checkbox-variants";
import React, { forwardRef } from "react";
import darkEmpty from "/public/assets/checkbox/kosher-checkbox-dark.svg";
import darkFull from "/public/assets/checkbox/kosher-checkbox-selected-dark.svg";
import lightEmpty from "/public/assets/checkbox/kosher-checkbox.svg";
import lightFull from "/public/assets/checkbox/kosher-checkbox-selected.svg";
import basic from "./checkbox.module.scss";

const Checkbox = forwardRef((props, ref) => {
	const {
		className = "",
		type = "checkbox",
		id,
		name,
		label = "",
		value = "",
		onChange = () => {},
		variant = CHECKBOX_VARAINTS.LIGHT,
		overrideVariant = false,
		smart = false,
		showError = false,
		errorMessage = "",
		emptyImage,
		checkedImage,
		isOutOfStock = false,
		outOfStockText = "",
		extraStyles = {},
		tabIndex = 0,
		onFocus,
		onBlur,
		hideLabel = false,
		role = "checkbox",
		ariaLabel = "",
		isDisabled = false,
	} = props;
	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};

	function doesPhotoExsits() {
		return overrideVariant
			? emptyImage !== undefined || checkedImage !== undefined
			: variant !== undefined;
	}

	function getImage(isSelected) {
		if (overrideVariant && checkedImage && emptyImage) {
			return isSelected ? checkedImage : emptyImage;
		} else {
			if (variant == CHECKBOX_VARAINTS.LIGHT) {
				return isSelected ? lightFull : lightEmpty;
			} else {
				return isSelected ? darkFull : darkEmpty;
			}
		}
	}

	const img = (
		<img
			src={getImage(value).src}
			className={styles("img")}
			alt={label}
		/>
	);

	const isStyled = doesPhotoExsits();

	const handleChange = (e) => {
		if (isOutOfStock) return;
		if (smart) {
			const { checked } = e.target;
			onChange(name, checked);
			return;
		}
		onChange(e);
	};

	const styledImages = isStyled ? img : "";
	const labelClass = isStyled ? styles("styled") : "";

	return (
		<div
			className={clsx(
				styles("checkbox-wrapper"),
				labelClass,
				className,
				value ? styles("selecetd") : "",
			)}>
			<input
				type={type}
				name={name}
				id={id}
				checked={value}
				onChange={handleChange}
				disabled={isDisabled}
			/>
			<label
				htmlFor={id}
				onFocus={onFocus}
				onBlur={onBlur}
				aria-label={ariaLabel}>
				<div
					ref={ref}
					className={clsx(styles("image-wrapper"), value ? styles("checked") : "")}
					tabIndex={tabIndex}
					name={name}
					data-value={value}
					aria-checked={value}
					aria-label={!ariaLabel && typeof label === "string" ? label : ariaLabel}
					role={role}>
					<div aria-hidden={true}>{styledImages}</div>
				</div>
				{props.children && props.children}

				<span
					className={clsx(
						styles("label"),
						isOutOfStock ? styles("disabled") : "",
						hideLabel ? "visually-hidden" : "",
					)}
					aria-label={ariaLabel}
					aria-hidden={true}>
					{label}
				</span>
				{isOutOfStock && (
					<span
						className={`${styles("label")} ${styles("out-of-stock")}`}
						tabIndex={0}>
						{outOfStockText}
					</span>
				)}
			</label>
			{showError ? <div className={styles("error-text")}>{errorMessage}</div> : ""}
		</div>
	);
});
Checkbox.displayName = "Checkbox";
export default Checkbox;
