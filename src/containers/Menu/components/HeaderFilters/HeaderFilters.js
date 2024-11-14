import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import useSetMenuPath from "hooks/useSetMenuPath";
import { META_ENUM } from "constants/menu-meta-tags";
import HeaderFilterItem from "../HeaderFilterItem/HeaderFilterItem";
import basic from "./HeaderFilters.module.scss";

import clsx from "clsx";
import { handleArrowLeftAndRight } from "components/accessibility/keyboardsEvents";
import { onArrows } from "components/accessibility/acfunctions";
import { notEmptyObject } from "utils/functions";
import useGetMenuData from "hooks/useGetMenuData";
import SlideRight from "components/SlideRight/SlideRight";
import { easings } from "@react-spring/web";
import SRContent from "../../../../components/accessibility/srcontent";
import useTranslate from "../../../../hooks/useTranslate";
import Actions from "redux/actions";

const INITIAL_ANIMATION = 500;

export default function HeaderFilters(props) {
	const digitalMenu = useGetMenuData({
		id: "digitalMenu",
		shouldUseMenus: true,
	});
	const menuPath = useSelector((store) => store.menuPath);
	const dispatch = useDispatch();
	const selectedMainId = menuPath[META_ENUM.MAIN_NAV];
	const promotionalAndOperationalPopups = useSelector(
		(store) => store.promoPopups,
	);
	const isInitialRender = useSelector((store) => store.isInitialRender);
	const [renderAnimation, setRenderAnimation] = useState(false);
	const hasPopups = !!promotionalAndOperationalPopups.length;

	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();

	const refTabs = useRef();

	const setPath = useSetMenuPath();
	const hasElements = digitalMenu && notEmptyObject(digitalMenu);

	useEffect(() => {
		if (selectedMainId) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [selectedMainId]);

	const handleChangeSelected = (index) => {
		setPath(index);
	};

	const handleKeyboardEvents = (clickedKeys) => {
		onArrows(clickedKeys, refTabs);
	};

	const handleAnimateDown = () => {
		dispatch(Actions.setIsInitialRender(false));
	};

	const findAcriveFilter = () => {
		return (
			digitalMenu?.elements?.filter((e) => e.id === selectedMainId)?.[0]?.label ??
			""
		);
	};

	function renderContent(isDekstop) {
		const activeFilter = findAcriveFilter();
		const activeCategoryText = translate(
			"accessibility_menuPage_activeCategory",
		).replace("{category}", activeFilter);
		const hasCategory = activeFilter !== "";

		return (
			<div className={basic["header-filters"]}>
				{hasCategory && (
					<SRContent
						role={"alert"}
						ariaLive={"polite"}
						message={activeCategoryText}
					/>
				)}
				<div
					role={"tablist"}
					ref={refTabs}
					className={basic["header-filters-wrapper"]}
					onKeyDown={(event) => {
						handleArrowLeftAndRight(event, handleKeyboardEvents);
					}}>
					{hasElements &&
						digitalMenu?.elements.map((filter, idx) => (
							<HeaderFilterItem
								key={`_${filter.id}`}
								id={filter.id}
								handleChangeSelected={handleChangeSelected}
								isSelected={selectedMainId === filter.id}
								text={filter.label}
								showSelected={isDekstop || (!isDekstop && !isInitialRender)}
								role={"tab"}
								renderAnimation={renderAnimation}
							/>
						))}
				</div>
			</div>
		);
	}

	useEffect(() => {
		if (promotionalAndOperationalPopups.length === 0) {
			setRenderAnimation(true);
		}
	}, [promotionalAndOperationalPopups.length]);

	if (deviceState.isMobile) {
		const activeFilter = findAcriveFilter();
		return (
			<div className={clsx(basic["header-filters-container"])}>
				{isInitialRender && (
					<SlideRight
						styleConfig={{
							duration: 2000,
							mass: 100,
							easing: easings.easeInOutElastic,
							friction: 100,
							tension: 240,
						}}
						offset={window.innerWidth}
						delay={100}
						onAnimationEnd={handleAnimateDown}>
						<div className={clsx(basic["initial-filter-animaition"])}>
							{/* explain in the css file. */}
							{activeFilter}
						</div>
					</SlideRight>
				)}
				{renderContent(false)}
			</div>
		);
	} else {
		return (
			<div className={clsx(basic["header-filters-container"])}>
				{renderContent(true)}
			</div>
		);
	}
}
