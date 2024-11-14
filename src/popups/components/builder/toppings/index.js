import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
	generateUniqueId,
	getFullMediaUrl,
	getPizzaImageByMeta,
	notEmptyObject,
	parseCoverageToQuarters,
	VibrateDevice,
} from "utils/functions";
import Actions from "redux/actions";
import Api from "api/requests";
import { MENUS } from "constants/menu-types";
import * as popupTypes from "constants/popup-types";
import { useDragDropManager, useDrop } from "react-dnd";
import { ItemTypes } from "constants/draggable-types";

/* Components */
import MultipleOptionsIndicator from "components/MultipleOptionsIndicator";
import Checkbox from "components/forms/checkbox";
import ToppingSelector, { ToppingPreview } from "components/ToppingSelector";
import HeaderFilterItem from "containers/Menu/components/HeaderFilterItem/HeaderFilterItem";

/* Assets */
import FullCircularCheckbox from "/public/assets/checkbox/red-checkbox-full.svg";
import EmptyCircularCheckbox from "/public/assets/checkbox/red-checkbox-empty.svg";
import PriceListIcon from "/public/assets/icons/multipleOptionsIndicator/price-list-icon.svg";
import SpecialRequestsIcon from "/public/assets/icons/multipleOptionsIndicator/pizza-special-requests-icon.svg";
import VeganFriendly from "/public/assets/icons/vegan-friendly.svg";
import ToggleFiltersIcon from "/public/assets/icons/topping-filter-icon.svg";
import ChangesIcon from "/public/assets/icons/blue-dot-icon.svg";
import CloseFilterIcon from "/public/assets/icons/x-icon-white.svg";
import CoverageOptions from "components/CoverageOptions";
import { MEDIA_TYPES } from "constants/media-types";
import { META_ENUM } from "constants/menu-meta-tags";
import useGetMenuData from "hooks/useGetMenuData";
import { MEDIA_ENUM } from "constants/media-enum";
import { VALIDATION_STATUS } from "constants/ValidationStatusEnum";
import CartService from "services/CartService";
import { STEPS } from "constants/validation-steps-enum";
import { UPSALES_TYPES } from "constants/upsales-types";
import doughMatrixEnum from "../../../../constants/doughMatrixEnum";

import doughAnimationPhases from "../../../../constants/doughAnimationPhases";
import PizzaTreeService from "../../../../services/PizzaTreeService";
import CustomCollapse from "components/CustomCollapse";
import clsx from "clsx";
import { Pizza } from "../Pizza";
import useTranslate from "hooks/useTranslate";
import HiddableScroolBar from "components/HiddableScrollBar/HiddableScrollBar";
import OptionsToolTip from "components/MultipleOptionsIndicator/OptionsToolTip";
import { handleKeyPress } from "../../../../components/accessibility/keyboardsEvents";
import SRContent from "../../../../components/accessibility/srcontent";
import { CHECKBOX_VARAINTS } from "constants/checkbox-variants";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import PizzaBuilderService from "services/PizzaBuilderService";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import SlideRight from "components/SlideRight/SlideRight";
import { easings } from "@react-spring/web";
import FloatingActionButton from "components/FloatingActionButton";
import EmarsysService from "utils/analyticsService/EmarsysService";
import { TRIGGER } from "constants/trigger-enum";
import { useDipsManager } from "hooks/useDipsManager";

const COVERAGE_ENUM = {
	[styles["full-circle"]]: {
		q1: 1,
		q2: 1,
		q3: 1,
		q4: 1,
	},
	[styles["half-circle-right"]]: {
		q1: 1,
		q2: 1,
		q3: 0,
		q4: 0,
	},
	[styles["half-circle-left"]]: {
		q1: 0,
		q2: 0,
		q3: 1,
		q4: 1,
	},
	[styles["quarter-top-left"]]: {
		q1: 0,
		q2: 0,
		q3: 0,
		q4: 1,
	},
	[styles["quarter-top-right"]]: {
		q1: 1,
		q2: 0,
		q3: 0,
		q4: 0,
	},
	[styles["quarter-bottom-left"]]: {
		q1: 0,
		q2: 0,
		q3: 1,
		q4: 0,
	},
	[styles["quarter-bottom-right"]]: {
		q1: 0,
		q2: 1,
		q3: 0,
		q4: 0,
	},
};

const SQUARE_COVERAGE_ENUM = {
	[styles["full-square"]]: {
		q1: 1,
		q2: 1,
		q3: 1,
		q4: 1,
	},
	[styles["half-square-right"]]: {
		q1: 1,
		q2: 1,
		q3: 0,
		q4: 0,
	},
	[styles["half-square-left"]]: {
		q1: 0,
		q2: 0,
		q3: 1,
		q4: 1,
	},
	[styles["square-quarter-top-left"]]: {
		q1: 0,
		q2: 0,
		q3: 0,
		q4: 1,
	},
	[styles["square-quarter-top-right"]]: {
		q1: 1,
		q2: 0,
		q3: 0,
		q4: 0,
	},
	[styles["square-quarter-bottom-left"]]: {
		q1: 0,
		q2: 0,
		q3: 1,
		q4: 0,
	},
	[styles["square-quarter-bottom-right"]]: {
		q1: 0,
		q2: 1,
		q3: 0,
		q4: 0,
	},
};

const DEFAULT_COVERAGE = {
	q1: 0,
	q2: 0,
	q3: 0,
	q4: 0,
};

export default function ToppingsBuilder(props) {
	const {
		Button = () => {},
		params = {},
		stepsLen,
		stepIndex = 0,
		maxDuplicate = 1,
		steps,
		// hasUpgrades = false,
		isEdit,
		isSale,
		isFromPizzas,
		isLastTab = false,
		nextTabText = "",
		showButton,
		fatherEntity,
		priceOverrides,
		trigger = "",
	} = props;
	const dispatch = useDispatch();

	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const {
		possiblePizzas,
		pizzaType,
		isSquare = "",
		isMixPizza = false,
	} = params;
	const isSquarePizza = !["classic", "", "spelt"].includes(isSquare);
	const allowCopyToNextSteps = steps?.[stepIndex]?.allowCopyToNextSteps ?? false;
	const [focusElement, setFocusElement] = useState(false);
	const filterRef = useRef();
	const toppingsRef = useRef();
	const deviceState = useSelector((store) => store.deviceState);

	const pizzaSpecialReqs = useSelector(
		(store) => store.builder.pizzaSpecialRequests[stepIndex],
	);
	const showFadeOut = useSelector((store) => store.builder.shouldFadeOut);
	const userData = useSelector((store) => store.userData);
	const [selectedToppingSrc, setSelectedToppingSrc] = React.useState("");
	const [pizzaDims, setPizzaDims] = React.useState({});
	const [distance, setDistance] = React.useState(-1);
	const [activeRow, setActiveRow] = React.useState(0);

	useDipsManager(stepIndex, isSale, TRIGGER.MENU);

	const [showCoverageOptions, setShowCoverageOptions] = React.useState(false);
	const [selectedToppingRect, setSelectedToppingRect] = React.useState();
	const [selectedTopping, setSelectedTopping] = React.useState(-1);
	const coverages = useSelector(
		(store) => store?.builder?.toppings?.[stepIndex],
	);
	const [selectedFilter, setSelectedFilter] = useState("");
	const [isNextToppingPayed, setIsNextToppingPayed] = useState(false);
	const didShowToppingWillCost = useRef(false);
	const offset = useRef();
	const dragDropManager = useDragDropManager();
	const monitor = dragDropManager.getMonitor();
	const builder = useSelector((store) => store.builder);
	const [mutatedToppingsList, setMutatedToppingsList] = useState([]);
	const initialCartItem = useRef(null);

	const [toppingMenuId, setToppingMenuId] = useState("");
	const [prepMenuId, setPrepMenuId] = useState("");
	const [dipsMenuId, setDipsMenuId] = useState("");

	const [showToppingFilters, setShowToppingFilters] = React.useState(false);
	const isFirstTime = React.useRef(true);
	const [showFadeIn, setShowFadeIn] = useState(true);
	const listRef = useRef();
	const dropRef = React.useRef("");
	const [vegan, setVegan] = useState(false);
	const [showVeganCheckbox, setShowVeganCheckbox] = useState(true);
	const translate = useTranslate();
	const saleObj = useSelector((store) => store.cartItem);
	useMemo(() => {
		initialCartItem.current = JSON.parse(JSON.stringify(saleObj));
	}, [saleObj]);
	const pizzaSpecialRequestsChoice = useGetMenuData({
		id: prepMenuId,
		isInBuilder: true,
		showLoader: false,
	});

	const toppingsFilters = useGetMenuData({
		id: toppingMenuId,
		isInBuilder: true,
		showLoader: false,
	});
	const toppings = useGetMenuData({ id: selectedFilter, isInBuilder: true });
	const cartItem = useSelector((store) => store.cartItem);
	const selectedPizzaId = isSale
		? cartItem.subitems?.[stepIndex].productId
		: cartItem.productId;
	const pizza = useMenus(selectedPizzaId, ActionTypes.PRODUCT);

	const [dargedTopping, setDragedTopping] = useState();
	const dough = useSelector((store) => store.builder.dough?.[stepIndex]);

	const pizzaImg = getPizzaImageByMeta(pizza.meta);
	const toppingsBuilderArray = builder.toppingsArray?.[stepIndex ?? 0];

	const hasChanges = Array.isArray(pizzaSpecialReqs)
		? pizzaSpecialReqs.length > 0
		: false;

	const pizzaRef = document.getElementById("toppings-pizza-img");

	const selectedToppingProduct = useMenus(
		dargedTopping ? dargedTopping : selectedTopping,
		ActionTypes.PRODUCT,
	);
	const isMixTopping =
		selectedToppingProduct.meta === META_ENUM.MIX_TOPPING_ITEM;

	const allowedQuartersTopping = selectedToppingProduct?.allowedQuarters ?? [];
	const isVolcanoPizza = pizza.meta === META_ENUM.VOLCANO_PIZZA;
	const isPersonalPizza = pizza.meta === META_ENUM.PERSONAL_PIZZA;
	const defaultFilter = toppingsFilters?.defaultElement;
	const allToppings = useGetMenuData({ id: defaultFilter, isInBuilder: true });

	const getDipsAmount = () => {
		const pizzaToppingsAndDips = isSale
			? saleObj?.subitems?.[stepIndex].subitems
			: saleObj?.subitems;

		const itemQuantity = pizzaToppingsAndDips?.filter((item) => {
			const checkedProduct = catalogProducts[item.productId];
			return checkedProduct?.meta === META_ENUM.PIZZA_DIP;
		});
		return itemQuantity?.length || 0;
	};
	const dipsAmountInCart = getDipsAmount();

	const btnProps = {
		state: true,
		text:
			!isSale || isLastTab
				? translate("builderModal_toppingsBuilder_last_pizza")
				: translate("builderModal_toppingsBuilder_continueBtn_title") + nextTabText,
		className: `${styles["submit-button"]} ${
			showFadeIn || showFadeOut ? styles["fade-in"] : ""
		}`,
		extraStyles: styles,
		callback: onSubmit,
		btnClassName: styles["toopings-continue-btn"],
	};

	useEffect(() => {
		updateToppingListByArrayOfToppings(toppingsBuilderArray);
		if (deviceState.isMobile && listRef.current) {
			const timeout = setTimeout(() => {
				listRef.current?.scrollTo({
					left: 0,
					behavior: "smooth",
				});
				clearTimeout(timeout);
			}, 200);
		}
	}, [toppingsBuilderArray, toppings, vegan]);

	useEffect(() => {
		if (selectedTopping) {
			const elem = document.getElementById(`topping-${selectedTopping}`);
			if (elem && deviceState.isDesktop) {
				elem.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "nearest",
				});
			}
		}
	}, [selectedTopping]);

	useEffect(() => {
		showButton();
		mealAnalytics();
		const timeout = setTimeout(() => {
			setShowFadeIn(false);
		}, 350);
		return () => {
			timeout && clearTimeout(timeout);
		};
	}, []);

	const mealAnalytics = () => {
		const { doughKey } = props.params;
		const payload = {
			item: "Customize Meal",
			type: pizzaType,
			size: doughKey,
			method: "regular meal",
			quantity: 1,
		};
		AnalyticsService.orderMealCustomizedSelect(payload);
		AnalyticsService.orderMealCustomizedTopping("Customize Meal Topping");
	};
	useEffect(() => {
		setSelectedFilter(toppingsFilters?.defaultElement);
	}, [toppingsFilters, toppingMenuId]);

	useEffect(() => {
		const isValidCartItem = isSale
			? typeof saleObj.subitems?.[stepIndex] === "object" &&
			  Array.isArray(saleObj.subitems[stepIndex]?.subitems) &&
			  saleObj.subitems?.[stepIndex]?.subitems?.length > 0
			: typeof saleObj === "object" &&
			  Array.isArray(saleObj.subitems) &&
			  saleObj.subitems?.length > 0;
		if (isEdit && isValidCartItem && fatherEntity) {
			updateToppingsInEdit();
			updateSpecialRequestInEdit();
		}
	}, [fatherEntity, stepIndex]);

	useEffect(() => {
		const isArrayPossiblePizzas =
			Array.isArray(possiblePizzas) && possiblePizzas.length > 1;

		const hasVeganPizza =
			possiblePizzas?.hasOwnProperty("vegan") || isArrayPossiblePizzas;

		setShowVeganCheckbox(hasVeganPizza);

		if (
			isSale &&
			Array.isArray(saleObj.subitems) &&
			saleObj.subitems.length > 0
		) {
			setVegan(
				PizzaTreeService.isPizzaVegan(saleObj?.subitems?.[stepIndex]?.productId),
			);
		} else {
			setVegan(PizzaTreeService.isPizzaVegan(selectedPizzaId));
		}
	}, [possiblePizzas, stepIndex]);

	useEffect(() => {
		if (
			catalogProducts[selectedPizzaId] &&
			catalogProducts[selectedPizzaId]["templateId"]
		) {
			getToppingList(catalogProducts[selectedPizzaId].templateId);
		} else {
			const onSuccess = (res) => {
				const templateId = res.product[selectedPizzaId].templateId;

				getToppingList(templateId);
			};
			if (selectedPizzaId) {
				Api.getProducts({
					payload: { productIds: [selectedPizzaId] },
					onSuccess,
				});
			}
		}
	}, [selectedPizzaId]);

	useEffect(() => {
		const host = document.getElementById("scroll-host");
		if (selectedFilter && host) {
			host.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [selectedFilter]);

	const getToppingList = (templateId) => {
		if (typeof templateId === "string" && templateId.length > 0) {
			Api.getProductTemplate({
				config: { showLoader: false },
				payload: {
					id: templateId.length > 0 ? templateId : params.pizzaType,
				},
				onSuccess: (res) => {
					if (Array.isArray(res?.components) && res?.components.length > 1) {
						const prepCmp = res?.components.filter(
							(cmp) => cmp.meta === "prepRegularMeta",
						)[0];
						const toppingCmp = (res?.components?.filter(
							(cmp) => cmp.meta === "toppingsMeta",
						))[0];
						const dipsCmps = (res?.components?.filter(
							(cmp) => cmp.meta === META_ENUM.PIZZA_DIPS,
						))[0];

						setToppingMenuId(toppingCmp?.menuId[0]);
						setPrepMenuId(prepCmp?.menuId[0]);
						setDipsMenuId(dipsCmps?.menuId[0]);
					}
				},
			});
		}
	};

	const options = [
		{
			id: generateUniqueId(8),
			img: SpecialRequestsIcon,
			text: translate("specialRequestsModal_toppingsBuilder_title"),
			onPress: () =>
				dispatch(
					Actions.addPopup({
						type: popupTypes.PIZZA_SPECIAL_REQUESTS,
						payload: {
							choices: pizzaSpecialRequestsChoice?.elements ?? [],
							stepIndex: stepIndex ?? 0,
							isSale,
							trigger,
						},
					}),
				),
			canChange: true,
		},
		{
			id: generateUniqueId(8),
			img: PriceListIcon,
			text: translate("priceListModal_priceList_title"),
			onPress: () =>
				dispatch(
					Actions.addPopup({
						type: popupTypes.PRICE_LIST,
						payload: {},
					}),
				),
		},
	];
	if (isVolcanoPizza) {
		options.shift();
	}

	const [{ isOver }, drop] = useDrop(
		() => ({
			accept: ItemTypes.TOPPING,
			canDrop: (item, monitor) => {
				if (monitor.isOver()) {
					const dropPoint = getOverlay();
					if (typeof dropPoint === "string") {
						const dropName =
							dropPoint.split(" ").length > 1 ? dropPoint.split(" ")[1] : "";
						dropRef.current = dropName;
						return dropName.length > 0;
					}
				}
			},
			drop: (item, monitor) => {
				if (monitor.canDrop()) {
					const coverage = getCoverage(dropRef.current);
					const updatedTopping = {
						id: item.id,
						name: item.name,
						coverage,
						isMix: item.isMix,
					};
					VibrateDevice(200);
					handleToppingAdd(updatedTopping);
				}
				return undefined;
			},
			collect: (monitor) => {
				return {
					isOver: !!monitor.isOver(),
					canDrop: !!monitor.canDrop(),
				};
			},
		}),
		[toppings, handleToppingAdd, saleObj],
	);

	useEffect(() => {
		if (pizzaRef) {
			onWindowResize();
		}
	}, [pizzaRef, isOver]);

	useEffect(() => {
		if (pizzaRef) {
			window.addEventListener("resize", onWindowResize);
		}
		return () => {
			window.removeEventListener("resize", onWindowResize);
		};
	}, [pizzaRef]);

	useEffect(() => {
		const unsubscribe = monitor.subscribeToOffsetChange(() => {
			offset.current = monitor.getClientOffset();
			if (notEmptyObject(pizzaDims) && offset.current) {
				const dist = calcDistance(pizzaDims.center, offset.current);
				setDistance(dist);
			}
		});
		return () => unsubscribe();
	}, [monitor, pizzaDims, offset]);

	function onWindowResize() {
		const rect = pizzaRef.getBoundingClientRect();
		const rad = Math.round(rect.height / 2);
		const dims = {
			x: rect.x,
			y: rect.y,
			width: Math.ceil(rect.width),
			height: Math.round(rect.height),
			radius: rad,
			center: { x: Math.ceil(rect.x + rad), y: Math.ceil(rect.y + rad) },
		};
		setPizzaDims(dims);
	}

	function updateToppingsInEdit() {
		const toppings = isSale
			? saleObj.subitems[stepIndex]?.subitems
			: saleObj.subitems;
		const filteredToppings = toppings.filter(
			(topping) =>
				catalogProducts[topping?.productId]?.meta !== META_ENUM.PIZZA_PREP &&
				catalogProducts[topping?.productId]?.meta !== META_ENUM.PIZZA_DIP,
		);
		filteredToppings?.forEach((topping) => {
			const coverage = {};
			const quarters = topping.quarters;
			if (quarters) {
				for (const quarter of quarters) {
					coverage[quarter] = 1;
				}
			}

			const currentToppingProduct = catalogProducts[topping?.productId];

			const isMixTopping =
				currentToppingProduct.meta === META_ENUM.MIX_TOPPING_ITEM;

			const toppingToAdd = {
				id: topping?.productId,
				coverage: coverage,
				isMix: isMixTopping,
				promoProductId: topping?.triggerProductId,
			};

			handleToppingAdd(toppingToAdd);
		});
	}

	function updateSpecialRequestInEdit() {
		if (!pizzaSpecialReqs) {
			const toppings = isSale
				? saleObj.subitems[stepIndex]?.subitems
				: saleObj.subitems;
			const filteredToppings = toppings.filter(
				(topping) =>
					catalogProducts[topping?.productId]?.meta === META_ENUM.PIZZA_PREP,
			);
			filteredToppings?.forEach((topping) => {
				dispatch(
					Actions.updatePizzaSpecialRequests({
						step: stepIndex ?? 0,
						id: topping?.productId,
					}),
				);
			});
		}
	}

	const getCenterPadding = () => {
		if (deviceState.isMobile) {
			return 60;
		} else if (deviceState.isTablet) {
			return 75;
		} else if (deviceState.isDesktop) {
			return 100;
		} else if (deviceState.isDesktopLarge) {
			return 125;
		}
	};

	const getVerticalOffset = () => {
		if (deviceState.isMobile) {
			return 50;
		} else if (deviceState.isTablet) {
			return 65;
		} else if (deviceState.isDesktop) {
			return 75;
		} else if (deviceState.isDesktopLarge) {
			return 100;
		}
	};

	const getCoverage = (dropPoint) => {
		const coverage = isSquarePizza
			? { ...SQUARE_COVERAGE_ENUM[dropPoint] }
			: { ...COVERAGE_ENUM[dropPoint] };
		if (typeof coverage === "object") {
			return coverage;
		} else return { ...DEFAULT_COVERAGE };
	};

	const getClassicPizzaOverlay = React.useCallback(
		(multi, centerPadding, verticalOffset) => {
			const {
				hideQuarters = false,
				hideHalfLeft = false,
				hideHalfRight = false,
				hideFullPizza = false,
			} = PizzaBuilderService.getAlowedToppingsAddFromAllowedQuarters(
				allowedQuartersTopping,
			);

			if (pizzaDims?.radius && distance <= pizzaDims.radius) {
				const leftHalfBound =
					pizzaDims?.center.x - Math.round(pizzaDims?.center.x * multi);
				const rightHalfBound =
					pizzaDims?.center.x + Math.round(pizzaDims?.center.x * multi);
				const mobileVerticalOffset =
					offset.current?.y < pizzaDims.center.y + verticalOffset &&
					offset.current?.y > pizzaDims.center.y - verticalOffset;
				if (distance <= centerPadding && !hideFullPizza) {
					return clsx(styles["overlay"], styles["full-circle"]);
				} else if (mobileVerticalOffset) {
					if (offset.current?.x <= leftHalfBound && !hideHalfLeft) {
						if (hideHalfLeft) {
							return clsx(styles["overlay"], styles["full-circle"]);
						}
						return clsx(styles["overlay"], styles["half-circle-left"]);
					} else if (offset.current?.x >= rightHalfBound) {
						if (hideHalfRight) {
							return clsx(styles["overlay"], styles["full-circle"]);
						}
						return clsx(styles["overlay"], styles["half-circle-right"]);
					}
				} else if (offset.current?.y > pizzaDims.center.y + verticalOffset) {
					if (offset.current?.x <= leftHalfBound) {
						if (hideQuarters && !hideHalfLeft) {
							return clsx(styles["overlay"], styles["half-circle-left"]);
						} else if (hideQuarters && hideHalfLeft) {
							return clsx(styles["overlay"], styles["full-circle"]);
						}
						return clsx(styles["overlay"], styles["quarter-bottom-left"]);
					} else if (offset.current?.x >= rightHalfBound) {
						if (hideQuarters && !hideHalfRight) {
							return clsx(styles["overlay"], styles["half-circle-right"]);
						} else if (hideQuarters && hideHalfRight) {
							return clsx(styles["overlay"], styles["full-circle"]);
						}
						return clsx(styles["overlay"], styles["quarter-bottom-right"]);
					}
				} else if (offset.current?.y < pizzaDims.center.y - verticalOffset) {
					if (offset.current?.x <= leftHalfBound) {
						if (hideQuarters && !hideHalfLeft) {
							return clsx(styles["overlay"], styles["half-circle-left"]);
						} else if (hideQuarters && hideHalfLeft) {
							return clsx(styles["overlay"], styles["full-circle"]);
						}

						return clsx(styles["overlay"], styles["quarter-top-left"]);
					} else if (offset.current?.x >= rightHalfBound) {
						if (hideQuarters && !hideHalfRight) {
							return clsx(styles["overlay"], styles["half-circle-right"]);
						} else if (hideQuarters && hideHalfRight) {
							return clsx(styles["overlay"], styles["full-circle"]);
						}

						return clsx(styles["overlay"], styles["quarter-top-right"]);
					}
				}
			}
		},
		[isOver, distance, pizzaDims, offset, allowedQuartersTopping],
	);

	const getSquarePizzaOverlay = React.useCallback(
		(multi, centerPadding, verticalOffset) => {
			if (pizzaDims?.radius && distance <= pizzaDims.radius) {
				if (isMixTopping) return clsx(styles["overlay"], styles["full-square"]);
				const leftHalfBound =
					pizzaDims?.center.x - Math.round(pizzaDims?.center.x * multi);
				const rightHalfBound =
					pizzaDims?.center.x + Math.round(pizzaDims?.center.x * multi);
				const mobileVerticalOffset =
					offset.current?.y < pizzaDims.center.y + verticalOffset &&
					offset.current?.y > pizzaDims.center.y - verticalOffset;
				if (distance <= centerPadding) {
					return clsx(styles["overlay"], styles["full-square"]);
				} else if (mobileVerticalOffset) {
					if (offset.current?.x <= leftHalfBound) {
						return clsx(styles["overlay"], styles["half-square-left"]);
					} else if (offset.current?.x >= rightHalfBound) {
						return clsx(styles["overlay"], styles["half-square-right"]);
					}
				} else if (offset.current?.y > pizzaDims.center.y + verticalOffset) {
					if (offset.current?.x <= leftHalfBound) {
						return clsx(styles["overlay"], styles["square-quarter-bottom-left"]);
					} else if (offset.current?.x >= rightHalfBound) {
						return clsx(styles["overlay"], styles["square-quarter-bottom-right"]);
					}
				} else if (offset.current?.y < pizzaDims.center.y - verticalOffset) {
					if (offset.current?.x <= leftHalfBound) {
						return clsx(styles["overlay"], styles["square-quarter-top-left"]);
					} else if (offset.current?.x >= rightHalfBound) {
						return clsx(styles["overlay"], styles["square-quarter-top-right"]);
					}
				}
			}
		},
		[isOver, distance, pizzaDims, offset, isMixTopping],
	);

	const getOverlay = () => {
		// NOTE: parameter to control bounds
		const multi = 0.05;
		const centerPadding = getCenterPadding();
		const verticalOffset = getVerticalOffset();
		if (isSquarePizza) {
			return getSquarePizzaOverlay(multi, centerPadding, verticalOffset);
		} else {
			return getClassicPizzaOverlay(multi, centerPadding, verticalOffset);
		}
	};

	const calcDistance = (p1, p2) => {
		return Math.round(
			Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),
		);
	};

	const hideTutorial = () => {
		if (isFirstTime.current) {
			isFirstTime.current = false;
		}
	};

	const handleToppingFilterClick = (item) => {
		setSelectedFilter(item?.id);
	};

	const resetToppingsFilter = () => {
		if (selectedFilter !== toppings?.defaultElement) {
			setSelectedFilter(toppingsFilters?.defaultElement);
		}
		if (deviceState.isMobile && listRef.current) {
			listRef.current?.scrollTo({
				left: 0,
				behavior: "smooth",
			});
		}
	};

	const getToppingPayload = (
		topping,
		shouldClearAllToppings = false,
		initialPayload = null,
	) => {
		let item = initialPayload
			? initialPayload
			: JSON.parse(JSON.stringify(saleObj));

		if (topping) {
			const currentStep = PizzaBuilderService.getCurrentStep(
				item,
				stepIndex,
				isSale,
			);

			let toppingObj = PizzaBuilderService.getChild(currentStep, topping.id);

			if (!toppingObj) {
				const toppingItem = catalogProducts[topping.id];
				const isMixTopping =
					typeof toppingItem === "object" &&
					toppingItem.hasOwnProperty("meta") &&
					toppingItem.meta === META_ENUM.MIX_TOPPING_ITEM;
				if (isMixTopping) {
					item = PizzaBuilderService.removeMix(item, stepIndex, catalogProducts);
				}

				item = PizzaBuilderService.addTopping(
					JSON.parse(JSON.stringify(item)),
					stepIndex,
					topping,
					isSale,
					shouldClearAllToppings,
				);
			} else {
				item = PizzaBuilderService.updateTopping(
					JSON.parse(JSON.stringify(item)),
					stepIndex,
					topping,
					isSale,
				);
			}
		}
		// Replace uuid
		const fatherUUID = item?.uuid;

		const step = stepIndex ?? 0;
		if (isSale) {
			const hasValidSubItems =
				item.subitems[step].hasOwnProperty("subitems") &&
				Array.isArray(item.subitems[step].subitems);

			const newToppings = [
				...(hasValidSubItems ? item.subitems[step].subitems : []),
			];

			let newSubItems = [...item.subitems];
			newSubItems[step] = { ...newSubItems[step], subitems: newToppings };
			item = { ...item, subitems: newSubItems };
		} else {
			const hasValidSubItems =
				item.hasOwnProperty("subitems") && Array.isArray(item?.subitems);
			const newToppings = [
				...(hasValidSubItems ? JSON.parse(JSON.stringify(item?.subitems)) : []),
			];
			item = { ...item, subitems: newToppings };
		}
		return {
			...(fatherUUID ? { insteadOf: fatherUUID } : {}),
			step: `${STEPS.ADD_TOPPING} - ${topping?.id}`,
			item: item,
		};
	};

	function handleToppingAdd(topping, optionalSaleObj = null) {
		const toppingName = catalogProducts[topping.id]?.name;
		const toppingMeta = catalogProducts[topping.id]?.meta;
		AnalyticsService.orderMealCustomizedToppingConfirm(
			toppingName,
			"Customize Meal Topping",
		);
		if (saleObj) {
			const currentStep = PizzaBuilderService.getCurrentStep(
				saleObj,
				stepIndex,
				isSale,
			);
			const cartItemTopping = PizzaBuilderService.getChild(
				currentStep,
				topping.id,
			);
			if (cartItemTopping) {
				const cartItemQuarters = cartItemTopping.quarters;
				if (cartItemQuarters !== null) {
					for (const quarter of Object.keys(topping.coverage)) {
						if (cartItemQuarters?.includes(quarter)) {
							topping.coverage[quarter] = 1;
						}
					}
				}
			}
		}
		if (isFirstTime.current) hideTutorial();
		const hasDifferentMix = coverages
			? Object.keys(coverages)
					.map((toppingId) => catalogProducts[toppingId])
					.some((t) => t.meta === META_ENUM.MIX_TOPPING_ITEM && t.id !== topping.id)
			: false;

		if (toppingMeta === META_ENUM.MIX_TOPPING_ITEM) {
			if (hasDifferentMix) {
				return showSwitchMixModal(topping.id);
			}
		}
		const { coverage = {} } = topping;
		const payload = getToppingPayload(topping, false, optionalSaleObj);
		if (typeof payload === "object") {
			CartService.validateAddToCart(
				payload,
				(res) => {
					if (res.overallstatus !== VALIDATION_STATUS.ERROR) {
						if (
							!didShowToppingWillCost.current &&
							res?.item?.pricingBalance?.topping < 0
						) {
							setIsNextToppingPayed(!isNextToppingPayed);
							didShowToppingWillCost.current = true;
						} else {
							setIsNextToppingPayed(false);
						}

						dispatch(Actions.setCartItem(payload.item));
					}
				},
				trigger,
			);
		}
		const newCoverage = {};
		for (const q in coverage) {
			if (coverage[q] !== 0) {
				newCoverage[q] = 1;
			}
		}
		dispatch(
			Actions.updateTopping({
				step: stepIndex ?? 0,
				id: topping.id,
				coverage: newCoverage,
				isMix: topping.isMix,
				promoProductId: topping?.promoProductId ?? "",
			}),
		);

		if (!isEdit) {
			const timeout = setTimeout(() => {
				resetToppingsFilter();
				clearTimeout(timeout);
			}, 250);
		}

		return payload.item;
	}

	function handleSwitchPizzaId(
		newPizzaId,
		isChangeUpgrade = false,
		initialPayload = null,
	) {
		let item;
		if (isChangeUpgrade) {
			const { productId, promoProductId } = newPizzaId;
			item = PizzaBuilderService.switchPizzaId(
				initialPayload ? initialPayload : null,
				stepIndex,
				productId,
				promoProductId,
				isSale,
			);
		} else {
			item = PizzaBuilderService.switchPizzaId(
				null,
				stepIndex,
				newPizzaId,
				null,
				isSale,
			);
		}

		return item;
	}

	const handleToppingRemove = (topping) => {
		const id = topping.id;
		let item;
		const step = stepIndex ?? 0;
		const father = isSale ? saleObj.subitems[step] : saleObj;
		if (PizzaBuilderService.isSubItemExists(father, id)) {
			item = PizzaBuilderService.removeTopping(saleObj, stepIndex, id, isSale);
			const payload = {
				step: `remove topping - ${id}`,
				item,
			};
			CartService.addToCart(
				payload,
				(res) => {
					if (res.overallstatus !== VALIDATION_STATUS.ERROR) {
						dispatch(Actions.setCartItem(payload.item));
						if (
							!res?.item?.pricingBalance?.topping ||
							res?.item?.pricingBalance?.topping > 0
						) {
							setIsNextToppingPayed(false);
							didShowToppingWillCost.current = false;
						}
					}
				},
				null,
				false,
				trigger,
			);
			dispatch(
				Actions.removeTopping({
					step: stepIndex ?? 0,
					id,
				}),
			);
		}
	};

	function updateToppingListByArrayOfToppings(toppingsArray) {
		if (toppingsFilters.elements) {
			const parsedList = JSON.parse(JSON.stringify(toppings?.elements ?? []));

			for (const toppingIndex in toppingsArray) {
				const toppingId = toppingsArray[toppingIndex];

				const foundTopping = allToppings?.elements?.find(
					(topping) => topping.id === toppingId,
				);

				if (foundTopping) {
					const NO_TOPPING_FOUND = -1;

					const toppingIndex = parsedList.findIndex(
						(topping) => topping.id === toppingId,
					);

					if (toppingIndex !== NO_TOPPING_FOUND) {
						parsedList.splice(toppingIndex, 1);
						parsedList.unshift(foundTopping);
					}
				}
			}

			setMutatedToppingsList(parsedList);
		}
	}

	const openVeganPopup = () => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.VEGAN_PIZZA,
			}),
		);
	};

	const openVeganErrorPopup = () => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.VEGAN_ERROR,
			}),
		);
	};

	const handleOnVeganPress = () => {
		const { possiblePizzas } = params;

		const isPossiblePizzasArray =
			Array.isArray(possiblePizzas) &&
			possiblePizzas.length > 0 &&
			Array.isArray(possiblePizzas[0]);

		let pizzaId;

		const isVeganPizza = dough?.vegan && dough?.vegan !== "muzzarella";

		if (isPossiblePizzasArray) {
			if (isVeganPizza) {
				pizzaId = { productId: possiblePizzas[0][doughMatrixEnum.ID] };
			} else {
				pizzaId = { productId: possiblePizzas[1][doughMatrixEnum.ID] };
			}
		} else {
			if (isVeganPizza) {
				pizzaId = possiblePizzas["muzzarella"];
			} else {
				pizzaId = possiblePizzas["vegan"];
			}
		}

		pizzaId = pizzaId?.productId;

		const payload = getToppingPayload();
		const { item } = payload;

		if (isSale) {
			item.subitems[stepIndex].productId = pizzaId;
		} else {
			item.productId = pizzaId;
		}

		CartService.validateAddToCart(
			payload,
			(res) => {
				if (res.overallstatus === "ErrorSubItemCannotBeAddedToParentItem") {
					return openVeganErrorPopup();
				} else if (
					!res.overallstatus ||
					res.overallstatus === VALIDATION_STATUS.INCOMPLETE
				) {
					setVegan((prevValue) => !prevValue);
					if (!vegan) {
						openVeganPopup();
					}
					dispatch(
						Actions.updateDough({
							step: stepIndex ?? 0,
							data: {
								vegan: dough?.vegan !== undefined ? !dough.vegan : true,
							},
						}),
					);

					if (pizzaId) {
						const item = PizzaBuilderService.switchPizzaId(
							saleObj,
							stepIndex,
							pizzaId,
							null,
							isSale,
						);
						dispatch(
							Actions.setPizzaId({
								step: stepIndex ?? 0,
								id: pizzaId,
							}),
						);
						dispatch(Actions.setCartItem(item));
					}
				}
			},
			null,
			false,
			trigger,
		);
	};

	const onShowCoverageOptions = (id, row, isDragging, rect) => {
		setActiveRow(row);
		setShowCoverageOptions(!isDragging);
		if (selectedTopping === id) {
			setSelectedTopping(-1);
			setShowCoverageOptions(false);
		} else {
			setSelectedToppingRect(rect);
			setSelectedTopping(id);
		}
	};

	const onShowMixInfo = (id) => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.MIX_INFO,
				payload: {
					id: id,
					primaryBtnText: translate("mixToppingInfo_addTopping_btnLabel"),
					onAdd: (topping) => {
						// clearAllToppings();
						handleToppingAdd(topping);
					},
				},
			}),
		);
	};

	const showSwitchMixModal = (id) => {
		const onSwitchCallback = (topping) => {
			const { coverage = {} } = topping;
			const oldMixToppingId = Object.keys(coverages)
				.map((toppingId) => catalogProducts[toppingId])
				.filter((t) => t.meta === META_ENUM.MIX_TOPPING_ITEM)[0]?.id;
			const item = PizzaBuilderService.switchMixTopping(
				isSale ? JSON.parse(JSON.stringify(saleObj)) : null,
				stepIndex ?? 0,
				id,
				isSale,
			);
			const payload = {
				item,
				step: `switch mix topping to ${id}`,
			};
			CartService.addToCart(
				payload,
				(res) => {
					if (res.overallstatus !== VALIDATION_STATUS.ERROR) {
						dispatch(
							Actions.removeTopping({
								step: stepIndex,
								id: oldMixToppingId,
							}),
						);
						dispatch(Actions.setCartItem(payload.item));
					}
				},
				null,
				false,
				trigger,
			);
			const newCoverage = {};
			for (const q in coverage) {
				if (coverage[q] !== 0) {
					newCoverage[q] = 1;
				}
			}
			dispatch(
				Actions.updateTopping({
					step: stepIndex ?? 0,
					id: topping.id,
					isMix: topping.isMix,
					assetVersion: topping.assetVersion ?? 0,
					coverage: newCoverage,
				}),
			);
		};
		const timeout = setTimeout(() => {
			dispatch(
				Actions.addPopup({
					type: popupTypes.SWITCH_MIX,
					payload: {
						id,
						title: translate("switchMixModal_title"),
						primaryBtnText: translate("switchMixModal_acceptBtn_label"),
						secondaryBtnText: translate("switchMixModal_declineBtn_label"),
						onAdd: (topping) => onSwitchCallback(topping),
						coverages,
						isSquare,

						stepIndex: stepIndex ?? 0,
						pizzaId: selectedPizzaId,
					},
				}),
			);
			clearTimeout(timeout);
		}, 300);
	};

	const renderNextToppingWillCost = () => {
		return (
			<div className={styles["next-topping-will-cost-wrapper"]}>
				<span className={styles["next-topping-will-cost-text"]}>
					{translate("toppingBuilder_nextToppingWillCostMoney_label")}
				</span>
			</div>
		);
	};

	const renderMobileToppingFilters = () => {
		return (
			<div className={styles["filter-list-wrapper"]}>
				<button
					aria-label={translate("accessibility_imageAlt_closeFilter")}
					onClick={() => setShowToppingFilters(false)}
					className={styles["close-filter-icon"]}>
					<img
						src={CloseFilterIcon.src}
						alt={""}
					/>
				</button>
				<div className={styles["divider"]} />
				<div
					ref={filterRef}
					className={styles["filter-list"]}>
					{toppingsFilters?.elements?.map((item, index) => (
						<HeaderFilterItem
							key={`toppings-filter-${item.id}-${index}`}
							handleChangeSelected={() => handleToppingFilterClick(item)}
							isSelected={selectedFilter === item.id}
							id={item.id}
							index={index}
							text={item.label}
						/>
					))}
				</div>
			</div>
		);
	};

	const onFocus = (event) => {
		setFocusElement(event);
	};

	const onBlur = () => {
		setFocusElement(false);
	};

	const onKeyDown = () => {
		if (!focusElement) {
			return;
		}
		handleOnVeganPress();
	};

	const renderVeganMobile = () => {
		return (
			<>
				<button
					aria-label={translate("accessibility_imageAlt_showFilters")}
					onClick={() => setShowToppingFilters(true)}
					className={styles["toggle-filter-list"]}>
					<img
						src={ToggleFiltersIcon.src}
						alt={""}
					/>
					{selectedFilter !== toppingsFilters?.defaultElement ? (
						<img
							className={styles["filter-changes"]}
							src={ChangesIcon.src}
							aria-hidden={true}
						/>
					) : null}
					<span className={styles["toggle-filter-label"]}>
						{translate("builderModal_toppingsBuilder_filterLabel")}
					</span>
				</button>
				{showVeganCheckbox && (
					<Checkbox
						id={"vegan"}
						variant={CHECKBOX_VARAINTS.LIGHT}
						value={vegan}
						name={"vegan"}
						smart
						emptyImage={EmptyCircularCheckbox}
						checkedImage={FullCircularCheckbox}
						overrideVariant
						className={styles["vegan-friendly-checkbox"]}
						onChange={handleOnVeganPress}
						ariaLabel={translate("toppings_vegan")}
						label={
							<span
								className={styles["checkbox-label"]}
								aria-hidden={true}>
								{translate("toppings_vegan")}
								<img
									src={VeganFriendly.src}
									alt={"vegan friendly"}
									className={styles["vegan-friendly-icon"]}
								/>
							</span>
						}
						onFocus={onFocus}
						onBlur={onBlur}
					/>
				)}
			</>
		);
	};

	const renderMiddleSection = () => {
		if (deviceState.isMobile || deviceState.isTablet) {
			return (
				<div
					className={clsx(
						styles["middle-section"],
						showFadeIn || showFadeOut ? styles["fade-in"] : "",
					)}>
					{!showToppingFilters ? renderVeganMobile() : renderMobileToppingFilters()}
				</div>
			);
		} else
			return (
				<div
					className={clsx(
						styles["middle-section"],
						!showVeganCheckbox ? styles["no-checkbox"] : "",
						showFadeIn || showFadeOut ? styles["fade-in"] : "",
					)}
					onKeyDown={(event) => handleKeyPress(event, onKeyDown)}>
					{showVeganCheckbox ? (
						<Checkbox
							id={"vegan"}
							variant={CHECKBOX_VARAINTS.LIGHT}
							value={vegan}
							name={"vegan"}
							smart
							emptyImage={EmptyCircularCheckbox}
							checkedImage={FullCircularCheckbox}
							overrideVariant
							className={styles["vegan-friendly-checkbox"]}
							onChange={handleOnVeganPress}
							ariaLabel={translate("toppings_vegan")}
							label={
								<span
									className={styles["checkbox-label"]}
									aria-hidden={true}>
									{translate("toppings_vegan")}
									<img
										src={VeganFriendly.src}
										alt={"vegan friendly"}
										className={styles["vegan-friendly-icon"]}
									/>
								</span>
							}
							onFocus={onFocus}
							onBlur={onBlur}
						/>
					) : null}
					<div className={styles["toppings-actions"]}>
						{options.reverse().map((option, idx) => {
							return (
								<React.Fragment key={`tooltip-option-${idx}`}>
									<div className={styles["topping-action-wrapper"]}>
										{option.canChange && hasChanges && (
											<div className={styles["changes-icon"]}>
												<img
													src={ChangesIcon.src}
													alt={""}
												/>
											</div>
										)}
										<button
											aria-label={option?.text}
											onClick={option.onPress}
											className={styles["topping-action"]}>
											<img
												src={option.img.src}
												alt={""}
											/>
										</button>
										<TooltipHover
											title={`${option.text} ${
												hasChanges && option.canChange
													? `(${pizzaSpecialReqs?.length})`
													: ""
											}`}
										/>
									</div>
									{options.length > 1 && idx === 0 && (
										<div className={styles["divider"]} />
									)}
								</React.Fragment>
							);
						})}
					</div>
				</div>
			);
	};

	const onCoverageOptionsClose = () => {
		setShowCoverageOptions(false);
	};

	const renderToppingList = () => {
		const toppingProduct = catalogProducts[selectedTopping];
		const allowedQuarters = toppingProduct?.allowedQuarters ?? [];
		const {
			hideQuarters = false,
			hideHalfLeft = false,
			hideHalfRight = false,
			hideFullPizza = false,
		} = PizzaBuilderService.getAlowedToppingsAddFromAllowedQuarters(
			allowedQuarters,
		);
		const coverageOptionsProps = {
			onClose: onCoverageOptionsClose,
			isVisible: showCoverageOptions,
			selectedTopping,
			selectedToppingRect,
			onAdd: handleToppingAdd,
			onRemove: handleToppingRemove,
			coverages,
			isSquare,
			pizzaImg,
			hideQuarters,
			hideHalfLeft,
			hideHalfRight,
			hideFullPizza,
		};
		return (
			<>
				{deviceState.notDesktop && showCoverageOptions && (
					<CoverageOptions
						{...coverageOptionsProps}
						pizzaId={selectedPizzaId}
					/>
				)}
				<div
					ref={listRef}
					id={"toppings-list"}
					className={clsx(styles["toppings-list"])}>
					{!!mutatedToppingsList?.length && (
						<SRContent
							role={"alert"}
							ariaLive={"off"}
							message={
								translate("accessibility_toppingsNumber") +
								" " +
								mutatedToppingsList.length
							}
						/>
					)}
					{/* {showLinearGradient && <div className={'linear-gradient-left'}/>} */}
					{!!mutatedToppingsList &&
						mutatedToppingsList?.map((topping, idx) => {
							const showInTable =
								deviceState.isDesktop &&
								((idx + 1) % 5 === 0 ||
									((idx + 1) % 5 !== 0 && idx === toppings?.elements?.length - 1));
							const isVisible =
								activeRow === Math.floor(idx / 5) && showCoverageOptions;
							const isOnPizza =
								coverages?.[topping.id] &&
								Object.values(coverages?.[topping.id]?.coverage).some((c) => c !== 0);

							return (
								<React.Fragment key={`topping-selector-${idx}`}>
									<ToppingSelector
										id={topping.id}
										row={Math.floor(idx / 5)}
										onClick={onShowCoverageOptions}
										key={`_${topping.id}`}
										assetVersion={topping.assetVersion}
										onShowMixInfo={onShowMixInfo}
										setPreviewSrc={(src) => setSelectedToppingSrc(src)}
										isDraggable
										resetToppingsFilter={resetToppingsFilter}
										clicked={selectedTopping === topping.id && showCoverageOptions}
										isOnPizza={isOnPizza}
										image={getFullMediaUrl(
											topping,
											MEDIA_TYPES.PRODUCT,
											MEDIA_ENUM.IN_MENU,
										)}
										coverage={coverages?.[topping.id]?.coverage}
										onRemove={handleToppingRemove}
										onAdd={handleToppingAdd}
										className={clsx(styles["topping"])}
										onToppingChange={setDragedTopping}
									/>
									{showInTable && (
										<CoverageOptions
											{...coverageOptionsProps}
											isVisible={isVisible}
											toppingId={selectedTopping}
											pizzaId={selectedPizzaId}
										/>
									)}
								</React.Fragment>
							);
						})}
					{/* {showLinearGradient && <div className={'linear-gradient-right'}/>} */}
				</div>
				<ToppingPreview img={selectedToppingSrc} />
			</>
		);
	};

	const onOpenDipsModal = () => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.PIZZA_DIPS,
				payload: {
					dipsMenuId,
					isEdit,
					isSale,
					stepIndex,
					dipsAmountInCart,
					initialCartItem: initialCartItem.current,
				},
			}),
		);
	};

	const renderMobile = () => {
		const overlayClassName = getOverlay();
		return (
			<div className={styles["toppings-builder-wrapper"]}>
				<div
					className={clsx(
						styles["toppings-top-section"],
						showFadeIn || showFadeOut ? styles["fade-in"] : "",
					)}>
					<CustomCollapse
						shouldChangeMaxHeight
						className={styles["next-topping-will-cost-collapse"]}
						isOpen={isNextToppingPayed}
						content={() => renderNextToppingWillCost()}
					/>
					<h2 className={styles["toppings-builder-title"]}>
						{translate("builderModal_toppingsBuilder_title")}
					</h2>
					<div className={styles["toppings-actions-options-wrapper"]}>
						<MultipleOptionsIndicator
							options={options}
							stepIndex={stepIndex}
							extraStyles={styles}
						/>
					</div>
				</div>

				{dipsMenuId && (
					<FloatingActionButton
						onClick={onOpenDipsModal}
						className={styles["dip-action"]}>
						{dipsAmountInCart > 0 && (
							<div className={styles["dips-notification"]}>{dipsAmountInCart}</div>
						)}
						<div className={styles["label"]}>{translate("dip_open_action")}</div>
					</FloatingActionButton>
				)}

				<Pizza
					ref={drop}
					isOver={isOver}
					pizzaId={selectedPizzaId}
					coverages={coverages}
					styles={styles}
					showTutorial={isFirstTime.current}
					overlayClassName={overlayClassName}
					isAnimatedCoverage
					isAllowedQuarters={!isPersonalPizza}
				/>
				{renderMiddleSection()}
				<SlideRight
					styleConfig={{
						duration: 1750,
						mass: 50,
						easing: easings.easeInOutElastic,
						friction: 100,
						tension: 240,
					}}
					offset={window.innerWidth}
					delay={100}>
					<div
						className={clsx(
							styles["toppings-list-wrapper"],
							showFadeOut ? styles["fade-in"] : "",
						)}>
						{renderToppingList()}
					</div>
				</SlideRight>
				{Button({ btnProps })}
			</div>
		);
	};

	const renderDesktop = () => {
		const overlayClassName = getOverlay();
		return (
			<div className={styles["toppings-builder-wrapper"]}>
				<SRContent
					message={translate("builderModal_toppingsBuilder_title")}
					ariaLive={"off"}
					role={"alert"}
				/>
				<CustomCollapse
					className={styles["next-topping-will-cost-collapse"]}
					shouldChangeMaxHeight
					isOpen={isNextToppingPayed}
					content={() => renderNextToppingWillCost()}
				/>

				{dipsMenuId && (
					<FloatingActionButton
						onClick={onOpenDipsModal}
						className={styles["dip-action"]}>
						{dipsAmountInCart > 0 && (
							<div className={styles["dips-notification"]}>{dipsAmountInCart}</div>
						)}
						<div className={styles["label"]}>{translate("dip_open_action")}</div>
					</FloatingActionButton>
				)}

				<div
					className={clsx(
						styles["toppings-right-section"],
						showFadeIn || showFadeOut ? styles["fade-in"] : "",
					)}>
					<h2 className={styles["toppings-builder-title"]}>
						{translate("builderModal_toppingsBuilder_title")}
					</h2>
					<div className={styles["filter-list-wrapper"]}>
						<div className={styles["filter-list"]}>
							{toppingsFilters?.elements?.map((item, index) => (
								<HeaderFilterItem
									key={`topping-filter-${item.label}-${index}`}
									handleChangeSelected={() => {
										setSelectedFilter(item?.id);
										onCoverageOptionsClose();
										// scrollToStart();
									}}
									isSelected={selectedFilter === item.id}
									id={item.id}
									index={index}
									text={item.label}
								/>
							))}
						</div>
					</div>
					<div className={styles["filters-separator"]} />
					<div
						className={styles["toppings-list-wrapper"]}
						ref={toppingsRef}>
						<HiddableScroolBar
							isOpen={true}
							listref={listRef}
							numberOfOptions={mutatedToppingsList.length}
							extraStyles={styles}>
							{renderToppingList()}
						</HiddableScroolBar>
					</div>
				</div>

				<div className={styles["toppings-left-section"]}>
					{renderMiddleSection()}
					<Pizza
						ref={drop}
						styles={styles}
						isOver={isOver}
						coverages={coverages}
						pizzaId={selectedPizzaId}
						showTutorial={isFirstTime.current}
						overlayClassName={overlayClassName}
						isAnimatedCoverage
						isAllowedQuarters={!isPersonalPizza}
					/>
					<div className={styles["continue-btn"]}>{Button({ btnProps })}</div>
				</div>
				<div className={styles["bottom-gradient"]}></div>
			</div>
		);
	};

	function onSubmit() {
		dispatch(Actions.setIsUserAgreeToReset(false));
		let payload = getToppingPayload();
		delete payload?.item.status;
		dispatch(Actions.setCartItem(payload.item));
		CartService.validateAddToCart(
			payload,
			(res) => {
				const { item } = res;
				const hasRemainingToppings = isSale
					? item.pricingBalance?.topping && item.pricingBalance?.topping > 0
					: false;
				const upgrades = isSale ? item.subitems[stepIndex].upgrades : item.upgrades;
				if (
					(!isSale || (isSale && (!isLastTab || !hasRemainingToppings))) &&
					!userData?.showUpgradePizza &&
					upgrades?.length > 0 &&
					!isMixPizza &&
					!isEdit
				) {
					dispatch(
						Actions.addPopup({
							type: popupTypes.MIXED_UPGRADES_POPUP,
							payload: {
								upgrades: upgrades,
								isSquare,
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
				} else if (
					typeof userData === "object" &&
					!userData?.showDuplicatePizza &&
					allowCopyToNextSteps &&
					!isEdit
				) {
					showDuplicatePopup();
				} else {
					endOfPopups(undefined, null, hasRemainingToppings);
				}
			},
			trigger,
		);
	}

	const showDuplicatePopup = (updatedSaleObj) => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.DUPLICATE_PIZZA,
				payload: {
					title: translate("duplicatePizzaModal_title"),
					subtitle: translate("duplicatePizzaModal_subtitle"),
					primaryBtnText: translate("duplicatePizzaModal_button"),
					primaryBtnOnPress: (payload, quantity) => {
						dispatch(Actions.setCartItem(payload.item));
						endOfPopups(quantity, payload);
					},
					maxAmount: maxDuplicate,
					coverages: coverages,
					isSquare: isSquarePizza,
					pizzaImg: pizzaImg,
					extraStyles: styles,
					stepIndex: stepIndex ?? 0,
					fatherEntity: fatherEntity,
					updatedSaleObj: updatedSaleObj,
				},
			}),
		);
	};

	const onUpgradeEnd = (payload) => {
		if (!userData?.showDuplicatePizza && allowCopyToNextSteps) {
			showDuplicatePopup({ item: payload ? payload : saleObj });
		} else {
			endOfPopups(1, { item: payload ? payload : saleObj });
		}
	};

	const endOfPopups = (
		quantity = 1,
		payload = null,
		hasRemainingToppings = false,
	) => {
		const {
			nextTab = () => {},
			isLastTab = false,
			onEndSale = () => {},
			goToTab = () => {},
		} = props;

		const salePayload = payload ? payload : { item: saleObj };

		const isMaxDuplicateLikeMaxSteps =
			quantity === stepsLen || quantity === stepsLen - stepIndex;
		if (isSale && !isLastTab && stepIndex !== undefined) {
			CartService.validateAddToCart(
				salePayload,
				(res) => {
					if (
						res.overallstatus === VALIDATION_STATUS.INCOMPLETE ||
						!res.overallstatus
					) {
						// dispatch(Actions.setCartItem(salePayload.item));
						if (isMaxDuplicateLikeMaxSteps) {
							goToTab(stepIndex + quantity - 1, true, true);
							onEndSale(res, isMixPizza);
						} else if (quantity > 1) {
							goToTab(stepIndex + quantity, true);
						} else nextTab();
					}
				},
				trigger,
			);
		} else {
			CartService.validateAddToCart(
				salePayload,
				(res) => {
					if (
						res.overallstatus === VALIDATION_STATUS.INCOMPLETE ||
						!res.overallstatus
					) {
						onEndSale(res);
					}
				},
				trigger,
			);
		}
		if (!hasRemainingToppings) {
			EmarsysService.setViewUpgradePizza(
				salePayload?.item?.subitems,
				isSale,
				stepIndex,
			);
		}
	};

	return deviceState.isMobile || deviceState.isTablet
		? renderMobile()
		: renderDesktop();
}

function TooltipHover({ title }) {
	const options = [
		{
			id: generateUniqueId(8),
			text: title,
		},
	];

	return (
		<OptionsToolTip
			className={styles["tooltip-hover"]}
			options={options}
			isVisible={true}
			extraStyles={styles}
		/>
	);
}
