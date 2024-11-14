import useGetMenuData from "hooks/useGetMenuData";
import BlurPopup from "popups/Presets/BlurPopup";
import styles from "./index.module.scss";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import useTranslate from "hooks/useTranslate";
import { useDispatch, useSelector } from "react-redux";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import { getFullMediaUrl, notEmptyObject } from "utils/functions";
import useMenus from "hooks/useMenus";
import Dip from "components/Dip";
import Actions from "redux/actions";
import PizzaBuilderService from "services/PizzaBuilderService";
import CartService from "services/CartService";
import { TRIGGER } from "constants/trigger-enum";
import { META_ENUM } from "constants/menu-meta-tags";
import useTags from "hooks/useTags";
import XIcon from "/public/assets/icons/x-icon-white.svg";
import Button from "components/button";
import useUpdateEffect from "hooks/useUpdateEffect";
import MaxFreeDipsMessage from "components/MaxFreeDipsMessage";

function Dips(props) {
	const cartItem = useSelector((store) => store.cartItem);
	const { id, payload } = props;
	const { dipsMenuId, isSale, isEdit, stepIndex = 0, initialCartItem } = payload;

	const deviceState = useSelector((store) => store.deviceState);
	const saleObj = useSelector((store) => store.cartItem);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const currentProductTemplate = useSelector(
		(store) => store.currentProductTemplate,
	);
	const dipsMenu = useGetMenuData({
		id: dipsMenuId,
		shouldUseMenus: false,
		isInBuilder: true,
		showLoader: false,
	});

	const dipsMenuHasElements =
		dipsMenu && dipsMenu.elements && notEmptyObject(dipsMenu.elements);
	const items = dipsMenuHasElements ? dipsMenu.elements : [];

	const [isQuantityChanged, setIsQuantityChanged] = useState(false);
	const ref = useRef();
	const animateOut = (callback) => ref.current.animateOut(callback);
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
	const initialQuantity = useRef(dipsAmountInCart);
	const maxDipsForSale = currentProductTemplate?.priceOverrides?.[0]?.maxQtty;

	const isNextDipsInCharge = useMemo(() => {
		return (
			typeof maxDipsForSale === "undefined" || dipsAmountInCart >= maxDipsForSale
		);
	}, [dipsAmountInCart, maxDipsForSale]);

	const dispatch = useDispatch();

	useUpdateEffect(() => {
		setIsQuantityChanged(initialQuantity.current !== dipsAmountInCart);
	}, [dipsAmountInCart]);

	const translate = useTranslate();

	const RenderItem = (item, index) => {
		return (
			<div
				className={styles["item"]}
				key={"dip-" + index}>
				<RenderDip
					item={item}
					index={index}
					isEdit={isEdit}
					isSale={isSale}
					stepIndex={stepIndex}
					isNextDipsInCharge={isNextDipsInCharge}
				/>
			</div>
		);
	};

	const renderDips = () => {
		return (
			<div className={styles["dips-container"]}>
				<div className={styles["header"]}>
					<h3 className={styles["main-title"]}>{translate("dip_main_header")}</h3>

					<MaxFreeDipsMessage
						components={currentProductTemplate.components}
						overrides={currentProductTemplate.priceOverrides}
						styles={styles}
					/>
				</div>

				<div className={styles["list-container"]}>
					{items.map((item, index) => RenderItem(item, index))}
				</div>
			</div>
		);
	};

	const handleCloseModal = (event, shouldReset = false) => {
		shouldReset && dispatch(Actions.setCartItem(initialCartItem));
		animateOut();
	};

	const renderCloseButton = () => {
		return (
			<button
				aria-label={translate("accessibility_aria_close")}
				className={styles["close-icon-wrapper"]}
				onClick={() => handleCloseModal(null, true)}>
				<img
					src={XIcon.src}
					alt={""}
				/>
			</button>
		);
	};

	const renderActionButton = () => {
		return (
			<div className={styles["confirm-btn-container"]}>
				<Button
					text={translate("dip_action_btn")}
					onClick={handleCloseModal}
					className={styles["confrim-btn"]}
					disabledClickNeeded={false}
				/>
			</div>
		);
	};

	const formattedLeftoverDips = () => {
		const title = translate("dips_leftover");
		const leftoverDips = maxDipsForSale - dipsAmountInCart;
		return leftoverDips > 0 ? title.replace("{number}", leftoverDips) : "";
	};

	const renderDipsLeftTitle = () => {
		return (
			<div className={styles["dips-leftover-title"]}>
				<p>{formattedLeftoverDips()}</p>
			</div>
		);
	};

	return (
		<BlurPopup
			id={id}
			ref={ref}
			withBackground={!deviceState.isDesktop}>
			{renderCloseButton()}
			{renderDips()}
			{renderDipsLeftTitle()}
			{(isQuantityChanged || dipsAmountInCart) && renderActionButton()}
		</BlurPopup>
	);
}

export default Dips;

function RenderDip(props) {
	const { item, isSale, stepIndex, isNextDipsInCharge } = props;
	const dispatch = useDispatch();
	const product = useMenus(item.id, item.actionType);
	const imgUrl = getFullMediaUrl(item, MEDIA_TYPES.PRODUCT, MEDIA_ENUM.IN_MENU);

	const cartItem = useSelector((store) => store.cartItem);
	const pizzaObj = isSale ? cartItem?.subitems?.[stepIndex] : cartItem;
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);

	const [isCounterDisabled, setIsCounterDisabled] = useState(false);

	const { label } = useTags(product.tags);

	const quantity = getProductQuantity();

	function getProductQuantity() {
		const itemQuantity = pizzaObj?.subitems?.filter((topping) => {
			const checkedProduct = catalogProducts[topping.productId];
			return (
				checkedProduct?.meta === META_ENUM.PIZZA_DIP &&
				checkedProduct.id === product.id
			);
		});
		return itemQuantity?.length || 0;
	}

	const onSuccessChange = (res) => {
		const { item: validateCartItem } = res;
		dispatch(Actions.setCartItem(validateCartItem));
		setTimeout(() => {
			setIsCounterDisabled(false);
		}, 100);
	};

	function onIncrement() {
		setIsCounterDisabled(true);

		const updatedCartItem = PizzaBuilderService.addDip(
			cartItem,
			stepIndex,
			product,
			isSale,
		);

		CartService.validateAddToCart(
			{ item: updatedCartItem },
			onSuccessChange,
			TRIGGER.MENU,
		);
	}

	function onDecrement() {
		setIsCounterDisabled(true);

		const updatedCartItem = PizzaBuilderService.removeDip(
			cartItem,
			stepIndex,
			product.id,
			isSale,
		);

		CartService.validateAddToCart(
			{ item: updatedCartItem },
			onSuccessChange,
			TRIGGER.MENU,
		);
	}

	if (!product) return;

	return (
		<Dip
			product={product}
			image={imgUrl}
			alt={product.name}
			isOutOfStock={product.outOfStock}
			price={product.price}
			priceBeforeDiscount={product.priceBeforeDiscount}
			showPriceBeforeDiscount={product.showPriceBeforeDiscount}
			title={product?.nameUseCases?.Title ?? product?.name}
			id={item.id}
			onIncrement={onIncrement}
			onDecrement={onDecrement}
			quantity={quantity}
			isCounterDisabled={isCounterDisabled}
			label={label}
			description={product?.nameUseCases?.SubTitle}
			isNextDipsInCharge={isNextDipsInCharge}
		/>
	);
}
