import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import styles from "./index.module.scss";
import Checkbox from "components/forms/checkbox";

import FullCheckbox from "/public/assets/icons/full-radio.svg";
import EmptyCheckbox from "/public/assets/icons/empty-radio.svg";
import {
	getFullMediaUrl,
	notEmptyObject,
	parseCartItem,
} from "utils/functions";
import useGetMenuData from "hooks/useGetMenuData";
import useMenus from "hooks/useMenus";

import Api from "api/requests";
import ActionTypes from "constants/menus-action-types";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "../../../../components/accessibility/keyboardsEvents";
import CartService from "services/CartService";
import PizzaBuilderService from "services/PizzaBuilderService";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import { VALIDATION_STATUS } from "constants/ValidationStatusEnum";
import clsx from "clsx";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
import TransparentCounterButton from "components/TransparentCounterButton/TransparentCounterButton";
import MaxFreeDipsMessage from "components/MaxFreeDipsMessage";
import DipsExtraPrice from "components/DipsExtraPrice";
import usePreventRageClick from "hooks/usePreventRageClick";

export default function ProductDetails(props) {
	const {
		params = {},
		Button = () => {},
		isSale = false,
		nextTab,
		isLastTab,
		stepIndex,
		goBack = () => {},
		onEndSale = () => {},
		isUpsaleBuilder,
		showButton,
		trigger,
	} = props;
	const { saleId, isEdit, subItems = [], onSelect = () => {} } = params;
	const translate = useTranslate();

	const product = useMenus(saleId, ActionTypes.PRODUCT);
	const image = getFullMediaUrl(
		product,
		MEDIA_TYPES.PRODUCT,
		MEDIA_ENUM.IN_MENU,
	);
	const [handleSubmit, isSubmitDisabled] = usePreventRageClick(onSubmit);
	const [form, setForm] = useState({});
	const [firstTry, setFirstTry] = useState(true);
	const [isFormValid, setIsFormValid] = useState(false);
	const [diffSelected, setDiffSelected] = useState(null);
	const deviceState = useSelector((store) => store.deviceState);
	const saleObj = useSelector((store) => store.cartItem);
	const step = stepIndex;
	const currentProductTemplate = useSelector(
		(store) => store.currentProductTemplate,
	);
	const [productTemplate, setProductTemplate] = useState();
	const hasComponents = isSale
		? productTemplate &&
		  productTemplate.components &&
		  notEmptyObject(productTemplate.components)
		: currentProductTemplate &&
		  currentProductTemplate.components &&
		  notEmptyObject(currentProductTemplate.components);

	const components = isSale
		? productTemplate?.components
		: currentProductTemplate.components;
	const overrides = isSale
		? productTemplate?.priceOverrides
		: currentProductTemplate.priceOverrides;

	const setInitForm = () => {
		if (hasComponents) {
			const initialForm = {};
			for (const section of components) {
				initialForm[section.menuId] = {};
				if (subItems && subItems.length > 0) {
					const subItemCountMap = {};

					subItems.forEach((subItem) => {
						subItemCountMap[subItem.productId] = subItemCountMap[subItem.productId]
							? subItemCountMap[subItem.productId] + subItem.quantity
							: subItem.quantity;
					});

					for (const productId in subItemCountMap) {
						initialForm[section.menuId][productId] = {
							isSelected: true,
							counter: subItemCountMap[productId],
						};
					}
				}
			}
			setForm(initialForm);
		}
	};

	useEffect(() => {
		setInitForm();
	}, []);

	useEffect(() => {
		if (isSale && !productTemplate) {
			const payload = { id: product.templateId };
			Api.getProductTemplate({
				payload,
				shouldOverride: false,
				onSuccess: (res) => {
					setProductTemplate(res);
				},
			});
		}
	}, [isSale, currentProductTemplate]);

	useEffect(() => {
		if (!isFormEmpty(form)) {
			const payload = { ...buildPayload() };
			payload.item["triggeredBy"] = trigger;
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
		if (!Array.isArray(components)) {
			return false;
		}
		const totalMin = components.reduce((sum, section) => {
			return sum + (section.min || 0);
		}, 0);

		return totalMin === 0;
	};

	useEffect(() => {
		showButton();
	}, []);

	function onSubmit() {
		setFirstTry(false);
		if (isFormValid && !isSubmitDisabled) {
			const productPayload = buildPayload();
			const salePayload = JSON.parse(JSON.stringify(saleObj));
			const temp = PizzaBuilderService.setSubItem(
				salePayload,
				step ?? 0,
				productPayload.item,
			);
			const payload = {
				item: isSale ? temp : productPayload.item,
				step: `add product - ${productPayload.item.productId}`,
			};
			const onSuccessCallback = isSale ? saleOnSuccess : onSuccess;

			CartService.validateAddToCart(payload, onSuccessCallback, trigger);

			function onSuccess(res) {
				typeof onEndSale === "function" && onEndSale(res);
			}

			function saleOnSuccess(res) {
				onSelect(productPayload.item);
				if (isLastTab || isEdit) {
					typeof onEndSale === "function" && onEndSale(res);
				} else {
					typeof nextTab === "function" && nextTab();
				}
			}
		}
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
				newState[id].isSelected = false; // Uncheck the item when counter is 0
			}
			return { ...prevForm, [name]: newState };
		});
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

	function buildPayload() {
		const subItems = [];

		for (const key in form) {
			const section = form[key];
			for (const itemId in section) {
				const item = section[itemId];
				for (let i = 0; i < item.counter; i++) {
					const itemPayload = {
						productId: itemId,
						quantity: 1,
					};
					subItems.push(itemPayload);
				}
			}
		}

		let itemSubItems = subItems;

		const productId = isSale ? product.id : saleId;

		const item = CartItemEntity.getObjectLiteralItem(
			productId,
			1,
			itemSubItems,
			null,
			null,
			null,
		);

		const payload = {
			item,
		};

		return payload;
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

	function showErrorBtnHandler() {
		return !isFormValid && !firstTry;
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

	const btnProps = {
		animated: true,
		callback: handleSubmit,
		text: translate("builderModal_productDetails_continue_button"),
		errorText: errorBtnText,
		isError: showErrorBtn,
		isBtnOnForm: true,
		extraStyles: styles,
		state: true,
		disabled: isSubmitDisabled,
	};

	return (
		<div className={styles["builder-product-details-wrapper"]}>
			<div className={styles["product-image-wrapper"]}>
				<img
					src={image}
					aria-hidden={true}
				/>
			</div>
			<div className={styles["right-side"]}>
				<div className={styles["content-body"]}>
					<div className={styles["title-wrapper"]}>
						<h3 className={styles["title"]}>{product?.nameUseCases?.Title}</h3>
					</div>
					{product?.description && (
						<div className={styles["description-wrapper"]}>
							<p className={styles["description"]}>{product?.description}</p>
						</div>
					)}
					{hasComponents &&
						components.map((section, index) => {
							return (
								<RenderSection
									max={section.max}
									min={section.min}
									menuId={
										Array.isArray(section.menuId) ? section.menuId[0] : section.menuId
									}
									onChange={onChange}
									isIdInList={isIdInList}
									subItems={subItems}
									isSale={isSale}
									key={"section-" + index}
									overrides={overrides}
									product={product?.nameUseCases?.Title}
									handleCounterChange={handleCounterChange}
									form={form}
									components={components}
									onDipsAmountChange={onDipsAmountChange}
								/>
							);
						})}
				</div>
				{deviceState.isDesktop && Button({ btnProps })}
			</div>
			{deviceState.notDesktop && Button({ btnProps })}
		</div>
	);
}

function RenderSection(props) {
	const {
		isSale = false,
		min,
		max,
		menuId,
		title,
		onChange = () => {},
		isIdInList,
		subItems = [],
		overrides = {},
		product = "",
		handleCounterChange,
		form,
		components,
		onDipsAmountChange,
	} = props;
	const [focusedElement, setFocusedElement] = useState(false);
	const [dipsAmount, setDipsAmount] = useState(null);
	const menu = useGetMenuData({ id: menuId, isInBuilder: true });
	const hasSubItems = Array.isArray(subItems) && subItems.length > 0;
	const selectedSubItemId = hasSubItems
		? isSale
			? subItems[0]?.productId
			: null
		: null;
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

	const onKeyDown = () => {
		if (!focusedElement) {
			return;
		}
		const name = focusedElement.target.getAttribute("name");
		const id = focusedElement.target.id;
		onChange({ name, id, min, max });
	};

	const onBlur = () => {
		setFocusedElement(false);
	};

	const onFocus = (e) => {
		setFocusedElement(e);
	};

	const getTotalItemsCounter = () => {
		if (!menu?.elements) return;
		return menu?.elements.reduce((total, option) => {
			const counter = form[menuId]?.[option.id]?.counter || 0;
			const count = total + counter;
			return count;
		}, 0);
	};

	const srText = createAccessibilityText(product, title);
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
								onChangeHandler={onChangeHandler}
								onBlur={onBlur}
								isMaxReached={isMaxReached}
								onFocus={onFocus}
								overrides={overrides}
								ariaBase={srText}
								counter={form[menuId]?.[option.id]?.counter}
								onCounterChange={(newValue) =>
									handleCounterChange(menuId, option.id, newValue)
								}
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
		onBlur,
		onFocus,
		ariaBase,
		counter,
		onCounterChange,
		overrides = {},
		totalItemsSelected,
		isMaxReached = false,
		isOnlyOneToSelect = false,
	} = props;
	const translate = useTranslate();
	const displayDecimalPoint = useSelector(
		(store) =>
			store.globalParams?.displayDecimalPoints?.result?.displayDecimalPoints,
	);

	const hasOverides =
		Array.isArray(overrides) &&
		overrides.length > 0 &&
		overrides[0]?.maxQtty &&
		notEmptyObject(overrides[0].products);

	const item = useMenus(option.id, "catalogProduct");

	let srText = item?.nameUseCases?.Title;

	if (hasOverides) {
		const overridePrice = overrides[option.id];
		const hasOverride = overridePrice > 0;
		const floatingValue = Number(overridePrice).toFixed(displayDecimalPoint);
		const overrideName = item?.nameUseCases?.Title + `\n[ ${floatingValue}+ ₪ ]`;
		srText = createAccessibilityText(
			ariaBase,
			hasOverride ? overrideName : item?.nameUseCases?.Title,
		);
	}

	const isTotalItemsSelectedBitMaxQtty =
		hasOverides && overrides[0].maxQtty <= totalItemsSelected;

	const isDisabled = !isSelected && isMaxReached && !isOnlyOneToSelect;

	return (
		<div className={styles["item-container"]}>
			<Checkbox
				className={clsx(
					styles["option-checkbox"],
					item.outOfStock ? styles["disabled"] : "",
				)}
				id={option.id}
				name={menuId}
				isOutOfStock={item.outOfStock}
				outOfStockText={translate("outOfStock")}
				label={item?.nameUseCases?.Title}
				ariaLabel={srText}
				value={isSelected}
				emptyImage={EmptyCheckbox}
				checkedImage={FullCheckbox}
				overrideVariant
				onChange={!isDisabled && onChangeHandler}
				extraStyles={styles}
				tabIndex={0}
				onBlur={onBlur}
				onFocus={onFocus}
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
						onChange={(newValue) => {
							onCounterChange(newValue);
						}}
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
