import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import styles from "./index.module.scss";
import {
	getFullMediaUrl,
	getPizzaImageByMeta,
	getPizzaToppingTypeByMeta,
} from "utils/functions";
import useTranslate from "hooks/useTranslate";
import { META_ENUM } from "constants/menu-meta-tags";
import { MEDIA_TYPES } from "constants/media-types";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";

export default function MovingSavedPizza(props) {
	const animationRef = useRef();
	const animationsArr = useSelector((store) => store.animationArray);
	const { payload = {}, id = "" } = props;
	const { from = {}, to = {}, toppings = [], id: pizzaId, type, size } = payload;
	const dispatch = useDispatch();

	useEffect(() => {
		if (animationRef.current) {
			animationRef.current.style.zIndex = 5000;
			animationRef.current.style.width = `${from.width}px`;
			animationRef.current.style.height = `${from.height}px`;
			animationRef.current.style.top = `${from.py}px`;
			animationRef.current.style.left = `${from.left}px`;
			const parent = setTimeout(() => {
				animate();
				clearTimeout(parent);
			}, 15);
		}
	}, [animationRef.current]);

	const animate = () => {
		const isExists = animationsArr.find((anim) => anim.id === id);
		if (animationRef.current) {
			animationRef.current.style.width = `${to.width}px`;
			animationRef.current.style.height = `${to.height}px`;
			animationRef.current.style.top = `${to.py}px`;
			animationRef.current.style.left = `${to.left}px`;
			const timeout = setTimeout(() => {
				if (isExists) {
					dispatch(Actions.removeAnimation(id));
				}
				clearTimeout(timeout);
			}, 720);
		}
	};

	return (
		<div
			ref={animationRef}
			className={"moving-product-image"}>
			{/*<img src={image} />*/}
			<PizzaWithToppings
				toppings={toppings}
				type={type}
				size={size}
				id={pizzaId}
			/>
		</div>
	);
}

export function PizzaWithToppings({ toppings = [], type = "classic", id }) {
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const translate = useTranslate();
	const pizza = useMenus(id, ActionTypes.PRODUCT);

	const pizzaImg = getPizzaImageByMeta(pizza.meta).src;
	const toppingsType = getPizzaToppingTypeByMeta(pizza.meta);

	const renderCoverages = () => {
		const res = [];
		let index = 0;
		const isMixTopping =
			toppings.length === 1 &&
			catalogProducts[toppings?.[0]?.id]?.meta === META_ENUM.MIX_TOPPING_ITEM;
		if (isMixTopping) {
			const topping = toppings[0];
			res.push(
				<img
					key={`coverage-${topping.id}-${"mix"}`}
					className={styles["q1"]}
					src={getFullMediaUrl(topping, MEDIA_TYPES.PRODUCT, toppingsType)}
					alt={translate("alt_toppingOnPizza")}
				/>,
			);
		} else {
			for (const topping of toppings) {
				if (!topping.coverage) {
					continue;
				}
				for (const coverage in topping.coverage) {
					res.push(
						<img
							key={`coverage-${topping.id}-${coverage}-${index}`}
							className={styles[coverage]}
							src={getFullMediaUrl(topping, MEDIA_TYPES.PRODUCT, toppingsType)}
							alt={translate("alt_toppingOnPizza")}
						/>,
					);
					index++;
				}
			}
		}
		return <div className={styles["coverages-wrapper"]}>{res}</div>;
	};

	return (
		<div className={`${styles["pizza-wrapper"]} pizza-wrapper`}>
			<img
				src={pizzaImg}
				alt={`${type} pizza`}
			/>
			{renderCoverages()}
		</div>
	);
}
