import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import STACK_TYPES from "../../../constants/stack-types";
import builderTypes from "../../../constants/builder-types";
import DoughBuilder from "./dough";
import BuilderHeader from "./components/BuilderHeader";
import useGetMenuByMeta from "hooks/useGetMenuByMeta";
import { META_ENUM } from "constants/menu-meta-tags";
import { useDispatch, useSelector } from "react-redux";
import * as popups from "constants/popup-types";
import Actions from "../../../redux/actions";
import ToppingsBuilder from "./toppings";
import Button from "../../../components/button";
import BundleBuilder from "./bundle";
import ChooseSize from "../personal-builder";
import PizzasBuilder from "./pizzas/pizzaBuilder";
import useStackNavigation from "../../../hooks/useStackNavigation";
import useGetMenuData from "../../../hooks/useGetMenuData";
import builderStepsEnum from "../../../constants/builderStepsEnum";
import CartService from "services/CartService";
import {
	getInitialScreen,
	getMaxAllowedDuplicate,
	getPizzaImageByMeta,
	isPizzaItem,
	notEmptyObject,
	optimisticCart,
} from "../../../utils/functions";
import * as popupTypes from "../../../constants/popup-types";
import TWO_ACTION_TYPES from "../../../constants/two-actions-popup-types";
import ProductDetails from "./product";
import FullScreenPopup from "../../Presets/FullScreenPopup";
import { STEPS } from "constants/validation-steps-enum";
import useEditCart from "../../../hooks/useEditCart";
import clsx from "clsx";
import PizzaTreeService from "services/PizzaTreeService";
import AddedToBasket from "./AddedToBasket/AddedToBasket";
import useTranslate from "hooks/useTranslate";
import { useRouter } from "next/router";
import * as Routes from "constants/routes";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import useAnimationDirection from "hooks/useAnimationDirection";
import { TRIGGER } from "constants/trigger-enum";

import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import doughMatrixEnum from "constants/doughMatrixEnum";
import LanguageDirectionService from "services/LanguageDirectionService";
import PizzaBuilderService from "services/PizzaBuilderService";
import { UPSALES_TYPES } from "constants/upsales-types";
import {
	ITEM_CATEGORY,
	ITEM_CATEGORY2,
	ITEM_CATEGORY3,
} from "constants/AnalyticsTypes";
import ActionTypes from "constants/menus-action-types";
import useMenus from "hooks/useMenus";
import EmarsysService from "utils/analyticsService/EmarsysService";
import BENEFITS_TYPES from "constants/BenefitsTypes";

const ANIMATION_TIMEOUT = 590;
const BuilderPopup = (props) => {
	const ref = useRef();
	const { payload = {}, closeBuilder = () => {} } = props;
	const {
		shouldSkipSize = false,
		saleId,
		isFromPizzas = false,
		isEdit = false,
		isMixPizza = false,
		isPizzaTypeItem = true,
		itemSubItems,
		item,
		isOnUpsale = false,
		showBackOnFirst = false,
		onEndOfSaleAddCallback,
		onEndOfSaleCartCallback,
		endOfSaleAddToCart = false,
		onClose,
		onFinish,
		isBenefitItem = false,
		trigger = TRIGGER.MENU,
		isOptimistic = false,
	} = payload;
	const {
		templateId,
		itemId,
		fatherEntity,
		possiblePizzas,
		doughKey,
		isMixPizzaFromParams = false,
		subItemsFromParams = null,
		editIndex = 0,
	} = payload;
	const dispatch = useDispatch();
	const userData = useSelector((store) => store.userData);
	const promoPopups = useSelector((store) => store.promoPopups);
	const pizzaSelection = useSelector((store) => store.pizzaSelection);
	const stackNavigation = useStackNavigation(STACK_TYPES.BUILDER, true);
	const builderState = useSelector((store) => store.builder);
	const doughTypes = useSelector((store) => store.pizzaSelection);
	const animationClassTransition = useAnimationDirection();
	const isForward = LanguageDirectionService.isRTL()
		? animationClassTransition !== "forward"
		: animationClassTransition === "forward";
	const currentScreenType = stackNavigation?.current?.screen?.type;
	const isToppings = currentScreenType === builderTypes.TOPPINGS;
	const isDough = currentScreenType === builderTypes.DOUGH;

	const isFirstScreen =
		stackNavigation.current.main === 0 && stackNavigation.current.sub === 0;

	const entering =
		!(isToppings || (isDough && !isForward)) && !(isFirstScreen && isForward);
	const exiting = !(
		isToppings ||
		(isDough && !isForward) ||
		(isDough && isForward)
	);
	const matrixBuilder = useSelector(
		(store) => store.stackState[STACK_TYPES.BUILDER],
	);

	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);

	const translate = useTranslate();
	const router = useRouter();

	const [tabs, overrides, saleTemplate] = useEditCart({
		templateId,
		itemId,
		stackNavigation,
		step: stackNavigation.current.main,
	});
	const saleObj = useSelector((store) => store.cartItem);
	const isSale = Array.isArray(saleTemplate?.steps);
	const stepIndex = isSale ? stackNavigation.current.main : undefined;
	const [maxDuplicate, setMaxDuplicate] = useState(1);
	const [hasUpsales, setHasUpsales] = useState(false);
	const stackState = useSelector(
		(store) => store.stackState[STACK_TYPES.BUILDER],
	);
	const [buttonAnimation, setButtonAnimation] = useState("");
	const builderFoodItemSubMenu = useGetMenuByMeta(META_ENUM.BUILDER_FOOD_ITEM);
	const currentMenuId = getCurrentMenuId();
	const currentMenu = useGetMenuData({
		id: currentMenuId,
		isInBuilder: true,
		showLoader: false,
	});

	const hasElementsBuilderFoodItem = Boolean(
		builderFoodItemSubMenu &&
			builderFoodItemSubMenu.elements &&
			notEmptyObject(builderFoodItemSubMenu.elements),
	);

	const data = {
		builderFoodItemSubMenu,
		hasElementsBuilderFoodItem,
		items: [].concat(
			hasElementsBuilderFoodItem ? builderFoodItemSubMenu.elements : [],
		),
	};

	useEffect(() => {
		if (pizzaSelection.length === 0) {
			PizzaTreeService.init();
		}
		dispatch(Actions.resetBuilder());
		dispatch(Actions.resetStack(STACK_TYPES.BUILDER));

		AnalyticsService.orderMealCustomized("Customize Meal");
		return () => {
			dispatch(Actions.resetCartItem());
			stackNavigation.resetStack();
			dispatch(Actions.resetBuilder());
			dispatch(Actions.resetCurrentProductTemplate());
		};
	}, []);

	useEffect(() => {
		if (Array.isArray(tabs) && tabs.length > 0) {
			const maxDuplicate = getMaxAllowedDuplicate(
				tabs,
				stackNavigation.current.main,
			);
			setMaxDuplicate(maxDuplicate);
		}
	}, [tabs, stackNavigation.current.main]);

	// Adds the required screen to the stack (on initialization and when tab changed)

	useEffect(() => {
		if (!stackNavigation.current.screen?.type) {
			if (saleTemplate) {
				if (isSale) {
					if (isEdit) {
						const product = saleObj.subitems?.[editIndex];
						const isPizza = isPizzaItem(product);
						if (isPizza) {
							const dough = PizzaTreeService.getPizzaPathById(product.productId);
							updateDoughBuilder(dough, editIndex);
							return populateEditStack(dough);
						}
					}
					const activeIndex = stackNavigation.current.main;
					if (
						currentMenu &&
						currentMenu?.meta &&
						(!stackState?.[activeIndex] || stackState?.[activeIndex]?.length === 0)
					) {
						let screen = builderTypes.PIZZAS;
						const meta = currentMenu.meta;
						screen = getScreenType(meta);
						if (screen === builderTypes.PIZZAS && isEdit) {
							const saleItems = saleObj.subitems;
							for (let i = 0; i < saleItems?.length; i++) {
								const saleItem = saleItems[i];
								const isPizza = Array.isArray(saleItem.subitems);
								if (!isPizza) continue;
								const pizzaObj = PizzaBuilderService.getChild(
									saleObj,
									saleObj.subitems[i].productId,
								);
								const dough = PizzaTreeService.getPizzaPathById(pizzaObj.productId);
								updateDoughBuilder(dough, i);
							}
						}
						stackNavigation.setStack({
							type: screen,
							params: {
								saleId,
								allowCopyToNextSteps: tabs[activeIndex]?.allowCopyToNextSteps,
								data: currentMenu.elements,
								meta,
							},
						});
					}
				} else {
					handleNotInSale();
				}
			} else if (isFromPizzas || (isFromPizzas && !item)) {
				handleNotInSale();
			}
		}
	}, [saleTemplate, currentMenu, stackNavigation.current]);

	// Turns the hasUpsales flag if there are upsales to show
	useEffect(() => {
		const upgrades =
			(isSale
				? saleObj?.subitems?.[stackNavigation.current.main]?.upgrades
				: saleObj?.upgrades) ?? null;
		if (Array.isArray(upgrades)) {
			setHasUpsales(true);
		}
	}, [saleObj, stackNavigation.current.main]);

	function handleNotInSale() {
		const pizzaObj = fatherEntity;

		let screen = builderTypes.SIZE;

		if (!isPizzaTypeItem) {
			screen = builderTypes.PRODUCT;
		}

		let subItems = [];

		if (pizzaObj && templateId) {
			screen = getInitialScreen(pizzaObj.productId);
		}

		if (isFromPizzas && item) {
			const isSinglePizzaType =
				Object.keys(possiblePizzas).length <= 2 &&
				(possiblePizzas.hasOwnProperty("vegan") ||
					possiblePizzas.hasOwnProperty("muzzarella"));
			screen = isSinglePizzaType ? builderTypes.TOPPINGS : builderTypes.DOUGH;
			if (isMixPizza) {
				subItems = item?.subItems;
			} else if (isMixPizzaFromParams && Array.isArray(subItemsFromParams)) {
				subItems = subItemsFromParams;
			}
		}

		if (screen === builderTypes.SIZE && stackNavigation.current.sub === 2) return;

		const id = saleObj.productId;
		const isPizza = isPizzaItem(saleObj);
		const dough = isPizza && PizzaTreeService.getPizzaPathById(id);
		isPizza && updateDoughBuilder(dough, stepIndex);

		if (isEdit && isPizza) {
			return populateEditStack(dough);
		}

		stackNavigation.setStack({
			type: screen,
			params: {
				...props.params,
				saleId: saleId && !isPizzaTypeItem ? saleId : null,
				isEdit: isEdit,
				isRecommendedDoughPizza:
					Array.isArray(item?.productIds) && item?.productIds.length > 1,
				allowCopyToNextSteps: false,
				possiblePizzas: possiblePizzas,
				subItems: itemSubItems ? itemSubItems : subItems,
				doughSize: doughKey,
				isSquare: dough?.[doughMatrixEnum.TYPE] ?? "classic",
				header: {
					hideBack: true,
				},
			},
		});
	}

	function populateEditStack(dough) {
		const isSingleDoughOption = getIsSingleDoughOption(dough);

		stackNavigation.setStack({
			type: isSale ? builderTypes.PIZZAS : builderTypes.SIZE,
			params: {},
			header: {
				hideBack: true,
			},
		});

		if (!isSingleDoughOption) {
			stackNavigation.setStack(
				{
					type: builderTypes.DOUGH,
					params: {
						pizzaType: dough[doughMatrixEnum.TYPE],
						doughKey: dough[doughMatrixEnum.SIZE],
						isAllowedToUpdateToppingsInEdit: true,
					},
				},
				true,
			);
		}

		return stackNavigation.setStack(
			{
				type: builderTypes.TOPPINGS,
				params: {
					possiblePizzas,
					pizzaType: dough?.[doughMatrixEnum.TYPE],
				},
			},
			true,
		);
	}

	function getIsSingleDoughOption(dough) {
		const key = dough[doughMatrixEnum.SIZE];
		return Object.entries(pizzaSelection[key].subs).length === 1;
	}

	function getCurrentMenuId() {
		return tabs?.[editIndex ? editIndex : stackNavigation?.current?.main]?.menuId;
	}

	function updateDoughBuilder(doughArray = [], stepIndex = 0) {
		const fields = ["size", "type", "extra", "option", "vegan"];

		for (let i = 0; i < fields.length; i++) {
			if (doughArray[i]) {
				dispatch(
					Actions.updateDough({
						step: stepIndex,
						data: {
							[fields[i]]: doughArray[i],
						},
					}),
				);
			}
		}
	}

	function getScreenType(meta) {
		switch (meta) {
			case builderStepsEnum.PIZZAS:
				return builderTypes.PIZZAS;
			case builderStepsEnum.BEVERAGES:
			case builderStepsEnum.SIDEDISH:
			case builderStepsEnum.DESSERTS:
				return builderTypes.BUNDLE;
			default:
				return builderTypes.PIZZAS;
		}
	}

	const onEndSaleSubmit = (payload, isMixPizza) => {
		const payloadCopy = JSON.parse(JSON.stringify(payload));
		if (payload?.item.hasOwnProperty("pricingBalance")) {
			delete payloadCopy.item.pricingBalance;
		}

		CartService.validateAddToCart(payloadCopy, (res) => {
			const newPayload = CartItemEntity.parseValidateRes(res);
			delete newPayload.pricingBalance;
			dispatch(Actions.setCartItem({ ...newPayload }));

			const payload = {
				item: { ...newPayload, triggeredBy: trigger },
				step: `add item - to cart`,
			};

			if (isOptimistic) {
				const { item } = payload;
				const { productId } = item;
				optimisticCart(productId, 1);
				closeHandler(() => {
					typeof onEndOfSaleAddCallback === "function" &&
						onEndOfSaleAddCallback(payload);
				});
				const anim = setTimeout(() => {
					CartService.addToCart(
						payload,
						null,
						() => {
							clearTimeout(anim);
							typeof onFinish === "function" && onFinish();
						},
						true,
						trigger,
					);
				}, ANIMATION_TIMEOUT);
				return;
			}

			const remainingToppings = res?.item?.pricingBalance?.topping;
			const hasRemainingToppings =
				typeof remainingToppings === "number" && remainingToppings > 0;
			if (hasRemainingToppings && !isEdit) {
				// Submit from remainings modal
				return onShowRemainingUpgradesModal(
					res,
					hasRemainingToppings,
					remainingToppings,
					null,
					isMixPizza,
				);
			}

			const isBenefitItem = payload.item?.triggeredBy === BENEFITS_TYPES.BENEFIT;

			if (isSale && !isBenefitItem && !isEdit) {
				// Submit sale & coupons (meals)
				return onShowEndOfSaleModal(payload);
			}

			if (isBenefitItem) {
				return closeHandler(() => {
					router.push(Routes.menu).then(() => {
						const moveImageTiming = setTimeout(() => {
							typeof onEndOfSaleAddCallback === "function" && onEndOfSaleAddCallback();

							clearTimeout(moveImageTiming);
						}, ANIMATION_TIMEOUT * 2);

						const addToCartTiming = setTimeout(() => {
							CartService.addToCart(payload, null, () => {}, true, TRIGGER.BENEFIT);
							clearTimeout(addToCartTiming);
						}, ANIMATION_TIMEOUT * 3);
					});
				});
			}

			if (isEdit) {
				// Submit all edit options
				const fatherUUID = saleObj?.uuid;
				payload.insteadOf = fatherUUID;

				return CartService.addToCart(
					payload,
					null,
					() => {
						closeHandler();
					},
					true,
					trigger,
				);
			}

			CartService.addToCart(
				payload,
				null,
				() => {
					closeHandler(() => {
						typeof onEndOfSaleAddCallback === "function" &&
							onEndOfSaleAddCallback(payload);
						typeof onFinish === "function" && onFinish();
					});
				},
				true,
				trigger,
			);
		});
	};

	const onUpgradeEnd = (newPayload, callback) => {
		if (isOnUpsale) {
			function onAddToCartSuccess() {
				stackNavigation.setStack({
					type: builderTypes.ADD_TO_BASKET,
					params: {},
				});
			}

			CartService.addToCart(
				{ item: newPayload },
				null,
				onAddToCartSuccess,
				true,
				isEdit ? TRIGGER.BASKET : TRIGGER.MENU,
			);
		} else {
			if (typeof callback === "function") {
				CartService.addToCart({ item: newPayload }, null, callback, true, trigger);
			} else {
				const payload = newPayload ? newPayload : item;
				onShowEndOfSaleModal(payload, callback);
			}
		}
	};

	const onShowRemainingUpgradesModal = (
		res,
		hasRemainingToppings = false,
		remainingToppings = 0,
		callback = null,
		isMixPizza,
	) => {
		const { item } = res;
		const stepIndex = stackNavigation.current.main;
		const dough = PizzaTreeService.getPizzaPathById(
			item.subitems?.[stepIndex].productId,
		);
		const pizzaObj = item.subitems[stepIndex];
		const hasUpgrades =
			pizzaObj.hasOwnProperty("upgrades") &&
			Array.isArray(pizzaObj.upgrades) &&
			pizzaObj.upgrades.length > 0;

		dispatch(
			Actions.addPopup({
				type: popups.REMAINING_UPGRADES,
				payload: {
					upgrades: [],
					remainingToppings,
					onShowEndOfSale: () => {
						if (
							hasUpgrades &&
							!userData?.showDuplicatePizza &&
							!userData?.showUpgradePizza &&
							!isMixPizza &&
							!isEdit
						) {
							dispatch(
								Actions.addPopup({
									type: popupTypes.MIXED_UPGRADES_POPUP,
									payload: {
										upgrades: pizzaObj.upgrades,
										isSquare: dough?.[doughMatrixEnum.TYPE] ?? "classic",
										stepIndex,
										isSale,
										primaryBtnOnPress: (cartItem) => {
											onUpgradeEnd(cartItem);
										},
										secondaryBtnOnPress: (cartItem) => {
											onUpgradeEnd(cartItem);
										},
									},
								}),
							);
						} else {
							const newPayload = CartItemEntity.parseValidateRes(res);
							delete newPayload.pricingBalance;
							onUpgradeEnd(newPayload, callback);
						}
					},
					onUpgradePress: () => {
						if (hasRemainingToppings) {
							if (tabs.length > 1) {
								const index = getFirstPizzaIndex();
								goToTab(index);
							}
						}
					},
				},
			}),
		);
	};

	// const addToCartEvent = (data) => {
	// 	const products = data.items
	// 		.map((product) => {
	// 			return catalogProducts[product.productId];
	// 		})
	// 		.filter((product) => product !== undefined);
	// 	const listData = {
	// 		value: data.total,
	// 		currency: "ILS",
	// 	};
	// 	const combinedProduct = Object.assign(
	// 		{
	// 			item_category: META_ENUM.DEALS,
	// 			index: 0,
	// 		},
	// 		...products,
	// 	);
	// 	AnalyticsService.addToCart(combinedProduct, listData);
	// };

	const formatPayload = (payload) => {
		if (payload.hasOwnProperty("item")) {
			return payload;
		}

		return {
			item: {
				...payload,
				triggeredBy: TRIGGER.MENU,
			},
			step: `${isSale ? STEPS.ADD_SALE : "add item"} - to cart`,
		};
	};

	const onShowEndOfSaleModal = (payload) => {
		const formattedPayload = formatPayload(payload);
		const fatherUUID = saleObj?.uuid;

		if (fatherUUID) {
			formattedPayload.item.insteadOf = fatherUUID;
		}
		if (!isEdit) {
			dispatch(
				Actions.addPopup({
					type: popups.END_OF_SALE,
					payload: {
						onCartClick: (callback) => {
							CartService.addToCart(
								formattedPayload,
								null,
								(res) => {
									closeHandler(
										typeof onEndOfSaleCartCallback === "function" &&
											onEndOfSaleCartCallback(formattedPayload),
									);
									callback();
									typeof onFinish === "function" && onFinish();

									// TODO: Analytics - Check if needed
									// addToCartEvent(res);
								},
								true,
								trigger,
							);
						},
						onMenuHandler: () => {
							if (router.pathname !== Routes.menu) {
								router.push(Routes.menu);
							}

							if (endOfSaleAddToCart) {
								CartService.addToCart(
									formattedPayload,
									null,
									(res) => {
										if (res) {
											// TODO: Analytics Check if needed
											// addToCartEvent(res);
										}
									},
									true,
									isBenefitItem ? TRIGGER.BENEFIT : TRIGGER.COUPON,
								);
							}
							closeHandler(() => {
								typeof onEndOfSaleAddCallback === "function" &&
									onEndOfSaleAddCallback(formattedPayload);
								typeof onFinish === "function" && onFinish();
							});
						},
					},
				}),
			);
		} else {
			CartService.addToCart(
				formattedPayload,
				null,
				() => closeHandler(),
				true,
				trigger,
			);
		}

		EmarsysService.go();
	};

	const getFirstPizzaIndex = () => {
		const firstPizza = saleTemplate.steps.find(
			(step, idx) => step?.meta === "pizzaMeta",
		);
		const idx = saleTemplate.steps.indexOf(firstPizza);
		return idx;
	};

	const nextTab = () => {
		stackNavigation.current.setMain(stackNavigation.current.main + 1);
	};

	const goToTab = (
		tabIndex = 0,
		shouldDuplicate = false,
		shouldDuplicateLast = false,
	) => {
		if (shouldDuplicate) {
			const maxSteps = tabIndex - stackNavigation.current.main;
			stackNavigation.duplicateSubStack(
				stackNavigation.current.main,
				maxSteps,
				shouldDuplicateLast,
			);
		}
		stackNavigation.current.setMain(tabIndex);
	};

	const onCloseHandler = () => {
		const title = isEdit
			? translate("builderModal_cancelModal_cancelEditTitle")
			: isSale
			? translate("builderModal_cancelModal_cancelSaleTitle")
			: translate("builderModal_cancelModal_cancelTitle");

		dispatch(
			Actions.addPopup({
				type: popupTypes.TWO_ACTION,
				payload: {
					type: TWO_ACTION_TYPES.GARBAGE,
					height: 60,
					title,
					isLottie: true,
					mainBtnText: translate(
						isEdit
							? "builderModal_cancelModal_yesEditButton_label"
							: "builderModal_cancelModal_yesButton_label",
					),
					mainBtnFunc: closeHandler,
					subBtnText: translate("builderModal_cancelModal_noButton_label"),
					subBtnFunc: () => undefined,
				},
			}),
		);
	};

	const showButton = () => {
		setButtonAnimation(clsx(styles["slide-in"]));
	};

	const hideButton = (animated = true) => {
		setButtonAnimation(`${animated ? styles["animated"] : ""}`);
	};

	const closeHandler = (callback = null) => {
		typeof closeBuilder === "function" && closeBuilder();
		typeof onClose === "function" && onClose();
		ref.current?.animateOut(() => {
			typeof callback === "function" && callback();
			dispatch(Actions.setIsUserAgreeToReset(false));
			dispatch(Actions.setDontShowDuplicatePizzaModal(false));
			dispatch(Actions.setDontShowUpgradePizzaModal(false));
			if (promoPopups.length === 0) {
				dispatch(Actions.resetPromoPopupState());
			}
		});
	};

	const endOfSale = isOnUpsale
		? (payload, isMixPizza) => endOfUpSale(payload, isMixPizza)
		: (payload, isMixPizza) => onEndSaleSubmit(payload, isMixPizza);

	const Render = () => {
		let screenProps = {
			params: stackNavigation.current.screen?.params,
			Button: buttonComponent,
			showButton: showButton,
			hideButton: hideButton,
			setStack: stackNavigation.setStack,
			nextTab,
			goToTab,
			isUpsaleBuilder: isOnUpsale,
			steps: tabs,
			maxDuplicate,
			stepIndex: isEdit ? editIndex : stepIndex,
			hasUpgrades: hasUpsales,
			isLastTab: stepIndex === tabs?.length - 1 || tabs === null || isEdit,
			onEndSale: endOfSale,
			nextTabText:
				stepIndex < tabs?.length - 1 ? tabs?.[stepIndex + 1]?.title : undefined,
			fatherEntity,
			isEdit,
			isSale,
			isFromPizzas,
			isMixPizza,
			priceOverrides: overrides,
			trigger,
			isOptimistic,
			isAnimating: entering || exiting,
			saleId,
		};

		const onSubmitSale = () => {
			stackNavigation.setStack({
				type: builderTypes.BUNDLE,
				params: {
					name: "blahblah",
				},
			});
		};

		const type = stackNavigation.current.screen?.type;
		switch (type) {
			case builderTypes.SIZE:
				return (
					<ChooseSize
						key={stepIndex + "-" + type}
						{...screenProps}
					/>
				);
			case builderTypes.PIZZAS:
				return (
					<PizzasBuilder
						key={stepIndex + "-" + type}
						isInBuilder
						menuId={currentMenuId}
						data={data}
						shouldSkipSize={shouldSkipSize}
						itemCategory={ITEM_CATEGORY.SPECIAL}
						itemCategory2={ITEM_CATEGORY2.DEAL}
						{...screenProps}
					/>
				);
			case builderTypes.TOPPINGS:
				return (
					<ToppingsBuilder
						key={stepIndex + "-" + type}
						stepsLen={tabs?.length}
						{...screenProps}
					/>
				);
			case builderTypes.DOUGH:
				return (
					<DoughBuilder
						key={stepIndex + "-" + type}
						onEndOfSaleAddCallback={onEndOfSaleAddCallback}
						closeHandler={closeHandler}
						{...screenProps}
					/>
				);
			case builderTypes.PRODUCT:
				return (
					<ProductDetails
						key={stepIndex + "-" + type}
						{...screenProps}
						goBack={stackNavigation.goBack}
						replace={stackNavigation.replace}
					/>
				);
			case builderTypes.SALE:
				return (
					<BundleBuilder
						key={stepIndex + "-" + type}
						{...screenProps}
						params={{
							...screenProps.params,
							title: tabs?.[stepIndex]?.title,
							onSubmit: onSubmitSale,
						}}
					/>
				);
			case builderTypes.BUNDLE:
				return (
					<BundleBuilder
						key={stepIndex + "-" + type}
						{...screenProps}
						builderMeta={tabs[stepIndex]}
						onSubmit={onContinue}
					/>
				);
			case builderTypes.ADD_TO_BASKET:
				return (
					<AddedToBasket
						key={stepIndex + "-" + type}
						{...screenProps}
						onDone={onUpSaleDone}
					/>
				);
		}
	};

	function addToCartEvent(id) {
		const product = catalogProducts[id];
		const listData = {
			value: product.value,
		};
		let toppings;
		if (
			product.subitem &&
			Array.isArray(product.subitems) &&
			product.subitems.length > 0
		) {
			product.subitems.forEach((subitem) => {
				const isPizzaItem = isPizzaItem(subitem);
				if (isPizzaItem && subitem.subitems.length > 0) {
					toppings = subitem.subitems
						.map((si) => catalogProducts[si.productId].name)
						.join(",");
				}
			});
		}
		const combinedProduct = Object.assign(
			{
				item_variant: toppings,
				index: stepIndex,
				item_category3: ITEM_CATEGORY3.POPULAR,
			},
			product,
		);
		AnalyticsService.addToCart(combinedProduct, listData);
	}

	function endOfUpSale(payload, isMixPizza) {
		const { item } = payload;

		function onAddToCartSuccess() {
			stackNavigation.setStack({
				type: builderTypes.ADD_TO_BASKET,
				params: {},
			});
			addToCartEvent(item.productId);
		}

		CartService.validateAddToCart(payload, (res) => {
			const remainingToppings = res?.item?.pricingBalance?.topping;
			const hasRemainingToppings =
				typeof remainingToppings === "number" && remainingToppings > 0;

			const newPayload = CartItemEntity.parseValidateRes(res);
			delete newPayload.pricingBalance;

			Actions.setCartItem({ ...newPayload, triggeredBy: TRIGGER.UPSALE });

			const updatedItem = { item: newPayload };

			return hasRemainingToppings
				? onShowRemainingUpgradesModal(
						updatedItem,
						hasRemainingToppings,
						remainingToppings,
						onAddToCartSuccess,
						isMixPizza,
				  )
				: CartService.addToCart(
						updatedItem,
						null,
						onAddToCartSuccess,
						true,
						TRIGGER.UPSALE,
				  );
		});
	}

	function onUpSaleDone() {
		typeof closeBuilder === "function" && closeBuilder();
	}

	/* Button Related */
	const onContinue = (btnProps) => {
		const { callback, isInternal, isError } = btnProps;
		if (!isError) {
			btnProps.state = false;
			if (typeof callback === "function") {
				callback();
			} else stackNavigation.goForward(null, isInternal);
		}
	};

	const buttonComponent = (props = {}) => {
		const { btnProps } = props;
		const buttonWrapperClass = btnProps?.className ?? "";
		const btnClassName = btnProps?.btnClassName ?? "";
		const extraStyles = btnProps?.extraStyles || {};

		return (
			<>
				<div className={styles["builder-gradient"]}></div>
				<div
					className={clsx(
						styles["builder-button-wrapper"],
						buttonAnimation,
						buttonWrapperClass,
					)}>
					{btnProps?.state ? (
						<Button
							focus={btnProps?.focus}
							animated={btnProps?.animated ?? true}
							onClick={() => onContinue(btnProps)}
							className={`${styles["builder-continue-btn"]} ${btnClassName}`}
							text={btnProps?.text}
							isError={btnProps?.isError ?? false}
							errorText={btnProps?.errorText}
							isBtnOnForm={btnProps?.isBtnOnForm ?? false}
							extraStyles={extraStyles}
							ariaLabel={btnProps?.text}
							disabledClickNeeded={false}
							disabled={btnProps.disabled}
						/>
					) : null}
				</div>
			</>
		);
	};

	const onTabChange = (tab) => {
		const currentIndex = stackNavigation.current.main;
		if (currentIndex === tab) return;
		if (isOnUpsale) {
			const prevStack = matrixBuilder[tab];

			const shouldRemoveProductFromSubStack =
				prevStack[prevStack.length - 1].type === builderTypes.PRODUCT;
			if (shouldRemoveProductFromSubStack) {
				stackNavigation.removeFrom2DStack(tab, prevStack.length - 1);
				return;
			}
		}
		stackNavigation.current.setMain(tab);
	};

	const handleGoBack = () => {
		if (isEdit) {
			return stackNavigation.goBack();
		}

		const step = stackNavigation.current.main;
		const currentStack = matrixBuilder[step ?? 0];
		const isToppings =
			stackNavigation.current.screen?.type === builderTypes.TOPPINGS;
		const shouldResetToppings =
			stackNavigation.current.screen?.type === builderTypes.TOPPINGS &&
			saleTemplate;
		if (isOnUpsale && isSale && step > 0) {
			const prevStack = matrixBuilder[step - 1];
			const shouldRemoveProductFromSubStack =
				prevStack[prevStack.length - 1].type === builderTypes.PRODUCT;
			if (shouldRemoveProductFromSubStack) {
				stackNavigation.removeFrom2DStack(step - 1, prevStack.length - 1);
				return;
			}
		}
		if (shouldResetToppings && !isEdit) {
			const step = stackNavigation.current.main;
			setTimeout(() => {
				// i did this set timeout, becuase i want the pizza animation to finish and them reset the id
				dispatch(
					Actions.setPizzaId({
						step: step ?? 0,
						id: "",
					}),
				);
			}, 500);
			dispatch(Actions.resetToppings(step));
			dispatch(Actions.resetPizzaSpecialRequests(step));
		}
		const shouldResetDough =
			stackNavigation.current.screen?.type === builderTypes.DOUGH ||
			(currentStack.length >= 2 &&
				currentStack[currentStack.length - 2].type !== builderTypes.DOUGH);
		if (shouldResetDough && !isEdit) {
			const step = stackNavigation.current.main;
			dispatch(Actions.resetDough(step));
		}
		// We delay from toppings for the fade out animation
		if (isToppings) {
			dispatch(Actions.setShouldFadeOut(true));
			dispatch(Actions.resetCurrentProductTemplate());
			const ti = setTimeout(() => {
				stackNavigation.goBack();
				dispatch(Actions.setShouldFadeOut(false));
				clearTimeout(ti);
			}, 350);
		} else {
			stackNavigation.goBack();
		}
		// }
	};

	return (
		<FullScreenPopup
			id={props.id}
			ref={ref}
			className={styles["builder-popup-wrapper"]}
			gradient>
			<BuilderHeader
				onClose={onCloseHandler}
				goBack={handleGoBack}
				isEdit={isEdit}
				activeTab={isEdit ? editIndex : stackNavigation.current.main}
				onTabChange={onTabChange}
				isFirst={stackNavigation.isFirst}
				tabs={tabs ?? []}
				showBackOnFirst={showBackOnFirst}
				isSale={isSale}
				hideBack={stackNavigation.current.screen?.header?.hideBack || false}
				editIndex={editIndex}
			/>
			<div className={styles["scroll-area"]}>
				<TransitionGroup
					className={`${styles["transition-wrapper"]} ${styles[animationClassTransition]}`}>
					<CSSTransition
						key={`${stackNavigation.current.screen?.type}-buillder-${
							stackNavigation?.current?.main ?? 0
						}`}
						timeout={300}
						classNames={styles["slide"]}
						enter={stackState?.length > 0 && entering}
						exit={stackState?.length > 0 && exiting}>
						<>{Render()}</>
					</CSSTransition>
				</TransitionGroup>
			</div>
		</FullScreenPopup>
	);
};
export default BuilderPopup;
