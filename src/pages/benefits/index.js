"use client";

import React, { useEffect, useRef, useState } from "react";

import styles from "./benefits.module.scss";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import useBenefits from "hooks/useBenefits";
import Benefit from "components/Benefit/Benefit";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import { useDispatch, useSelector } from "react-redux";
import Header from "containers/header";

import Arrow from "/public/assets/icons/arrow-white.svg";
import BreadCrumbs from "components/breadcrumbs";
import * as Routes from "constants/routes";
import LanguageDirectionService from "services/LanguageDirectionService";
import { relativeSize } from "utils/functions";

import NoBenefit from "/public/assets/icons/no-benefit.svg";
import useTranslate from "hooks/useTranslate";
import OrderStatusService from "services/OrderStatusService";
import { NO_ORDER_STATUS } from "constants/OrderStatus";
import Actions from "redux/actions";
import * as popupsTypes from "constants/popup-types";
import useOrder from "hooks/useOrder";
import CouponsAndBenefits from "services/CouponsAndBenefits";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";
import usePreventRageClick from "hooks/usePreventRageClick";
import Api from "api/requests";

SwiperCore.use([Navigation]);

function Benefits(props) {
	const benefits = useBenefits();
	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();

	const navigationNextRef = useRef();
	const navigationPrevRef = useRef();
	const languageFlag = useSelector((store) => store.languageFlag);
	const selectedBenefit = useSelector((store) => store.selectedBenefit);

	const swiperRef = useRef();
	const dispatch = useDispatch();
	const { hasOrder } = useOrder();

	const [settings, setSettings] = useState(null);

	useEffect(() => {
		if (!hasOrder) {
			OrderStatusService.getStatusFromUserData(
				NO_ORDER_STATUS,
				null,
				onDisallowed,
			);

			function onDisallowed() {
				dispatch(
					Actions.addPopup({
						type: popupsTypes.CONTINUE_ACTIVE_ORDER,
						payload: {},
					}),
				);
			}
		}
	}, []);

	useEffect(() => {
		window.addEventListener("resize", () => onWindowResize);
		return () => {
			window.removeEventListener("resize", () => onWindowResize);
		};
	}, []);

	useEffect(() => {
		if (navigationNextRef.current && navigationPrevRef.current) {
			const padding = relativeSize(
				88,
				deviceState.isDesktopLarge || deviceState.isDesktopMax ? 1920 : 1200,
			);
			const margin = relativeSize(
				40,
				deviceState.isDesktopLarge || deviceState.isDesktopMax ? 1920 : 1200,
			);
			const arrows = {
				prevEl: navigationPrevRef.current,
				nextEl: navigationNextRef.current,
			};
			const swiperSettings = {
				navigation: arrows,
				slidesPerView: "auto",
				slidesOffsetAfter: padding,
				slidesOffsetBefore: padding,
				spaceBetween: margin,
			};
			setSettings(swiperSettings);
		}
	}, [navigationNextRef.current, navigationPrevRef.current]);

	useEffect(() => {
		if (languageFlag) {
			swiperRef.current.changeLanguageDirection(
				LanguageDirectionService.isRTL() ? "rtl" : "ltr",
			);
		}
	}, [languageFlag]);

	function onWindowResize() {
		if (swiperRef.current) {
			swiperRef.current.updateSize();
		}
	}

	const [onClick, isDisbaled] = usePreventRageClick(
		CouponsAndBenefits.openBuilderWithBenefit,
		200,
	);

	function RenderItem(item, index) {
		return (
			<Benefit
				key={"benefit_" + index}
				title={item.description}
				subtitle={item.details}
				popupLabel={item.popupLabel}
				popupContent={item.popupContent}
				date={item.expiryDate}
				id={item.id}
				productID={item.productID}
				openBuilderWithBenefit={onClick}
				assetVersion={item.assetVersion}
				isDisabled={selectedBenefit === item.id || isDisbaled}
			/>
		);
	}

	function RenderMobile() {
		return (
			<div className={styles["benefits-wrapper"]}>
				{benefits.map((item, index) => RenderItem(item, index))}
			</div>
		);
	}

	function RenderDesktop() {
		return (
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
					{settings && (
						<Swiper
							onSwiper={(swiper) => (swiperRef.current = swiper)}
							{...settings}>
							{RenderSlides()}
						</Swiper>
					)}

					<button
						ref={navigationNextRef}
						className={`${styles["arrow-wrapper-next"]} ${styles["arrow-wrapper"]}`}>
						<img
							className={`${styles["arrow-icon"]} ${styles["arrow-icon-next"]}`}
							src={Arrow.src}
						/>
					</button>

					<button
						className={`${styles["arrow-wrapper"]} ${styles["arrow-wrapper-prev"]}`}
						ref={navigationPrevRef}>
						<img
							className={`${styles["arrow-icon"]}`}
							src={Arrow.src}
						/>
					</button>
				</div>
			</div>
		);
	}

	function RenderSlides() {
		return benefits.map((item, index) => {
			return (
				<SwiperSlide key={"benefit_-" + index}>
					{RenderItem(item, index)}
				</SwiperSlide>
			);
		});
	}

	function noBenefits() {
		return (
			<div className={styles["no-benefits-wrapper"]}>
				<div className={styles["image-wrapper"]}>
					<img
						src={NoBenefit.src}
						alt={""}
					/>
				</div>
				<h1 className={styles["no-benefits-title"]}>
					{translate("benefitsScreen_noBenefits")}
				</h1>
			</div>
		);
	}

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
					? RenderDesktop()
					: RenderMobile()
				: noBenefits()}
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
			} else {
				return {
					props: { ...params },
				};
			}
		},
);
