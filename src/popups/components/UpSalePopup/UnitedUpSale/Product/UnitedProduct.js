import { getCurrencySign, getFullMediaUrl } from "utils/functions";
import useMenus from "hooks/useMenus";
import Button from "components/button";
import Price from "components/Price";
import TransparentCounterButton from "components/TransparentCounterButton/TransparentCounterButton";
import { MEDIA_ENUM } from "constants/media-enum";
import { MEDIA_TYPES } from "constants/media-types";
import React, { useEffect } from "react";

import styles from "./UnitedProduct.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { createAccessibilityText } from "../../../../../components/accessibility/acfunctions";
import SRContent from "../../../../../components/accessibility/srcontent";
import { META_ENUM } from "constants/menu-meta-tags";
import { ITEM_CATEGORY2, ITEM_CATEGORY3 } from "constants/AnalyticsTypes";
import LanguageDirectionService from "services/LanguageDirectionService";
import { useSelector } from "react-redux";

function UpSaleProduct(props) {
	const {
		item,
		currency = "shekel",
		accept,
		quantity,
		removeFromBasket,
		index,
		isUpsaleBuilder,
	} = props;

	const deviceState = useSelector((store) => store.deviceState);
	const isMobile = deviceState.isMobile || deviceState.isTablet;
	const isRTL = LanguageDirectionService.isRTL();
	const product = useMenus(item?.id, item?.actionType);
	const price = product?.price;
	const oldPrice = product.priceBeforeDiscount;
	const showPriceBeforeDiscount = product.showPriceBeforeDiscount;
	const translate = useTranslate();
	const imgUrl = getFullMediaUrl(item, MEDIA_TYPES.PRODUCT, MEDIA_ENUM.IN_MENU);

	useEffect(() => {
		const combinedProduct = Object.assign(
			{
				index,
				item_category3: isUpsaleBuilder ? ITEM_CATEGORY3.POPULAR : null,
			},
			product,
		);
		const listData = {
			promotion_name: 0,
			promotion_id: 0,
			creative_name: 0,
			creative_slot: 0,
		};
		AnalyticsService.viewPromotion(combinedProduct, listData);
	}, []);

	function onChangeHandler(count) {
		if (count > quantity) {
			accept({
				id: item.id,
				templateId: product.templateId,
			});
		} else {
			removeFromBasket(1);
		}
	}
	const srText = createAccessibilityText(
		product?.nameUseCases?.Title,
		`${price}${getCurrencySign(currency)}`,
		showPriceBeforeDiscount &&
			createAccessibilityText(
				translate("accessibility_srContent_insteadOf"),
				`${oldPrice}${getCurrencySign(currency)}`,
			),
	);

	const renderPricesByDevice = () => {
		return (
			<div
				className={styles["price-container"]}
				style={{ flexDirection: isMobile ? "column" : "column-reverse" }}>
				{showPriceBeforeDiscount && (
					<Price
						value={oldPrice}
						currency={currency}
						className={styles["up-sale-old-price"]}
						mark={true}
						ariaHidden={true}
						extraStyles={styles}
					/>
				)}
				<Price
					value={price}
					currency={currency}
					className={styles["up-sale-price"]}
					extraStyles={styles}
					ariaHidden={true}
				/>
			</div>
		);
	};

	function onContainerClick() {
		onChangeHandler(quantity + 1);
	}

	const renderForMobile = () => {
		return (
			<button
				onClick={onContainerClick}
				className={clsx(styles["up-sale-product-wrapper"], styles["row"])}>
				<SRContent
					id={product.id}
					message={srText}
				/>
				<div className={styles["product-content"]}>
					<span
						className={styles["up-sale-product-title"]}
						aria-hidden={true}>
						{product?.nameUseCases?.Title}
					</span>
					<div className={styles["up-sale-product-disc"]}>
						{product?.nameUseCases?.Subtitle}
					</div>
					<div className={styles["prices-counter"]}>
						<div className={styles["prices-wrapper"]}>{renderPricesByDevice()}</div>
						{quantity ? (
							<TransparentCounterButton
								value={quantity}
								onChange={onChangeHandler}
								className={styles["counetr"]}
								min={product?.quantity?.minPerSale}
								max={product?.quantity?.maxPerSale}
								extraStyles={styles}
								baseAriaLabel={srText}
							/>
						) : (
							<Button
								text={translate("upsalePopup_zigzag_choose")}
								onClick={() => {
									onChangeHandler(1);
								}}
								ariaDescription={product.id}
								className={styles["counetr"]}
								extraStyles={styles}
							/>
						)}
					</div>
				</div>
				<div className={`${styles.image} ${styles.imagePos}`}>
					<img
						src={imgUrl}
						alt={"up sale"}
					/>
				</div>
			</button>
		);
	};

	const renderForDesktop = () => {
		return (
			<button
				className={styles["product-wrapper-container"]}
				onClick={onContainerClick}>
				<div className={clsx(styles["up-sale-product-wrapper"], styles["row"])}>
					<SRContent
						id={product.id}
						message={srText}
					/>
					<div className={styles["product-content"]}>
						<span
							className={styles["up-sale-product-title"]}
							aria-hidden={true}>
							{product?.nameUseCases?.Title}
						</span>
						<div className={styles["up-sale-product-disc"]}>
							{product?.nameUseCases?.Subtitle}
						</div>
						<div className={styles["prices-counter"]}>
							<div className={styles["prices-wrapper"]}>{renderPricesByDevice()}</div>
							{quantity ? (
								<TransparentCounterButton
									value={quantity}
									onChange={onChangeHandler}
									className={styles["counetr"]}
									min={product?.quantity?.minPerSale}
									max={product?.quantity?.maxPerSale}
									extraStyles={styles}
									baseAriaLabel={srText}
								/>
							) : (
								<Button
									text={translate("upsalePopup_zigzag_choose")}
									onClick={() => {
										onChangeHandler(1);
									}}
									ariaDescription={product.id}
									className={styles["counetr"]}
									extraStyles={styles}
								/>
							)}
						</div>
					</div>
					<div className={styles["image-container"]}>
						<div className={`${styles.image}`}>
							<img
								src={imgUrl}
								alt={"up sale"}
							/>
						</div>
					</div>
				</div>
			</button>
		);
	};

	return isMobile ? renderForMobile() : renderForDesktop();
}

export default UpSaleProduct;
