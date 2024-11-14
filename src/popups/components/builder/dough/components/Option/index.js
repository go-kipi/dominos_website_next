import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { useSelector } from "react-redux";
import { getMobileOperatingSystem, relativeSize } from "utils/functions";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
const Option = (props) => {
	const {
		image,
		text,
		id,
		productId,
		height,
		index,
		flip = false,
		selected = false,
		isVisible = false,
		onSelect = () => {},
		onAnimationDone = () => {},
		fold = false,
		role = "",
		ariaLabel = "",
	} = props;
	const os = getMobileOperatingSystem();
	const isIOS = os === "iOS";
	const deviceState = useSelector((store) => store.deviceState);
	const [localBottom, setLocalBottom] = useState(height / 2);
	const isLaptop = deviceState.isLaptop;
	const pizza = useMenus(productId, ActionTypes.PRODUCT);
	const isOutOfStock = pizza.outOfStock;

	useEffect(() => {
		if (fold) {
			handleClose();
		} else if (isVisible) {
			const res =
				height +
				relativeSize(isIOS ? 25 : 15) +
				relativeSize(isLaptop ? 75 : 70) * index;
			setLocalBottom(res);
		}
	}, [fold, height, isVisible]);

	const handleClose = () => {
		setLocalBottom(height / 2);
		setTimeout(() => {
			// Wait for animation to end in order to hide modal
			onAnimationDone();
		}, 200);
	};

	const handleSelect = () => {
		onSelect(id);
	};

	const selectedClass = selected ? styles["selected"] : "";
	const flipClassName = flip ? styles["flip"] : "";
	const notInStock = isOutOfStock ? styles["disabled"] : "";
	return (
		<button
			className={`${styles["dough-option-wrapper"]} ${selectedClass} ${flipClassName} ${notInStock}`}
			role={role}
			aria-checked={selected}
			aria-label={ariaLabel}
			style={{
				bottom: localBottom,
			}}
			onClick={handleSelect}>
			<div className={styles["image-wrapper"]}>
				<img
					src={image}
					alt="/"
					className={styles["image"]}
				/>
			</div>
			<div className={styles["text"]}>{text}</div>
		</button>
	);
};

export default Option;
