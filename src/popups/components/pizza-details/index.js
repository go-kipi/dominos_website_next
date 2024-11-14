import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Actions from "redux/actions";
import styles from "./index.module.scss";
import { getFullMediaUrl, parseCoverage } from "utils/functions";
import SwiperCore, { Navigation } from "swiper";
import TransparentCounterButton from "components/TransparentCounterButton/TransparentCounterButton";
import Price from "components/Price";
import builderTypes from "constants/builder-types";

import WhitePencilIcon from "/public/assets/icons/white-pencil-icon.svg";
import ToppingSelector from "../../../components/ToppingSelector";
import Button from "../../../components/button";
import * as popups from "../../../constants/popup-types";
import CartService from "services/CartService";
import useArrayMissingProducts from "hooks/useArrayMissingProducts";
import PizzaTreeService from "services/PizzaTreeService";

import Api from "api/requests";
import { META_ENUM } from "constants/menu-meta-tags";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import { MEDIA_ENUM } from "constants/media-enum";
import { MEDIA_TYPES } from "constants/media-types";
import { QUARTERS } from "constants/quarters-enum";
import BlurPopup from "../../Presets/BlurPopup";
import useTranslate from "hooks/useTranslate";
import RenderNotes from "components/PizzaNotes/PizzaNotes";
import animationTypes from "../../../constants/animationTypes";
import { PizzaWithToppings } from "../../../animations-manager/animations/MovingSavedPizza";
import { TRIGGER } from "constants/trigger-enum";

import ToppingListWithSwiper from "../ToppingListWithSwiper";
import doughMatrixEnum from "constants/doughMatrixEnum";
import EmarsysService from "utils/analyticsService/EmarsysService";
SwiperCore.use([Navigation]);

export default function PizzaDetailsPopup(props) {
	const {
		pizzaName,
		price,
		oldPrice = undefined,
		dough,
		id,
		product,
		showPriceBeforeDiscount = false,
		isInBuilder = false,
		isEdit = false,
		onAddInBuilder,
		stepIndex,
		setStack,
		nextTab,
		isLastTab,
		priceOverrides,
		shouldPopulateStack = true,
		pizzaBuilderId,
	} = props.payload;
	const { subItems = [] } = product;
	const ref = useRef();
	const pizzaRef = useRef();
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const [quantity, setQuantity] = useState(1);
	const [name, setName] = useState(pizzaName);
	const filteredToppings = getFilteredToppings();
	const [toppings, setToppings] = useState(filteredToppings);
	const translate = useTranslate();

	const pizza = useMenus(id, ActionTypes.PRODUCT);
	const renderSwiper = filteredToppings?.length > 4;
	const deviceState = useSelector((store) => store.deviceState);
	const saleObj = useSelector((store) => store.cartItem);
	const dispatch = useDispatch();
	const getArrayProduct = useArrayMissingProducts();
	const pizzaType =
		PizzaTreeService.getDoughObjectWithId(pizza.id)?.["type"] ?? "classic";
	const size = PizzaTreeService.getParentSize(id);

	useEffect(() => {
		const array = getArrayProduct([product]);

		if (array && array.length > 0) {
			const payload = { productIds: array };
			Api.getProducts({ payload });
		}
	}, [product]);

	// function getFilteredToppings() {
	// return;
	// 	if (Array.isArray(subItems)) {
	// 		const newToppings = subItems.filter(
	// 			(t) => catalogProducts[t.productId]?.meta !== META_ENUM.PIZZA_PREP,
	// 		);
	// 		return newToppings;
	// 	} else return [];
	// }

	function getFilteredToppings() {
		if (Array.isArray(subItems)) {
			const newToppings = subItems.filter((t) => {
				const meta = catalogProducts[t.productId]?.meta;
				if (meta === undefined) {
					console.error(`Error: meta is not defined for productId ${t.productId}`);
					return false;
				}
				return meta !== META_ENUM.PIZZA_PREP;
			});
			return newToppings;
		} else {
			return [];
		}
	}

	const onQuantityChange = (newQuantity) => {
		setQuantity(newQuantity);
	};

	// const handleToppingAdd = (topping) => {
	//   const item = PizzaBuilderService.addTopping(null, stepIndex, topping, false);
	//   return item;
	// }

	// const handleSwitchPizzaId = (upgrade) => {
	//   const { productId, promoProductId } = upgrade;
	//   const item = PizzaBuilderService.switchPizzaId(
	//     null,
	//     stepIndex,
	//     productId,
	//     promoProductId,
	//     false
	//   );
	//   return item;
	// }

	// // TODO: Refactor upgrade by type to invoke from the PizzaBuilderService to dedupe code.
	// const handleUpgradeByType = (upgrade, type) => {
	//   switch (type) {
	//     case UPSALES_TYPES.ADD_SUB_ITEM:
	//       return handleToppingAdd(upgrade);
	//     case UPSALES_TYPES.CHANGE_ITEM:
	//       return handleSwitchPizzaId(upgrade);
	//   }
	// };

	const onAddToCartCallback = () => {
		dispatch(Actions.resetCartItem());
		const pizzaLocation = pizzaRef.current.getBoundingClientRect();
		const cartIcon = document.getElementById("cart-icon").getBoundingClientRect();
		const dough = PizzaTreeService.getPizzaPathById(id);
		const doughType = dough?.[doughMatrixEnum.TYPE];
		ref.current.animateOut();
		dispatch(
			Actions.addAnimation({
				type: animationTypes.MOVING_SAVED_PIZZA,
				payload: {
					id,
					type: doughType,
					from: {
						top: pizzaLocation.top,
						left: pizzaLocation.left,
						width: pizzaLocation.width,
						height: pizzaLocation.height,
						py: pizzaLocation.y,
					},
					to: {
						top: cartIcon.top,
						left: cartIcon.left,
						width: cartIcon.width,
						height: cartIcon.height,
						py: cartIcon.y,
					},
					toppings,
				},
			}),
		);
	};

	const addToCart = () => {
		const { id } = props.payload;
		const { subItems } = props.payload.product;
		if (!isInBuilder) {
			const payload = {
				item: {
					productId: id,
					quantity: quantity,
					subitems: subItems,
				},
			};
			const trigger = isEdit ? TRIGGER.BASKET : TRIGGER.SAVED_KIT;
			CartService.validateAddToCart(
				payload,
				(res) => {
					const { item } = res;
					const { upgrades } = item;
					dispatch(Actions.setCartItem(payload.item));
					onAddToCartCallback();
					const timeout = setTimeout(() => {
						CartService.addToCart(
							payload,
							null,
							() => {
								clearTimeout(timeout);
								EmarsysService.setViewSideDishComplex(payload.item);
							},
							true,
							trigger,
						);
					}, 600);
				},
				trigger,
			);
		} else {
			const step = stepIndex ?? 0;
			const temp = JSON.parse(JSON.stringify(saleObj));
			temp.subitems[step] = {
				productId: id,
				quantity,
				subitems: subItems,
			};
			const dough = PizzaTreeService.getDoughObjectWithId(id);
			let possiblePizzas =
				PizzaTreeService.getTree()[dough.size].subs?.[dough.type];
			const hasExtra = possiblePizzas?.subs?.[dough.extra] !== undefined;
			const hasOption = !PizzaTreeService.isKeyFinal(
				possiblePizzas?.subs?.[dough.extra],
			);
			if (hasExtra) {
				const isFinal = PizzaTreeService.isKeyFinal(
					possiblePizzas?.subs?.[dough.extra],
				);
				possiblePizzas = isFinal
					? possiblePizzas?.subs?.[dough.extra].subs.final.subs
					: possiblePizzas?.subs?.[dough.extra];
			}
			if (hasOption) {
				possiblePizzas = possiblePizzas?.subs?.[dough?.option]?.subs.final.subs;
			}

			dispatch(
				Actions.updateDough({
					step: stepIndex,
					data: dough,
				}),
			);

			dispatch(
				Actions.setPizzaId({
					step: stepIndex,
					id,
				}),
			);
			if (Array.isArray(subItems) && subItems.length > 0) {
				subItems.forEach((si) => {
					const topping = catalogProducts[si.productId];
					const coverage =
						si.quarters !== null
							? si.quarters?.reduce((o, key) => Object.assign(o, { [key]: 1 }), {})
							: {};
					const hasCoverage = Boolean(Object.keys(coverage).length);
					if (hasCoverage) {
						dispatch(
							Actions.updateTopping({
								step: stepIndex,
								id: si.productId,
								coverage,
								assetVersion: topping.assetVersion,
							}),
						);
					} else {
						dispatch(
							Actions.updatePizzaSpecialRequests({
								step: stepIndex ?? 0,
								id: si.productId,
							}),
						);
					}
				});
			}
			const onSuccess = (res) => {
				const productIds = Object.values(res.catalogProducts).map((p) => p.id);
				const pizzas = productIds
					.map((id) => PizzaTreeService.getPizzaPathById(id))
					.filter((p) => typeof p !== "undefined");
				ref.current?.animateOut(() => {
					typeof onAddInBuilder === "function" &&
						onAddInBuilder(temp, dough, possiblePizzas, pizzas);
					if (!isLastTab && shouldPopulateStack) {
						typeof nextTab === "function" && nextTab();
						typeof setStack === "function" &&
							setStack({
								type: builderTypes.DOUGH,
								params: {
									doughKey: dough.size,
									possiblePizzas: pizzas,
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
					} else if (isLastTab) {
						// typeof setStack === "function" &&
						//   setStack({
						//     type: builderTypes.DOUGH,
						//     params: {
						//       doughKey: dough.size,
						//       possiblePizzas: pizzas,
						//       pizzaType: dough?.type,
						//       isSquare: dough?.type,
						//     },
						//   });
						// typeof setStack === "function" &&
						//   setStack({
						//     type: builderTypes.TOPPINGS,
						//     params: {
						//       possiblePizzas: possiblePizzas,
						//       pizzaType: dough?.type,
						//       isSquare: dough?.type,
						//     },
						//   });
					}
				});
			};
			Api.getMenu({
				payload: { menuId: pizzaBuilderId, isInBuilder: true },
				onSuccess,
			});
		}
	};

	const handleOnPizzaNameChange = (newName) => {
		setName(newName);
		const payload = {
			oldName: pizzaName,
			newName,
		};
		Api.renameSavedKit({
			payload,
			onSuccess: (res) => {
				Api.getSavedKits();
			},
		});
	};
	const HandleOnNameEditClick = () => {
		dispatch(
			Actions.addPopup({
				type: popups.EDIT_PIZZA_NAME,
				payload: {
					toppings: toppings,
					pizzaId: id,
					pizzaName,

					onChange: (newName) => handleOnPizzaNameChange(newName),
				},
			}),
		);
	};

	const renderTopSection = () => {
		return (
			<div
				className={styles["pizzas-img-wrapper"]}
				ref={pizzaRef}>
				<PizzaWithToppings
					id={props.payload.id}
					type={pizzaType}
					toppings={toppings}
				/>
			</div>
		);
	};

	const renderMiddleSection = () => {
		return (
			<>
				<div className={styles["pizzas-details-container"]}>
					<div className={styles["name-edit-wrapper"]}>
						<div className={styles["edit-wrapper"]}>
							<span
								className={styles["pizzas-name"]}
								tabIndex={0}>
								{name}
							</span>
							<button
								aria-label={translate("accessibility_imageAlt_editName")}
								onClick={HandleOnNameEditClick}
								className={styles["pizzas-name-icon-wrapper"]}>
								<img
									src={WhitePencilIcon.src}
									alt={""}
								/>
							</button>
						</div>
						{deviceState.notDesktop && !isInBuilder && (
							<TransparentCounterButton
								value={quantity}
								onChange={onQuantityChange}
							/>
						)}
					</div>
					<div
						className={styles["pizza-dough-size-wrapper"]}
						tabIndex={0}>
						{pizza?.nameUseCases?.Title && pizza?.nameUseCases?.Title}
					</div>
					{deviceState.notDesktop && !isInBuilder && (
						<div className={styles["price-wrapper"]}>
							<Price
								className={styles["price"]}
								value={price}
							/>
							{showPriceBeforeDiscount && (
								<Price
									className={styles["old-price"]}
									value={oldPrice}
									mark
								/>
							)}
						</div>
					)}
					{deviceState.isDesktop && !isInBuilder && (
						<div className={styles["right-price-wrapper"]}>
							<div className={styles["price-wrapper"]}>
								<Price
									className={styles["price"]}
									value={price}
								/>
								{showPriceBeforeDiscount && (
									<Price
										className={styles["old-price"]}
										value={oldPrice}
										mark
									/>
								)}
							</div>
							<TransparentCounterButton
								value={quantity}
								onChange={onQuantityChange}
								extraStyles={styles}
							/>
						</div>
					)}
				</div>
			</>
		);
	};

	const renderToppingList = () => {
		const showLinearGradient = deviceState.isMobile && toppings.length > 4;
		return (
			<>
				<div className={styles["separator"]} />
				<div className={styles["toppings-list"]}>
					{showLinearGradient && <div className={styles["linear-gradient-left"]} />}
					{subItems.map((item, index) => {
						return (
							<RenderItem
								item={item}
								key={"topping-" + index}
								setToppings={setToppings}
							/>
						);
					})}
					{showLinearGradient && <div className={styles["linear-gradient-right"]} />}
				</div>
				<div className={styles["separator"]} />
			</>
		);
	};

	const renderToppingListWithSwiper = () => {
		const dedupedToppings = toppings.filter((t) => !t.hasOwnProperty("id"));
		return (
			<ToppingListWithSwiper
				toppings={dedupedToppings}
				setToppings={setToppings}
			/>
		);
	};

	const renderMobile = () => {
		return (
			<>
				{renderTopSection()}
				{renderMiddleSection()}
				{subItems?.length > 0 && (
					<div className={styles["toppings-list-wrapper"]}>
						{renderToppingList()}
					</div>
				)}
				<span className={styles["pizzas-instructions"]}>
					<RenderNotes
						className={styles["note"]}
						items={subItems}
					/>
				</span>
				<div className={styles["linear-gradient-bottom"]}>
					<Button
						text={translate("savedPizzaPopup_addToCart_btnTitle")}
						onClick={addToCart}
					/>
				</div>
			</>
		);
	};

	const renderDesktop = () => {
		return (
			<div className={styles["content"]}>
				<div className={styles["pizzas-details-wrapper"]}>
					<div className={styles["details-right"]}>
						{renderMiddleSection()}
						{subItems?.length > 0
							? renderSwiper
								? renderToppingListWithSwiper()
								: renderToppingList()
							: null}
						<span className={styles["pizzas-instructions"]}>
							<RenderNotes
								items={subItems}
								className={styles["note"]}
							/>
						</span>
						<div className={styles["actions"]}>
							<Button
								text={translate("savedPizzaPopup_addToCart_btnTitle")}
								onClick={addToCart}
								className={styles["add-to-cart-btn"]}
							/>
						</div>
					</div>
					<div className={styles["details-left"]}>{renderTopSection()}</div>
				</div>
			</div>
		);
	};

	return (
		<BlurPopup
			id={props.id}
			className={styles["pizzas-details"]}
			showCloseIcon
			ref={ref}>
			{deviceState.notDesktop ? renderMobile() : renderDesktop()}
		</BlurPopup>
	);
}
function RenderItem(props) {
	const { item, setToppings, isOnSwiper = false } = props;
	const product = useMenus(item.productId, ActionTypes.PRODUCT);
	const [topping, setTopping] = useState({});
	const imageUrl = getFullMediaUrl(
		topping,
		MEDIA_TYPES.PRODUCT,
		MEDIA_ENUM.IN_MENU,
	);

	useEffect(() => {
		if (item) {
			onToppingsCovarge();
		}
	}, [item]);

	useEffect(() => {}, []);

	function onToppingsCovarge() {
		const coverage = parseCoverage(item.quarters);
		const topping = {
			id: item.productId,
			coverage,
			quantity: item.quantity,
			assetVersion: product.assetVersion,
		};
		setToppings((prevState) => {
			return [...prevState, topping];
		});
		setTopping(topping);
	}

	if (META_ENUM.PIZZA_PREP !== product?.meta) {
		return (
			<ToppingSelector
				product={product}
				coverage={topping?.coverage}
				isDraggable={false}
				image={imageUrl}
				clicked
				id={product.id}
				isOnPizza
				isOnSwiper={isOnSwiper}
				showCloseIcon={false}
				className={isOnSwiper ? styles["on-swiper"] : ""}
				showInfoIcon={false}
			/>
		);
	} else {
		// not a topping
		return null;
	}
}
