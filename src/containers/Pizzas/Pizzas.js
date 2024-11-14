import SavedPizza from "containers/Menu/components/SavedPizza/SavedPizza";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as POPUP_TYPES from "constants/popup-types";
import styles from "./Pizzas.module.scss";
import Chef from "/public/assets/icons/white-chef.svg";
import Star from "/public/assets/icons/white-star.svg";

import PizzaBuilderDekstop from "/public/assets/icons/pizza-builder.png";
import PizzaBuilderMobile from "/public/assets/icons/pizza-builder-mobile.png";

import IconTitle from "containers/Menu/components/IconTitle/IconTitle";
import RenderSideDishComponent from "containers/Menu/components/RenderSideDishComponent";
import { META_ENUM } from "../../constants/menu-meta-tags";

import useGetMenuByMeta from "hooks/useGetMenuByMeta";

import Actions from "../../redux/actions";
import useTranslate from "hooks/useTranslate";
import { MEDIA_TYPES } from "constants/media-types";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { handleArrowLeftAndRight } from "../../components/accessibility/keyboardsEvents";
import { onArrows } from "components/accessibility/acfunctions";
import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_HIDDEN,
} from "../../constants/accessibility-types";
import PizzaTreeService from "services/PizzaTreeService";
import animationTypes from "constants/animationTypes";
import { getAllToppingsFromSubitems } from "utils/functions";
import { ITEM_CATEGORY } from "constants/AnalyticsTypes";

function Pizzas(props) {
	const dispatch = useDispatch();

	const user = useSelector((store) => store.userData);
	const midAreaSectionMenu = useGetMenuByMeta(META_ENUM.MID_AREA_SECTIONS);
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const menuPath = useSelector((store) => store.menuPath);
	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const pizzasRef = useRef();
	const pizzaIconRef = useRef();

	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const recommendedKits = useSelector(
		(store) => store.menusData.recommendedKits,
	);

	const PizzaBuilderIcon =
		deviceState.isMobile || deviceState.isTablet
			? PizzaBuilderMobile
			: PizzaBuilderDekstop;

	const hasElements =
		midAreaSectionMenu?.elements &&
		typeof midAreaSectionMenu?.elements === "object" &&
		midAreaSectionMenu.elements.length > 0;

	const pizzaBuilder = hasElements
		? midAreaSectionMenu.elements.find(
				(el) => el.actionType === "startPizzaBuilder",
		  )
		: null;

	useEffect(() => {
		if (Object.values(recommendedKits).length > 0) {
			const products = Object.values(recommendedKits).map((item) =>
				formatProduct(item),
			);
			addViewProductListEvent(products);
		}
	}, []);

	const formatProduct = (product) => {
		const { id, subItems = [] } = product;
		const toppings =
			Array.isArray(subItems) && subItems.length > 0
				? subItems
						.map((si) => catalogProducts[si.productId]?.nameUseCases?.Title)
						?.join(", ")
				: "";
		return Object.assign({
			item_category: ITEM_CATEGORY.SPECIAL,
			item_variant: toppings,
			...recommendedKits[id],
		});
	};

	const addViewProductListEvent = (products) => {
		const listItem = {
			id: "recommendedKits",
			name: "Recommended Pizzas",
		};
		AnalyticsService.viewItemList(products, listItem);
	};

	function RenderItem(item, index) {
		return (
			<RenderSideDishComponent
				key={"pizzas-" + index}
				className={styles["pizza-wrapper"]}
				item={item}
				mediaType={MEDIA_TYPES.SAVED_KITS}
				isRecommended={true}
				index={index}
				buttonTabIndex={TAB_INDEX_DEFAULT}
				pizzaCategory={ITEM_CATEGORY.SPECIAL}
			/>
		);
	}

	const handleKeyboardEvents = (event) => {
		typeof onArrows === "function" && onArrows(event, pizzasRef);
	};

	const animatePizza = (
		pizzaId,
		doughType,
		toppings = [],
		pizzaSize = "family",
	) => {
		const pizzaLocation = pizzaIconRef?.current?.getBoundingClientRect();
		const cartIcon = document.getElementById("cart-icon").getBoundingClientRect();
		const filteredToppings = toppings.filter((topping) => topping);
		dispatch(
			Actions.addAnimation({
				type: animationTypes.MOVING_SAVED_PIZZA,
				payload: {
					id: pizzaId,
					type: doughType,
					size: pizzaSize,
					from: {
						top: pizzaLocation.top,
						left: pizzaLocation.left,
						width: pizzaLocation.height,
						height: pizzaLocation.height,
						py: pizzaLocation.y,
					},
					to: {
						top: cartIcon.top,
						left: cartIcon.left,
						width: cartIcon.height,
						height: cartIcon.height,
						py: cartIcon.y,
					},
					toppings: filteredToppings,
				},
			}),
		);
	};

	function renderRecommendedPizzas() {
		return (
			<div
				className={styles["recommended-pizzas"]}
				aria-description={translate("menu_pizzas_recommended_title")}>
				{deviceState.notDesktop ? (
					<IconTitle
						icon={Star}
						title={translate("menu_pizzas_recommended_title")}
						className={styles["title-wrapper"]}
					/>
				) : (
					<div className={styles["head"]}>
						<IconTitle
							icon={Star}
							title={translate("menu_pizzas_recommended_title")}
						/>
					</div>
				)}
				<div
					className={styles["pizzas"]}
					ref={pizzasRef}
					onKeyDown={(event) =>
						handleArrowLeftAndRight(event, handleKeyboardEvents)
					}>
					{recommendedKits &&
						Object.values(recommendedKits)
							?.sort((a, b) => a?.sortIndex - b?.sortIndex)
							?.map((item, index) => RenderItem(item, index))}
				</div>
			</div>
		);
	}

	function addToCartEvent(item) {
		const product = catalogProducts[item.productId];
		const list = {
			value: product?.price,
			currency: "ILS",
		};

		const toppings = getAllToppingsFromSubitems(item?.subitems);

		const combinedProduct = Object.assign(
			{
				item_list_id: topNavId,
				item_list_name: list,
				index: 0,
				item_variant: toppings,
			},
			product,
		);
		AnalyticsService.addToCart(combinedProduct, list);
	}

	function openBuilderModal() {
		dispatch(
			Actions.addPopup({
				type: POPUP_TYPES.BUILDER,
				payload: {
					templateId: "",
					isFromPizzas: true,
					isOptimistic: true,
					onEndOfSaleAddCallback: (payload) => {
						const { item } = payload;
						const doughObject = PizzaTreeService.getDoughObjectWithId(item.productId);
						const doughType = doughObject?.type;
						const size = doughObject?.size;
						const toppings =
							Array.isArray(item.subitems) && item.subitems.length > 0
								? item.subitems.map((topping) => {
										const toppingObj = catalogProducts[topping.productId];
										if (toppingObj) {
											return {
												id: topping.productId,
												coverage: topping.quarters?.reduce(
													(a, v) => ({ ...a, [v]: 1 }),
													{},
												),
												quantity: topping.quantity,
												assetVersion: toppingObj.assetVersion,
											};
										}
								  })
								: [];
						animatePizza(item.productId, doughType, toppings, size);
						addToCartEvent(item);
					},
				},
			}),
		);
	}

	return (
		<div
			className={styles["pizzas-wrapper"]}
			role={"tabpanel"}>
			<div className={styles["pizzas-head"]}>
				<SavedPizza />
				<div
					className={styles["build-pizza-wrapper"]}
					aria-description={translate("menu_pizzas_buildPizza_title")}>
					<IconTitle
						icon={Chef}
						title={translate("menu_pizzas_buildPizza_title")}
					/>
					<button
						className={styles["build-pizza-card"]}
						onClick={openBuilderModal}>
						<div
							ref={pizzaIconRef}
							className={styles["build-pizza-image"]}>
							<img src={PizzaBuilderIcon.src} />
						</div>
						<div className={styles["build-pizza-content"]}>
							<h3 className={styles["build-pizza-content-title"]}>
								{translate("menu_pizzas_buildPizza_contentTitle")}
							</h3>
							<h4 className={styles["build-pizza-content-subtitle"]}>
								{translate("menu_pizzas_buildPizza_contentSubtitle")}
							</h4>
						</div>
					</button>
				</div>
			</div>
			{renderRecommendedPizzas()}
		</div>
	);
}

export default Pizzas;
