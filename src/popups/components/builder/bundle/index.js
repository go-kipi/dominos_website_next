import React, { useEffect, useRef, useState } from "react";

import { getFullMediaUrl } from "utils/functions";
import CartService from "services/CartService";

import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

import styles from "./index.module.scss";

import HeaderFilterItem from "containers/Menu/components/HeaderFilterItem/HeaderFilterItem";
import BeverageSelect from "components/BeverageSelect";
import SideDishSelect from "components/SideDishSelect";
// eslint-disable-next-line
import builderStepsEnum from "../../../../constants/builderStepsEnum";
import useMenus from "../../../../hooks/useMenus";
import { MEDIA_ENUM } from "../../../../constants/media-enum";
import { MEDIA_TYPES } from "../../../../constants/media-types";
import { STEPS } from "../../../../constants/validation-steps-enum";
import useTranslate from "hooks/useTranslate";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import PizzaBuilderService from "services/PizzaBuilderService";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { META_ENUM } from "../../../../constants/menu-meta-tags";
import { menuPath } from "../../../../redux/slices/state";
import useGetMenuByMeta from "../../../../hooks/useGetMenuByMeta";
import builderTypes from "constants/builder-types";
import STACK_TYPES from "../../../../constants/stack-types";
import { ITEM_CATEGORY2, ITEM_CATEGORY3 } from "constants/AnalyticsTypes";
import EmarsysService from "utils/analyticsService/EmarsysService";
import useUpdateEffect from "hooks/useUpdateEffect";

const BundleBuilder = (props) => {
	const dispatch = useDispatch();
	const {
		params = {},
		Button = () => {},
		showButton = () => {},
		priceOverrides = {},
		isLastTab = false,
		setStack = () => {},
		onEndSale = () => {},
		stepIndex = 0,
		isEdit,
		fatherEntity,
		nextTabText,
		builderMeta,
		trigger = "",
		isUpsaleBuilder,
	} = props;
	const translate = useTranslate();

	const { name, title, tags, data = [], meta = "" } = params;
	const saleObj = useSelector((store) => store.cartItem);
	// const builderStackState = useSelector((store) => store.stackState.builder);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const stackState = useSelector(
		(store) => store.stackState[STACK_TYPES.BUILDER][stepIndex],
	);
	const bundle = saleObj.subitems?.[stepIndex];
	const [selectedTag, setSelectedTag] = useState("ALL");
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const topNavId = menuPath[META_ENUM.TOP_NAV];
	const listName = topNav?.elements?.find((el) => el.id === topNavId)?.label;
	const isSingleItem = Array.isArray(data) && data.length === 1;
	const btnProps = {
		text: isLastTab
			? translate("addToCart")
			: translate("builderModal_bundleBuilder_continue") + nextTabText,
		state: bundle !== undefined,
		extraStyles: styles,
		disabled: isSingleItem,
		callback:
			isLastTab || isEdit ? () => handleEndOfSale() : () => handleSubmit(),
	};

	useEffect(() => {
		if (bundle) {
			showButton();
		}
		viewItemListEvent();
	}, []);

	useEffect(() => {
		if (isSingleItem) {
			const id = data[0].id;
			onSelectHanlder(id, 0, true);
		}
	}, [data]);

	useEffect(() => {
		const isSingleItem = Array.isArray(data) && data.length === 1;

		if (isSingleItem) {
			const id = data[0].id;
			const product = catalogProducts[id];
			const templateId = product?.templateId;

			if (!templateId) {
				if (Array.isArray(saleObj?.subitems)) {
					const isExistInCartItem = saleObj.subitems.find(
						(item) => item.productId === id,
					);

					if (isExistInCartItem) {
						const timer = setTimeout(() => {
							typeof btnProps.callback === "function" && btnProps.callback();
							clearTimeout(timer);
						}, 1000);
					}
				}
			}
		}
	}, [data, saleObj.subitems?.length]);

	const viewItemListEvent = () => {
		const items = filteredItems();
		if (items.length > 0) {
			const listItem = {
				id: topNavId,
				name: listName,
			};
			const products = items.map((item, idx) =>
				Object.assign({
					index: idx,
					item_category2: ITEM_CATEGORY2.DEAL,
					item_category3: isUpsaleBuilder
						? ITEM_CATEGORY3.POPULAR
						: ITEM_CATEGORY3.SELF_CHOICE,
					...catalogProducts[item?.id],
				}),
			);
			AnalyticsService.viewItemList(products, listItem);
		}
	};

	const selectItemEvent = (id, index) => {
		const Product = catalogProducts[id];
		const listItem = {
			id: topNavId ? topNavId : 0,
			name: listName ? listName : 0,
		};
		const combinedItem = Object.assign(
			{
				index,
				item_category2: ITEM_CATEGORY2.DEAL,
				item_category3: isUpsaleBuilder
					? ITEM_CATEGORY3.POPULAR
					: ITEM_CATEGORY3.SELF_CHOICE,
			},
			Product,
		);
		AnalyticsService.selectItem(combinedItem, listItem);
	};

	function handleSubmit() {
		const { nextTab = () => {} } = props;
		const payload = getBundlePayload();
		const bundleItemId = payload.item.subitems[stepIndex].productId;
		const bundleItem = CartItemEntity.getObjectLiteralItem(
			bundleItemId,
			1,
			payload.item.subitems[stepIndex]?.subitems,
		);
		const cartItem = PizzaBuilderService.setSubItem(
			saleObj,
			bundleItem,
			stepIndex,
		);
		dispatch(Actions.setCartItem(cartItem));

		EmarsysService.setViewBundle(payload?.item, bundleItemId);

		nextTab();
	}

	const handleEndOfSale = () => {
		const payload = getBundlePayload();

		const bundleItemId = payload.item.subitems[stepIndex].productId;
		const bundleItem = CartItemEntity.getObjectLiteralItem(
			bundleItemId,
			1,
			payload.item.subitems[stepIndex].subitems,
		);
		const cartItem = PizzaBuilderService.setSubItem(
			saleObj,
			bundleItem,
			stepIndex,
		);

		const requestPayload = {
			step: `${STEPS.ADD_BUNDLE}`,
			item: cartItem,
		};

		dispatch(Actions.setCartItem(cartItem));
		CartService.validateAddToCart(
			requestPayload,
			(res) => {
				onEndSale(res);
				EmarsysService.setViewBundle(payload?.item, bundleItemId);
			},
			trigger,
		);
	};

	const handleChangeSelected = (index) => {
		setSelectedTag(index);
	};

	const getBundlePayload = (id, payload = null) => {
		const temp = JSON.parse(JSON.stringify(saleObj));
		const step = stepIndex;

		delete temp.status;
		const bundleToPush = !payload
			? {
					productId: id,
					quantity: 1,
			  }
			: {
					...payload,
			  };
		if (id) {
			if (typeof temp.subitems[step] === "undefined") {
				temp.subitems[step] = {};
			}
			temp.subitems[step] = bundleToPush;
		}
		return {
			step: `${STEPS.ADD_BUNDLE} - ${id}`,
			item: temp,
		};
	};

	const filteredItems = () => {
		if (selectedTag === "ALL") {
			return data;
		}
		return data.filter((item) => item.type === selectedTag);
	};

	const RenderItems = (item, index) => {
		const additionalProps = {
			key: `bundle-item-${item?.id}-${index}`,
			name,
			onChange: (id, index) => onSelectHanlder(id, index),
			isSelected: bundle?.productId === item?.id,
			isLastTab,
			priceOverrides,
			index,
		};

		switch (meta) {
			case builderStepsEnum.BEVERAGES:
				return (
					<BeverageSelect
						id={item.id}
						role={"radio"}
						{...additionalProps}
					/>
				);
			case builderStepsEnum.DESSERTS:
			case builderStepsEnum.SIDEDISH:
				return (
					<RenderSideDishItem
						item={item}
						{...additionalProps}
					/>
				);
		}
	};

	const onSelectHanlder = (id, index = 0, hideBack = false) => {
		const subItems = bundle?.subitems ?? [];
		const product = catalogProducts[id];
		const templateId = product?.templateId;
		const name = product?.nameUseCases?.Title;
		if (!!templateId) {
			const combinedItem = Object.assign(
				{
					index,
					item_category2: ITEM_CATEGORY2.DEAL,
					item_category3: isUpsaleBuilder
						? ITEM_CATEGORY3.POPULAR
						: ITEM_CATEGORY3.SELF_CHOICE,
				},
				product,
			);
			const listData = { value: product.price, currency: "ILS" };
			AnalyticsService.viewItem(combinedItem, listData);

			typeof setStack === "function" &&
				setStack({
					type: builderTypes.PRODUCT,
					params: {
						saleId: id,
						isEdit,
						allowCopyToNextSteps: false,
						subItems,
						onSelect: (payload) => {
							onSelect(name, id, payload);
						},
					},
					header: {
						hideBack,
					},
				});
		} else {
			onSelect(name, id);
		}
	};

	const onSelect = (name, id, selectionPayload = null, index) => {
		const optionsPayload = selectionPayload?.item
			? selectionPayload?.item
			: selectionPayload;

		dispatch(Actions.updateBundle({ [stepIndex]: id }));
		const payload = optionsPayload
			? getBundlePayload(id, optionsPayload)
			: getBundlePayload(id);

		CartService.validateAddToCart(
			payload,
			(res) => {
				selectItemEvent(id, index);
				dispatch(Actions.setCartItem(payload.item));

				if (!isUpsaleBuilder && !isEdit) {
					dispatch(
						Actions.removeFrom2DStack({
							key: STACK_TYPES.BUILDER,
							index: stepIndex,
							removeIndex: stackState.length,
						}),
					);
				}
			},
			trigger,
		);
		showButton();
	};

	const titleParts = translate("pizzaBuilder_saleBuilder_headline").split("[_]");

	return (
		<div className={styles["bundle-builder-wrapper"]}>
			{title && (
				<h4 className={styles["title"]}>
					{titleParts[0]}
					<span className={styles["title-bold"]}>{title + " "}</span>
					{titleParts[1]}
				</h4>
			)}
			{tags && (
				<div className={styles["tags-wrapper"]}>
					{tags.map((tag) => (
						<HeaderFilterItem
							text={tag.text}
							index={tag.type}
							key={`filter-item-${tag.text}-${tag.type}`}
							isSelected={tag.type === selectedTag}
							handleChangeSelected={handleChangeSelected}
						/>
					))}
				</div>
			)}
			<div className={styles["bundle-items-wrapper"]}>
				{filteredItems()?.map(RenderItems)}
			</div>
			<div className={styles["bottom-gradient"]} />
			{Button({ btnProps })}
		</div>
	);
};

export default BundleBuilder;

const RenderSideDishItem = (props) => {
	const {
		item = {},
		onChange = () => {},
		isSelected = false,

		priceOverrides,
		index,
	} = props;
	const Product = useMenus(item.id, item.actionType);

	function findPrice(productId) {
		for (const override of priceOverrides) {
			if (productId in override.products) {
				return override.products[productId];
			}
		}
		return null;
	}

	const price = findPrice(Product?.id);
	const isComplex =
		typeof Product?.templateId === "string" && Product?.templateId.length > 0;
	return (
		<SideDishSelect
			title={Product?.nameUseCases?.Title}
			id={Product?.id}
			outOfStock={Product.outOfStock}
			image={getFullMediaUrl(Product, MEDIA_TYPES.PRODUCT, MEDIA_ENUM.IN_MENU)}
			description={Product?.nameUseCases?.SubTitle}
			onChange={onChange}
			isSelected={isSelected}
			isComplex={isComplex}
			templateId={Product?.templateId}
			priceOverride={price}
			role={"radio"}
			index={index}
		/>
	);
};
