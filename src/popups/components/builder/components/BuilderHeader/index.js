import React, { useEffect } from "react";
import BackIcon from "/public/assets/icons/back.svg";
import CloseIcon from "/public/assets/icons/x-icon-white.svg";
import styles from "./index.module.scss";
import STACK_TYPES from "constants/stack-types";
import HeaderTabNavigator from "components/HeaderTabNavigator";
import useTranslate from "../../../../../hooks/useTranslate";

const BuilderHeader = (props) => {
	const {
		onClose = () => {},
		activeTab,
		isFirst = true,
		isEdit = false,
		onTabChange = () => {},
		name = STACK_TYPES.BUILDER,
		onLastTabReached = () => {},
		tabs = [],
		isFinished = false,
		onSubTabChange = () => {},
		goBack = () => {},
		showBackOnFirst = false,
		isSale,
		hideBack = false,
		editIndex,
	} = props;

	const translate = useTranslate();
	useEffect(() => {
		onSubTabChange(0);
	}, []);

	const handleGoBack = () => {
		if (isFirst) {
			return onClose();
		}
		goBack();
	};

	return (
		<div className={styles["builder-header-wrapper"]}>
			{((showBackOnFirst && isFirst) || !isFirst) && !hideBack ? (
				<button
					className={styles["icon-button"]}
					onClick={handleGoBack}
					aria-label={translate("accessibility_alt_arrowBack")}>
					<img
						src={BackIcon.src}
						alt={"back button"}
						aria-hidden={true}
						className={styles["back-btn"]}
					/>
				</button>
			) : (
				<div className={styles["icon-button"]} />
			)}

			<HeaderTabNavigator
				onTabChange={onTabChange}
				activeTab={activeTab}
				isBackButtonVisible={(showBackOnFirst && isFirst) || !isFirst}
				name={name}
				tabs={tabs}
				isEdit={isEdit}
				onLastTabReached={onLastTabReached}
				isFinished={isFinished}
				isSale={isSale}
				editIndex={editIndex}
			/>

			<button
				className={styles["icon-button"]}
				onClick={onClose}
				aria-label={translate("accessibility_aria_close")}>
				<img
					src={CloseIcon.src}
					alt={""}
					aria-hidden={true}
				/>
			</button>
		</div>
	);
};

export default BuilderHeader;
