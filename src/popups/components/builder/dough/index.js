import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	getDoughImage,
	getPizzaImageByMeta,
	notEmptyObject,
	optimisticCart,
	relativeSize,
} from "utils/functions";
import { Swiper, SwiperSlide } from "swiper/react";
import * as popupTypes from "constants/popup-types";
/* Redux */
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

/* Components */
import DoughType from "./components/DoughType";
import OptionsModal from "./components/BlurModal";

/* Assets */
import styles from "./index.module.scss";

import pizzaBuildingTypes from "../../../../constants/pizza-building-types";
import doughMatrixEnum from "../../../../constants/doughMatrixEnum";
import builderTypes from "../../../../constants/builder-types";
import doughAnimationPhases from "../../../../constants/doughAnimationPhases";
import PizzaTreeService from "../../../../services/PizzaTreeService";
import clsx from "clsx";
import CartService from "services/CartService";
import { STEPS } from "constants/validation-steps-enum";
import useTranslate from "hooks/useTranslate";
import { TRIGGER } from "constants/trigger-enum";
import AnimatedPizza from "components/AnimatedPizza";
import { VALIDATION_STATUS } from "constants/ValidationStatusEnum";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import PizzaBuilderService from "services/PizzaBuilderService";
import { UPSALES_TYPES } from "constants/upsales-types";
import { Store } from "redux/store";
import { META_ENUM } from "constants/menu-meta-tags";
import SRContent from "../../../../components/accessibility/srcontent";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import EmarsysService from "utils/analyticsService/EmarsysService";
import TWO_ACTION_TYPES from "constants/two-actions-popup-types";

const DoughBuilder = (props) => {
	const {
		setStack = () => {},
		Button = () => {},
		params = {},
		stepIndex = 0,
		fatherEntity,
		isEdit,
		isSale,
		isRecommendedDoughPizza,
		isLastTab = false,
		isMixPizza = false,
		isFromPizzas = false,
		closeHandler,
		showButton = () => {},
		hideButton = () => {},
		onEndSale,
		nextTab,
		goToTab,
		steps,
		maxDuplicate,
		onEndOfSaleAddCallback,
		trigger = "",
		isOptimistic,
	} = props;
	const {
		possiblePizzas,
		subItems = [],
		isSinglePizza = false,
		type,
		isMixPizzaFromParams = false,
		subItemsFromParams = null,
		doughKey,
	} = params;
	// TODO: Handle mix pizza in builder and duplicate mix pizza; also fix edit.
	const stackDir = useSelector((store) => store.stackState.direction);
	const animatedPizzaRef = useRef();
	const dispatch = useDispatch();
	const [data, setData] = useState();
	const [position, setPosition] = useState();
	const [showBlur, setShowBlur] = useState(false);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);

	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);
	const saleObj = useSelector((store) => store.cartItem);
	const builder = useSelector((store) => store.builder);
	const dough = builder.dough?.[stepIndex ?? 0];
	const pizzaId = useSelector(
		(store) => store.builder.pizzaId?.[stepIndex ?? 0],
	);

	const isDoughNotExist =
		dough && dough.hasOwnProperty("type") && typeof dough["type"] === "undefined";

	const fadeIn = typeof dough === "object";
	const [shouldFadeIn, setShouldFadeIn] = useState(!fadeIn);
	const [shouldFadeOut, setShouldFadeOut] = useState(false);
	const isButtonDisabled = useRef(true);
	const deviceState = useSelector((store) => store.deviceState);
	const doughTypes = useSelector((store) => store.pizzaSelection);
	const pizzaObj = isSale ? saleObj?.subitems?.[stepIndex] : saleObj;
	const selectedPizzaId = useSelector(
		(store) => store.builder.pizzaId?.[stepIndex],
	);
	const pizza = useMenus(selectedPizzaId, ActionTypes.PRODUCT);
	const pizzaImg = getPizzaImageByMeta(pizza.meta);
	const user = useSelector((store) => store.userData);
	const userAgreedReset = useSelector((store) => store.userAgreeToReset);
	const isSingleMixPizza = isMixPizza && isFromPizzas;
	const translate = useTranslate();
	const [pizzaClassName, setPizzaClassName] = useState("");
	const shouldFilterByArray =
		Array.isArray(possiblePizzas) && Array.isArray(possiblePizzas[0]);
	const doughSize = possiblePizzas
		? PizzaTreeService[
				shouldFilterByArray ? "filterDoughSizesFromArray" : "filterDoughSizes"
		  ](possiblePizzas)
		: doughKey;
	const doughTypesArr = possiblePizzas
		? PizzaTreeService[
				shouldFilterByArray ? "filterDoughTypesByArray" : "filterDoughTypes"
		  ](possiblePizzas, doughSize)
		: undefined;
	const doughExtras = possiblePizzas
		? PizzaTreeService[
				shouldFilterByArray ? "filterDoughExtrasByArray" : "filterDoughExtras"
		  ](possiblePizzas, doughSize, doughTypesArr)
		: undefined;
	const doughOptions = possiblePizzas
		? PizzaTreeService[
				Array.isArray(possiblePizzas)
					? "filterDoughOptionsByArray"
					: "filterDoughOptions"
		  ](possiblePizzas, doughSize, doughTypesArr, doughExtras)
		: undefined;
	const doughType = builder["dough"]?.[stepIndex]?.["type"];
	const doughExtra = builder["dough"]?.[stepIndex]?.["extra"];
	const doughOption = builder["dough"]?.[stepIndex]?.["option"];
	const finalPossiblePizzas = useMemo(
		() => getFinalPossiblePizzas(),
		[dough, doughKey],
	);
	const nonVeganPizza = finalPossiblePizzas?.["muzzarella"];
	const veganPizza = finalPossiblePizzas?.["vegan"];

	const btnProps = {
		state: checkButton(dough),
		text: isSingleMixPizza
			? translate("builderModal_toppingsBuilder_last_pizza")
			: isMixPizza || isMixPizzaFromParams
			? translate("builderModal_doughBuilder_mixPizza_continue_button")
			: translate("builderModal_doughBuilder_continue_button"),
		className: clsx(
			styles["submit-button"],
			shouldFadeOut ? styles["fade-out"] : "",
			shouldFadeIn ? styles["fade-in"] : "",
		),
		focus: true,
		animated: false,
		extraStyles: styles,
		isInternal: true,
		callback: () =>
			isSingleMixPizza || isMixPizzaFromParams
				? handleMixPizza()
				: onValidateSubmit(),
	};

	useEffect(() => {
		if (isEdit) {
			if (isDoughNotExist) {
				const thisPizza = isSale
					? saleObj?.subitems[stepIndex].productId
					: saleObj?.productId;
				const pizza = PizzaTreeService.getPizzaPathById(thisPizza);
				if (pizza?.[doughMatrixEnum.TYPE]) {
					onDoughChange("type", pizza[doughMatrixEnum.TYPE]);
				}
				if (pizza[doughMatrixEnum.CRUST]) {
					onDoughChange("extra", pizza[doughMatrixEnum.CRUST]);
				}
				if (pizza[doughMatrixEnum.CRUST_FLAVOR]) {
					onDoughChange("option", pizza[doughMatrixEnum.CRUST_FLAVOR]);
				}
			}
			showButton();
		}
	}, []);

	const foldPizza = (callback = false) => {
		animatedPizzaRef.current?.play(() => {
			setPizzaClassName("");
			isButtonDisabled.current = false;
			typeof callback === "function" && callback();
		});
	};

	const unfoldPizza = (callback = false) => {
		animatedPizzaRef.current?.reverse(() => {
			typeof callback === "function" && callback();
		});
	};

	const getDoughTypes = () => {
		if (notEmptyObject(doughTypes)) {
			if (doughTypesArr) {
				const tempTypes = JSON.parse(JSON.stringify(doughTypes));
				const types = Object.keys(tempTypes[doughSize].subs).filter((type) =>
					doughTypesArr.includes(type),
				);
				return [types, "type"];
			}
			return [Object.keys(doughTypes[doughSize]?.subs), "type"];
		}
		return [];
	};

	const getExtraTypes = (type = dough?.type) => {
		if (doughTypes && type) {
			const currentType = doughTypes[doughSize].subs[type];
			if (!PizzaTreeService.hasOptions(currentType)) {
				const onlyOption = Object.keys(currentType.subs)[0];
				return [[], "extra"];
			}
			if (doughExtras) {
				const tempTypes = JSON.parse(JSON.stringify(doughTypes));
				const extras = Object.keys(tempTypes[doughSize].subs[type].subs).filter(
					(type) => doughExtras.includes(type),
				);
				return [extras, "extra"];
			}
			return [Object.keys(currentType.subs), "extra"];
		}
		return [];
	};

	const getOptionTypes = (extra, type = dough?.type) => {
		if (doughTypes && type && extra) {
			const currentType = doughTypes[doughSize].subs[type];
			const currentExtra = currentType.subs[extra];
			if (!PizzaTreeService.hasOptions(currentExtra)) {
				return [[], "option"];
			}
			if (
				doughOptions &&
				doughTypes[doughSize]?.subs[type ?? doughType]?.subs[extra ?? doughExtra]
					?.subs
			) {
				const tempTypes = JSON.parse(JSON.stringify(doughTypes));
				const options = Object.keys(
					tempTypes[doughSize].subs[type ?? doughType].subs[extra ?? doughExtra]
						.subs,
				).filter((type) => doughOptions.includes(type));
				if (options.length === 1 && !doughOption) {
					dispatch(
						Actions.updateDough({
							step: stepIndex ?? 0,
							data: {
								option: options[0],
							},
						}),
					);
				}
				return [options, "option"];
			}
			const tempTypes = JSON.parse(JSON.stringify(doughTypes));
			const treeOptions =
				tempTypes[doughSize].subs[type ?? doughType]?.subs[extra ?? doughExtra];
			if (
				typeof treeOptions === "object" &&
				treeOptions.hasOwnProperty("subs") &&
				typeof treeOptions.subs === "object"
			) {
				const options = Object.keys(treeOptions?.subs);
				if (!PizzaTreeService.isKeyFinal(treeOptions)) {
					return [options, "option"];
				}
			}
			return [];
		}
		return [];
	};

	const getFinalPizza = () => {
		let pizza = doughTypes[doughSize].subs[doughType]?.subs[doughExtra];
		pizza = PizzaTreeService.isKeyFinal(pizza)
			? pizza?.subs["final"]?.subs["muzzarella"]
			: pizza?.subs[doughOption]?.subs["final"]?.subs["muzzarella"];
		return pizza;
	};

	useEffect(() => {
		if (!doughTypes || (Array.isArray(doughTypes) && doughTypes.length === 0)) {
			PizzaTreeService.init();
		}
	}, [doughTypes]);

	useEffect(() => {
		if (
			!checkButton(dough) &&
			fatherEntity &&
			Array.isArray(doughTypes) &&
			doughTypes.length > 0
		) {
			const thisPizza = pizzaObj;
			if (thisPizza.productId) {
				dispatch(
					Actions.setPizzaId({
						step: stepIndex ?? 0,
						id: thisPizza.productId,
					}),
				);
			}
			const thisPizzaArray = PizzaTreeService.getPizza(pizzaObj.productId);
			if (thisPizzaArray) {
				const localDough = {
					type: thisPizzaArray[doughMatrixEnum.TYPE],
					extra: thisPizzaArray[doughMatrixEnum.CRUST],
					option: thisPizzaArray[doughMatrixEnum.CRUST_FLAVOR],
				};
				dispatch(
					Actions.updateDough({
						step: stepIndex ?? 0,
						data: localDough,
					}),
				);
				const localPossiblePizzas = PizzaTreeService.getPossiblePizzasById(
					pizzaObj.productId,
				);
				setStack({
					type: builderTypes.TOPPINGS,
					params: {
						...params,
						possiblePizzas: localPossiblePizzas,
						isSquare: dough?.type,
						isMixPizza: isMixPizza || isMixPizzaFromParams,
					},
				});
			}
		}
	}, [fatherEntity, doughTypes]);

	function fadeInDoughTypes() {
		setShouldFadeIn(true);
	}

	const handleToppingAdd = (topping, initialPayload = null) => {
		const saleObj = initialPayload ? initialPayload : null;
		const item = PizzaBuilderService.addTopping(
			saleObj,
			stepIndex,
			topping,
			isSale,
		);
		return item;
	};

	const handleSwitchPizzaId = (upgrade, initialPayload = null) => {
		const saleObj = initialPayload ? initialPayload : null;
		const { productId, promoProductId } = upgrade;
		const item = PizzaBuilderService.switchPizzaId(
			saleObj,
			stepIndex,
			productId,
			promoProductId,
			isSale,
		);
		return item;
	};

	const onDuplicateCallback = (quantity = 1, payload = null) => {
		const isMaxDuplicateLikeMaxSteps =
			quantity === steps?.length || quantity === steps?.length - stepIndex;
		let callback;
		if (isMaxDuplicateLikeMaxSteps) {
			callback = (newPayload) => {
				goToTab(stepIndex + quantity - 1, true, true);
				onEndSale(newPayload, isMixPizza || isMixPizzaFromParams);
			};
		} else if (quantity > 1) {
			callback = () => goToTab(stepIndex + quantity, true);
		} else {
			callback = () => nextTab();
		}
		CartService.validateAddToCart(
			payload,
			(res) => {
				if (
					!res.overallstatus ||
					res.overallstatus === VALIDATION_STATUS.INCOMPLETE
				) {
					const item = CartItemEntity.parseValidateRes(res);

					const newPayload = {
						item,
						step: res.step,
					};
					dispatch(Actions.setCartItem(newPayload.item));
					typeof callback === "function" && callback(res);
				}
			},
			trigger,
		);
	};

	const showDuplicatePopup = (coverages) => {
		const isSquarePizza = !["classic", "", "spelt"].includes(dough.type);
		const pizza = getFinalPizza();
		const possiblePizzas = PizzaTreeService.getPossiblePizzasById(
			pizza.productId,
		);
		const pizzaProduct = catalogProducts[pizza.productId];
		const pizzaImg = getPizzaImageByMeta(pizzaProduct.meta);

		dispatch(
			Actions.addPopup({
				type: popupTypes.DUPLICATE_PIZZA,
				payload: {
					title: translate("duplicatePizzaModal_title"),
					subtitle: translate("duplicatePizzaModal_subtitle"),
					primaryBtnText: translate("duplicatePizzaModal_button"),
					primaryBtnOnPress: (payload, quantity) => {
						const newPaylaod = {
							...payload,
						};
						delete newPaylaod.item.pricingBalance;
						dispatch(Actions.setCartItem(newPaylaod.item));
						setStack({
							type: builderTypes.TOPPINGS,
							params: {
								...params,
								possiblePizzas,
								pizzaImg: pizzaImg,
								isSquare: dough?.type,
								isMixPizza: isMixPizza || isMixPizzaFromParams,
							},
						});
						onDuplicateCallback(quantity, newPaylaod);
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
	};

	function getFinalPossiblePizzas() {
		let finalPossiblePizzas = {};
		if (typeof dough === "object" && Object.keys(dough).length > 0) {
			const { type, extra, option } = dough;
			if (doughTypes) {
				const conditionalSize = doughKey ?? doughSize;
				const conditionalType = doughType ?? type;
				const conditionalExtra = doughExtra ?? extra;
				const hasType =
					doughTypes[conditionalSize].subs?.[conditionalType] !== undefined;
				const hasExtra =
					doughTypes[conditionalSize].subs?.[conditionalType]?.subs?.[
						conditionalExtra
					] !== undefined;
				const hasOption = !PizzaTreeService.isKeyFinal(
					doughTypes[doughSize].subs?.[conditionalType]?.subs?.[conditionalExtra],
				);
				finalPossiblePizzas = doughTypes[conditionalSize].subs?.[conditionalType];
				if (hasExtra) {
					finalPossiblePizzas = finalPossiblePizzas?.subs?.[extra];
				}
				if (hasOption) {
					finalPossiblePizzas =
						finalPossiblePizzas?.subs?.[option]?.subs?.final.subs;
				} else {
					finalPossiblePizzas = finalPossiblePizzas?.subs?.final?.subs;
				}
			}
		}

		return finalPossiblePizzas;
	}

	const getPizzaId = (veganPizza, nonVeganPizza) => {
		let newPizzaId;
		if (!veganPizza) {
			newPizzaId = nonVeganPizza.productId;
		} else {
			newPizzaId =
				dough.vegan && dough.vegan === "vegan"
					? veganPizza.productId
					: nonVeganPizza?.productId;
		}
		let currentPizzaId;
		if (isSale) {
			currentPizzaId = saleObj?.subitems?.[stepIndex]?.productId;
		} else {
			currentPizzaId = saleObj.productId;
		}

		return { newPizzaId, currentPizzaId };
	};

	const handleAnimationOut = (finalPossiblePizzas) => {
		setShouldFadeOut(true);
		setTimeout(() => {
			setPizzaClassName(styles["down"]);
			setTimeout(() => {
				unfoldPizza(() => {
					setStack({
						type: pizzaBuildingTypes.TOPPINGS,
						params: {
							...params,
							possiblePizzas: finalPossiblePizzas,
							pizzaType: dough?.type ?? builder.dough?.[stepIndex ?? 0],
							isSquare: dough?.type ?? builder.dough?.[stepIndex ?? 0],
						},
					});
				});
			}, 200);
		}, 400);
	};

	function renderResetModal(callback) {
		dispatch(
			Actions.addPopup({
				type: popupTypes.TWO_ACTION,
				payload: {
					type: TWO_ACTION_TYPES.UPDATE,
					title: translate("edit_reset_toppings"),
					mainBtnText: translate("edit_reset_toppings_main_button"),
					subBtnText: translate("edit_reset_toppings_secondary_button"),
					capsuleButton: true,
					mainBtnFunc: () => {
						dispatch(Actions.setIsUserAgreeToReset(true));
						callback();
					},
				},
			}),
		);
	}

	const onValidateSubmit = () => {
		const { newPizzaId, currentPizzaId } = getPizzaId(veganPizza, nonVeganPizza);

		dispatch(
			Actions.setPizzaId({
				step: stepIndex ?? 0,
				id: newPizzaId ? newPizzaId : nonVeganPizza?.productId,
			}),
		);

		const shouldReset = currentPizzaId && newPizzaId !== currentPizzaId;

		if (isEdit && shouldReset) {
			renderResetModal(() => {
				onSubmit(newPizzaId, nonVeganPizza, true, finalPossiblePizzas);
			});
		} else {
			onSubmit(newPizzaId, nonVeganPizza, shouldReset, finalPossiblePizzas);
		}
	};

	const onSubmit = (
		newPizzaId,
		nonVeganPizza,
		shouldReset,
		finalPossiblePizzas,
	) => {
		if (shouldReset) {
			dispatch(Actions.resetToppings(stepIndex));
			dispatch(Actions.resetPizzaSpecialRequests(stepIndex));
		}

		const newCartItem = PizzaBuilderService.switchPizzaId(
			saleObj,
			stepIndex,
			newPizzaId ? newPizzaId : nonVeganPizza?.productId,
			null,
			isSale,
			shouldReset,
		);

		dispatch(
			Actions.setPizzaId({
				step: stepIndex ?? 0,
				id: newPizzaId ? newPizzaId : nonVeganPizza?.productId,
			}),
		);

		dispatch(Actions.setCartItem(newCartItem));
		dispatch(Actions.setIsUserAgreeToReset(false));
		handleAnimationOut(finalPossiblePizzas);

		// const possibleIds = Object.values(finalPossiblePizzas).map(
		// 	(pizza) => pizza.productId,
		// );
	};

	const handleUpgradeByType = (upgrade, type, initialPayload = null) => {
		const formattedPayload = initialPayload.hasOwnProperty("item")
			? initialPayload.item
			: initialPayload;
		switch (type) {
			case UPSALES_TYPES.ADD_SUB_ITEM:
				return handleToppingAdd(upgrade, formattedPayload);
			case UPSALES_TYPES.CHANGE_ITEM:
				return handleSwitchPizzaId(upgrade, formattedPayload);
		}
	};

	const getToppingStep = () => {
		let toppingStep;
		subItemsFromParams.forEach((si) => {
			const topping = catalogProducts[si.productId];
			const coverage = si.quarters.reduce(
				(o, key) => Object.assign(o, { [key]: 1 }),
				{},
			);
			toppingStep = {
				step: stepIndex,
				id: si.productId,
				coverage,
				assetVersion: topping.assetVersion,
			};
		});
		return toppingStep;
	};

	const handleNextTab = (toppingStep) => {
		if (!user?.showDuplicatePizza && steps[stepIndex]?.allowCopyToNextSteps) {
			showDuplicatePopup(toppingStep);
		} else typeof nextTab === "function" && nextTab();
	};

	const onUpgradeEnd = (payload) => {
		dispatch(Actions.setDontShowUpgradePizzaModal(true));
		const parsePayload = JSON.parse(JSON.stringify(payload));
		delete parsePayload.discount;
		delete parsePayload.pricingBalance;

		if (!isSale) {
			if (isOptimistic) {
				const { productId } = parsePayload;
				optimisticCart(productId, 1);
				typeof closeHandler === "function" &&
					closeHandler(() => {
						typeof onEndOfSaleAddCallback === "function" && onEndOfSaleAddCallback();
					});
				const anim = setTimeout(() => {
					CartService.addToCart(
						{ item: parsePayload },
						null,
						() => {
							clearTimeout(anim);
						},
						true,
						isEdit ? TRIGGER.BASKET : TRIGGER.RECOMMENDED_KIT,
					);
				}, 570);
			} else {
				CartService.addToCart(
					{ item: parsePayload },
					null,
					() => {
						typeof closeHandler === "function" &&
							closeHandler(() => {
								typeof onEndOfSaleAddCallback === "function" &&
									onEndOfSaleAddCallback();
							});
					},
					true,
					isEdit ? TRIGGER.BASKET : TRIGGER.RECOMMENDED_KIT,
				);
			}
		} else {
			const toppingStep = getToppingStep();
			if (typeof toppingStep === "object") {
				const pizza = getFinalPizza();

				const possiblePizzas = PizzaTreeService.getPossiblePizzasById(
					pizza.productId,
				);

				setStack({
					type: builderTypes.TOPPINGS,
					params: {
						...params,
						possiblePizzas,
						isSquare: dough?.type,
						isMixPizza: isMixPizza || isMixPizzaFromParams,
					},
				});

				isLastTab
					? typeof onEndSale === "function" &&
					  onEndSale({ item: payload }, isMixPizza || isMixPizzaFromParams)
					: handleNextTab({ [toppingStep.id]: toppingStep });
			}
		}
		EmarsysService.setViewUpgradePizza(payload?.subitems, isSale, stepIndex);
	};

	const updateBuilderCoverages = (item) => {
		const subitemsOnPizza = isSale
			? item.subitems?.[stepIndex].subitems
			: item.subitems;
		subitemsOnPizza.forEach((si) => {
			const topping = catalogProducts[si.productId];
			const isMix = topping?.meta === META_ENUM.MIX_TOPPING_ITEM;
			const coverage = si.quarters?.reduce((a, v) => ({ ...a, [v]: 1 }), {}) ?? {};
			const res = {
				id: si.productId,
				isMix,
				assetVersion: topping.assetVersion,
				coverage,
			};
			dispatch(Actions.updateTopping(res));
		});
	};

	const RenderUpgradesPopups = (item, upgrades) => {
		updateBuilderCoverages(item);
		const id = isSale ? item.subitems?.[stepIndex].productId : item.productId;
		dispatch(
			Actions.setPizzaId({
				step: stepIndex ?? 0,
				id,
			}),
		);

		dispatch(
			Actions.addPopup({
				type: popupTypes.MIXED_UPGRADES_POPUP,
				payload: {
					upgrades: upgrades,
					isSquare: dough?.type,
					isSale,
					stepIndex,
					primaryBtnOnPress: (cartItem) => {
						onUpgradeEnd(cartItem);
					},

					secondaryBtnOnPress: (cartItem) => {
						onUpgradeEnd(cartItem);
					},
				},
			}),
		);
	};

	const onSubmitMixPizza = () => {
		const pizza = getFinalPizza();
		const payload = {
			step: `${STEPS.ADD_PIZZA} - ${pizza.productId}`,
			item: {
				productId: pizza.productId,
				subitems: [...subItems],
				quantity: 1,
			},
		};
		CartService.validateAddToCart(
			payload,
			(res) => {
				const { item } = res;
				dispatch(Actions.setCartItem(payload.item));
				const upgrades = item.upgrades;
				if (upgrades?.length > 0) {
					RenderUpgradesPopups(item, upgrades);
				} else {
					if (isOptimistic) {
						const { productId } = payload.item;
						optimisticCart(productId, 1);
						typeof closeHandler === "function" &&
							closeHandler(() => {
								typeof onEndOfSaleAddCallback === "function" &&
									onEndOfSaleAddCallback();
							});
						const anim = setTimeout(() => {
							CartService.addToCart(
								payload,
								null,
								() => {
									clearTimeout(anim);
								},
								true,
								isEdit ? TRIGGER.BASKET : TRIGGER.RECOMMENDED_KIT,
							);
						}, 570);
					} else {
						CartService.addToCart(
							payload,
							null,
							() => {
								typeof closeHandler === "function" &&
									closeHandler(() => {
										typeof onEndOfSaleAddCallback === "function" &&
											onEndOfSaleAddCallback();
									});
							},
							true,
							isEdit ? TRIGGER.BASKET : TRIGGER.RECOMMENDED_KIT,
						);
					}
				}
			},
			trigger,
		);
	};

	const handleMixPizzaInBuilder = () => {
		const { newPizzaId, currentPizzaId } = getPizzaId(veganPizza, nonVeganPizza);
		const saleItem = JSON.parse(JSON.stringify(saleObj));
		const pizza = getFinalPizza();
		const possiblePizzas = PizzaTreeService.getPossiblePizzasById(
			pizza.productId,
		);
		dispatch(
			Actions.setPizzaId({
				step: stepIndex ?? 0,
				id: pizza.productId,
			}),
		);
		const toppingStep = getToppingStep();
		const stepItem = {
			productId: pizza.productId,
			subitems: [...subItemsFromParams],
			quantity: 1,
		};
		saleItem.subitems[stepIndex] = stepItem;
		const payload = {
			step: `${STEPS.ADD_PIZZA} - ${pizza.productId}`,
			item: {
				...saleItem,
			},
		};
		CartService.validateAddToCart(
			payload,
			(res) => {
				const { item } = res;
				dispatch(Actions.updateTopping(toppingStep));
				dispatch(Actions.setCartItem(payload.item));
				const upgrades = item.subitems[stepIndex]?.upgrades ?? [];
				if (upgrades?.length > 0 && !isEdit) {
					RenderUpgradesPopups(item, upgrades);
				} else {
					const isValidate =
						!isEdit ||
						(isEdit && newPizzaId === currentPizzaId) ||
						(isEdit && userAgreedReset);

					if (isValidate) {
						setStack({
							type: builderTypes.TOPPINGS,
							params: {
								...params,
								possiblePizzas,
								isSquare: dough?.type,
								isMixPizza: isMixPizza || isMixPizzaFromParams,
							},
						});
					} else {
						return renderResetModal(() => {
							isLastTab
								? typeof onEndSale === "function" && onEndSale(res)
								: handleNextTab({ [toppingStep.id]: toppingStep });
						});
					}

					isLastTab
						? typeof onEndSale === "function" && onEndSale(res)
						: handleNextTab({ [toppingStep.id]: toppingStep });
				}
			},
			trigger,
		);
	};

	function handleMixPizza() {
		dispatch(Actions.setIsUserAgreeToReset(false));
		return isSingleMixPizza && !isMixPizzaFromParams
			? onSubmitMixPizza()
			: handleMixPizzaInBuilder();
	}

	function checkButton(dough = {}) {
		if (typeof dough === "object") {
			const { type, extra, option } = dough;
			if (doughTypes) {
				const conditionalSize = doughKey ?? doughSize;
				const conditionalType = type;
				const conditionalExtra = extra;
				const hasType =
					doughTypes[conditionalSize]?.subs?.[conditionalType] !== undefined;
				const hasExtra =
					doughTypes[conditionalSize]?.subs?.[conditionalType]?.subs?.[
						conditionalExtra
					] !== undefined;
				const hasOption = PizzaTreeService.isKeyFinal(
					doughTypes[conditionalSize]?.subs?.[conditionalType]?.subs?.[
						conditionalExtra
					],
				)
					? true
					: doughTypes[conditionalSize]?.subs?.[conditionalType]?.subs?.[
							conditionalExtra
					  ]?.subs?.[option] !== undefined;
				return hasType && hasExtra && hasOption;
			} else {
				return false;
			}
		}
		return false;
	}

	const onDoughChange = (name, value, position, data) => {
		if (isButtonDisabled.current) return;
		const res = { ...dough };
		res[name] = value;
		if (isRecommendedDoughPizza) {
			if (name === "option") {
				const filteredDough = possiblePizzas.filter(
					(pizza) => pizza[doughMatrixEnum.CRUST_FLAVOR] === value,
				)[0];
				res.type = filteredDough[doughMatrixEnum.TYPE];
				res.extra = filteredDough[doughMatrixEnum.CRUST];
			} else if (name === "extra") {
				const filteredDough = possiblePizzas.filter(
					(pizza) => pizza[doughMatrixEnum.CRUST] === value,
				)[0];
				res.type = filteredDough[doughMatrixEnum.TYPE];
			}
		}

		const [extras] = res.type ? getExtraTypes(res.type) : [[]];
		const onlyOneExtra = extras?.length === 1;
		res.extra = name === "type" ? (onlyOneExtra ? extras[0] : null) : res.extra;

		const [options] = res.extra ? getOptionTypes(res.extra) : [[]];
		const onlyOneOption = options?.length === 1;
		res.option = ["type", "extra"].includes(name)
			? name === "extra" && res.extra !== dough?.extra
				? onlyOneOption
					? options[0]
					: null
				: res.option
			: res.option;

		dispatch(
			Actions.updateDough({
				step: stepIndex ?? 0,
				data: res,
			}),
		);
		if (position) {
			setShowBlur(true);
			setData(data);
			setPosition(position);
		}

		if (!checkButton(res)) {
			hideButton(false);
		} else {
			showButton();
		}
	};

	const closeModal = () => {
		setShowBlur(false);
	};

	const getItem = (key = "", reduxField = "") => {
		switch (reduxField) {
			case "type":
				return doughTypes[doughSize].subs[key];
			case "extra":
				return doughTypes[doughSize].subs[dough?.type]?.subs[key];
			case "option":
				return doughTypes[doughSize].subs[dough?.type]?.subs?.[dough?.extra]
					?.subs?.[key];
		}
	};

	const RenderSlider = (items = [], className = "", name = "", root = {}) => {
		if (items?.length <= 1) {
			return null;
		}
		const swiperOption = {
			breakpoints: {
				0: {
					slidesPerView: 3,
				},
				768: {
					slidesPerView: 4,
				},
				1280: {
					slidesPerView: 4,
				},
			},
			spaceBetween: relativeSize(30),
			autoplay: false,
			loop: false,
		};
		const sortedItems = items.sort((a, b) =>
			parseInt(root[a]?.sortIndex) < parseInt(root[b]?.sortIndex) ? -1 : 1,
		);
		let srText = "";
		switch (name) {
			case "type":
				srText = "סוג בצק";
				break;
			case "extra":
				srText = "סוג שוליים";
				break;
		}
		return (
			<Swiper
				aria-label={srText}
				aria-description={srText}
				aria-live={"polite"}
				{...swiperOption}
				className={className}>
				{sortedItems.map((item, idx) => {
					let options = [];
					if (name === "extra") {
						options = getOptionTypes(item)[0];
					}
					const hasOptions = options.length > 0;
					const optionText =
						hasOptions && dough?.option !== null ? dough.option : undefined;
					const isSelected =
						item === dough?.[name] &&
						(hasOptions ? options.includes(dough?.option) : true);
					const Item = getItem(item, name);

					let comment = "";
					if (Item?.price && Number(Item.price) > 0) {
						let price = Number(Item.price).toFixed(displayDecimalPoint);
						comment = translate("pizzaSelection-extra-price").replace("[_]", price);
					} else if (Item?.price && isNaN(Number(Item.price))) {
						comment = translate(Item.price); // Wait for translate
					}
					const finalPizzaSubs = PizzaTreeService.getPizzaFinalSubs(Item);
					const id =
						typeof finalPizzaSubs === "object"
							? finalPizzaSubs["muzzarella"]?.productId
							: "";

					let isPrimaryDoughInStock = false;
					const finalPizzasItemsSubs = Item.subs;
					const finalPizzasItemsSubsArr = Object.values(finalPizzasItemsSubs);
					finalPizzasItemsSubsArr.map((subItem) => {
						const itemId = subItem?.subs?.final?.subs?.muzzarella?.productId;
						const isItemOutOfStock = catalogProducts[itemId]?.outOfStock;

						if (!isItemOutOfStock) {
							isPrimaryDoughInStock = true;
						}
					});

					const srText = createAccessibilityText(
						translate("accessibility_doughBuilder_type").replace(
							"{doughType}",
							translate(`pizzaSelection-${name === "type" ? item : dough.type}`),
						),
						name === "extra" && translate(`pizzaSelection-${item}`),
						hasOptions &&
							options.includes(dough.option) &&
							translate("accessibility_doughBuilder_flavor").replace(
								"{flavor}",
								translate(`pizzaSelection-${dough.option}`),
							),
						comment &&
							comment
								.replace("[", "")
								.replace("]", "")
								.replace("+", translate("accessibility_doughBuilder_additionalCost")),
					);
					return (
						<SwiperSlide key={`${name}-dough-item-${item}-${idx}`}>
							<DoughType
								shouldFocus={idx === 0}
								id={id}
								name={name}
								image={getDoughImage(item)}
								text={translate("pizzaSelection-" + item)}
								value={item}
								info={translate("pizzaSelection-info-" + item)}
								comment={comment}
								onChange={onDoughChange}
								selected={isSelected}
								selectedText={
									optionText ? translate(`pizzaSelection-${optionText}`) : undefined
								}
								hasOptions={hasOptions}
								options={options}
								ariaDescription={srText}
								isChildrenInStock={isPrimaryDoughInStock}
							/>
						</SwiperSlide>
					);
				})}
			</Swiper>
		);
	};

	const getTitle = () => {
		return (
			<h1
				className={clsx(
					styles["title"],
					shouldFadeOut ? styles["fade-out"] : "",
					shouldFadeIn ? styles["fade-in"] : "",
				)}>
				{translate("builderModal_doughBuilder_which_dough")}
			</h1>
		);
	};

	const onPizzaImageLoad = () => {
		if (dough) {
			setPizzaClassName(styles["down-without-transition"]);
			// foldPizza(fadeInDoughTypes);
		} else {
		}
		foldPizza(fadeInDoughTypes);
	};

	const [doughs, doughName] = getDoughTypes();
	const [extras, name] = getExtraTypes();

	const onlyOptions = extras?.length === 1 && doughs?.length === 1;
	const [options] = onlyOptions ? getOptionTypes(extras[0]) : [];
	const onlyOneOption = options?.length === 1;
	return (
		<div className={styles["dough-builder-wrapper"]}>
			<SRContent
				role={"alert"}
				message={translate("builderModal_doughBuilder_which_dough")}
				ariaLive={"off"}
			/>
			<div className={styles["dough-content-wrapper"]}>
				<div className={styles["left-side"]}>
					{!deviceState.isDesktop && getTitle()}
					<div
						className={clsx(
							styles["dough-image-wrapper"],
							deviceState.notDesktop ? pizzaClassName : "",
						)}>
						<div className={styles["image"]}>
							<AnimatedPizza
								ref={animatedPizzaRef}
								onLoadImage={onPizzaImageLoad}
								type={doughType}
								reversed={stackDir === "backward"}
							/>
						</div>
					</div>
					{deviceState.isDesktop && Button({ btnProps })}
				</div>
				<div
					className={clsx(
						styles["right-side"],
						shouldFadeOut ? styles["fade-out"] : "",
						shouldFadeIn ? styles["fade-in"] : "",
					)}>
					{deviceState.isDesktop && getTitle()}
					{RenderSlider(
						doughs,
						styles["types-wrapper"],
						doughName,
						doughTypes?.[doughSize]?.subs,
					)}
					{RenderSlider(
						extras,
						styles["extras-wrapper"],
						name,
						doughTypes?.[doughSize]?.subs?.[dough?.type]?.subs,
					)}
					{onlyOptions &&
						RenderSlider(
							options,
							styles["types-wrapper"],
							"option",
							doughTypes?.[doughSize]?.subs?.[dough?.type]?.subs,
						)}
					{!deviceState.isDesktop && Button({ btnProps })}
				</div>
			</div>
			<OptionsModal
				show={!onlyOneOption && showBlur}
				onClose={() => closeModal()}
				onChange={onDoughChange}
				position={position}
				data={data}
				stepIndex={stepIndex}
				doughSize={doughSize}
			/>
		</div>
	);
};

export default DoughBuilder;
