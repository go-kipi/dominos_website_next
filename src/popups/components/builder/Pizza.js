import clsx from "clsx";
import { MEDIA_ENUM } from "constants/media-enum";
import { MEDIA_TYPES } from "constants/media-types";
import { META_ENUM } from "constants/menu-meta-tags";
import useTranslate from "hooks/useTranslate";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import {
	getFullMediaUrl,
	getisSqurePizza,
	getPizzaImageByMeta,
	getPizzaToppingTypeByMeta,
	isSqurePizza,
	notEmptyObject,
	VibrateDevice,
} from "utils/functions";
import Topping from "./Topping";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import LottieAnimation from "components/LottieAnimation";
import CheesyCrustLottie from "animations/cheesy-crust-anim.json";
import CheesyCrustLottieReverse from "animations/cheesy-crust-anim-rev.json";

export const LOTTIE_ANIMATIONS = {
	CHESSYCRUST_IN: "CHESSYCRUST_IN",
	CHESSYCRUST_OUT: "CHESSYCRUST_OUT",
};

const PizzaRef = (props, ref) => {
	const {
		showTutorial = false,
		isOver = false,
		overlayClassName = "",
		coverages = {},
		styles = {},
		extraStyles = {},
		isAnimatedCoverage = false,
		isAllowedQuarters = true,
		pizzaId = "",
		lottie = null,
	} = props;
	const pizza = useMenus(pizzaId, ActionTypes.PRODUCT);

	const initialPizzaImg = getPizzaImageByMeta(pizza.meta);
	const toppingsType = getPizzaToppingTypeByMeta(pizza.meta);
	const dispatch = useDispatch();
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const translate = useTranslate();
	const hasShownTutorial = useSelector((store) => store.hasShownTutorial);
	const hasShownTutorialRef = useRef(hasShownTutorial);
	const [isTutorialActive, setIsTutorialActive] = useState(false);
	const [pizzaImg, setPizzaImg] = useState(initialPizzaImg || undefined);

	useEffect(() => {
		if (showTutorial) {
			dispatch(Actions.setHasShownTutorial(true));
		}
		return () => dispatch(Actions.setHasShownTutorial(false));
	}, [showTutorial]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setPizzaImg(initialPizzaImg);
		}, 1000);

		return () => clearTimeout(timer);
	}, [pizzaImg, pizza]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsTutorialActive(true);
		}, 100);
		return () => {
			timer && clearTimeout(timer);
		};
	}, []);

	useEffect(() => {
		if (overlayClassName) {
			VibrateDevice(200);
		}
	}, [overlayClassName]);

	const extraPizzaStyles = (className) => {
		return (styles[className] ?? "") + " " + (extraStyles[className] ?? "");
	};

	const renderCoverage = () => {
		const res = [];

		Object.keys(coverages)?.map((topping) => {
			const { assetVersion = 0, meta } = catalogProducts[topping] || {};
			const isMixTopping = meta === META_ENUM.MIX_TOPPING_ITEM;
			if (coverages[topping]?.coverage) {
				const { q1 = 0, q2 = 0, q3 = 0, q4 = 0 } = coverages[topping].coverage;
				const mediaObject = {
					id: topping,
					assetVersion,
				};
				const toppingImage = getFullMediaUrl(
					mediaObject,
					MEDIA_TYPES.PRODUCT,
					toppingsType,
				);
				if (isMixTopping) {
					res.push(
						<Topping
							key={`coverage-${topping}-q1`}
							className={extraPizzaStyles("q1")}
							src={toppingImage}
							isAnimated
						/>,
					);
					return null;
				}
				if (q1) {
					res.push(
						<Topping
							key={`coverage-${topping}-q1`}
							className={extraPizzaStyles("q1")}
							src={toppingImage}
							isAnimated={isAnimatedCoverage}
						/>,
					);
				}
				if (!coverages[topping]?.isMix) {
					if (q2) {
						res.push(
							<Topping
								key={`coverage-${topping}-q2`}
								className={extraPizzaStyles("q2")}
								src={toppingImage}
								isAnimated={isAnimatedCoverage}
							/>,
						);
					}
					if (q3) {
						res.push(
							<Topping
								key={`coverage-${topping}-q3`}
								className={extraPizzaStyles("q3")}
								src={toppingImage}
								isAnimated={isAnimatedCoverage}
							/>,
						);
					}
					if (q4) {
						res.push(
							<Topping
								key={`coverage-${topping}-q4`}
								className={extraPizzaStyles("q4")}
								src={toppingImage}
								isAnimated={isAnimatedCoverage}
							/>,
						);
					}
				}
			}
			return null;
		});
		return (
			<div className={extraPizzaStyles(`topping-coverage-on-pizza`)}>{res}</div>
		);
	};

	const renderTutorial = () => {
		return (
			<div
				className={clsx(
					extraPizzaStyles("tutorial-wrapper"),
					extraPizzaStyles(isTutorialActive ? "active" : ""),
				)}>
				{isAllowedQuarters && (
					<div className={extraPizzaStyles("tutorial-horizontal-dotted-line")} />
				)}
				<div className={extraPizzaStyles("tutorial-vertical-line")} />
				<div className={extraPizzaStyles("tutorial-middle-circle")}>
					<span className={extraPizzaStyles("tutorial-text")}>
						{translate("builderModal_toppingsBuilder_tutorialCircle_label")}
					</span>
				</div>
			</div>
		);
	};

	const getLottieSrc = () => {
		switch (lottie) {
			case LOTTIE_ANIMATIONS.CHESSYCRUST_IN:
				return CheesyCrustLottie;
			case LOTTIE_ANIMATIONS.CHESSYCRUST_OUT:
				return CheesyCrustLottieReverse;
			default:
				return null;
		}
	};

	const renderPizza = () => {
		const isSqurePizza = getisSqurePizza(pizza.meta);
		return lottie && !isSqurePizza ? (
			<LottieAnimation
				className={styles["lottie"]}
				animation={getLottieSrc()}
			/>
		) : (
			<img
				src={pizzaImg.src}
				alt={"base pizza"}
			/>
		);
	};

	return (
		<div
			ref={ref}
			id="toppings-pizza-img"
			aria-hidden={true}
			className={clsx(extraPizzaStyles("toppings-pizza-img"))}>
			{renderPizza()}
			{showTutorial &&
				!notEmptyObject(coverages) &&
				!hasShownTutorialRef.current &&
				renderTutorial()}
			{renderCoverage()}
			{isOver && <div className={overlayClassName} />}
		</div>
	);
};
export const Pizza = React.forwardRef(PizzaRef);
