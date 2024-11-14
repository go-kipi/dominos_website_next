import React from "react";

import BackIcon from "/public/assets/icons/back-black.svg";
import CloseIcon from "/public/assets/icons/x-icon.svg";

import styles from "./Header.module.scss";

import STACK_TYPES from "../../../../../../constants/stack-types";
import useStack from "../../../../../../hooks/useStack";
import useTranslate from "hooks/useTranslate";

function Header(props) {
	const { animateOut, hideCloseIcon = false } = props;
	const [_, __, goBack] = useStack(STACK_TYPES.DELIVERY);
	const translate = useTranslate();

	function onCloseClick() {
		animateOut();
	}

	function onBackClick() {
		goBack();
	}

	return (
		<div className={styles["choose-address-form-list-header-wrapper"]}>
			<div className={styles["back-button-wrapper"]}>
				{!hideCloseIcon && (
					<button
						aria-label={"Back"}
						className={styles["icon-wrapper"]}
						onClick={onBackClick}>
						<img
							src={BackIcon.src}
							alt={""}
							className={styles["icon"]}
						/>
					</button>
				)}
			</div>
			<div className={styles["title-wrapper"]}>
				<h1
					className={styles["title"]}
					tabIndex={0}>
					{translate("deliveryPopup_choosingBranch_title")}
				</h1>
			</div>
			<div className={styles["x-close-icon-wrapper"]}>
				<button
					aria-label={"close"}
					className={styles["icon-wrapper"]}
					onClick={onCloseClick}>
					<img
						src={CloseIcon.src}
						alt={""}
						className={styles["icon"]}
					/>
				</button>
			</div>
		</div>
	);
}

export default Header;
