import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import * as popupTypes from "constants/popup-types";
import SideDish from "components/SideDish";
import useMenus from "hooks/useMenus";
import {
	getAllToppingsFromSubitems,
	getFullMediaUrl,
	getInitialScreen,
	getPizzaImageByMeta,
	notEmptyObject,
	optimisticCart,
} from "utils/functions";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import useCartInMenu from "hooks/useCartInMenu";
import builderTypes from "constants/builder-types";
import animationTypes from "constants/animationTypes";
import doughMatrixEnum from "constants/doughMatrixEnum";
import PizzaTreeService from "services/PizzaTreeService";
import TabOptions from "constants/tab-menu-options";
import { VALIDATION_STATUS } from "constants/ValidationStatusEnum";
import { STEPS } from "constants/validation-steps-enum";
import CartService from "services/CartService";
import useTags from "hooks/useTags";
import { TRIGGER } from "constants/trigger-enum";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import PizzaBuilderService from "services/PizzaBuilderService";
import useGetMenuByMeta from "../../../hooks/useGetMenuByMeta";
import { META_ENUM } from "../../../constants/menu-meta-tags";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { PRODUCT } from "popups/popup-types";
import TWO_ACTION_TYPES from "constants/two-actions-popup-types";
import useTranslate from "hooks/useTranslate";

import EmarsysService from "utils/analyticsService/EmarsysService";
import { ITEM_CATEGORY, ITEM_CATEGORY2 } from "constants/AnalyticsTypes";

function RenderSideDishComponent(props) {
	const {
		item,
		stepIndex = 0,
		nextTab = () => {},
		setStack = () => {},
		isInBuilder = false,
		isEdit = false,
		mediaType = MEDIA_TYPES.PRODUCT,
		fatherEntity,
		isBuilderRecommended = false,
		steps,
		isLastTab,
		onEndSale,
		isSideDish,
		isSale,
		index,
		trigger = "",
		buttonTabIndex,
		className = "",
		pizzaCategory = "",
		priceOverride,
	} = props;

	const [disableClick, setDisableClick] = useState(false);
	const Product = useMenus(item.id, item.actionType);
	const saleObj = useSelector((store) => store.cartItem);
	const translate = useTranslate();
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const lang = useSelector((store) => store.generalData.lang);
	const isRecommendedPizza =
		typeof Product === "object" && !notEmptyObject(Product);
	const menuPath = useSelector((store) => store.menuPath);
	const imgUrl = getFullMediaUrl(item, mediaType, MEDIA_ENUM.IN_MENU);
	const isInPizzas = !isInBuilder && menuPath.mainNav === TabOptions.PIZZAS;
	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const listName = topNav?.elements?.find((el) => el.id === topNavId)?.label;
	const builder = useSelector((store) => store.builder);
	const dough = builder.dough?.[stepIndex ?? 0];
	const dispatch = useDispatch();
	const isComplex = Product?.templateId !== "";
	const isUnchangablePizza =
		!item?.subItems &&
		Array.isArray(item?.productIds) &&
		item.productIds.length === 1;

	const isUnchangablePizzaWithToppings =
		Array.isArray(item?.subItems) &&
		item.subItems.length > 0 &&
		Array.isArray(item?.productIds) &&
		item.productIds.length === 1;

	const isMixPizza =
		Array.isArray(item?.productIds) &&
		item.productIds.length > 0 &&
		Array.isArray(item?.subItems) &&
		item.subItems.length > 0;
	const [quantity, addToBasket, removeFromBasket] = useCartInMenu(item.id);

	const { url, label } = useTags(Product.tags);

	function getPayload() {
		return {
			title: Product?.nameUseCases?.Title,
			description: Product?.nameUseCases?.internet,
			price: Product.price,
			oldPrice: Product.priceBeforeDiscount,
			image: imgUrl,
			templateId: Product?.templateId,
			id: item.id,
			showPriceBeforeDiscount: Product.showPriceBeforeDiscount,
			max: Product?.quantity?.maxPerSale,

			setDisableClick: setDisableClick,
		};
	}

	function handlePizzaByType(_, rect) {
		if (!isInBuilder) {
			if (isUnchangablePizza || isUnchangablePizzaWithToppings) {
				const id = item?.productIds[0];
				addToCart(id, rect);
			} else {
				const possiblePizzas = item.productIds
					.map((pId) => PizzaTreeService.getPizza(pId))
					.filter((p) => typeof p !== "undefined");
				// the recommended pizza is either a mix pizza or a recommended dough.
				const onFinishCallback = () => {
					addToCartEvent(item.subItems[0]);
					addToCartAnimation(rect);
				};
				openBuilderModal(null, item, isMixPizza, possiblePizzas, onFinishCallback);
			}
		} else {
			handlePizzaByTypeInBuilder();
		}
	}

	function resetCartItemToppings(newPizzaId) {
		dispatch(Actions.resetToppings(stepIndex));
		const pizzaObj = CartItemEntity.getObjectLiteralItem(newPizzaId);
		const newCartItem = PizzaBuilderService.setSubItem(
			saleObj,
			stepIndex,
			pizzaObj,
		);
		dispatch(Actions.setCartItem(newCartItem));
	}

	function moveToNextStack(possiblePizzas, id, shouldUpdateCartItem = false) {
		const isSquare = PizzaTreeService.getPizzaPathById(id);
		const dough = PizzaTreeService.getDoughObjectWithId(id);

		if (shouldUpdateCartItem) {
			const newCartItem = PizzaBuilderService.switchPizzaId(
				saleObj,
				stepIndex,
				id,
				null,
				isSale,
				false,
			);

			dispatch(Actions.setCartItem(newCartItem));
		}

		dispatch(
			Actions.updateDough({
				step: stepIndex ?? 0,
				data: dough,
			}),
		);
		dispatch(
			Actions.setPizzaId({
				step: stepIndex ?? 0,
				id,
			}),
		);

		setStack({
			type: builderTypes.TOPPINGS,
			params: {
				templateId: item.templateId,
				title: item?.nameUseCases?.Title,
				image: {
					uri: getFullMediaUrl(item, MEDIA_TYPES.PRODUCT, MEDIA_ENUM.IN_MENU),
				},
				id: item.productIds[0],
				description: item?.nameUseCases?.SubTitle,
				oldPrice: item.priceBeforeDiscount,
				price: item.price,
				possiblePizzas,
				allowCopyToNextSteps: steps[stepIndex]?.allowCopyToNextSteps,
				isSquare: isSquare[doughMatrixEnum.TYPE],
			},
		});
	}

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

	function onUpgradeEnd(payload) {
		const parsePayload = { ...payload };
		delete parsePayload.discount;
		delete parsePayload.pricingBalance;
		const newPayload = { item: parsePayload };
		if (isLastTab) {
			typeof onEndSale === "function" && onEndSale(newPayload);
		} else {
			nextTab(newPayload);
		}
	}

	const RenderUpgradesPopups = (item, upgrades) => {
		updateBuilderCoverages(item);

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

	const renderResetToppingModal = (callback) => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.TWO_ACTION,
				payload: {
					type: TWO_ACTION_TYPES.UPDATE,
					title: translate("edit_reset_toppings"),
					mainBtnText: translate("edit_reset_toppings_main_button"),
					subBtnText: translate("edit_reset_toppings_secondary_button"),
					mainBtnFunc: callback,
					capsuleButton: true,
				},
			}),
		);
	};

	async function handlePizzaByTypeInBuilder() {
		const isRecommendedDough = !item.subItems;
		const possiblePizzas = item.productIds
			.map((pizza) => PizzaTreeService.getPizzaPathById(pizza))
			.filter((p) => typeof p !== "undefined");

		const prevPizzaId = isEdit && saleObj.subitems[stepIndex].productId;
		const newPizzaId = possiblePizzas[0][doughMatrixEnum.ID];

		if (isUnchangablePizza || isUnchangablePizzaWithToppings) {
			const id = item?.productIds[0];
			const hasTemplate =
				catalogProducts[id].templateId && catalogProducts[id].templateId.length > 0;
			if (!hasTemplate || isUnchangablePizzaWithToppings) {
				const temp = JSON.parse(JSON.stringify(saleObj));
				const saleEntity = CartItemEntity.getObjectLiteralItem(
					id,
					1,
					item.subItems,
				);

				temp.subitems[stepIndex] = saleEntity;
				const payload = {
					item: temp,
					step: `add recommended pizza ${id}`,
				};
				CartService.validateAddToCart(
					payload,
					(res) => {
						if (res.overallstatus !== VALIDATION_STATUS.ERROR) {
							dispatch(Actions.setCartItem(payload.item));
							const { item } = res;
							const { subitems } = item;
							const upgrades = subitems[stepIndex].upgrades;
							if (Array.isArray(upgrades) && upgrades.length > 0) {
								RenderUpgradesPopups(item, upgrades);
							} else {
								nextTab();
							}
						}
					},
					trigger,
				);
			} else {
				let newCartItem = saleObj;
				let pizzaObj = saleObj.subitems[stepIndex];

				if (possiblePizzas.length === 1) {
					if (!pizzaObj) {
						pizzaObj = CartItemEntity.getObjectLiteralItem(
							possiblePizzas[0][doughMatrixEnum.ID],
						);
						newCartItem = PizzaBuilderService.setSubItem(
							saleObj,
							stepIndex,
							pizzaObj,
						);
						dispatch(Actions.setCartItem(newCartItem));
					} else {
						if (prevPizzaId !== newPizzaId && isEdit) {
							return renderResetToppingModal(() => {
								dispatch(Actions.setIsUserAgreeToReset(true));
								resetCartItemToppings(newPizzaId);
								moveToNextStack(possiblePizzas, id);
							});
						}
					}
				}
				moveToNextStack(possiblePizzas, id, true);
			}
		} else {
			// the recommended pizza is either a mix pizza or a recommended dough.
			isRecommendedDough ? continueRecommendedDough() : continueMixPizza();
		}
	}

	async function continueRecommendedDough() {
		if (!Array.isArray(item.productIds)) return;
		const possiblePizzas = item.productIds
			.map((pId) => PizzaTreeService.getPizzaPathById(pId))
			.filter((p) => typeof p !== "undefined");
		const saleId = saleObj.productId;
		const screen = await PizzaTreeService.getInitialScreen(
			item.productIds,
			stepIndex,
			saleObj,
		);
		typeof setStack === "function" &&
			setStack({
				type: screen,
				params: {
					saleId,
					isFromPizzas: false,
					shouldSkipSize: true,
					possiblePizzas,
				},
			});
	}

	function continueMixPizza() {
		if (!Array.isArray(item.productIds)) return;

		const possiblePizzas = item.productIds
			.map((pId) => PizzaTreeService.getPizzaPathById(pId))
			.filter((p) => typeof p !== "undefined");
		const saleId = saleObj.productId;
		typeof setStack === "function" &&
			setStack({
				type: builderTypes.DOUGH,
				params: {
					saleId,
					isMixPizzaFromParams: true,
					subItemsFromParams: item?.subItems,
					isFromPizzas: false,
					shouldSkipSize: true,
					possiblePizzas,
				},
			});
	}

	function showProductPopup(item, rect) {
		if (disableClick) return;
		setDisableClick(true);
		const imagePlaceholder = document
			.getElementById("moving-product-image-popup-placeholder")
			.getBoundingClientRect();
		const to = {
			py: imagePlaceholder.y + imagePlaceholder.height * 0.15,
			width: imagePlaceholder.width,
			height: imagePlaceholder.height,
			right: imagePlaceholder.right,
			left: imagePlaceholder.left,
		};
		const from = {
			...rect,
		};
		dispatch(
			Actions.addAnimation({
				type: animationTypes.MOVING_IMAGE,
				payload: {
					from,
					to,
					image: imgUrl,
				},
			}),
		);

		const timeout = setTimeout(() => {
			// waiting for animation to complete

			dispatch(
				Actions.addPopup({
					type: popupTypes.PRODUCT,
					payload: {
						...getPayload(),
						onAddCallback: (payload) => {
							addToCartEvent(payload);
							addToCartAnimation(rect);
							CartService.optimisticAddToCart(
								payload,
								() => {
									dispatch(Actions.setCurrentProductTemplate(false));
								},
								() => onRemoveFromBasket(rect, true),
							);
						},
					},
				}),
			);
			clearTimeout(timeout);
		}, 712);

		const combinedItem = Object.assign(
			{
				item_list_name: listName,
				item_list_id: topNavId,
				index,
				item_category: pizzaCategory,
				item_category2: isInBuilder ? META_ENUM.DEALS : null,
			},
			Product,
		);

		const listData = { value: Product.price, currency: "ILS" };
		AnalyticsService.viewItem(combinedItem, listData);
	}

	function addToCartAnimation(rect) {
		const cartIcon = document.getElementById("cart-icon").getBoundingClientRect();
		const to = {
			py: cartIcon.y,
			width: cartIcon.width,
			height: cartIcon.height,
			right: cartIcon.right,
			left: cartIcon.left,
		};
		const from = {
			...rect,
		};
		dispatch(
			Actions.addAnimation({
				type: animationTypes.MOVING_IMAGE,
				payload: {
					from,
					to,
					image: imgUrl,
				},
			}),
		);
	}

	function removeFromBasketAnimation(rect) {
		const cartIcon = document.getElementById("cart-icon").getBoundingClientRect();
		const from = {
			py: cartIcon.y,
			width: cartIcon.width,
			height: cartIcon.height,
			right: cartIcon.right,
			left: cartIcon.left,
		};
		const to = {
			...rect,
		};
		dispatch(
			Actions.addAnimation({
				type: animationTypes.MOVING_IMAGE,
				payload: {
					from,
					to,
					image: imgUrl,
				},
			}),
		);
	}

	const viewEvent = () => {
		if (!isComplex) {
			EmarsysService.setViewSimple(Product);
		}
	};

	const selectItemEvent = () => {
		const listItem = {
			id: topNavId ? topNavId : 0,
			name: listName ? listName : 0,
		};
		const combinedItem = Object.assign(
			{
				index,
				item_category: pizzaCategory,
				item_category2: isInBuilder ? ITEM_CATEGORY2.DEAL : null,
			},
			Product,
		);
		AnalyticsService.selectItem(combinedItem, listItem);
	};

	const getProductAndList = (item) => {
		const id = item && item?.id ? item.id : item?.productId;
		const product = id ? catalogProducts[id] : undefined;
		const toppings = getAllToppingsFromSubitems(item?.subitems);

		const list = {
			value: Product.price,
			currency: "ILS",
		};

		const combinedProduct = Object.assign(
			{
				index,
				item_category: pizzaCategory,
				item_category2: isInBuilder ? ITEM_CATEGORY2.DEAL : null,
				item_list_id: topNavId,
				item_list_name: listName,
				coupon: "",
				item_variant: toppings,
			},
			product ? product : Product,
		);
		return [combinedProduct, list];
	};

	const addToCartEvent = (item) => {
		const [combinedProduct, list] = getProductAndList(item);
		AnalyticsService.addToCart(combinedProduct, list);
	};

	const removeFromCartEvent = () => {
		const [combinedProduct, list] = getProductAndList();
		AnalyticsService.removeFromCart(combinedProduct, list);
	};

	function onSuccessAddToBasket(rect, isRejection = false) {
		addToCartAnimation(rect);
		if (isRejection) optimisticCart(item.id, -1, true);
		addToCartEvent();
	}

	function onRemoveFromBasket(rect, isRejection = false) {
		removeFromBasketAnimation(rect);
		if (isRejection) optimisticCart(item.id, +1);
		removeFromCartEvent();
	}

	function Increment(_, rect) {
		onChange(quantity + 1, rect, () => onRemoveFromBasket(rect, true));
	}

	function Decrement(_, rect) {
		onChange(quantity - 1, rect, () => onSuccessAddToBasket(rect, true));
	}

	function onChange(currentQuantity, rect, onRejection) {
		if (typeof currentQuantity === "number") {
			if (currentQuantity > quantity) {
				const diff = currentQuantity - quantity;
				if (isComplex) {
					showProductPopup(null, rect);
					addToBasket(diff, null, () => {
						onSuccessAddToBasket(rect);
					});
				} else {
					onSuccessAddToBasket(rect);
					addToBasket(diff, null, null, null, onRejection);
				}
			} else if (currentQuantity < quantity) {
				const decrementBy = quantity - currentQuantity;
				onRemoveFromBasket(rect);
				removeFromBasket(decrementBy, null, onRejection);
			}
		}
	}

	const openBuilderModal = (
		saleEntity,
		item,
		isMixPizza = false,
		possiblePizzas,
		onFinishCallback = null,
	) => {
		if (saleEntity) {
			const id = saleEntity.productId;
			dispatch(
				Actions.setPizzaId({
					step: 0,
					id,
				}),
			);
			dispatch(
				Actions.addPopup({
					type: popupTypes.BUILDER,
					payload: {
						trigger: TRIGGER.RECOMMENDED_KIT,
						templateId: Product.templateId,
						saleId: Product.id,
						isFromPizzas: false,
						shouldSkipSize: true,
						endOfSaleAddToCart: true,
						isOptimistic: true,
					},
				}),
			);
			dispatch(Actions.setCartItem(saleEntity));
		} else {
			const id = isNaN(item.id) ? "" : item.id;
			const cartItem = CartItemEntity.getObjectLiteralItem(id);
			dispatch(Actions.setCartItem(cartItem));
			dispatch(
				Actions.addPopup({
					type: popupTypes.BUILDER,
					payload: {
						trigger: TRIGGER.RECOMMENDED_KIT,
						templateId: item.templateId,
						saleId: item.id,
						isFromPizzas: true,
						shouldSkipSize: true,
						isMixPizza: isMixPizza,
						item: item,
						possiblePizzas,
						endOfSaleAddToCart: true,
						onEndOfSaleAddCallback: onFinishCallback,
						isOptimistic: true,
					},
				}),
			);
		}
	};

	const addToCart = (id = null, rect) => {
		const { fatherEntity, stepIndex } = props;
		if (isInBuilder) {
			let pizzaObj = fatherEntity?.subitems[stepIndex];
			if (!pizzaObj) {
				pizzaObj = CartItemEntity.getObjectLiteralItem(Product.id);
				const item = PizzaBuilderService.setSubItem(
					fatherEntity,
					stepIndex,
					pizzaObj,
				);
				dispatch(Actions.setCartItem(item));
			}

			const screen = getInitialScreen(Product.id);
			setStack({
				type: screen,
				params: {
					templateId: Product.templateId,
					title: Product?.nameUseCases?.Title,
					image: {
						uri: getFullMediaUrl(item, MEDIA_TYPES.PRODUCT, MEDIA_ENUM.IN_MENU),
					},
					id: item.id,
					description: Product?.nameUseCases?.SubTitle,
					oldPrice: Product.priceBeforeDiscount,
					price: Product.price,
					pizzaType: possiblePizzas[0]?.[doughMatrixEnum.TYPE],
					isEdit: isEdit,
				},
			});

			dispatch(
				Actions.setPizzaId({
					step: stepIndex ?? 0,
					id: Product.id,
				}),
			);
		} else if (isInPizzas && id) {
			PizzaTreeService.init();
			const saleEntity = CartItemEntity.getObjectLiteralItem(id, 1, item.subItems);
			const payload = {
				step: `${STEPS.ADD_PIZZA} - ${saleEntity.productId}`,
				item: saleEntity,
			};
			if (isUnchangablePizza || isUnchangablePizzaWithToppings) {
				const item = catalogProducts[id];
				const hasTemplate = item.templateId && item.templateId.length > 0;
				// If we have a template it means we have a pizza so we can skip dough and go straight to toppings.
				if (hasTemplate && !isUnchangablePizzaWithToppings) {
					const possiblePizzas = PizzaTreeService.getPossiblePizzasById(id);
					const onFinishCallback = (payload) => {
						addToCartEvent(payload.item);
						addToCartAnimation(rect);
					};
					return openBuilderModal(
						null,
						item,
						false,
						possiblePizzas,
						onFinishCallback,
					);
				} else {
					addToCartAnimation(rect);
					addToCartEvent(item);

					EmarsysService.setViewSideDishComplex({ ...payload.item });
					return CartService.optimisticAddToCart({
						item: { ...payload.item, quantity: 1, triggeredBy: TRIGGER.MENU },
					});
				}
			}
			CartService.validateAddToCart(
				payload,
				(res) => {
					if (
						res.overallstatus === VALIDATION_STATUS.INCOMPLETE ||
						!res.overallstatus
					) {
						if (!isUnchangablePizza) {
							openBuilderModal(saleEntity);
						}
					}
				},
				trigger,
			);
		}
	};

	return (
		<SideDish
			alt={isRecommendedPizza ? item?.id : Product?.name}
			title={
				isRecommendedPizza
					? item?.nameUseCases?.title?.[lang]
					: Product?.nameUseCases?.Title
			}
			description={
				isRecommendedPizza
					? item?.nameUseCases?.subTitle?.[lang]
					: Product?.nameUseCases?.SubTitle
			}
			price={isRecommendedPizza ? item.price : Product.price}
			oldPrice={
				isRecommendedPizza ? item.priceBeforeDiscount : Product.priceBeforeDiscount
			}
			showPriceBeforeDiscount={
				isRecommendedPizza
					? item.showPriceBeforeDiscount
					: Product.showPriceBeforeDiscount
			}
			counter={quantity}
			comment={Product.comment}
			image={imgUrl}
			outOfStock={isRecommendedPizza ? item.outOfStock : Product.outOfStock}
			label={label}
			onExpand={isInBuilder || isInPizzas ? handlePizzaByType : showProductPopup}
			onIncrement={isInBuilder || isInPizzas ? handlePizzaByType : Increment}
			onDecrement={Decrement}
			min={Product?.quantity?.minPerSale}
			max={Product?.quantity?.maxPerSale}
			id={item.id}
			isComplex={isComplex}
			onChange={onChange}
			isInBuilder={isInBuilder}
			iconUrl={url}
			isBuilderRecommended={isBuilderRecommended}
			productClick={(selectItemEvent, viewEvent)}
			buttonTabIndex={buttonTabIndex}
			className={className}
			priceOverride={priceOverride}
		/>
	);
}

export default RenderSideDishComponent;
