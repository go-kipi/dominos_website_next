import SavedPizza from "containers/Menu/components/SavedPizza/SavedPizza";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Api from "api/requests";

import * as popupTypes from "constants/popup-types";
import { getPizzaImageByMeta, notEmptyObject } from "utils/functions";

import styles from "./pizzasBuilder.module.scss";
import Chef from "/public/assets/icons/white-chef.svg";
import Star from "/public/assets/icons/white-star.svg";
import PizzaBuilderDekstop from "/public/assets/icons/pizza-builder.png";
import PizzaBuilderMobile from "/public/assets/icons/pizza-builder-mobile.png";
import IconTitle from "containers/Menu/components/IconTitle/IconTitle";
import RenderSideDishComponent from "containers/Menu/components/RenderSideDishComponent";
import useGetMenuData from "hooks/useGetMenuData";
import builderTypes from "constants/builder-types";
import doughMatrixEnum from "constants/doughMatrixEnum";
import PizzaTreeService from "services/PizzaTreeService";
import useTranslate from "hooks/useTranslate";
import { MEDIA_TYPES } from "constants/media-types";
import Actions from "redux/actions";
import CartService from "services/CartService";
import { VALIDATION_STATUS } from "constants/ValidationStatusEnum";
import PizzaBuilderService from "services/PizzaBuilderService";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { ITEM_CATEGORY } from "constants/AnalyticsTypes";
import EmarsysService from "utils/analyticsService/EmarsysService";

function PizzasBuilder(props) {
	const {
		showTitle = () => {},
		setImage,
		params = {},
		menuId = "",
		setMovingImageClassName,
		setStack = () => {},
		fatherEntity,
		stepIndex,
		nextTab,
		isUpsaleBuilder,
		goToTab,
		isEdit,
		isSale,
		isLastTab,
		onEndSale,
		steps = [],
		maxDuplicate,
		trigger = "",
		itemCategory,
		itemCategory2,
		priceOverrides,
	} = props;
	const recommendedPizzasTitleRef = useRef(null);
	const dispatch = useDispatch();
	const translate = useTranslate();

	const midAreaSectionMenu = useGetMenuData({ id: menuId, isInBuilder: true });
	const saleObj = useSelector((store) => store.cartItem);
	const user = useSelector((store) => store.userData);
	const deviceState = useSelector((store) => store.deviceState);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const hasElements =
		typeof midAreaSectionMenu === "object" &&
		midAreaSectionMenu.elements &&
		notEmptyObject(midAreaSectionMenu.elements);
	const pizzaBuilderId = hasElements
		? midAreaSectionMenu.elements.filter(
				(el) => el?.actionType === "startPizzaBuilder",
		  )[0]?.id
		: "familyPizza";
	const PizzaBuilderIcon =
		deviceState.isMobile || deviceState.isTablet
			? PizzaBuilderMobile
			: PizzaBuilderDekstop;

	const [recommendedKits, setRecommendedKits] = useState({});
	const [pizzaProductIds, setPizzaProductIds] = useState([]);

	useEffect(() => {
		if (pizzaBuilderId) {
			const payload = {
				menuId: pizzaBuilderId,
				step: stepIndex,
				isInBuilder: true,
			};
			Api.getMenus({
				payload,
				onSuccess: (res) => {
					dispatch(Actions.updateBuilderSavedKits({ [stepIndex]: res.savedKits }));
					setRecommendedKits(res.recommendedKits);
					const hasMenus = Array.isArray(res?.menus) && res.menus.length > 0;
					if (hasMenus) {
						const pizzaMenu = res.menus[0];
						const hasElements =
							Array.isArray(pizzaMenu?.elements) && pizzaMenu.elements.length > 0;
						if (hasElements) {
							const productIds = pizzaMenu.elements.map((p) => p.id);
							setPizzaProductIds(productIds);
						}
					}
				},
			});
		}
	}, [stepIndex]);

	useEffect(() => {
		let observer = null;
		const instance = recommendedPizzasTitleRef.current;

		if (instance) {
			observer = new IntersectionObserver(function (entries) {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						showTitle(false);
					} else {
						showTitle(true);
					}
				});
			}, {});
			observer.observe(instance);
		}
		return () => {
			observer && instance && observer.unobserve(instance);
		};
	}, [recommendedPizzasTitleRef.current]);

	useEffect(() => {
		if (
			typeof recommendedKits === "object" &&
			Object.values(recommendedKits).length > 0
		) {
			const products = Object.values(recommendedKits).map((item) =>
				formatProduct(item),
			);
			addViewProductListEvent(products);
		}
	}, [recommendedKits]);

	const formatProduct = (product) => {
		const { id, subItems = [] } = product;
		const toppings =
			Array.isArray(subItems) && subItems.length > 0
				? subItems
						.map((si) => catalogProducts[si.productId]?.nameUseCases?.Title)
						?.join(", ")
				: "";
		return Object.assign({
			item_category: itemCategory,
			item_category2: itemCategory2,
			item_category3: isUpsaleBuilder ? "Popular" : "Self choise",
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
		function findPrice(productIds) {
			const override = Object.values(priceOverrides) && priceOverrides[stepIndex];
			const foundProductId = productIds.find(
				(productId) => productId in override.products,
			);

			if (foundProductId) {
				return (
					Number(override.products[foundProductId]) > 0 &&
					override.products[foundProductId]
				);
			}
			return null;
		}
		const price = priceOverrides && findPrice(item?.productIds);
		// NOTE: DO NOT REMOVE isInBuilder prop!
		return (
			<div
				className={styles["pizza-wrapper"]}
				key={"pizzas-" + index}>
				<RenderSideDishComponent
					setStack={setStack}
					isRecommended={true}
					isInBuilder={true}
					isBuilderRecommended={true}
					isEdit={isEdit}
					isSale={isSale}
					steps={steps}
					fatherEntity={fatherEntity}
					setImage={setImage}
					stepIndex={stepIndex}
					nextTab={nextTab}
					setMovingImageClassName={setMovingImageClassName}
					item={item}
					mediaType={MEDIA_TYPES.SAVED_KITS}
					isLastTab={isLastTab}
					onEndSale={onEndSale}
					pizzaCategory={ITEM_CATEGORY.SPECIAL}
					priceOverride={price}
				/>
			</div>
		);
	}

	function renderRecommendedPizzas() {
		const hasRecommendedPizzas = Object.values(recommendedKits ?? {}).length > 0;
		if (!hasRecommendedPizzas) return null;
		return (
			<div
				className={styles["recommended-pizzas"]}
				aria-description={translate("menu_pizzas_recommended_title")}>
				<div className={styles["head"]}>
					<div ref={recommendedPizzasTitleRef}>
						<IconTitle
							icon={Star}
							title={translate("menu_pizzas_recommended_title")}
						/>
					</div>
				</div>
				<div className={styles["pizzas"]}>
					{Object.values(recommendedKits ?? {})
						?.sort((a, b) => a?.sortIndex - b?.sortIndex)
						?.map((item, index) => RenderItem(item, index))}
				</div>
			</div>
		);
	}

	function openBuilderModal() {
		onNavigateBuilder();
	}

	const onNavigateBuilder = async () => {
		const possiblePizzas = pizzaProductIds
			.map((id) => PizzaTreeService.getPizzaPathById(id))
			.filter((p) => typeof p !== "undefined");
		const step = stepIndex ?? 0;
		let pizzaObj = saleObj?.subitems[step];
		if (!pizzaObj && possiblePizzas.length === 1) {
			pizzaObj = CartItemEntity.getObjectLiteralItem(
				possiblePizzas[0][doughMatrixEnum.ID],
			);
			const newCartItem = PizzaBuilderService.setSubItem(saleObj, step, pizzaObj);
			dispatch(Actions.setCartItem(newCartItem));
		}
		if (possiblePizzas.length === 2) {
			let hasVegan = false;
			let productId = null;
			for (const index in possiblePizzas) {
				const possiblePizza = possiblePizzas[index];
				if (possiblePizza.includes("vegan")) {
					hasVegan = true;
				} else {
					productId = possiblePizza[doughMatrixEnum.ID];
				}
			}

			if (productId && hasVegan) {
				const currentPizza = isEdit ? saleObj.subitems[step] : null;
				const dough = CartItemEntity.getObjectLiteralItem(
					productId,
					1,
					currentPizza ? currentPizza.subitems : [],
				);
				const newCartItem = PizzaBuilderService.setSubItem(saleObj, step, dough);
				dispatch(Actions.setCartItem(newCartItem));
			}
		}
		const screen = await PizzaTreeService.getInitialScreen(
			pizzaProductIds,
			stepIndex,
			saleObj,
			isEdit,
		);

		setStack({
			type: screen,
			params: {
				...params,
				pizzaBuilderId,
				possiblePizzas,
			},
		});
	};

	const onDuplicateCallback = (
		quantity = 1,
		payload = null,
		dough,
		possiblePizzas,
		doughPossiblePizzas,
	) => {
		const isMaxDuplicateLikeMaxSteps =
			quantity === steps?.length || quantity === steps?.length - stepIndex;
		let stepsToSkip = stepIndex + 1;
		if (isMaxDuplicateLikeMaxSteps) {
			stepsToSkip = stepIndex + quantity - 1;
		} else if (quantity > 1) {
			stepsToSkip = stepIndex + quantity;
		}
		for (let i = 0; i < stepsToSkip; i++) {
			typeof setStack === "function" &&
				setStack({
					type: builderTypes.DOUGH,
					params: {
						doughKey: dough.size,
						possiblePizzas: doughPossiblePizzas,
						pizzaType: dough?.type,
						isSquare: dough?.type,
					},
				});
			typeof setStack === "function" &&
				setStack({
					type: builderTypes.TOPPINGS,
					params: {
						possiblePizzas: possiblePizzas,
						pizzaType: dough?.type,
						isSquare: dough?.type,
					},
				});
		}
		CartService.validateAddToCart(
			payload,
			(res) => {
				if (res.overallstatus !== VALIDATION_STATUS.ERROR) {
					const item = CartItemEntity.parseValidateRes(res);

					const newPayload = {
						item,
						step: res.step,
					};
					dispatch(Actions.setCartItem(newPayload.item));
					if (isMaxDuplicateLikeMaxSteps || isEdit) {
						onEndSale(res);
					}
					goToTab(stepsToSkip, true);
				}
			},
			trigger,
		);
	};

	function openDuplicatePopup(
		type,
		coverages,
		dough,
		possiblePizzas,
		doughPossiblePizzas,
		pizzaId,
	) {
		const isSquarePizza = !["classic", "", "spelt"].includes(type);

		const pizza = catalogProducts[pizzaId];

		const pizzaImg = getPizzaImageByMeta(pizza.meta);
		dispatch(
			Actions.addPopup({
				type: popupTypes.DUPLICATE_PIZZA,
				payload: {
					shouldReset: true,
					title: translate("duplicatePizzaModal_title"),
					subtitle: translate("duplicatePizzaModal_subtitle"),
					primaryBtnText: translate("duplicatePizzaModal_button"),
					primaryBtnOnPress: (payload, quantity) => {
						const newPaylaod = {
							...payload,
						};
						delete newPaylaod.item.pricingBalance;
						dispatch(Actions.setCartItem(newPaylaod.item));
						onDuplicateCallback(
							quantity,
							newPaylaod,
							dough,
							possiblePizzas,
							doughPossiblePizzas,
						);
					},
					maxAmount: maxDuplicate,
					coverages: coverages,
					isSquare: isSquarePizza,
					pizzaImg: pizzaImg,
					extraStyles: styles,
					stepIndex: stepIndex ?? 0,
					fatherEntity: fatherEntity,
				},
			}),
		);
	}

	function getCoverages(toppings) {
		let coverages = {};
		if (toppings) {
			toppings.forEach((t) => {
				const toppingProduct = catalogProducts[t.productId];
				coverages[t.productId] = {
					coverage: t.quarters
						? t.quarters?.reduce((a, v) => ({ ...a, [v]: 1 }), {})
						: {},
					assetVersion: toppingProduct.assetVersion,
					isMix: false,
				};
			});
		}
		return coverages;
	}

	function onNavigateSavedKit(
		savedKitPayload,
		dough,
		possiblePizzas,
		doughPossiblePizzas,
	) {
		const payload = {
			step: "add saved kit",
			item: savedKitPayload,
		};
		dispatch(Actions.setCartItem(payload.item));

		CartService.validateAddToCart(
			payload,

			(res) => {
				if (res.overallstatus !== VALIDATION_STATUS.ERROR) {
					const { item } = res;
					const savedKitId = savedKitPayload.subitems[stepIndex].productId;
					let upgradesCallback;
					const doughType =
						PizzaTreeService.getPizzaPathById(savedKitId)[doughMatrixEnum.TYPE];
					const coverages = getCoverages(
						savedKitPayload.subitems[stepIndex].subitems,
					);

					if (
						!user?.showDuplicatePizza &&
						steps[stepIndex]?.allowCopyToNextSteps &&
						!isEdit
					) {
						upgradesCallback = () => {
							openDuplicatePopup(
								doughType,
								coverages,
								dough,
								possiblePizzas,
								doughPossiblePizzas,
								savedKitId,
							);
						};
						EmarsysService.setViewUpgradePizza(
							payload?.item?.subitems,
							isSale,
							stepIndex,
						);
					} else {
						upgradesCallback = () => {
							if (!isLastTab) {
								typeof setStack === "function" &&
									setStack({
										type: builderTypes.DOUGH,
										params: {
											doughKey: dough.size,
											possiblePizzas: doughPossiblePizzas,
											pizzaType: dough?.type,
											isSquare: dough?.type,
										},
									});
								typeof setStack === "function" &&
									setStack({
										type: builderTypes.TOPPINGS,
										params: {
											possiblePizzas,
											pizzaType: dough?.type,
											isSquare: dough?.type,
										},
									});
								nextTab();
							} else {
								const newPayload = { item };
								typeof onEndSale === "function" && onEndSale(newPayload);
							}
						};

						EmarsysService.setViewUpgradePizza(
							payload?.item?.subitems,
							isSale,
							stepIndex,
						);
					}
					typeof upgradesCallback === "function" && upgradesCallback();
				}
			},
			trigger,
		);
	}

	return (
		<div className={styles["pizzas-wrapper"]}>
			<span className={styles["title"]}>{translate("pizzaBuilder_title")}</span>
			<span className={styles["price-disclaimer"]}>
				{translate("builder_pizzaBuilder_priceDisclaimer")}
			</span>
			<div className={styles["pizzas-head"]}>
				<SavedPizza
					onAddInBuilder={onNavigateSavedKit}
					isInBuilder={true}
					isEdit={isEdit}
					setStack={setStack}
					nextTab={nextTab}
					isLastTab={isLastTab || isEdit}
					step={stepIndex}
					pizzaBuilderId={pizzaBuilderId}
					shouldPopulateStack={
						Array.isArray(steps) &&
						steps.length > 0 &&
						!steps[stepIndex]?.allowCopyToNextSteps
					}
				/>

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
						<div className={styles["build-pizza-image"]}>
							<img
								src={PizzaBuilderIcon.src}
								alt={""}
							/>
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

export default PizzasBuilder;
