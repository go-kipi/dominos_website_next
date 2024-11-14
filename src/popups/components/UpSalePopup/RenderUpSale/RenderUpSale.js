import React from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import DontantionUpSale from "../DontantionUpSale/DontantionUpSale";
import OneUpSale from "../OneUpSale/OneUpSale";

import XIcon from "/public/assets/icons/x-icon-white.svg";
import styles from "./RenderUpSale.module.scss";
import { UP_SALE_SCREEN_TYPES } from "constants/upSaleScreenTypes";
import { useDispatch, useSelector } from "react-redux";
import useGetMenuData from "hooks/useGetMenuData";
import CartService from "services/CartService";
import { META_ENUM } from "constants/menu-meta-tags";
import Actions from "redux/actions";

import useTranslate from "hooks/useTranslate";
import { TRIGGER } from "constants/trigger-enum";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import { notEmptyObject } from "utils/functions";
import PizzaTreeService from "services/PizzaTreeService";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
import SRContent from "../../../../components/accessibility/srcontent";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import UnitedUpSale from "../UnitedUpSale/UnitedUpSale";
import ZigZagUpSale from "../ZigZagUpSale/ZigZagUpSale";

function RenderUpSale(props) {
	const {
		setStack,
		currentIndex,
		upsales,
		hasElements,
		proceed,
		animateOut,
		setCurrentMeta,
		currentMeta = "",
	} = props;
	const translate = useTranslate();
	const isDontantion = currentMeta === META_ENUM.DONATION_UP_SALE;

	function getItemByIndex() {
		const item = upsales.elements[currentIndex];
		return (
			<UpSales
				item={item}
				proceed={proceed}
				setStack={setStack}
				setCurrentMeta={setCurrentMeta}
				index={currentIndex}
			/>
		);
	}

	const srText = createAccessibilityText(
		translate("upsalepopup_subtitle"),
		isDontantion
			? translate("upsale_dontantion_title")
			: translate("upsalepopup_title"),
	);
	return (
		<div className={styles["up-sale-content"]}>
			<div className={styles["up-sale-header-wrapper"]}>
				<button
					aria-label={translate("accessibility_alt_close")}
					className={"close-icon-wrapper"}
					onClick={() => animateOut()}>
					<img
						src={XIcon.src}
						alt={""}
					/>
				</button>
			</div>
			<SRContent
				role={"alert"}
				message={srText}
				ariaLive={"polite"}
			/>
			<div className={styles["title-wrapper"]}>
				<h4
					className={styles["subtitle"]}
					aria-hidden={true}>
					{translate("upsalepopup_subtitle")}
				</h4>
				<h3
					className={styles["title"]}
					aria-hidden={true}>
					{isDontantion
						? translate("upsale_dontantion_title")
						: translate("upsalepopup_title")}
				</h3>
			</div>

			<TransitionGroup className={styles["transition-wrapper"]}>
				<CSSTransition
					key={"component-" + currentIndex}
					timeout={300}
					classNames={styles["slide"]}>
					{hasElements ? getItemByIndex() : <></>}
				</CSSTransition>
			</TransitionGroup>
		</div>
	);
}

function UpSales(props) {
	const { item, proceed, setStack, setCurrentMeta, index } = props;
	const dispatch = useDispatch();
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const menu = useGetMenuData({ id: item.id });
	const hasElements = menu && menu.elements && notEmptyObject(menu.elements);

	function dontantionUpSaleAcceptHandler(id, price = undefined) {
		const payload = {
			item: { productId: id, quantity: 1 },
		};
		if (price) {
			payload.item["price"] = Number(price);
		}
		CartService.addToCart(payload, null, null, true, TRIGGER.UPSALE);
	}

	function dontantionUpSaleAcceptHandler(id, price = undefined) {
		const payload = {
			item: { productId: id, quantity: 1 },
		};
		if (price) {
			payload.item["price"] = Number(price);
		}
		CartService.addToCart(
			payload,
			null,
			() => {
				proceed();
			},
			true,
			TRIGGER.UPSALE,
		);
	}

	function addBasketItemUpSale({ id, templateId }) {
		const saleEntity = CartItemEntity.getObjectLiteralItem(id);
		const item = saleEntity;
		if (templateId) {
			PizzaTreeService.init((res) => {
				// complex item
				setStack({
					type: UP_SALE_SCREEN_TYPES.BUILDER,
					params: {
						templateId,
						saleId: id,
						isOnUpsale: true,
						showBackOnFirst: true,
					},
				});
				dispatch(
					Actions.setCartItem({
						...item,
					}),
				);
			});
		} else {
			const payload = { item };
			CartService.addToCart(
				payload,
				null,
				() => {
					const product = catalogProducts[id];
					const listData = {
						value: product.value,
					};
					let toppings;
					if (Array.isArray(item.subitems) && item.subitems.length > 0) {
						item.subitems.forEach((subitem) => {
							const isPizzaItem = isPizzaItem(subitem);
							if (isPizzaItem && subitem.subitems.length > 0) {
								toppings = subitem.subitems
									.map((si) => catalogProducts[si.productId].name)
									.join(",");
							}
						});
					}
					const combinedProduct = Object.assign(
						{
							item_variant: toppings,
							index,
							item_category3: "Popular",
						},
						product,
					);
					AnalyticsService.addToCart(combinedProduct, listData);
					proceed();
				},
				true,
				TRIGGER.UPSALE,
			);
		}
	}

	function onDeclineHandler() {
		proceed();
	}

	function RenderUpSaleByMeta() {
		setCurrentMeta(menu?.meta);

		switch (menu?.meta) {
			case META_ENUM.ONE_UP_SALE:
				return (
					<OneUpSale
						decline={onDeclineHandler}
						menu={menu}
						hasElements={hasElements}
						accept={addBasketItemUpSale}
					/>
				);

			case META_ENUM.TWO_UP_SALE:
				return (
					<ZigZagUpSale
						item={item}
						decline={onDeclineHandler}
						menu={menu}
						hasElements={hasElements}
						accept={addBasketItemUpSale}
					/>
				);

			case META_ENUM.UNITED_UP_SALE:
				return (
					<UnitedUpSale
						item={item}
						decline={onDeclineHandler}
						menu={menu}
						hasElements={hasElements}
						accept={addBasketItemUpSale}
					/>
				);

			case META_ENUM.DONATION_UP_SALE:
				return (
					<DontantionUpSale
						item={item}
						decline={onDeclineHandler}
						menu={menu}
						hasElements={hasElements}
						accept={dontantionUpSaleAcceptHandler}
					/>
				);

			default:
				return null;
		}
	}

	return RenderUpSaleByMeta();
}

export default RenderUpSale;
