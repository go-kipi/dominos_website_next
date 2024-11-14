import BlurPopup from "popups/Presets/BlurPopup";
import styles from "./MenuFiltersPopup.module.scss";

import { useEffect, useRef, useState } from "react";
import useTranslate from "hooks/useTranslate";
import useSetMenuPath from "hooks/useSetMenuPath";
import clsx from "clsx";
import useGetMenuByMeta from "hooks/useGetMenuByMeta";
import { getFullMediaUrl, notEmptyObject } from "utils/functions";
import { META_ENUM } from "constants/menu-meta-tags";
import { useSelector } from "react-redux";

import FullCheckbox from "/public/assets/icons/full-radio.svg";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";

function MenuFiltersPopup(props) {
	const ref = useRef();
	const menus = useSelector((store) => store.menusData.menus);
	const mainMenu = useSelector(
		(store) => store.globalParams.DefaultMenus.result.main,
	);
	const { setFadeAnimation } = props.payload;
	const translate = useTranslate();

	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const hasElements = topNav && notEmptyObject(topNav);
	const menuPath = useSelector((store) => store.menuPath);

	const selectedId = menuPath[META_ENUM.TOP_NAV];

	const [tabId, setTabId] = useState(selectedId);

	const animateOut = () => {
		ref.current.animateOut();
	};
	const topNavId = topNav?.id;
	const topNavItem = menus[mainMenu]?.elements?.find((t) => t.id === topNavId);

	const image = getFullMediaUrl(
		topNavItem,
		MEDIA_TYPES.MENU,
		MEDIA_ENUM.SELECTED_MOBILE,
	);

	useEffect(() => {
		if (selectedId) {
			setTabId(selectedId);
		}
	}, []);

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			showCloseIcon
			className={styles["menu-filters-popup"]}>
			<div className={styles["content"]}>
				<div className={styles["icon-wrapper"]}>
					<img src={image} />
				</div>
				<span
					className={styles["title"]}
					tabIndex={0}>
					{translate("mennFiltersPopup_title")}
				</span>

				<div className={styles["menu-filters-rows"]}>
					{hasElements &&
						topNav?.elements.map((filter, idx) => {
							const length = topNav.elements.length;
							const isLastIndex = idx === length - 1;

							return (
								<MenuFilter
									setFadeAnimation={setFadeAnimation}
									key={"menu-filter" + idx}
									id={filter.id}
									text={filter.label}
									closePopup={animateOut}
									isLastIndex={isLastIndex}
									selectedId={tabId}
									setTabId={setTabId}
								/>
							);
						})}
				</div>
			</div>
		</BlurPopup>
	);
}

export default MenuFiltersPopup;

function MenuFilter({
	id,
	isLastIndex,
	text,
	closePopup,
	selectedId,
	setTabId,
	setFadeAnimation,
}) {
	const setPath = useSetMenuPath();

	function onClick() {
		if (selectedId === id) {
			closePopup();
		} else {
			setTabId(id);
			window.scrollTo({ top: 0, behavior: "smooth" });
			setFadeAnimation(true);
			setTimeout(() => {
				setPath(id);
				closePopup();
			}, 500);
		}
	}

	const isSelected = selectedId === id;

	return (
		<button
			className={clsx(
				styles["menu-filter-row"],
				isLastIndex ? styles["hide-border"] : "",
			)}
			onClick={onClick}>
			{text}

			{!!isSelected && (
				<div className={styles["radio-wrapper"]}>
					<img src={FullCheckbox.src} />
				</div>
			)}
		</button>
	);
}
