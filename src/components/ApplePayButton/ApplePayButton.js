import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "./index.module.scss";
import { useSelector } from "react-redux";

/* eslint-disable no-useless-computed-key */
const ApplePayButton = ({
	theme = "black",
	["aria-label"]: ariaLabel,
	children,
	...extraProps
}) => {
	const deviceState = useSelector((store) => store.deviceState);
	const height = deviceState.isTablet ? "70px" : "47px";
	return (
		<button
			style={{
				width: "83%",
				marginTop: "35px",
				minWidth: "240px",
				height: height,
				minHeight: "40px",
				"-webkit-appearance": "-apple-pay-button",
				"-apple-pay-button-type": "buy",
				"-apple-pay-button-style": theme,
			}}
			{...extraProps}
			aria-label={ariaLabel}></button>
	);
};
/* eslint-enable no-useless-computed-key */

ApplePayButton.propTypes = {
	theme: PropTypes.oneOf(["white", "black"]),
	"aria-label": PropTypes.string,
};

export default ApplePayButton;
