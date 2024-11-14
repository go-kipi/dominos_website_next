import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import Api from "api/requests";
import useTranslate from "hooks/useTranslate";
import Button from "components/button";
import { MEDIA_ENUM } from "constants/media-enum";
import { MEDIA_TYPES } from "constants/media-types";
import { getSimpleMediaUrl } from "utils/functions";
import { useSelector } from "react-redux";
import clsx from "clsx";

const RenderPromoProduct = (props) => {
	const { productId = "", onClick, btnText, isSingleProduct = false } = props;
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const intialProduct =
		typeof catalogProducts === "object" && Object.keys(catalogProducts).length > 0
			? catalogProducts[productId]
			: null;
	const [product, setProduct] = useState(intialProduct);
	const deviceState = useSelector((store) => store.deviceState);
	const isMobile = deviceState.isMobile || deviceState.isTablet;
	const translate = useTranslate();
	const currentDevice = isMobile ? "mobile" : "desktop";
	const mediaType = isSingleProduct
		? MEDIA_TYPES.PROMO_ONE
		: MEDIA_TYPES.PROMO_TWO;
	const imgSuffix = `${MEDIA_TYPES.PRODUCT}/${productId}/V${product?.assetVersion}/${mediaType}-${currentDevice}.png`;
	const productImg = getSimpleMediaUrl(imgSuffix);

	useEffect(() => {
		if (!intialProduct && !product) {
			const onSuccess = (res) => {
				const { product } = res;
				const hasProduct = typeof product[productId] === "object";
				if (hasProduct) {
					setProduct(product[productId]);
				}
			};
			const payload = { productIds: [productId] };
			Api.getProducts({ payload, onSuccess });
		}
	}, []);

	const handleOnClick = () => {
		typeof onClick === "function" && onClick(product);
	};

	return (
		<div
			className={clsx(
				styles["product-wrapper"],
				isSingleProduct ? styles["single"] : "",
			)}>
			<div
				className={clsx(
					styles["product-img"],
					!isSingleProduct ? styles["multi"] : "",
				)}>
				{typeof product?.assetVersion === "number" ? (
					<img
						src={productImg}
						alt={product?.nameUseCases?.Title}
					/>
				) : null}
				{isMobile && !isSingleProduct ? (
					<Button
						text={translate(btnText)}
						className={clsx(
							styles["product-button"],
							!isSingleProduct ? styles["small"] : "",
						)}
						textClassName={styles["button-text"]}
						onClick={handleOnClick}
						extraStyles={styles}
					/>
				) : null}
			</div>
			{!isMobile || (isMobile && isSingleProduct) ? (
				<Button
					text={translate(btnText)}
					className={styles["product-button"]}
					textClassName={styles["button-text"]}
					onClick={handleOnClick}
					extraStyles={styles}
				/>
			) : null}
		</div>
	);
};
export default RenderPromoProduct;
