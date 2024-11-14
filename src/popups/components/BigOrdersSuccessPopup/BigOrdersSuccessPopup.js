"use client";

import React, { useRef } from "react";

import styles from "./BigOrdersSuccessPopup.module.scss";
import SlidePopup from "popups/Presets/SlidePopup";
import BigOrdersSuccess from "components/BigOrdersSuccess/BigOrdersSuccess";

function BigOrdersSuccessPopup(props) {
	const ref = useRef();
	const handleClick = () => {
		ref.current?.animateOut();
	};
	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={styles["big-orders-success"]}>
			<BigOrdersSuccess onCloseClick={handleClick} />
		</SlidePopup>
	);
}

export default BigOrdersSuccessPopup;
