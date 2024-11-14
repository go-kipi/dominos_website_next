import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import styles from "./Product.module.scss";
import TransparentCounterButton from "components/TransparentCounterButton/TransparentCounterButton";
import Price from "components/Price";
import Checkbox from "components/forms/checkbox";

import FullCheckbox from "/public/assets/icons/full-radio.svg";
import EmptyCheckbox from "/public/assets/icons/empty-radio.svg";
import Button from "components/button";

import useGetMenuData from "hooks/useGetMenuData";
import useMenus from "hooks/useMenus";
import { TRIGGER } from "constants/trigger-enum";
import Api from "api/requests";
import BlurPopup from "../../Presets/BlurPopup";
import clsx from "clsx";
import Actions from "redux/actions";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "../../../components/accessibility/keyboardsEvents";
import ActionTypes from "constants/menus-action-types";
import { notEmptyObject } from "utils/functions";
import EmarsysService from "utils/analyticsService/EmarsysService";
import MaxFreeDipsMessage from "components/MaxFreeDipsMessage/index";
import DipsExtraPrice from "components/DipsExtraPrice";

export default function ProductPopup(props) {
	const ref = useRef();
	const { payload } = props;
	const {
		title,
		price,
		oldPrice,
		showPriceBeforeDiscount,
		image,
		id,
		templateId,
		isFromBuilder = false,
		onSelect = () => {},
		onAddCallback = () => {},
		max,
		setDisableClick,
	} = payload;

	const dispatch = useDispatch();
	const [form, setForm] = useState([]);
	const [isFormValid, setIsFormValid] = useState(false);
	const [firstTry, setFirstTry] = useState(true);
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const [quantity, setQuantity] = useState(1);
	const [showTopGradient, setShowTopGradient] = useState(false);
	const [diffSelected, setDiffSelected] = useState(null);
	const currentProductTemplate = useSelector(
		(store) => store.currentProductTemplate,
	);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const itemCatalog = catalogProducts[id];
	const itemDescription = itemCatalog?.nameUseCases?.SubTitle || "";
	const hasComponents =
		currentProductTemplate &&
		currentProductTemplate.components &&
		notEmptyObject(currentProductTemplate.components);
	const hasOverrides =
		currentProductTemplate &&
		currentProductTemplate.priceOverrides &&
		notEmptyObject(currentProductTemplate.priceOverrides);

	useEffect(() => {
		return () => {
			setDisableClick(false);
			dispatch(Actions.resetCurrentProductTemplate());
		};
	}, []);

	useEffect(() => {
		if (templateId) {
			const payload = { id: templateId };

			Api.getProductTemplate({ payload, config: { showLoader: false } });
		}
	}, [templateId]);

	useEffect(() => {
		if (!isFormEmpty(form)) {
			const payload = buildPayload(form, 1);
			Api.validateAddBasketItem({ payload, onSuccess });
			function onSuccess(data) {
				if (!data.overallstatus) {
					setIsFormValid(true);
				} else {
					setFirstTry(true);
					setIsFormValid(false);
				}
			}
		} else {
			if (isFormCanBeEmpty()) {
				setIsFormValid(true);
			} else {
				setIsFormValid(false);
			}
		}
	}, [form]);

	const isFormCanBeEmpty = () => {
		if (!Array.isArray(currentProductTemplate.components)) {
			return false;
		}

		const totalMin = currentProductTemplate.components.reduce((sum, section) => {
			return sum + (section.min || 0);
		}, 0);

		return totalMin === 0;
	};

	useEffect(() => {
		function getInitialState() {
			const form = {};
			for (const section of currentProductTemplate.components) {
				form[section.menuId] = {};
			}
			return form;
		}

		if (hasComponents) {
			setForm(getInitialState());
		}
	}, [hasComponents, currentProductTemplate]);

	function onQuantityChange(newQuantity) {
		setQuantity(newQuantity);
	}

	function isIdInList(name, id) {
		return form[name]?.[id]?.isSelected || false;
	}

	function onChange({ name, id, min, max }) {
		const newState = { ...form[name] };
		const checkedCount = Object.values(newState).filter(
			(item) => item.isSelected,
		).length;

		const isIdInListFlag = isIdInList(name, id);
		if (isIdInListFlag) {
			newState[id].isSelected = false;
			setForm((prevForm) => ({ ...prevForm, [name]: newState }));
			// Wait for the fade-out effect to complete before setting counter to 0
			setTimeout(() => {
				newState[id].counter = 0;
				setForm((prevForm) => ({ ...prevForm, [name]: newState }));
			}, 300);
		} else if (!isIdInListFlag && checkedCount < max) {
			newState[id] = { isSelected: true, counter: 1 };
			setForm((prevForm) => ({ ...prevForm, [name]: newState }));
		} else if (!isIdInListFlag && max === 1) {
			// Uncheck all other items if max is 1 and then check the new item
			Object.keys(newState).forEach((key) => {
				newState[key] = { isSelected: false };
			});
			newState[id] = { isSelected: true, counter: 1 };
			setForm((prevForm) => ({ ...prevForm, [name]: newState }));
		} else if (isIdInListFlag && checkedCount === min) {
			// If checkedCount equals min, prevent unchecking
			newState[id].counter = newState[id].counter;
			setForm((prevForm) => ({ ...prevForm, [name]: newState }));
		}
	}

	function handleCounterChange(name, id, newValue) {
		setForm((prevForm) => {
			const newState = {
				...prevForm[name],
				[id]: { ...prevForm[name][id], counter: newValue },
			};
			if (newValue === 0) {
				newState[id].isSelected = false;
			}
			return { ...prevForm, [name]: newState };
		});
	}

	function onScrollList(e) {
		const window = e.target;

		if (window.scrollTop === 0) {
			setShowTopGradient(false);
		} else {
			setShowTopGradient(true);
		}
	}

	function isFormEmpty(form) {
		if (notEmptyObject(form)) {
			for (const key in form) {
				const section = form[key];
				if (Object.values(section).some((item) => item.isSelected)) {
					return false;
				}
				return true;
			}
		}
		return true;
	}

	function buildPayload(data, productQuantity) {
		const payload = {
			item: {
				productId: id,
				quantity: productQuantity,
				subItems: [],
				triggeredBy: TRIGGER.MENU,
			},
		};

		for (const key in data) {
			const section = data[key];
			for (const itemId in section) {
				const item = section[itemId];
				if (item.isSelected) {
					for (let i = 0; i < item.counter; i++) {
						const itemPayload = {
							productId: itemId,
							quantity: 1,
						};
						payload.item.subItems.push(itemPayload);
					}
				}
			}
		}

		return payload;
	}

	function addToBasket() {
		setFirstTry(false);
		if (isFormValid) {
			const payload = buildPayload(form, quantity);
			EmarsysService.setViewSideDishComplex(payload.item);
			if (isFromBuilder) {
				ref.current?.animateOut(
					typeof onSelect === "function" && onSelect(payload),
				);
			} else {
				ref.current?.animateOut(() => {
					typeof onAddCallback === "function" && onAddCallback(payload);
				});
			}
		}
	}

	function showErrorBtnHandler() {
		return !firstTry && !isFormValid;
	}

	const onDipsAmountChange = (totalItemsSelected, menuId, components) => {
		const matchingComponent = components.find((component) =>
			component.menuId.includes(menuId),
		);
		const diff = calculateDifference(totalItemsSelected, matchingComponent.min);
		setDiffSelected(diff);
	};

	function calculateDifference(totalItemsSelected, minAmount) {
		const diff = minAmount - totalItemsSelected;
		return diff;
	}

	const showErrorBtn = showErrorBtnHandler();

	const getLeftToChooseDips = () => {
		if (diffSelected <= 0) {
			return translate("productPopup_acceptBtn_error_label");
		} else if (diffSelected === 1) {
			return translate("btnErrorWithOneDips");
		} else {
			return translate("btnErrorWithCounter").replace(
				"{counter}",
				`${diffSelected}`,
			);
		}
	};
	const errorBtnText = getLeftToChooseDips();
	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			showCloseIcon
			className={styles["product-popup"]}>
			{showTopGradient && <div className={styles["linear-gradient-top"]} />}
			<div
				className={styles["scroll-view"]}
				onScroll={onScrollList}>
				<div className={styles["product-image-wrapper"]}>
					<img
						src={image}
						alt={""}
					/>
				</div>
				<div className={styles["right-side"]}>
					<div className={styles["content-body"]}>
						<div className={styles["title-wrapper"]}>
							<h3 className={styles["title"]}>{title}</h3>
							{deviceState.notDesktop && (
								<TransparentCounterButton
									ariaTitle={title}
									className={styles["counter"]}
									value={quantity}
									onChange={onQuantityChange}
									extraStyles={styles}
									min={1}
									max={max}
								/>
							)}
						</div>
						<div className={styles["prices-wrapper"]}>
							<div className={styles["prices"]}>
								{price && (
									<Price
										value={price}
										className={styles["product-price"]}
										currency="shekel"
										extraStyles={styles}
									/>
								)}
								{showPriceBeforeDiscount && (
									<div className={styles["old-price-wrapper"]}>
										<Price
											value={oldPrice}
											className={clsx(
												styles["product-price"],
												styles["product-price-old"],
											)}
											currency="shekel"
											extraStyles={styles}
											mark={true}
										/>
									</div>
								)}
							</div>
							{deviceState.isDesktop && price && (
								<TransparentCounterButton
									ariaTitle={title}
									className={styles["counter"]}
									value={quantity}
									onChange={onQuantityChange}
									extraStyles={styles}
									min={1}
									max={max}
								/>
							)}
						</div>

						{deviceState.isDesktop && itemDescription && (
							<div className={styles["description-wrapper"]}>
								<p className={styles["description"]}>{itemDescription}</p>
							</div>
						)}

						{hasComponents &&
							currentProductTemplate.components.map((section, index) => {
								return (
									<RenderSection
										max={section.max}
										min={section.min}
										menuId={
											Array.isArray(section.menuId) ? section.menuId[0] : section.menuId
										}
										onChange={onChange}
										isIdInList={isIdInList}
										key={"section-" + index}
										hasOverrides={hasOverrides}
										overrides={currentProductTemplate?.priceOverrides}
										components={currentProductTemplate?.components}
										handleCounterChange={handleCounterChange}
										form={form}
										onDipsAmountChange={onDipsAmountChange}
									/>
								);
							})}
					</div>
					{deviceState.isDesktop && (
						<div className={styles["actions"]}>
							<Button
								text={translate("productPopup_acceptBtn")}
								className={styles["accept-btn"]}
								onClick={() => addToBasket()}
								isBtnOnForm={true}
								isError={showErrorBtn}
								errorText={errorBtnText}
								extraStyles={styles}
							/>
						</div>
					)}
				</div>
			</div>
			{deviceState.notDesktop && (
				<div className={styles["actions"]}>
					<Button
						text={translate("productPopup_acceptBtn")}
						className={styles["accept-btn"]}
						onClick={() => addToBasket()}
						isBtnOnForm={true}
						isError={showErrorBtn}
						key="khfdkfdkhfkdjf-fksjhfkdshfkdhf"
						errorText={errorBtnText}
						extraStyles={styles}
					/>
				</div>
			)}
		</BlurPopup>
	);
}

function RenderSection(props) {
	const {
		min,
		max,
		menuId,
		onChange = () => {},
		isIdInList,
		hasOverrides = false,
		overrides = {},
		handleCounterChange,
		form,
		components,
		onDipsAmountChange,
	} = props;
	const menu = useGetMenuData({ id: menuId, showLoader: false });
	const [focusElement, setFocusElement] = useState(false);
	const [dipsAmount, setDipsAmount] = useState(null);
	const hasElements = menu && menu.elements && notEmptyObject(menu.elements);
	const sectionData = components.filter((cmp) => cmp?.menuId?.[0] === menuId)[0];
	const sectionMax = sectionData?.max ?? 1;
	const sectionMin = sectionData?.min ?? 1;
	const isOnlyOneToSelect = sectionMax === 1 && sectionMin === 1;
	useEffect(() => {
		const totalItemsSelected = getTotalItemsCounter();
		setDipsAmount(totalItemsSelected);
		setTimeout(() => {
			onDipsAmountChange(dipsAmount, menuId, components);
		}, 100);
	}, [form, dipsAmount]);

	function onChangeHandler(e) {
		const name = e.target.name;
		const id = e.target.id;

		onChange({ name, id, min, max });
	}
	const onKeyDown = (event) => {
		if (!focusElement) {
			return;
		}
		const name = focusElement.target.getAttribute("name");
		const id = focusElement.target.id;
		onChange({ name, id, min, max });
	};

	const onBlur = () => {
		setFocusElement(null);
	};

	const onFocus = (event) => {
		setFocusElement(event);
	};

	const getTotalItemsCounter = () => {
		if (!menu?.elements) return;
		return menu?.elements.reduce((total, option) => {
			const counter = form[menuId]?.[option.id]?.counter || 0;
			const count = total + counter;
			return count;
		}, 0);
	};

	return (
		<div
			className={styles["choose-wrapper"]}
			key={"options-" + menuId}>
			<MaxFreeDipsMessage
				overrides={overrides}
				components={components}
			/>
			<div
				className={styles["checkboxs"]}
				onKeyDown={(event) => handleKeyPress(event, onKeyDown)}>
				{hasElements &&
					menu?.elements.map((option) => {
						const isSelected = isIdInList(menuId, option.id);
						const totalItemsSelected = getTotalItemsCounter();
						const isMaxReached = sectionMax <= totalItemsSelected;
						return (
							<RenderItem
								key={`${menuId}-${option.id}`}
								option={option}
								isSelected={isSelected}
								menuId={menuId}
								counter={form[menuId]?.[option.id]?.counter}
								onCounterChange={(newValue) => {
									handleCounterChange(menuId, option.id, newValue);
								}}
								isMaxReached={isMaxReached}
								onChangeHandler={onChangeHandler}
								onFocus={onFocus}
								onBlur={onBlur}
								overrides={overrides}
								hasOverrides={hasOverrides}
								totalItemsSelected={totalItemsSelected}
								isOnlyOneToSelect={isOnlyOneToSelect}
							/>
						);
					})}
			</div>
		</div>
	);
}

function RenderItem(props) {
	const {
		option,
		isSelected,
		menuId,
		onChangeHandler,
		onFocus,
		onBlur,
		counter,
		onCounterChange,
		overrides = {},
		totalItemsSelected = 0,
		isMaxReached = false,
		isOnlyOneToSelect = false,
	} = props;

	const translate = useTranslate();
	const item = useMenus(option.id, ActionTypes.PRODUCT);

	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);
	const hasOverides =
		Array.isArray(overrides) &&
		overrides.length > 0 &&
		overrides[0]?.maxQtty &&
		notEmptyObject(overrides[0].products);

	const overridePrice =
		overrides?.[option?.id] > 0 ? overrides[option.id] : null;
	const hasOverride = !!overridePrice;

	const floatingValue = hasOverride
		? Number(overridePrice).toFixed(displayDecimalPoint)
		: "";
	const overrideName = hasOverride
		? `${item?.nameUseCases?.Title}\n[ ${floatingValue}+ ₪ ]`
		: item?.nameUseCases?.Title;

	const isTotalItemsSelectedBitMaxQtty =
		hasOverides && overrides?.[0]?.maxQtty
			? overrides[0].maxQtty <= totalItemsSelected
			: false;

	const isDisabled = !isSelected && isMaxReached && !isOnlyOneToSelect;

	return (
		<div className={styles["item-container"]}>
			<Checkbox
				className={clsx(styles["option-checkbox"], {
					[styles["disabled"]]: item.outOfStock,
				})}
				id={option.id}
				name={menuId}
				label={overrideName}
				value={isSelected}
				emptyImage={EmptyCheckbox}
				checkedImage={FullCheckbox}
				overrideVariant
				extraStyles={styles}
				tabIndex={0}
				onChange={onChangeHandler}
				onFocus={onFocus}
				onBlur={onBlur}
				isOutOfStock={item.outOfStock}
				outOfStockText={translate("outOfStock")}
				isDisabled={isDisabled}
			/>
			{!isOnlyOneToSelect && (
				<div className={styles["btnsWrapper"]}>
					{!isMaxReached && (
						<DipsExtraPrice
							option={option}
							overrides={overrides}
							isTotalItemsSelectedBitMaxQtty={isTotalItemsSelectedBitMaxQtty}
							hasOverides={hasOverides}
						/>
					)}

					<TransparentCounterButton
						value={counter}
						min={item?.quantity?.minPerSale}
						max={item?.quantity?.maxPerSale}
						onChange={onCounterChange}
						disabledPlus={isMaxReached}
						className={clsx(styles["counter"], {
							[styles["show-counter"]]: isSelected && counter > 0,
						})}
						extraStyles={styles}
					/>
				</div>
			)}
		</div>
	);
}
