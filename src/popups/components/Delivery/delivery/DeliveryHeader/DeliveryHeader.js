import React from "react";
import { animated, useSpring } from "@react-spring/web";

import BackIcon from "/public/assets/icons/back-black.svg";
import CloseIcon from "/public/assets/icons/x-icon.svg";

import basic from "./DeliveryHeader.module.scss";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import useTranslate from "hooks/useTranslate";
import { createAccessibilityText } from "../../../../../components/accessibility/acfunctions";
import { TAB_INDEX_HIDDEN } from "../../../../../constants/accessibility-types";
import Actions from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
function DeliveryHeader(props) {
	const {
		animateOut,
		address,
		didAnimateAddress,
		onBackPressHandler = null,
		hideCloseIcon = false,
	} = props;
	const [_, __, goBack] = useStack(STACK_TYPES.DELIVERY);
	const translate = useTranslate();
	const dispatch = useDispatch();
	const temporarilyNotKosher = useSelector(
		(store) => store.generalData.temporarilyNotKosher,
	);

	const styles = useSpring({
		to: { y: 0 },
		from: { y: 500 },
	});

	function onCloseClick() {
		if (temporarilyNotKosher) {
			dispatch(Actions.setTemporarilyNotKosher(false));
		}
		animateOut();
	}

	function onBackClick() {
		if (onBackPressHandler) {
			onBackPressHandler();
		} else {
			goBack();
		}
	}

	function onTitleClick() {
		goBack();
	}
	return (
		<div className={basic["second-delivery-header-wrapper"]}>
			<div className={basic["back-button-wrapper"]}>
				{!hideCloseIcon && (
					<button
						className={basic["icon-wrapper"]}
						aria-label={translate("accessibility_alt_arrowBack")}
						onClick={onBackClick}>
						<img
							src={BackIcon.src}
							alt={""}
							className={basic["icon"]}
						/>
					</button>
				)}
			</div>
			<div
				className={basic["title-wrapper"]}
				tabIndex={TAB_INDEX_HIDDEN}>
				{!address && (
					<span className={basic["title"]}>
						{translate("deliveryPopup_delivery_chooseBranch_HeaderTitle")}
					</span>
				)}
				{address && (
					<animated.div
						className={basic["address-wrapper"]}
						style={didAnimateAddress ? styles : {}}
						onClick={onTitleClick}>
						<span className={basic["address"]}>{address}</span>
					</animated.div>
				)}
			</div>
			<div className={basic["x-close-icon-wrapper"]}>
				<button
					className={basic["icon-wrapper"]}
					onClick={onCloseClick}
					aria-label={translate("accessibility_alt_close")}>
					<img
						src={CloseIcon.src}
						alt={""}
						className={basic["icon"]}
					/>
				</button>
			</div>
		</div>
	);
}

export default DeliveryHeader;
