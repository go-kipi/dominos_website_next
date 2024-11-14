import React, { useEffect, useState } from "react";

import styles from "./TabSelector.module.scss";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { relativeSize } from "utils/functions";

function TabSelector({
	tabs = [],
	selectedTab = "",
	onTabChange = (id) => {},
}) {
	const deviceState = useSelector((store) => store.deviceState);
	const [offset, setOffset] = useState(0);

	useEffect(() => {
		if (selectedTab) {
			const ele = document.getElementById(`tab-${selectedTab}`);
			if (ele) {
				const offsetLeft = ele?.offsetLeft;
				const width = ele?.clientWidth;
				if (offsetLeft !== undefined && width !== undefined) {
					setOffset(offsetLeft + width / 2 - getIndicatorSize(deviceState));
				}
			}
		}
	}, [selectedTab, deviceState]);

	return (
		<div className={styles["wrapper"]}>
			<div
				className={styles["tabs-wrapper"]}
				role={"tablist"}>
				{tabs.map((item, index) => {
					return (
						<Tab
							key={"tab-item-" + index}
							text={item.label}
							isSelected={selectedTab === item.id}
							onClick={onTabChange}
							id={item.id}
						/>
					);
				})}
				<span
					className={styles["indicator"]}
					style={{ left: offset }}
				/>
			</div>
		</div>
	);
}

export default TabSelector;

function Tab({ text, isSelected, id, onClick }) {
	return (
		<button
			id={"tab-" + id}
			className={clsx(styles["tab"], isSelected ? styles["selected"] : "")}
			onClick={() => onClick(id)}>
			{text}
		</button>
	);
}

const getIndicatorSize = (deviceState) => {
	if (deviceState.isMobile) {
		return relativeSize(15.5);
	}
	if (deviceState.isTablet) {
		return relativeSize(15.5);
	}
	if (deviceState.isDesktopMax) {
		return relativeSize(15.5, 1920);
	}
	if (deviceState.isDesktopLarge) {
		return relativeSize(15.5, 1500);
	}
	return relativeSize(15.5, 1280);
};
