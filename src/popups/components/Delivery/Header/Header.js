import React, { useRef, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import Actions from "redux/actions";
import LanguageDirectionService from "services/LanguageDirectionService";

import styles from "./Header.module.scss";
import useTranslate from "hooks/useTranslate";
import { handleArrowLeftAndRight } from "components/accessibility/keyboardsEvents";

const startingPointEnum = {
	PICKUP: {
		RTL: "start",
		NOT_RTL: "end",
	},
	DELIVERY: {
		RTL: "end",
		NOT_RTL: "start",
	},
};

const pickupEnum = {
	PICKUP: "PICKUP",
	DELIVERY: "DELIVERY",
};

const rtlEnum = {
	RTL: "RTL",
	NOT_RTL: "NOT_RTL",
};

export default function Header() {
	const order = useSelector((store) => store.order);
	const isrtl = LanguageDirectionService.isRTL();
	const { isPickup } = order;
	const translate = useTranslate();
	const tabsRef = useRef();

	const startingPoint =
		startingPointEnum[isPickup ? pickupEnum.PICKUP : pickupEnum.DELIVERY][
			isrtl ? rtlEnum.RTL : rtlEnum.NOT_RTL
		];

	const [linePosition, setLinePosition] = useState(startingPoint);
	const dispatch = useDispatch();

	function deliveryButtonClick() {
		dispatch(Actions.updateOrder({ isPickup: false }));
		setLinePosition(isrtl ? "end" : "start");
	}

	function pickupButtonClick() {
		dispatch(Actions.updateOrder({ isPickup: true }));
		setLinePosition(isrtl ? "start" : "end");
	}

	const pickupClassName = isPickup ? styles["active"] : "";
	const deliveryClassName = !isPickup ? styles["active"] : "";

	const handleKeyboardArrows = () => {
		if (isPickup) {
			dispatch(Actions.updateOrder({ isPickup: false }));
			setLinePosition(isrtl ? "end" : "start");
			tabsRef.current.children[0].focus();
		} else {
			dispatch(Actions.updateOrder({ isPickup: true }));
			setLinePosition(isrtl ? "start" : "end");
			tabsRef.current.children[1].focus();
		}
	};

	const handleFilterKeyboard = (event) => {
		handleArrowLeftAndRight(event, () => handleKeyboardArrows());
	};

	return (
		<div className={styles["delivery-header-wrapper"]}>
			<div
				ref={tabsRef}
				className={styles["header"]}
				role={"tablist"}
				onKeyDown={(event) => handleFilterKeyboard(event)}>
				<button
					className={`${styles["header-item"]} ${deliveryClassName}`}
					onClick={deliveryButtonClick}
					role={"tab"}
					aria-selected={!isPickup}
					aria-label={translate("delivery_label")}>
					<span className={styles["header-item-text"]}>
						{translate("delivery_label")}
					</span>
				</button>
				<button
					className={`${styles["header-item"]} ${pickupClassName}`}
					onClick={pickupButtonClick}
					role={"tab"}
					aria-selected={isPickup}
					aria-label={translate("pickup_label")}>
					<span className={styles["header-item-text"]}>
						{translate("pickup_label")}
					</span>
				</button>
				<div className={`${styles["header-line"]} ${styles[linePosition]}`} />
			</div>
		</div>
	);
}
