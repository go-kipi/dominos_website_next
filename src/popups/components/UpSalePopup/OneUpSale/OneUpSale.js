import { getCurrencySign, getFullMediaUrl } from "utils/functions";
import Button from "components/button";
import Price from "components/Price";
import TextOnlyButton from "components/text_only_button";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import styles from "./OneUpSale.module.scss";
import Confetti from "/public/assets/icons/confetti-upsale-added-to-basket.svg";
import Vi from "/public/assets/icons/vi-upsale-added-to-basket.svg";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import useMenus from "hooks/useMenus";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
import SRContent from "../../../../components/accessibility/srcontent";
import { ITEM_CATEGORY3 } from "constants/AnalyticsTypes";

function OneUpSale(props) {
	const { accept = () => {}, decline = () => {}, menu, hasElements } = props;

	return (
		<>
			{hasElements &&
				menu.elements.map((item, index) => {
					return (
						<OneUpSaleProduct
							accept={accept}
							decline={decline}
							item={item}
							index={index}
							key={"product-" + index}
						/>
					);
				})}
		</>
	);
}

export default OneUpSale;

function OneUpSaleProduct(props) {
	const {
		item,
		accept = () => {},
		decline = () => {},
		currency = "shekel",
		index,
	} = props;

	const deviceState = useSelector((store) => store.deviceState);
	const [showConfetti, setShowConfetti] = useState(false);

	const product = useMenus(item.id, item.actionType);
	const price = product?.price;
	const oldPrice = product.priceBeforeDiscount;
	const showPriceBeforeDiscount = product.showPriceBeforeDiscount;
	const translate = useTranslate();
	const imgUrl = getFullMediaUrl(item, MEDIA_TYPES.PRODUCT, MEDIA_ENUM.IN_MENU);

	useEffect(() => {
		const combinedProduct = Object.assign(
			{ index, item_category3: ITEM_CATEGORY3.POPULAR },
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

	function onAcceptHandler() {
		const combinedProduct = Object.assign(
			{ index, item_category3: ITEM_CATEGORY3.POPULAR },
			product,
		);
		AnalyticsService.selectPromotion(combinedProduct, {});

		if (!product.templateId) {
			setShowConfetti(true);
		}
		return (
			typeof accept === "function" &&
			accept({ id: item.id, templateId: product.templateId })
		);
	}

	function onDeclineHandler(id) {
		return typeof decline === "function" && decline(id);
	}
	const srText = createAccessibilityText(
		product?.nameUseCases?.Title,
		translate("upsale_product_inPrice"),
		`${price}${getCurrencySign(currency)}`,
		showPriceBeforeDiscount &&
			createAccessibilityText(
				translate("upsale_product_insteadPrice") ??
					translate("upsale_product_insteadPrice"),
				`${oldPrice}${getCurrencySign(currency)}`,
			),
	);
	return (
		<div className={styles["one-up-sale-wrapper"]}>
			<div
				className={styles["image"]}
				aria-hidden={true}>
				<img
					src={imgUrl}
					alt="up-sale"
				/>
			</div>
			<div className={styles["one-up-sale-content"]}>
				<h5
					className={styles["one-up-sale-title"]}
					aria-hidden={true}>
					{product?.nameUseCases?.Title}
				</h5>
				<div
					className={styles["one-up-sale-price-wrapper"]}
					aria-hidden={true}>
					<span
						className={styles["price-text"]}
						aria-hidden={true}>
						{translate("upsale_product_inPrice")}
					</span>
					<Price
						readPrice={true}
						value={price}
						currency={currency}
						className={styles["one-up-sale-price"]}
						extraStyles={styles}
						ariaHidden={true}
					/>
					{showPriceBeforeDiscount && (
						<>
							<span
								className={styles["old-price-text"]}
								aria-hidden={true}>
								{translate("upsale_product_insteadPrice")}
							</span>
							<div className={styles["one-up-sale-old-price"]}>
								<Price
									readPrice={true}
									value={oldPrice}
									currency={currency}
									mark={!!deviceState.isDesktop}
									extraStyles={styles}
									ariaHidden={true}
								/>
							</div>
						</>
					)}
				</div>

				{!showConfetti && (
					<div className={styles["actions"]}>
						<Button
							text={translate("upsale_product_addToCartAcceptBtn_label")}
							onClick={onAcceptHandler}
							className={styles["one-up-sale-accept-btn"]}
							ariaLabel={`${translate(
								"upsale_product_addToCartAcceptBtn_label",
							)} ${srText}`}
						/>
						<TextOnlyButton
							text={translate("upsale_product_declineBtn_label")}
							className={styles["one-up-sale-decline-btn"]}
							onClick={onDeclineHandler}
						/>
					</div>
				)}
				{showConfetti && (
					<div className={styles["up-sale-added-to-basket"]}>
						<SRContent
							message={translate("upSalePopup_addedToBasket")}
							role={"alert"}
							ariaLive={"off"}
						/>
						<div className={styles["up-sale-confetti"]}>
							<img
								src={Confetti.src}
								alt={""}
							/>
						</div>
						<div className={styles["up-sale-vi"]}>
							<img
								src={Vi.src}
								alt={""}
							/>
						</div>
						<span className={styles["added-to-basket-title"]}>
							{translate("upSalePopup_addedToBasket")}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
