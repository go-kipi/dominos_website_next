import clsx from "clsx";
import React from "react";
import styles from "./index.module.scss";

function FloatingActionButton(props) {
	const { className, onClick } = props;

	const handleOnClick = () => {
		typeof onClick === "function" && onClick();
	};
	return (
		<button
			onClick={handleOnClick}
			className={clsx(styles["floating-action-btn-wrapper"], className)}>
			{props.children}
		</button>
	);
}

export default FloatingActionButton;
