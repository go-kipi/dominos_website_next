import React from "react";
import AddIcon from "/public/assets/icons/plus.svg";

import styles from "./index.module.scss";
import clsx from "clsx";
const AddItem = (props) => {
	const { className, text, onClick } = props;

	return (
		<button
			aria-label={text}
			className={clsx(styles["add-item-wrap"], className)}
			onClick={() => onClick()}>
			<div className={styles["add-item-inner"]}>
				<div className={styles["icon-wrap"]}>
					<img
						className={styles["icon"]}
						src={AddIcon.src}
						alt={"add"}
						aria-hidden={true}
					/>
				</div>
				<span className={styles["text"]}>{text}</span>
			</div>
		</button>
	);
};

export default AddItem;
