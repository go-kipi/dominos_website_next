import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { TransitionGroup, CSSTransition } from "react-transition-group";

import UpsaleBG from "/public/assets/menu/mobile-background.png";

import styles from "./UpSalePopup.module.scss";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import { UP_SALE_SCREEN_TYPES } from "constants/upSaleScreenTypes";
import RenderUpSale from "./RenderUpSale/RenderUpSale";
import LanguageDirectionService from "services/LanguageDirectionService";
import Api from "api/requests";
import useGetMenuData from "hooks/useGetMenuData";
import BuilderPopup from "../builder";
import FullScreenPopup from "../../Presets/FullScreenPopup";
import { META_ENUM } from "constants/menu-meta-tags";
import Actions from "redux/actions";
import { notEmptyObject } from "utils/functions";

function UpSalePopup(props) {
	const ref = useRef();
	const dispatch = useDispatch();
	const [currentScreen, setStack] = useStack(STACK_TYPES.UPSALE);
	const showBackgroundWithGradient =
		currentScreen.type === UP_SALE_SCREEN_TYPES.UP_SALE;

	const [currentIndex, setCurrentIndex] = useState(0);

	const [currentMeta, setCurrentMeta] = useState("");
	const defaultMenus = useSelector(
		(store) => store.globalParams.DefaultMenus.result,
	);
	const upsales = useGetMenuData({ id: defaultMenus.upsales });

	const hasElements =
		upsales && upsales.elements && notEmptyObject(upsales.elements);

	useEffect(() => {
		setStack({ type: UP_SALE_SCREEN_TYPES.UP_SALE, params: {} });
	}, []);

	function proceed() {
		if (upsales.elements.length - 1 === currentIndex) {
			onFinishUpsale();
		} else {
			setCurrentIndex((prevState) => {
				return prevState + 1;
			});
		}
	}

	function closeBuilder() {
		if (currentMeta === META_ENUM.ONE_UP_SALE) {
			proceed();
		}
		setStack({ type: UP_SALE_SCREEN_TYPES.UP_SALE, params: {} });
	}
	function onFinishUpsale() {
		ref.current?.animateOut(onFinish);

		function onFinish() {
			dispatch(Actions.updateOrder({ isShownedUpSales: true }));
			typeof props.payload.onFinish === "function" && props.payload.onFinish();
		}
	}

	function RenderPopup() {
		switch (currentScreen.type) {
			case UP_SALE_SCREEN_TYPES.UP_SALE:
				return (
					<CSSTransition
						key={"component-up-sale" + UP_SALE_SCREEN_TYPES.UP_SALE}
						timeout={300}
						classNames={
							LanguageDirectionService.isRTL()
								? styles["slide-right"]
								: styles["slide-left"]
						}>
						<RenderUpSale
							animateOut={onFinishUpsale}
							setStack={setStack}
							upsales={upsales}
							hasElements={hasElements}
							currentIndex={currentIndex}
							proceed={proceed}
							setCurrentMeta={setCurrentMeta}
							currentMeta={currentMeta}
						/>
					</CSSTransition>
				);
			case UP_SALE_SCREEN_TYPES.BUILDER:
				return (
					<CSSTransition
						key={"component-up-sale-" + UP_SALE_SCREEN_TYPES.BUILDER}
						timeout={300}
						classNames={
							LanguageDirectionService.isRTL()
								? styles["slide-right"]
								: styles["slide-left"]
						}>
						<BuilderPopup
							animateOut={onFinishUpsale}
							payload={currentScreen.params}
							closeBuilder={closeBuilder}
						/>
					</CSSTransition>
				);
			default:
				return (
					<div
						className={"visually-hidden"}
						tabIndex={0}
					/>
				); // require for focus trap;
		}
	}

	if (!currentScreen.type) {
		return (
			<div
				className={"visually-hidden"}
				tabIndex={0}
			/>
		); // require for focus trap;
	}

	return (
		<FullScreenPopup
			id={props.id}
			ref={ref}
			className={styles["up-sale-popup"]}
			background={UpsaleBG}
			gradient={showBackgroundWithGradient}>
			<TransitionGroup className={styles["transition-wrapper-bundle-up-sale"]}>
				{RenderPopup()}
			</TransitionGroup>
		</FullScreenPopup>
	);
}

export default UpSalePopup;
