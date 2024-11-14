import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { isPizzaItem, relativeSize } from "../../utils/functions";
import { useSelector } from "react-redux";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";

const HeaderTabNavigator = (props) => {
	const {
		tabs = [],
		activeTab = 0,
		name = "",
		onTabChange = () => {},
		onLastTabReached = () => {},
		isBackButtonVisible = false,
		isFinished = false,
		isEdit = false,
		isSale = true,
		editIndex = false,
	} = props;
	const stackState = useSelector((store) => store.stackState[name]);
	const deviceState = useSelector((store) => store.deviceState);
	const lang = useSelector((store) => store.generalData.lang);
	const cartItem = useSelector((store) => store.cartItem);
	const [offset, setOffset] = useState(0);
	const [isMounted, setIsMounted] = useState(false);
	const translate = useTranslate();

	useEffect(() => {
		if (activeTab <= tabs.length - 1) {
			if (tabs.length - 1 === activeTab) {
				onLastTabReached();
			}

			const ele = document.getElementById(
				`${tabs[activeTab]?.title.replace(" ", "-")}-${activeTab}`,
			);

			if (ele) {
				ele.scrollIntoView();
				const offsetLeft = ele?.offsetLeft;
				const width = ele?.clientWidth;
				if (offsetLeft !== undefined && width !== undefined) {
					setOffset(offsetLeft + width / 2 - getIndicatorSize(deviceState));
				}
			}
		}
	}, [activeTab, deviceState, tabs]);

	useEffect(() => {
		let timeout = setTimeout(() => {
			if (!isSale) {
				setIsMounted(true);
			}
		}, 350);
		return () => timeout && clearTimeout(timeout);
	}, []);

	if (!isSale && isMounted && isEdit && !isPizzaItem(cartItem)) {
		return (
			<span
				className={clsx(
					styles["title"],
					isBackButtonVisible ? styles["back-showing"] : "",
				)}>
				{tabs?.nameUseCases?.Title}
			</span>
		);
	}

	if (!isSale && isMounted) {
		return (
			<span
				className={clsx(
					styles["title"],
					isBackButtonVisible ? styles["back-showing"] : "",
				)}>
				{translate("builderModal_sizeBuilderTitle")}
			</span>
		);
	}

	function renderTab() {
		if (isEdit) {
			const item = tabs[editIndex];
			return (
				<Tab
					key={`tab-item-${editIndex}`}
					selected={true}
					id={`${item.title.replace(" ", "-")}-${editIndex}`}
					text={item?.nameUseCases?.[lang] ?? item.title}
					role={"tab"}
				/>
			);
		} else {
			return tabs.map((item, idx) => {
				const isTabDisabled =
					(stackState?.length - 1 < idx || isFinished) && !isEdit;
				return (
					<Tab
						key={`tab-item-${idx}`}
						selected={activeTab === idx}
						onClick={onTabChange.bind(this, idx)}
						id={`${item.title.replace(" ", "-")}-${idx}`}
						text={item?.nameUseCases?.[lang] ?? item.title}
						disabled={isTabDisabled}
						role={"tab"}
					/>
				);
			});
		}
	}

	return (
		<div className={styles["header-tab-navigator-wrapper"]}>
			<div
				className={styles["tabs-wrapper"]}
				role={"tablist"}>
				{tabs.length && renderTab()}
				{!isFinished && (
					<span
						className={styles["indicator"]}
						style={{ left: offset }}
					/>
				)}
			</div>
		</div>
	);
};

export default HeaderTabNavigator;

const getIndicatorSize = (deviceState) => {
	if (deviceState.isMobile) {
		return relativeSize(15.5);
	}
	if (deviceState.isTablet) {
		return relativeSize(15.5);
	}
	if (deviceState.isDesktopMax) {
		return relativeSize(25, 1920);
	}
	if (deviceState.isDesktopLarge) {
		return relativeSize(25, 1500);
	}
	return relativeSize(25, 1280);
};

const Tab = (props) => {
	const {
		text,
		id,
		onClick = () => {},
		selected = false,
		disabled = false,
		role = "",
	} = props;
	const selectedClassName = selected ? styles["selected"] : "";
	return (
		<button
			className={clsx(styles["tab-wrapper"], selectedClassName)}
			onClick={onClick}
			id={id}
			disabled={disabled}
			role={role}>
			{text}
		</button>
	);
};
