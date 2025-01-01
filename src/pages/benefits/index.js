"use client";

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import { useDispatch, useSelector } from "react-redux";

// Components
import styles from "./benefits.module.scss";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import Benefit from "components/Benefit/Benefit";
import Header from "containers/header";
import BreadCrumbs from "components/breadcrumbs";

// Services & Utils
import LanguageDirectionService from "services/LanguageDirectionService";
import CouponsAndBenefits from "services/CouponsAndBenefits";
import { relativeSize } from "utils/functions";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";

// Hooks
import useBenefits from "hooks/useBenefits";
import useTranslate from "hooks/useTranslate";
import useOrder from "hooks/useOrder";
import usePreventRageClick from "hooks/usePreventRageClick";

// Constants and Assets
import * as Routes from "constants/routes";
import Arrow from "/public/assets/icons/arrow-white.svg";
import NoBenefit from "/public/assets/icons/no-benefit.svg";

SwiperCore.use([Navigation]);

function Benefits() {
	// Hooks
	const benefits = useBenefits();
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { hasOrder } = useOrder();
	const [onClick, isDisabled] = usePreventRageClick(
		CouponsAndBenefits.openBuilderWithBenefit,
		200,
	);

	// Refs
	const navigationNextRef = useRef(null);
	const navigationPrevRef = useRef(null);
	const swiperRef = useRef(null);

	// State
	const [settings, setSettings] = useState(null);
	const [isInitialized, setIsInitialized] = useState(false);

	// Selectors
	const deviceState = useSelector((store) => store.deviceState);
	const languageFlag = useSelector((store) => store.languageFlag);
	const selectedBenefit = useSelector((store) => store.selectedBenefit);

	// Initialize Swiper settings
	useEffect(() => {
		if (
			!isInitialized &&
			navigationNextRef.current &&
			navigationPrevRef.current &&
			benefits.length > 0
		) {
			const baseSize =
				deviceState.isDesktopLarge || deviceState.isDesktopMax ? 1920 : 1200;

			const swiperSettings = {
				navigation: {
					prevEl: navigationPrevRef.current,
					nextEl: navigationNextRef.current,
				},
				slidesPerView: "auto",
				slidesOffsetAfter: relativeSize(88, baseSize),
				slidesOffsetBefore: relativeSize(88, baseSize),
				spaceBetween: relativeSize(40, baseSize),
				observer: true,
				observeParents: true,
			};

			setSettings(swiperSettings);
			setIsInitialized(true);
		}
	}, [
		navigationNextRef.current,
		navigationPrevRef.current,
		benefits.length,
		deviceState.isDesktopLarge,
		deviceState.isDesktopMax,
		isInitialized,
	]);

	// Handle language direction changes
	useEffect(() => {
		if (languageFlag && swiperRef.current?.changeLanguageDirection) {
			swiperRef.current.changeLanguageDirection(
				LanguageDirectionService.isRTL() ? "rtl" : "ltr",
			);
		}
	}, [languageFlag]);

	// Window resize handler
	useEffect(() => {
		const handleResize = () => {
			if (swiperRef.current) {
				swiperRef.current.update();
			}
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	// Cleanup
	useEffect(() => {
		return () => {
			if (swiperRef.current) {
				swiperRef.current.destroy(true, true);
			}
		};
	}, []);

	const renderBenefitItem = (item, index) => (
		<Benefit
			key={`benefit-${item.id}-${index}`}
			title={item.description}
			subtitle={item.details}
			popupLabel={item.popupLabel}
			popupContent={item.popupContent}
			date={item.expiryDate}
			id={item.id}
			productID={item.productID}
			openBuilderWithBenefit={onClick}
			assetVersion={item.assetVersion}
			isDisabled={selectedBenefit === item.id || isDisabled}
		/>
	);

	const renderSlides = () =>
		benefits.map((item, index) => (
			<SwiperSlide key={`benefit-slide-${item.id}-${index}`}>
				{renderBenefitItem(item, index)}
			</SwiperSlide>
		));

	const renderMobile = () => (
		<div className={styles["benefits-wrapper"]}>
			{benefits.map((item, index) => renderBenefitItem(item, index))}
		</div>
	);

	const renderDesktop = () => (
		<div className={styles["benefits-page-container"]}>
			<BreadCrumbs
				root={{ route: Routes.root, name: translate("breadcrumbs_root") }}
				crumbs={{
					routes: [Routes.benefits],
					names: [translate("breadcrumbs_benefits")],
				}}
				className={styles["custom-breadcrumbs"]}
			/>
			<div className={styles["benefits-wrapper-desktop"]}>
				{/* Navigation Buttons */}
				<button
					ref={navigationNextRef}
					className={`${styles["arrow-wrapper-next"]} ${styles["arrow-wrapper"]}`}>
					<img
						className={`${styles["arrow-icon"]} ${styles["arrow-icon-next"]}`}
						src={Arrow.src}
						alt="Next"
					/>
				</button>

				<button
					ref={navigationPrevRef}
					className={`${styles["arrow-wrapper"]} ${styles["arrow-wrapper-prev"]}`}>
					<img
						className={styles["arrow-icon"]}
						src={Arrow.src}
						alt="Previous"
					/>
				</button>

				{/* Swiper */}
				{settings && benefits.length > 0 && (
					<Swiper
						onSwiper={(swiper) => {
							swiperRef.current = swiper;
							setTimeout(() => {
								swiper.update();
							}, 100);
						}}
						{...settings}>
						{renderSlides()}
					</Swiper>
				)}
			</div>
		</div>
	);

	const renderNoBenefits = () => (
		<div className={styles["no-benefits-wrapper"]}>
			<div className={styles["image-wrapper"]}>
				<img
					src={NoBenefit.src}
					alt="No benefits available"
				/>
			</div>
			<h1 className={styles["no-benefits-title"]}>
				{translate("benefitsScreen_noBenefits")}
			</h1>
		</div>
	);

	return (
		<div className={styles["benefits-page-wrapper"]}>
			<BackgroundImage />

			{deviceState.isDesktop ? (
				<Header title={translate("benefitsScreen_title")} />
			) : (
				<GeneralHeader
					cart
					back
					title={translate("benefitsScreen_title")}
				/>
			)}

			{benefits.length > 0
				? deviceState.isDesktop
					? renderDesktop()
					: renderMobile()
				: renderNoBenefits()}
		</div>
	);
}

export default Benefits;

export const getStaticProps = reduxWrapper.getStaticProps(
	(store) =>
		async ({ params, locale }) => {
			ISR.setGlobalStore(store);
			const isrRevalidate = parseInt(process.env.NEXT_PUBLIC_ISR_REVALIDATE);
			const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

			if (isrEnabled) {
				try {
					await ISR.sharedRequests(locale);
					await ISR.getGeneralMetaTags(locale, "/benefits");

					return {
						props: { ...params },
						revalidate: isrRevalidate,
					};
				} catch {
					return {
						props: null,
						revalidate: isrRevalidate,
					};
				}
			}

			return {
				props: { ...params },
			};
		},
);
