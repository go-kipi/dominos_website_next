import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import styles from "./SavedPizza.module.scss";

import SavedPizzaCard from "components/SavedPizzaCard/SavedPizzaCard";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";

import Flag from "/public/assets/icons/white-flag.svg";
import RedFlag from "/public/assets/icons/red-flag.svg";
import NextArrow from "/public/assets/icons/next-arrow.svg";
import PrevArrow from "/public/assets/icons/prev-arrow.svg";
import IconTitle from "../IconTitle/IconTitle";
import SlideRightAndOpacity from "../../../../components/SlideRightAndOpacity/SlideRightAndOpacity";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_HIDDEN,
} from "../../../../constants/accessibility-types";
import { META_ENUM } from "constants/menu-meta-tags";
import { ITEM_CATEGORY } from "constants/AnalyticsTypes";

SwiperCore.use([Navigation]);

function SavedPizza(props) {
	const translate = useTranslate();

	const {
		onAddInBuilder,
		step = undefined,
		setStack,
		nextTab,
		isLastTab,
		isEdit = false,
		shouldPopulateStack,
		pizzaBuilderId,
	} = props;
	const deviceState = useSelector((store) => store.deviceState);
	const builderSavedKits = useSelector((store) => store.builder.savedKits);
	const savedKits = useSelector((store) => store.menusData.savedKits);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const isInBuilder = step !== undefined;
	const navigationNextRef = useRef();
	const navigationPrevRef = useRef();
	const [settings, setSettings] = useState(null);
	const [showPreviousButton, setShowPreviousButton] = useState(false);

	const numberOfItemInRow =
		deviceState.isDesktopLarge || deviceState.isDesktopMax ? 4 : 3;

	let savedKitsMenu = isInBuilder ? builderSavedKits[step] : savedKits;

	const hasElements =
		typeof savedKitsMenu === "object" &&
		Object.values(savedKitsMenu ?? {}).length > 0;

	const length =
		typeof savedKitsMenu === "object" ? Object.values(savedKitsMenu).length : 0;

	useEffect(() => {
		if (navigationNextRef.current && navigationPrevRef.current) {
			const arrows = {
				prevEl: navigationPrevRef.current,
				nextEl: navigationNextRef.current,
			};
			const swiperSettings = {
				navigation: arrows,
				slidesPerView: numberOfItemInRow,
			};
			setSettings(swiperSettings);
		}
	}, [navigationNextRef.current, navigationPrevRef.current, hasElements]);

	useEffect(() => {
		if (hasElements) {
			const data = Object.values(savedKitsMenu);
			const products = data.map((item) => formatProduct(item));
			addViewProductListEvent(products);
		}
	}, []);

	const formatProduct = (product) => {
		const { productId, subItems = [] } = product;
		const toppings =
			Array.isArray(subItems) && subItems.length > 0
				? subItems
						.map((si) => catalogProducts[si.productId]?.nameUseCases?.Title)
						?.join(", ")
				: "";
		return Object.assign({
			item_category: ITEM_CATEGORY.FAVORITE,
			item_variant: toppings,
			...catalogProducts[productId],
		});
	};

	const addViewProductListEvent = (products) => {
		const listItem = {
			id: "savedKits",
			name: "Saved Pizzas",
		};
		AnalyticsService.viewItemList(products, listItem);
	};

	function RenderSlides() {
		const savedKits = Object.values(savedKitsMenu);
		const components = RenderSavedKitsDesktop(savedKits);

		if (components.length < numberOfItemInRow) {
			for (
				let index = 0;
				index <= numberOfItemInRow - components.length;
				index++
			) {
				const component = (
					<SwiperSlide key={"saved-pizzas-placeholder-" + index}>
						<div className={styles["saved-pizza-item"]}>
							<div className={styles["placeholder"]} />
						</div>
					</SwiperSlide>
				);
				components.push(component);
			}
		}
		return components;
	}

	function RenderSavedKitsDesktop(list = []) {
		const components = [];
		list.map((item, index) => {
			const component = (
				<li
					aria-live={"polite"}
					key={"saved-pizzas-li-" + index}>
					<SwiperSlide key={"saved-pizzas-" + index}>
						<RenderSavedPizzasCard
							onAddInBuilder={(payload, dough, possiblePizzas, doughPossiblePizzas) =>
								onAddInBuilder(payload, dough, possiblePizzas, doughPossiblePizzas)
							}
							shouldPopulateStack={shouldPopulateStack}
							pizzaBuilderId={pizzaBuilderId}
							setStack={setStack}
							nextTab={nextTab}
							isLastTab={isLastTab}
							isInBuilder={isInBuilder}
							isEdit={isEdit}
							item={item}
							stepIndex={step}
						/>
					</SwiperSlide>
				</li>
			);
			components.push(component);
			return null;
		});
		return components;
	}

	function RenderSavedKitsMobile(list = []) {
		return list.map((item, index) => {
			return (
				<RenderSavedPizzasCard
					onAddInBuilder={(payload, dough, possiblePizzas, doughPossiblePizzas) =>
						onAddInBuilder(payload, dough, possiblePizzas, doughPossiblePizzas)
					}
					shouldPopulateStack={shouldPopulateStack}
					pizzaBuilderId={pizzaBuilderId}
					setStack={setStack}
					nextTab={nextTab}
					isLastTab={isLastTab}
					isInBuilder={isInBuilder}
					isEdit={isEdit}
					item={item}
					stepIndex={step}
					key={"saved-pizzas-" + item?.productId}
				/>
			);
		});
	}

	const showTitle =
		deviceState.isDesktop || (deviceState.notDesktop && hasElements);

	return (
		<div
			className={clsx(
				styles["saved-pizzas-wrapper"],
				!hasElements ? styles["no-saved-pizzas"] : "",
			)}
			aria-description={translate("menu_pizzas_savedPizza_title")}>
			{showTitle && (
				<div className={styles["saved-pizza-title-wrapper"]}>
					<IconTitle
						icon={Flag}
						title={
							deviceState.isDesktop
								? translate("menu_pizzas_savedPizza_title") + ` (${length})`
								: translate("menu_pizzas_savedPizza_title")
						}
					/>
				</div>
			)}
			<SlideRightAndOpacity>
				{deviceState.notDesktop && hasElements && (
					<div className={styles["saved-pizza-list"]}>
						<div className={styles["saved-pizza-list-container"]}>
							{RenderSavedKitsMobile(Object.values(savedKitsMenu))}
						</div>
					</div>
				)}
				{deviceState.isDesktop && hasElements && (
					<div className={styles["slider-wrapper"]}>
						<div className={styles["arrows"]}>
							<button
								aria-label={translate("accessibility_imageAlt_savedPizza_carouselBack")}
								className={clsx(styles["prev-arrow-wrapper"], styles["arrow"])}
								tabIndex={showPreviousButton ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}>
								<img
									className={styles["prev-arrow"]}
									src={PrevArrow.src}
									ref={navigationPrevRef}
									alt={""}
								/>
							</button>
							<button
								className={clsx(styles["next-arrow-wrapper"], styles["arrow"])}
								aria-label={translate(
									"accessibility_imageAlt_savedPizza_carouselForward",
								)}>
								<img
									className={styles["next-arrow"]}
									src={NextArrow.src}
									ref={navigationNextRef}
									alt={""}
								/>
							</button>
						</div>
						<ul className={styles["list"]}>
							{settings && (
								<Swiper
									onSlideChange={(swiper) =>
										setShowPreviousButton(swiper.activeIndex > 0)
									}
									{...settings}>
									{RenderSlides()}
								</Swiper>
							)}
						</ul>
					</div>
				)}
			</SlideRightAndOpacity>
			{deviceState.isDesktop && !hasElements && (
				<div
					className={styles["no-saved-pizza-wrapper"]}
					role={"button"}>
					<div className={styles["no-saved-pizza-image"]}>
						<img src={RedFlag.src} />
					</div>
					<div className={styles["no-saved-pizza-content"]}>
						<h3 className={styles["no-saved-pizza-content-title"]}>
							{translate("menu_pizzas_noSavedPizza_contentTitle")}
						</h3>
						<h4 className={styles["no-saved-pizza-content-subtitle"]}>
							{translate("menu_pizzas_noSavedPizza_contentSubtitle")}
						</h4>
					</div>
				</div>
			)}
		</div>
	);
}

export default SavedPizza;

function RenderSavedPizzasCard(props) {
	const {
		item,
		isInBuilder = false,
		isEdit = false,
		onAddInBuilder,
		stepIndex,
		setStack,
		nextTab,
		isLastTab,

		shouldPopulateStack,
		pizzaBuilderId,
	} = props;

	return (
		<div className={styles["saved-pizza-item"]}>
			<SavedPizzaCard
				id={item?.productId}
				title={item?.name}
				price={!isInBuilder ? item?.price : null}
				oldPrice={!isInBuilder ? item?.priceBeforeDiscount : null}
				showPriceBeforeDiscount={
					isInBuilder ? false : item?.showPriceBeforeDiscount
				}
				shouldPopulateStack={shouldPopulateStack}
				outOfStock={item?.outOfStock}
				toppings={item?.subItems}
				product={item}
				isInBuilder={isInBuilder}
				isEdit={isEdit}
				disabledReason={item?.disabledReason}
				addInBuilder={(payload, dough, possiblePizzas, doughPossiblePizzas) =>
					onAddInBuilder(payload, dough, possiblePizzas, doughPossiblePizzas)
				}
				stepIndex={stepIndex}
				setStack={setStack}
				nextTab={nextTab}
				isLastTab={isLastTab}
				pizzaBuilderId={pizzaBuilderId}
			/>
		</div>
	);
}
