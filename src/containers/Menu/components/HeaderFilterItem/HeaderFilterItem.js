import clsx from "clsx";
import React from "react";

import styles from "./HeaderFilterItem.module.scss";
import useGetMenuData from "hooks/useGetMenuData";
import SlideRight from "components/SlideRight/SlideRight";
import { easings } from "@react-spring/web";
export default function HeaderFilterItem(props) {
	const {
		isSelected = false,
		handleChangeSelected,
		text,
		id,
		role = "",
		showSelected = true,
	} = props;
	const menu = useGetMenuData({ id: id });

	const handleOnClick = () => {
		typeof handleChangeSelected === "function" && handleChangeSelected(id);
	};
	function buttonContent() {
		return (
			<button
				id={id}
				onClick={handleOnClick}
				className={clsx(
					styles["header-filter-wrapper"],
					showSelected
						? isSelected
							? styles["filter-selected"]
							: ""
						: isSelected
						? styles["filter-selected-transperent"]
						: "",
				)}
				aria-selected={isSelected}
				role={role}>
				<h2
					className={clsx(
						isSelected
							? styles["header-filter-selected-text"]
							: styles["header-filter-text"],
					)}>
					{menu?.nameUseCases?.name ?? text}
				</h2>
			</button>
		);
	}

	return buttonContent();
}
