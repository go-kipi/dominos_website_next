import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import BuilderHeader from "../builder/components/BuilderHeader";
import STACK_TYPES from "../../../constants/stack-types";
import Api from "api/requests";
import Button from "../../../components/button";
import { useDispatch, useSelector } from "react-redux";
import { getFullMediaUrl, parseCoverage } from "../../../utils/functions";
import AnimatedInput from "../../../components/forms/animated_input";
import BlurPopup from "../../Presets/BlurPopup";
import PizzaTreeService from "services/PizzaTreeService";
import doughMatrixEnum from "constants/doughMatrixEnum";
import ToppingSelector from "components/ToppingSelector";
import { MEDIA_ENUM } from "constants/media-enum";
import { MEDIA_TYPES } from "constants/media-types";
import useTranslate from "hooks/useTranslate";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import { META_ENUM } from "constants/menu-meta-tags";
import RenderNotes from "components/PizzaNotes/PizzaNotes";
import useDetectKeyboardOpen from "hooks/useDetectKeyboardOpen";
import TextInput from "components/forms/textInput";
import { PizzaWithToppings } from "animations-manager/animations/MovingSavedPizza";
import ToppingListWithSwiper from "../ToppingListWithSwiper";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { USER_PROPERTIES } from "constants/user-properties";

import SlideAnimation from "components/SlideAnimation/SlideAnimation";
import useStack from "hooks/useStack";
import Actions from "redux/actions";

const SavePizza = (props) => {
	const { payload } = props;
	const { pizzas = [], onPizzaSaved = () => {} } = payload;
	const ref = useRef();
	const [currentScreen, setStack, goBack, getIndex, resetStack] = useStack(
		STACK_TYPES.SAVE_PIZZA,
	);
	const stackState = useSelector(
		(store) => store.stackState[STACK_TYPES.SAVE_PIZZA],
	);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const dispatch = useDispatch();
	const tabs = pizzas;
	const [currentPizza, setCurrentPizza] = useState(tabs?.[0]);
	const [activeIndex, setActiveIndex] = useState(0);
	const currentProduct = useMenus(currentPizza?.productId, ActionTypes.PRODUCT);
	const isKeyboardOpen = useDetectKeyboardOpen();
	const currentPizzaType = PizzaTreeService.getPizzaPathById(
		currentPizza?.productId,
	)?.[doughMatrixEnum.TYPE];
	const savedpizzaTitle = useSelector((state) => state.savedPizzaTitle);
	const catalog = useSelector((store) => store.menusData.catalogProducts);
	const didSave = useRef(false);
	const deviceState = useSelector((store) => store.deviceState);
	const [showToppings, setShowToppings] = useState(true);
	const [placeholder, setPlaceholder] = useState(
		"savePizzaModal_text_input_placeholder",
	);
	const [errorMessage, setErrorMessage] = useState("");
	const [showError, setShowError] = useState(false);
	const translate = useTranslate();
	const [toppings, setToppings] = useState([]);
	const isDesktop = deviceState.isDesktop;

	const validations = useSelector(
		(store) => store.globalParams?.savedKitNameValidation?.result,
	);

	useEffect(() => {
		const input = document.getElementById("name-input");

		if (!isKeyboardOpen && deviceState.isMobile && input) {
			input.blur();
		}
	}, [isKeyboardOpen]);

	useEffect(() => {
		if (typeof currentPizza === "object") {
			setStack({
				type: `${currentPizza.uuid}`,
				params: {},
			});
			hideError();
		}

		return () => {
			dispatch(Actions.resetSavedPizzaName({}));
		};
	}, []);

	useEffect(() => {
		return () => {
			resetStack();
		};
	}, []);

	useEffect(() => {
		if (Array.isArray(stackState)) {
			const nextIdx = tabs.findIndex((tab) => tab.uuid === currentScreen.type);
			const nextPizza = tabs[nextIdx];
			if (typeof nextPizza === "object") {
				setCurrentPizza(nextPizza);
				// setName("");
				setActiveIndex(nextIdx);
			}
		}
	}, [currentScreen.type]);

	useEffect(() => {
		if (typeof currentPizza === "object") {
			const toppings = [];
			for (const index in currentPizza?.subItems) {
				const subItem = currentPizza?.subItems[index];
				const coverage = parseCoverage(subItem.quarters);
				const product = catalog[subItem.productId];

				const topping = {
					id: subItem.productId,
					coverage,
					quantity: subItem.quantity,
					assetVersion: product.assetVersion,
				};
				toppings.push(topping);
			}
			setToppings(toppings);
		}
	}, [currentPizza]);

	const throwError = (message) => {
		setErrorMessage(message);
		setShowError(true);
	};
	const hideError = () => {
		setErrorMessage("");
		setShowError(false);
	};

	const onSavePizza = (uuid) => {
		if (
			validations &&
			validations?.minCharacters > savedpizzaTitle?.[activeIndex].length
		) {
			throwError(translate("savedKit_error_too_short"));
			return;
		} else {
			hideError();
		}
		const payload = {
			uuid: uuid,
			name: savedpizzaTitle?.[activeIndex],
		};

		Api.saveNewKit({
			payload,
			onSuccess: (res) => {
				didSave.current = true;
				goNextTab();
				AnalyticsService.setUserProperties({
					[USER_PROPERTIES.ADD_TO_FAVORITE]: USER_PROPERTIES.values.YES,
				});
			},
		});
	};

	const onTabChange = (idx) => {
		const selectedPizza = tabs[idx];
		setActiveIndex(idx);
		if (selectedPizza) {
			const payload = {
				type: `${selectedPizza.uuid}`,
				params: {},
			};
			setStack(payload);
		}
	};

	const goNextTab = () => {
		if (activeIndex + 1 >= tabs.length) {
			return ref.current.animateOut(didSave.current ? onPizzaSaved : null);
		}
		setActiveIndex((prevValue) => prevValue + 1);

		const nextPizza = tabs[activeIndex + 1];
		if (typeof nextPizza === "object") {
			setStack({
				type: `${nextPizza.uuid}`,
				params: {},
			});
			hideError();
		}
	};

	const onNameChange = (e) => {
		const { value } = e.target;
		if (validations?.regexp) {
			const reg = RegExp(validations.regexp);
			if (reg.exec(value) === null) {
				throwError(translate("savedKit_error_bad_characters"));
			} else {
				hideError();
			}
		}
		dispatch(Actions.updateSavedPizzaName({ activeIndex, value }));
		// setName(value);
	};

	const onInputFocus = () => {
		if (deviceState.notDesktop) {
			setShowToppings(false);
		} else {
			setPlaceholder("savePizzaModal_text_input_placeholder_desktop");
		}
	};

	const onInputBlur = (e) => {
		const { value } = e.target;

		setTimeout(() => {
			// NOTE: For changing the order of the call stack - make the click on button first and then onBlur (default = onMouseDown => onBlur => onMouseUp => onClick)
			if (deviceState.notDesktop) {
				setShowToppings(true);
			} else {
				if (value.length === 0) {
					setPlaceholder("savePizzaModal_text_input_placeholder");
				}
			}
		}, 0);
	};

	const RenderInput = () => {
		return deviceState.notDesktop ? (
			<TextInput
				type="text"
				className={styles["save-pizza-name-input"]}
				placeholder={translate(`savePizzaModal_text_input_placeholder`)}
				value={savedpizzaTitle?.[activeIndex]}
				onChange={onNameChange}
				onFocus={onInputFocus}
				onBlur={onInputBlur}
				id={"name-input"}
				showClearIcon
				name="pizza-name"
				errorMessage={errorMessage}
				showError={showError}
				maxLength={validations?.maxCharacters}
				centerInput
			/>
		) : (
			<AnimatedInput
				id={"name-input"}
				name={"pizza-name"}
				type={"text"}
				className={styles["save-pizza-name-input"]}
				focusPlaceHolderClass={styles["save-pizza-name-focus"]}
				wrapperFocusClass={styles["save-pizza-wrapper-focus"]}
				placeHolderClass={styles["save-pizza-name-placeholder"]}
				value={savedpizzaTitle?.[activeIndex]}
				placeholder={translate(placeholder)}
				onChange={onNameChange}
				onFocus={onInputFocus}
				onBlur={onInputBlur}
				persistFocus
				showCloseIcon={true}
				extraStyles={styles}
				errorMsg={errorMessage}
				showError={showError}
				maxLength={validations?.maxCharacters}
			/>
		);
	};

	const RenderButtons = () => {
		return (
			<div className={styles["actions"]}>
				<div className={styles["save-pizza-continue-button-wrapper"]}>
					<Button
						show={savedpizzaTitle?.[activeIndex]?.length > 0}
						className={styles["save-pizza-continue-button"]}
						text={translate(
							`savePizzaModal_continue${
								activeIndex + 1 === tabs.length ? "_last" : ""
							}`,
						)}
						onClick={() => onSavePizza(currentPizza?.uuid)}
						animated
					/>
				</div>
				<Button
					isPrimary={false}
					className={styles["save-pizza-skip"]}
					text={translate("savePizzaModal_skip_button")}
					onClick={() => goNextTab()}
				/>
			</div>
		);
	};

	const customPopupHeader = () => {
		return (
			<div className={styles["save-pizzas-header"]}>
				<BuilderHeader
					tabs={tabs}
					isFirst={stackState?.length === 1}
					onTabChange={onTabChange}
					name={STACK_TYPES.SAVE_PIZZA}
					goBack={goBack}
					activeTab={activeIndex}
					onClose={() => ref.current.animateOut()}
				/>
			</div>
		);
	};

	const renderToppingsList = () => {
		const filteredToppings = Array.isArray(currentPizza?.subItems)
			? currentPizza?.subItems.filter(
					(si) => catalogProducts[si.productId].meta !== META_ENUM.PIZZA_PREP,
			  )
			: [];
		const shouldShowSwiper = isDesktop && filteredToppings.length > 4;
		if (shouldShowSwiper) {
			return (
				<ToppingListWithSwiper
					hideSeparators
					toppings={currentPizza?.subItems}
					setToppings={setToppings}
				/>
			);
		} else
			return filteredToppings?.map((item, key) => {
				return (
					<RenderTopping
						key={`topping-${key}`}
						item={item}
					/>
				);
			});
	};

	const renderSavePizza = () => {
		return (
			<div className={styles["save-pizza-wrapper"]}>
				<div className={styles["save-pizza-left-side"]}>
					<div className={styles["save-pizza-image-wrapper"]}>
						<PizzaWithToppings
							toppings={toppings}
							type={currentPizzaType}
							id={currentPizza?.productId}
						/>
					</div>
				</div>
				<div className={styles["save-pizza-right-side"]}>
					<div
						className={styles["save-pizza-title"]}
						tabIndex={0}>
						{currentProduct?.nameUseCases?.Title}
					</div>
					<div className={styles["save-pizza-comments"]}>
						<RenderNotes
							items={currentPizza?.subItems}
							className={styles["save-pizza-comments"]}
						/>
					</div>
					{showToppings ? (
						<div className={styles["save-pizza-toppings-list"]}>
							{renderToppingsList()}
						</div>
					) : null}
					{RenderInput()}
					{RenderButtons()}
				</div>
			</div>
		);
	};

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			className={styles["save-pizza-popup"]}
			header={customPopupHeader}>
			<SlideAnimation stack={STACK_TYPES.SAVE_PIZZA}>
				{renderSavePizza()}
			</SlideAnimation>
		</BlurPopup>
	);
};

export default SavePizza;

function RenderTopping(props) {
	const { item } = props;
	const product = useMenus(item.productId, ActionTypes.PRODUCT);
	const isSpecialRequest = product.meta === META_ENUM.PIZZA_PREP;
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

	function onToppingsCovarge() {
		const coverage = parseCoverage(item.quarters);
		const topping = {
			id: item.productId,
			coverage,
			quantity: item.quantity,
			assetVersion: product.assetVersion,
		};

		setTopping(topping);
	}

	if (isSpecialRequest) return null;

	return (
		<ToppingSelector
			product={product}
			coverage={topping?.coverage}
			isDraggable={false}
			image={imageUrl}
			id={product.id}
			isOnPizza
			showCloseIcon={false}
			showInfoIcon={false}
		/>
	);
}
