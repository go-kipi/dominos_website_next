import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

import Api from "api/requests";
import SRContent from "components/accessibility/srcontent";
import clsx from "clsx";

import styles from "./index.module.scss";

import { UPSALES_TYPES } from "constants/upsales-types";
import { TAB_INDEX_HIDDEN } from "constants/accessibility-types";
import { Pizza } from "../builder/Pizza";

import BlurPopup from "popups/Presets/BlurPopup";
import Button from "components/button";
import PizzaUpgradeOption from "components/PizzaUpgradeOption";
import Checkbox from "components/forms/checkbox";

import useTranslate from "hooks/useTranslate";

import FullCheckbox from "/public/assets/icons/full-radio.svg";
import EmptyCheckbox from "/public/assets/icons/empty-radio.svg";
import CartService from "services/CartService";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import PizzaBuilderService from "services/PizzaBuilderService";
import { TRIGGER } from "constants/trigger-enum";
import CartItem from "entitiesCartItem/CartItem";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import { getPizzaImageByMeta } from "utils/functions";
import { VALIDATION_STATUS } from "constants/ValidationStatusEnum";
import { API_ERROR } from "constants/popup-types";
import { GENERAL_MESSAGE } from "popups/popup-types";

const ADD = "ADD";
const REMOVE = "REMOVE";

function MixedUpgradesPopup(props) {
	const { payload = {} } = props;
	const {
		primaryBtnOnPress = () => {},
		secondaryBtnOnPress = () => {},
		upgrades = [],
		isSale,
		stepIndex,
		isSquare,
	} = payload;

	const coverages = useSelector(
		(store) => store?.builder?.toppings?.[stepIndex],
	);
	const saleObj = useSelector((store) => store.cartItem);
	const builder = useSelector((store) => store.builder);
	const ref = useRef();
	const dispatch = useDispatch();
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const userData = useSelector((store) => store.userData);
	const [firstTry, setFirstTry] = useState(true);
	const [isActionsDisabled, setisActionsDisabled] = useState(false);
	const [isValid, setIsValid] = useState(true);
	const [selectedOptions, setSelectedOptions] = useState([]);
	const [shouldShow, setShouldShow] = useState(false);
	const initialCartItem = useRef();
	const initialBuilderState = useRef();

	const pizzaId = useSelector((store) => store.builder.pizzaId[stepIndex]);

	const fadeInClassName = shouldShow ? styles["show"] : styles["hide"];
	const fadeOutClassName = shouldShow ? styles["hide"] : styles["show"];

	useEffect(() => {
		initialBuilderState.current = builder;
		initialCartItem.current = saleObj;
		const productIds = upgrades?.map((u) => u.upgradeToProductId);
		const payload = { productIds: productIds };
		Api.getProducts({
			payload,
		});
	}, []);

	useEffect(() => {
		if (upgrades.length === 1) {
			setTimeout(() => {
				handleOnOptionSelect(null, 0);
			}, 200);
		}
	}, []);

	const isBtnError = () => !firstTry && !isValid;

	const handleSkipPress = () => {
		setisActionsDisabled(true);
		dispatch(Actions.updateBuilder(initialBuilderState.current));
		if (!isActionsDisabled) {
			ref.current?.animateOut(() => secondaryBtnOnPress(initialCartItem.current));
		}
	};

	const handleDontAskAgain = (_, checked) => {
		dispatch(Actions.setDontShowUpgradePizzaModal(checked));
	};

	const handleToppingAdd = (topping, cartItem) => {
		const { coverage } = topping;
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

		const item = PizzaBuilderService.addTopping(
			cartItem,
			stepIndex,
			topping,
			isSale,
		);
		return { item, step: `add topping - ${topping.id}` };
	};

	const handleToppingRemove = (topping, cartItem) => {
		const item = PizzaBuilderService.removeTopping(
			cartItem,
			stepIndex,
			topping.id,
			isSale,
		);
		dispatch(
			Actions.removeTopping({
				step: stepIndex ?? 0,
				id: topping.id,
			}),
		);
		return { item, step: `remove topping - ${topping.id}` };
	};

	const handleSwitchPizzaId = (newPizzaId, cartItem) => {
		const { productId, promoProductId } = newPizzaId;
		const item = PizzaBuilderService.switchPizzaId(
			cartItem,
			stepIndex,
			productId,
			promoProductId,
			isSale,
		);

		return { item, step: `change dough - ${productId}` };
	};

	const showErrorModal = () => {
		dispatch(
			Actions.addPopup({
				type: GENERAL_MESSAGE,
				payload: {
					text: translate("ErrorSubItemCannotBeAddedToParentItem"),
					btnText: translate("mixed_upgrade_error_modal_btn"),
				},
			}),
		);
	};

	const handleUpgradeByType = (upgrade, type, actionType = "", cartItem) => {
		const formattedCartItem = cartItem.hasOwnProperty("item")
			? cartItem.item
			: cartItem;

		switch (true) {
			case type === UPSALES_TYPES.ADD_SUB_ITEM && actionType === ADD:
				return handleToppingAdd(upgrade, formattedCartItem);
			case type === UPSALES_TYPES.ADD_SUB_ITEM && actionType === REMOVE:
				return handleToppingRemove(upgrade, formattedCartItem);
			case type === UPSALES_TYPES.CHANGE_ITEM:
				return handleSwitchPizzaId(upgrade, formattedCartItem);
		}
	};

	const handleOnOptionSelect = (e, autoSelect = null) => {
		const value = e ? Number(e.target.id) : autoSelect;

		const selectedUpgrade = upgrades[value];
		const upgradeType = selectedUpgrade.type;
		const isChangeParent = upgradeType === UPSALES_TYPES.CHANGE_ITEM;
		const isAddSubItem = upgradeType === UPSALES_TYPES.ADD_SUB_ITEM;

		if (typeof value === "number") {
			setIsValid(true);
			const newSelectedOptions = [...selectedOptions];

			let payload;

			if (selectedOptions.includes(value)) {
				// UI:
				const filtered = newSelectedOptions.filter((option) => option !== value);
				setSelectedOptions(filtered);

				// Cart item updating:
				if (isChangeParent) {
					payload = {
						productId: selectedUpgrade.triggerProductId,
						promoProductId: selectedUpgrade.upgradeToProductId,
					};
				}

				if (isAddSubItem) {
					payload = {
						id: selectedUpgrade.upgradeToProductId,
					};
				}

				const cartItem = handleUpgradeByType(payload, upgradeType, REMOVE, saleObj);

				dispatch(Actions.setCartItem(cartItem.item));
			} else {
				let payload;

				if (isChangeParent) {
					payload = {
						productId: selectedUpgrade.upgradeToProductId,
						promoProductId: selectedUpgrade.triggerProductId,
					};
				}

				if (isAddSubItem) {
					const triggerProductId = isSale
						? saleObj?.subitems?.[stepIndex].productId
						: saleObj.productId;

					payload = {
						id: selectedUpgrade.upgradeToProductId,
						coverage: { q1: 1, q2: 1, q3: 1, q4: 1 },
						isMix: false,
						promoProductId: triggerProductId,
					};
				}

				const cartItem = handleUpgradeByType(payload, upgradeType, ADD, saleObj);

				const onSuccess = (res) => {
					if (res.overallstatus === VALIDATION_STATUS.ITEM_ADD_ERROR) {
						showErrorModal();
					} else {
						newSelectedOptions.push(value);
						setSelectedOptions(newSelectedOptions);
						const validatedItem = res.item;
						dispatch(Actions.setCartItem(validatedItem));
					}
				};

				CartService.validateAddToCart(cartItem, onSuccess, TRIGGER.MENU);
			}
		}
	};

	const handleContinuePress = () => {
		setFirstTry(false);
		const isValid = selectedOptions.length > 0;
		if (isValid && !isActionsDisabled) {
			setisActionsDisabled(true);
			setShouldShow(true);
			const ti = setTimeout(() => {
				ref.current?.animateOut(() => primaryBtnOnPress(saleObj));
				clearTimeout(ti);
			}, 1500);
		} else {
			setIsValid(false);
		}
	};

	const renderUpgradeList = () => {
		const isSingleUpgrade = upgrades.length === 1;
		return (
			<div
				className={clsx(
					styles["upgrade-list"],
					fadeOutClassName,
					isSingleUpgrade ? styles["single-upgrade-list"] : "",
				)}>
				{upgrades?.map((upgrade, idx) => {
					const isSelected = selectedOptions.includes(idx);
					return (
						<PizzaUpgradeOption
							isSelected={isSelected}
							index={idx}
							onChangeHandler={handleOnOptionSelect}
							option={upgrade}
							key={idx}
						/>
					);
				})}
			</div>
		);
	};

	const renderButtons = () => {
		const showErrorBtn = isBtnError();
		return (
			<div className={clsx(styles["buttons-wrapper"], fadeOutClassName)}>
				<Button
					className={styles["continue_button"]}
					textClassName={styles["continue_button_text"]}
					text={translate("mixedUpgrades_popup_accept_label")}
					isError={showErrorBtn}
					errorText={translate("mixedUpgrades_popup_error_label")}
					onClick={handleContinuePress}
					costumeError={showErrorBtn}
					disabled={isActionsDisabled}
				/>
				<button
					disabled={isActionsDisabled}
					className={styles["another-time"]}
					onClick={handleSkipPress}>
					{translate("mixedUpgrades_popup_decline_label")}
				</button>
				<Checkbox
					className={clsx(styles["dont-ask-checkbox"])}
					id={"dont-ask"}
					name={"dont-ask"}
					label={translate("mixedUpgrades_popup_checkbox_label")}
					value={userData?.showUpgradePizza}
					emptyImage={EmptyCheckbox}
					checkedImage={FullCheckbox}
					overrideVariant
					smart
					onChange={handleDontAskAgain}
					extraStyles={styles}
					tabIndex={0}
				/>
			</div>
		);
	};

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			showCloseIcon
			onClose={handleSkipPress}
			className={styles["mixed-upgrades-popup"]}>
			{!shouldShow ? (
				<SRContent
					role={"alert"}
					message={`${translate("mixedUpgrades_popup_title")} ${translate(
						"mixedUpgrades_popup_subtitle",
					)}`}
					ariaLive={"polite"}
				/>
			) : (
				<SRContent
					role={"alert"}
					message={`${translate("upgradePizzaModal_upgrade_title_1")} ${translate(
						"upgradePizzaModal_upgrade_title_2",
					)}`}
					ariaLive={"polite"}
				/>
			)}
			<div className={styles["upgrade-right-side"]}>
				<div
					className={clsx(styles["header-title"], fadeOutClassName)}
					tabIndex={TAB_INDEX_HIDDEN}>
					{translate("mixedUpgrades_popup_title")}
				</div>
				<div
					className={clsx(styles["header-subtitle"], fadeOutClassName)}
					tabIndex={TAB_INDEX_HIDDEN}>
					{translate("mixedUpgrades_popup_subtitle")}
				</div>
				<div className={clsx(styles["mama-mia-wrapper"], fadeInClassName)}>
					<span className={styles["mama-mia-text"]}>
						{shouldShow ? translate("upgradePizzaModal_upgrade_title_1") : ""}
					</span>
					<span className={clsx(styles["mama-mia-text"], styles["bold"])}>
						{shouldShow ? translate("upgradePizzaModal_upgrade_title_2") : ""}
					</span>
				</div>
				{!(deviceState.isMobile || deviceState.isTablet) && renderUpgradeList()}
				{!(deviceState.isMobile || deviceState.isTablet) && renderButtons()}
			</div>
			<div className={styles["upgrade-left-side"]}>
				<Pizza
					styles={styles}
					pizzaId={pizzaId}
					coverages={coverages}
					isAnimatedCoverage={true}
				/>
				{(deviceState.isMobile || deviceState.isTablet) && renderUpgradeList()}
				{(deviceState.isMobile || deviceState.isTablet) && renderButtons()}
			</div>
		</BlurPopup>
	);
}

export default MixedUpgradesPopup;
