import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as popupTypes from "constants/popup-types";

import styles from "./MenuFilters.module.scss";
import { META_ENUM } from "constants/menu-meta-tags";
import { notEmptyObject } from "utils/functions";
import useGetMenuByMeta from "hooks/useGetMenuByMeta";
import clsx from "clsx";
import Actions from "redux/actions";
import useTranslate from "../../../../hooks/useTranslate";
import { Player } from "@lottiefiles/react-lottie-player";
import deviceState from "utils/device_state";
import useUpdateEffect from "hooks/useUpdateEffect";
import animationTypes from "constants/animationTypes";

const fabLotties = {
	open: {
		he: require("../../../../animations/fab/fab-open-he.json"),
		enUS: require("../../../../animations/fab/fab-open-en.json"),
	},
	fold: {
		he: require("../../../../animations/fab/fab-fold-he.json"),
		enUS: require("../../../../animations/fab/fab-fold-en.json"),
	},
	close: {
		he: require("../../../../animations/fab/fab-close-he.json"),
		enUS: require("../../../../animations/fab/fab-close-en.json"),
	},
};

const animationsTypes = {
	OPEN: "open",
	FOLD: "fold",
	CLOSE: "close",
};

const fadeStyle = {
	OPEN: "open",
	CLOSE: "close",
	FULL_CLOSE: "full-close",
};

function MenuFilters({
	setFadeAnimation,
	fixBottom,
	isScrolled = false,
	onResetScroll,
}) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const menuPath = useSelector((store) => store.menuPath);
	const deviceState = useSelector((store) => store.deviceState);

	const openFabRef = useRef();
	const closeFabRef = useRef();
	const foldFabRef = useRef();

	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const hasElements = topNav && notEmptyObject(topNav);
	const hasMoreThanOneElement = hasElements && topNav.elements.length > 1;
	const lang = useSelector((store) => store.generalData.lang);
	const currentStyle = useRef(null);

	const [animationState, setAnimationState] = useState(null);
	const [isFabOpen, setisFabOpen] = useState(false);
	const [direction, setDirection] = useState(-1);

	const hasChanges = topNavId !== topNav?.defaultElement;

	function openFiltersPopup() {
		dispatch(
			Actions.addPopup({
				type: popupTypes.MENU_FILTERS,
				payload: { setFadeAnimation },
			}),
		);
	}

	useEffect(() => {
		if (hasMoreThanOneElement) {
			currentStyle.current = animationsTypes.OPEN;
			onOpenAnimation();
		} else {
			if (animationState === animationsTypes.OPEN) {
				currentStyle.current = fadeStyle.FULL_CLOSE;
				setAnimationState(animationsTypes.FOLD);
			} else {
				currentStyle.current = fadeStyle.CLOSE;
				setAnimationState(animationsTypes.CLOSE);
			}
		}

		return () => {
			resetState(null);
		};
	}, [hasMoreThanOneElement]);

	useUpdateEffect(() => {
		if (foldFabRef.current) {
			foldFabRef.current.setDirection(direction);
			foldFabRef.current.play();
		}
	}, [direction]);

	useUpdateEffect(() => {
		if (!hasMoreThanOneElement) return;
		setAnimationState(animationsTypes.FOLD);
		setDirection(isScrolled ? 1 : -1);
	}, [isScrolled]);

	const resetState = () => {
		setAnimationState(null);
		onResetScroll();
		setisFabOpen(false);
	};

	function onOpenAnimation() {
		setAnimationState(animationsTypes.OPEN);

		const animationTimeout = setTimeout(() => {
			openFabRef?.current?.play();
			clearTimeout(animationTimeout);
		}, 500);
	}

	function RenderOpenAnimation() {
		const onOpenAnimationFinish = () => {
			setisFabOpen(true);
		};

		return (
			<Player
				lottieRef={(instance) => {
					if (openFabRef) {
						openFabRef.current = instance;
					}
				}}
				autoplay={false}
				src={fabLotties.open[lang]}
				keepLastFrame={true}
				speed={1.5}
				onEvent={(ev) => {
					if (ev === "complete") {
						onOpenAnimationFinish();
					}
				}}
			/>
		);
	}

	function RenderFoldAnimation() {
		const onFoldAnimationFinish = () => {
			if (!hasMoreThanOneElement) {
				setAnimationState(animationsTypes.CLOSE);
			}
		};

		return (
			<Player
				lottieRef={(instance) => {
					if (foldFabRef) {
						foldFabRef.current = instance;
					}
				}}
				src={fabLotties.fold[lang]}
				autoplay
				speed={1.6}
				keepLastFrame={true}
				onEvent={(ev) => {
					if (ev === "complete") {
						onFoldAnimationFinish();
					}
				}}
			/>
		);
	}

	function RenderCloseAnimation() {
		return (
			<Player
				lottieRef={(instance) => {
					if (closeFabRef) {
						closeFabRef.current = instance;
					}
				}}
				src={fabLotties.close[lang]}
				speed={0.6}
				autoplay
				keepLastFrame={true}
			/>
		);
	}

	function RenderAnimation() {
		if (animationState === animationsTypes.OPEN) {
			return RenderOpenAnimation();
		} else if (animationState === animationsTypes.FOLD) {
			return RenderFoldAnimation();
		} else if (animationState === animationsTypes.CLOSE) {
			return RenderCloseAnimation();
		} else {
			return null;
		}
	}

	function getAnimationStyle() {
		switch (currentStyle.current) {
			case fadeStyle.OPEN:
				return styles["open"];
			case fadeStyle.FULL_CLOSE:
				return styles["full-close"];
			case fadeStyle.CLOSE:
				return styles["close"];
		}
	}

	return (
		<button
			aria-label={translate("accessibility_menuPage_filtersButton")}
			onClick={openFiltersPopup}
			className={clsx(
				styles["menu-filters-wrapper"],
				getAnimationStyle(),
				!deviceState.isDesktop && fixBottom && styles["fix-bottom"],
			)}>
			<div className={styles["icon-wrapper"]}>{RenderAnimation()}</div>
			{hasChanges && (
				<div
					className={clsx(
						styles["has-changes"],
						isFabOpen ? styles["shown-has-changes"] : "",
						isScrolled && styles["fold-has-changes"],
					)}
				/>
			)}
		</button>
	);
}

export default MenuFilters;
