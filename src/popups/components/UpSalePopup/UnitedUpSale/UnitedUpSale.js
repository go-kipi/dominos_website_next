import useCartInMenu from "hooks/useCartInMenu";
import Button from "components/button";
import TextOnlyButton from "components/text_only_button";
import React, { Children, useEffect, useRef, useState } from "react";
import UpSaleProduct from "./Product/UnitedProduct";
import Arrow from "/public/assets/icons/arrow-white.svg";
import styles from "./UnitedUpSale.module.scss";
import useTranslate from "hooks/useTranslate";
import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { useSelector } from "react-redux";
import { relativeSize } from "utils/functions";
import { Swiper, SwiperSlide } from "swiper/react";
function UnitedUpSale(props) {
	const { hasElements, accept = () => {}, decline = () => {}, menu } = props;
	const deviceState = useSelector((store) => store.deviceState);
	const isMobile = deviceState.isMobile || deviceState.isTablet;
	const itemsMenu = menu.elements;
	const translate = useTranslate();
	const swiperRef = useRef();
	const navigationNextRef = useRef();
	const navigationPrevRef = useRef();
	const [settings, setSettings] = useState(null);
	const currentProductsCounter = useSelector(
		(store) => store.currentProductsCounter,
	);

	const [isShow, setIsShow] = useState(false);
	const ITEM_WIDTH = relativeSize(
		deviceState.isDesktopLarge || deviceState.isDesktopMax ? 341 : 297,
		deviceState.isDesktopLarge || deviceState.isDesktopMax ? 1920 : 1200,
	);
	let numberOfItems = Math.floor(window.innerWidth / ITEM_WIDTH);

	useEffect(() => {
		const popupContainer = document.querySelector("#united-upsale-popup");
		disableBodyScroll(popupContainer);

		return () => {
			clearAllBodyScrollLocks();
		};
	}, []);

	useEffect(() => {
		if (navigationNextRef.current && navigationPrevRef.current) {
			const padding = relativeSize(
				105,
				deviceState.isDesktopLarge || deviceState.isDesktopMax ? 1920 : 1200,
			);
			const arrows = {
				prevEl: navigationPrevRef.current,
				nextEl: navigationNextRef.current,
			};

			const slidersCount =
				deviceState.isDesktopLarge || deviceState.isDesktopMax
					? numberOfItems - 0.2
					: numberOfItems - 0.5;

			const swiperSettings = {
				navigation: arrows,
				slidesPerView: slidersCount,
				slidesOffsetAfter: padding,
				slidesOffsetBefore: padding,
			};

			setSettings(swiperSettings);
		}
	}, [navigationNextRef.current, navigationPrevRef.current, deviceState]);

	useEffect(() => {
		window.addEventListener("resize", () => onWindowResize);
		return () => {
			window.removeEventListener("resize", () => onWindowResize);
		};
	}, []);

	function onDeclineHandler() {
		typeof decline === "function" && decline();
	}

	function onWindowResize() {
		if (swiperRef.current) {
			swiperRef.current.updateSize();
		}
	}

	useEffect(() => {
		for (const item of itemsMenu) {
			const quantity = currentProductsCounter[item.id];
			if (quantity) {
				setIsShow(true);
				return;
			}
		}
		setIsShow(false);
	}, [itemsMenu.length, currentProductsCounter]);

	const containerClasses =
		itemsMenu.length < numberOfItems
			? `${styles["united-up-sale-products"]} ${styles["justifyContentCenter"]}`
			: styles["united-up-sale-products"];

	const shouldShowSimplifiedMenu = isMobile || itemsMenu.length < numberOfItems;
	const shouldShowNavigationButtons =
		!isMobile && itemsMenu.length >= numberOfItems;

	return (
		<div
			id={"united-upsale-popup"}
			className={styles["united-up-sale-wrapper"]}>
			<div className={containerClasses}>
				{shouldShowSimplifiedMenu
					? hasElements &&
					  itemsMenu.map((item, index) => (
							<RenderUpsale
								key={`upsale_${index}`}
								accept={accept}
								item={item}
								index={index}
							/>
					  ))
					: settings && (
							<Swiper
								onSwiper={(swiper) => (swiperRef.current = swiper)}
								{...settings}>
								{hasElements &&
									itemsMenu.map((item, index) => {
										return (
											<SwiperSlide key={`upsale_${index}`}>
												<RenderUpsale
													accept={accept}
													item={item}
													index={index}
												/>
											</SwiperSlide>
										);
									})}
							</Swiper>
					  )}
			</div>
			<div className={styles["btn-page-wrapper"]}>
				{shouldShowNavigationButtons && (
					<button
						ref={navigationPrevRef}
						className={`${styles["arrow-wrapper-next"]} ${styles["arrow-wrapper"]}`}>
						{
							<img
								className={`${styles["arrow-icon"]}`}
								src={Arrow.src}
							/>
						}
					</button>
				)}

				<div className={styles["actions"]}>
					{isShow ? (
						<Button
							className={styles["accept-btn"]}
							text={translate("upsale_product_continueAcceptBtn_label")}
							onClick={onDeclineHandler}
						/>
					) : (
						<TextOnlyButton
							className={styles["decline-btn"]}
							text={translate("upsale_product_declineBtn_label")}
							onClick={onDeclineHandler}
						/>
					)}
				</div>

				{shouldShowNavigationButtons && (
					<button
						ref={navigationNextRef}
						className={`${styles["arrow-wrapper"]} ${styles["arrow-wrapper-prev"]}`}
						d>
						{
							<img
								className={`${styles["arrow-icon"]}`}
								src={Arrow.src}
							/>
						}
					</button>
				)}
			</div>
		</div>
	);
}

export default UnitedUpSale;

function RenderUpsale({ accept, item, index }) {
	const [quantity, _, removeFromBasket] = useCartInMenu(item?.id);
	return (
		<UpSaleProduct
			key={item.id}
			item={item}
			accept={accept}
			quantity={quantity}
			removeFromBasket={removeFromBasket}
			index={index}
		/>
	);
}
