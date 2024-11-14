import clsx from "clsx";
import React from "react";

import styles from "./BitButton.module.scss";

import BitIcon from "/public/assets/icons/payment/bit-icon.svg";

const BitStyledButton = ({ onClick, className }) => {
	return (
		<button
			className={clsx(styles["bit-btn"], className)}
			onClick={onClick}>
			<img src={BitIcon.src} />
		</button>
	);
};

export default BitStyledButton;
