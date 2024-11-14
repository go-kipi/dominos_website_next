import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Api from "api/requests";
import styles from "./index.module.scss";
import PizzaImg from "pizzas/images/family-pizza-mock.png";
import VolcanoPizzaImg from "pizzas/images/volcano-pizza.png";
import PlusIcon from "/public/assets/icons/plus-icon.svg";
import builderTypes from "constants/builder-types";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import Actions from "redux/actions";
import Button from "components/button";
import Price from "components/Price";
import PizzaTreeService from "services/PizzaTreeService";
import PizzaBuilderService from "services/PizzaBuilderService";
import { getCurrencySign, notEmptyObject } from "utils/functions";
import { TAB_INDEX_HIDDEN } from "../../../constants/accessibility-types";
import SRContent from "../../../components/accessibility/srcontent";
import { createAccessibilityText } from "../../../components/accessibility/acfunctions";
import doughMatrixEnum from "constants/doughMatrixEnum";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import * as popupTypes from "constants/popup-types";
import TWO_ACTION_TYPES from "constants/two-actions-popup-types";
import useStackNavigation from "hooks/useStackNavigation";
import STACK_TYPES from "constants/stack-types";

const PizzaSizes = {
	extra: {
		pizzaIconClassName: styles["extra"],
		titleTranslate: "personalBuilderPopup_extraSize_title",
	},
	family: {
		pizzaIconClassName: styles["family"],
		titleTranslate: "personalBuilderPopup_familySize_title",
	},
	volcano: {
		pizzaIconClassName: styles["family"],
		titleTranslate: "personalBuilderPopup_volcanoSize_title",
		img: VolcanoPizzaImg,
	},
	personal: {
		pizzaIconClassName: styles["personal"],
		titleTranslate: "personalBuilderPopup_personalSize_title",
	},
};

export default function ChooseSize(props) {
	const {
		setStack = () => {},
		stepIndex = 0,
		isEdit = false,
		params = {},
		isSale = false,
	} = props;

	const saleObj = useSelector((store) => store.cartItem);
	const userAgreedReset = useSelector((store) => store.userAgreeToReset);
	const stackNavigation = useStackNavigation(STACK_TYPES.BUILDER, true);
	const builder = useSelector((store) => store.builder);
	const currentDough = useSelector(
		(store) => store.builder.dough[stepIndex ?? 0],
	);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const doughTypes = useSelector((store) => store.pizzaSelection);
	const doughSizes = getDoughSizes(doughTypes) ?? [];
	const sortedSizes = doughSizes?.sort((a, b) =>
		parseInt(a.sortIndex) > parseInt(b.sortIndex) ? -1 : 1,
	);

	const hasPizzas =
		Array.isArray(params?.possiblePizzas) && params.possiblePizzas.length > 0;
	const possiblePizzaSizes = hasPizzas
		? params?.possiblePizzas.map((p) => p[doughMatrixEnum.SIZE])
		: [];
	const validPizzaSizes =
		possiblePizzaSizes.length > 0
			? Array.from(new Set(possiblePizzaSizes).values())
			: [];
	const filteredPizzaSizes =
		validPizzaSizes.length > 0
			? sortedSizes.filter((s) => validPizzaSizes.includes(s.key))
			: sortedSizes;
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!notEmptyObject(doughTypes)) {
			Api.pizzaProductSelection();
		}
		if (typeof currentDough === "object" && notEmptyObject(doughTypes)) {
			dispatch(
				Actions.updateDough({
					step: stepIndex ?? 0,
					data: {},
				}),
			);
		}
	}, []);

	const resetToppings = () => {
		dispatch(Actions.resetToppings(stepIndex));
	};

	const resetDough = () => {
		dispatch(Actions.resetDough(0));
	};

	function onContinueToppings(pizzaId, key, shouldReset, type, pizzas) {
		if (shouldReset) {
			resetToppings();
			dispatch(Actions.resetPizzaSpecialRequests(stepIndex));
		}

		const cartItem = PizzaBuilderService.switchPizzaId(
			saleObj,
			stepIndex ?? 0,
			pizzaId,
			null,
			isSale,
			shouldReset,
		);

		dispatch(Actions.setCartItem(cartItem));

		return setStack({
			type: builderTypes.TOPPINGS,
			params: {
				doughKey: key,
				pizzaType: type,
				possiblePizzas: pizzas,
				isSinglePizza: true,
				isSquare: type,
			},
		});
	}

	function onContinueToDoughType(key, shouldReset = false) {
		if (shouldReset) {
			dispatch(Actions.resetPizzaSpecialRequests(stepIndex));
			resetToppings();
			resetDough();

			const cartItem = PizzaBuilderService.switchPizzaId(
				saleObj,
				stepIndex ?? 0,
				"",
				null,
				isSale,
				shouldReset,
			);
			dispatch(Actions.setCartItem(cartItem));
		}

		setStack({
			type: builderTypes.DOUGH,
			params: {
				pizzaType: undefined,
				possiblePizzas: undefined,
				isSinglePizza: false,
				doughKey: key,
				isAllowedToUpdateToppingsInEdit: true,
			},
		});
	}

	function updateDoughBuilder(pizzaId, key, type, extra, isVegan) {
		const dough = {
			size: key,
			type: type,
			extra: extra,
			option: null,
			vegan: isVegan,
		};

		dispatch(
			Actions.setPizzaId({
				step: stepIndex ?? 0,
				id: pizzaId,
			}),
		);

		dispatch(
			Actions.updateDough({
				step: stepIndex ?? 0,
				data: dough,
			}),
		);
	}

	function renderResetModal(callback) {
		dispatch(
			Actions.addPopup({
				type: popupTypes.TWO_ACTION,
				payload: {
					type: TWO_ACTION_TYPES.UPDATE,
					title: translate("edit_reset_toppings"),
					mainBtnText: translate("edit_reset_toppings_main_button"),
					subBtnText: translate("edit_reset_toppings_secondary_button"),
					mainBtnFunc: () => {
						dispatch(Actions.setIsUserAgreeToReset(true));
						callback();
					},
				},
			}),
		);
	}

	const onClickSizeHandler = (key, isOutOfStock = false, selectedPizzaId) => {
		if (isOutOfStock) return;
		const selectedPizzaDough = doughTypes[key];
		const optionalPizzas = PizzaTreeService.getPizzaFinalSubs(selectedPizzaDough);
		const hasVegan = optionalPizzas?.hasOwnProperty("vegan");
		const hasNormal = optionalPizzas?.hasOwnProperty("muzzarella");
		const isSinglePizza = hasNormal || hasVegan;
		const type = Object.keys(selectedPizzaDough.subs)[0];
		const extra = Object.keys(selectedPizzaDough.subs[type].subs)[0];
		const currentPizzaId = isSale
			? saleObj.subitems?.[stepIndex]?.productId
			: saleObj?.productId;
		dispatch(Actions.setSelectedSize(key));

		if (isSinglePizza) {
			const isVeganSelected =
				isEdit &&
				builder.dough[stepIndex ?? 0]?.vegan &&
				builder.dough[stepIndex ?? 0]?.vegan !== "muzzarella";

			const getSelectedPizza = () => {
				if (isVeganSelected) {
					return optionalPizzas.hasOwnProperty("vegan")
						? optionalPizzas["vegan"]
						: optionalPizzas["muzzarella"];
				} else {
					return optionalPizzas["muzzarella"];
				}
			};

			const selectedPizza = getSelectedPizza();

			const restartedPizzaId = optionalPizzas["muzzarella"].productId;
			const shouldShowResetModal =
				isSale && !isEdit
					? typeof currentDough === "object" && currentDough.size !== key
					: currentPizzaId && currentPizzaId !== selectedPizza.productId;

			if (shouldShowResetModal && !userAgreedReset && isEdit) {
				renderResetModal(() => {
					updateDoughBuilder(restartedPizzaId, key, type, extra, false);
					onContinueToppings(restartedPizzaId, key, true, type, optionalPizzas);
				});
			} else {
				updateDoughBuilder(
					selectedPizza.productId,
					key,
					type,
					extra,
					isVeganSelected,
				);

				onContinueToppings(
					selectedPizza.productId,
					key,
					shouldShowResetModal,
					type,
					optionalPizzas,
				);
			}
		} else {
			const currentSize = PizzaTreeService.getParentSize(currentPizzaId);
			const shouldShowResetModal = currentSize !== key;
			if (!isSale) {
				if (shouldShowResetModal && !userAgreedReset && isEdit) {
					renderResetModal(() => {
						onContinueToDoughType(key, true);
					});
				} else {
					!isEdit && resetDough();
					onContinueToDoughType(key, false);
				}
			} else {
				if (!isEdit) {
					resetDough();
				}
				// If edit - the dough updating is invoked from the builder main component inside of a useEffect

				if (shouldShowResetModal && !userAgreedReset && isEdit) {
					renderResetModal(() => {
						onContinueToDoughType(key, true);
					});
				} else {
					onContinueToDoughType(key);
				}
			}
		}
	};

	const renderIsOutOfStock = () => {
		return (
			<div className={styles["out-of-stock"]}>
				{translate("builderModal_doughBuilder_outOfStock_dough")}
			</div>
		);
	};

	const renderButton = (price, titleTranslate) => {
		const srText = createAccessibilityText(
			translate(titleTranslate).replace(/["|״]/g, "inch"),
			`${price} ${getCurrencySign("shekel")}`,
			translate("builder_size_choose"),
		);
		return (
			<>
				{deviceState.isDesktop ? (
					<button
						className={styles["plus-btn-wrapper"]}
						aria-label={srText}>
						<img
							src={PlusIcon.src}
							alt={"pizza"}
							aria-hidden={true}
						/>
					</button>
				) : (
					<Button
						text={translate("builder_size_choose")}
						className={styles["plus-btn-wrapper"]}
						animated={false}
						ariaLabel={srText}
					/>
				)}
			</>
		);
	};

	function findProductIdByDoughType(obj, doughType) {
		function search(currentObj, path = []) {
			if (currentObj.productId) {
				return { path, productId: currentObj.productId };
			}

			if (currentObj.subs) {
				for (let key in currentObj.subs) {
					const result = search(currentObj.subs[key], [...path, key]);
					if (result && result.path.includes(doughType)) {
						return result;
					}
				}
			}

			return null;
		}

		const result = search(obj);
		return result ? result.productId : null;
	}

	const getPrice = (key) => {
		const { pizzaBuilderId = "" } = params;
		if (isSale) {
			const pizzaTreeObject = doughTypes[key];
			const hasMealPrices = typeof pizzaTreeObject?.mealPrices === "object";
			if (pizzaBuilderId.length > 0 && hasMealPrices) {
				return pizzaTreeObject.mealPrices[pizzaBuilderId];
			} else return "";
		} else {
			const dough = doughSizes.find((size) => size.key === key);
			return dough?.price;
		}
	};

	const renderPizza = (key) => {
		const pizza = PizzaSizes[key];
		const dough = doughSizes.find((size) => size.key === key);
		const pizzaTreeObject = doughTypes[key];
		const hasMealPrices = typeof pizzaTreeObject?.mealPrices === "object";
		const price = getPrice(key);
		const shouldShowBrackets = isSale && hasMealPrices;
		const { pizzaIconClassName, titleTranslate, img = PizzaImg } = pizza;
		const pizzaSubs = PizzaTreeService.getPizzaFinalSubs(dough);
		const finalPizza = pizzaSubs ? pizzaSubs?.["muzzarella"] : "";
		const pizzaId = finalPizza?.productId;
		const product = catalogProducts[pizzaId];
		const isOutOfStock = product?.outOfStock;
		const isValidPrice = price.length > 0 && !Number.isNaN(Number(price));
		const isBlank = price.length === 0;
		if (pizzaId && !product) {
			// if the pizza is not returning from the server
			return null;
		}
		return (
			<button
				key={`pizza-size-${key}`}
				className={clsx(
					styles["pizza-wrapper"],
					isOutOfStock ? styles["disabled"] : "",
				)}
				onClick={() => onClickSizeHandler(key, isOutOfStock)}
				tabIndex={TAB_INDEX_HIDDEN}>
				<div className={clsx(styles["pizzas-img-wrapper"], pizzaIconClassName)}>
					<img
						src={img.src}
						alt={"pizza"}
					/>
				</div>
				<div className={styles["button-text-wrapper"]}>
					<div className={styles["text-wrapper"]}>
						<h2 className={styles["pizzas-title"]}>{translate(titleTranslate)}</h2>
						{isValidPrice ? (
							<div className={styles["price-wrapper"]}>
								{shouldShowBrackets ? (
									<span className={styles["price-bracket"]}>
										{translate("pizzaSelection-meal-price").replace("[_]", price)}
									</span>
								) : (
									<>
										<Price
											value={price}
											className={styles["price-title"]}
											extraStyles={styles}
										/>
									</>
								)}
							</div>
						) : (
							<span
								className={clsx(styles["price-title"], isBlank ? styles["blank"] : "")}>
								{translate(price)}
							</span>
						)}
						{isOutOfStock ? renderIsOutOfStock() : null}
					</div>
					{!isOutOfStock ? renderButton(price, titleTranslate) : null}
				</div>
			</button>
		);
	};

	function renderAllPizzas() {
		return (
			<div className={styles["pizzas-wrapper"]}>
				{Array.isArray(filteredPizzaSizes) &&
					filteredPizzaSizes.map((size) => {
						return (
							<React.Fragment key={`pizza-size-${size.key}`}>
								{renderPizza(size.key)}
							</React.Fragment>
						);
					})}
			</div>
		);
	}

	return (
		<div className={styles["personal-builder"]}>
			<SRContent
				message={translate("personalBuilderPopup_subtitle")}
				ariaLive={"off"}
				role={"alert"}
			/>
			<h1 className={styles["subtitle"]}>
				{translate("personalBuilderPopup_subtitle")}
			</h1>
			{renderAllPizzas()}
		</div>
	);
}

const getDoughSizes = (doughTypes = {}) => {
	let sortedDoughSizes = [];
	const doughEntries = Object.entries(doughTypes);
	for (let i = 0; i < Object.keys(doughTypes).length; i++) {
		sortedDoughSizes.push({ key: doughEntries[i][0], ...doughEntries[i][1] });
	}
	return sortedDoughSizes;
};
