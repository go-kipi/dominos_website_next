import React, { useEffect, useRef } from "react";

import LottieAnimation from "components/LottieAnimation";

import styles from "./AddressTypeBlock.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";

function AddressTypeBlock(props) {
	const { lottie, text, isSelected, onClick, index, setCurrentImagePosition } =
		props;
	const imageRef = useRef(null);
	const animationRef = useRef();
	const translate = useTranslate();
	const defaultOptions = {
		loop: false,
		autoplay: true,
		animation: lottie,
	};

	function onClickHandler() {
		if (imageRef.current) {
			const rect = imageRef.current.getBoundingClientRect();
			setCurrentImagePosition(rect);
		}

		onClick(index);
	}

	return (
		<button
			onClick={onClickHandler}
			className={clsx(
				styles["address-type-block-wrapper"],
				isSelected ? styles["selected"] : "",
			)}
			aria-label={`${translate("accessibility_addressType_deliveryTo")}${text}`}>
			<div
				className={styles["animation-wrapper"]}
				ref={imageRef}>
				<LottieAnimation
					{...defaultOptions}
					ref={animationRef}
				/>
			</div>
			<span className={styles["text"]}>{text}</span>
		</button>
	);
}

export default AddressTypeBlock;
