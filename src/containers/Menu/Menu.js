import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import HeaderFilters from "./components/HeaderFilters/HeaderFilters";
import MenuHeader from "./components/MenuHeader/MenuHeader";

import styles from "./Menu.module.scss";
import LanguageDirectionService from "services/LanguageDirectionService";
import { META_ENUM } from "../../constants/menu-meta-tags";
import useSetMenuPath from "hooks/useSetMenuPath";
import Actions from "redux/actions";
import RenderScreen from "./components/RenderScreen";
import Animations from "../../animations-manager";
import PizzaTreeService from "services/PizzaTreeService";
import * as Routes from "constants/routes";

import Api from "api/requests";

import { useRouter } from "next/router";

import * as popupTypes from "constants/popup-types";
import useEntryBenefit from "hooks/useEntreyBenefit";

import useOrder from "hooks/useOrder";
import useTranslate from "hooks/useTranslate";
import usePromotionalAndOperationalPopups from "hooks/usePromotionalAndOperationalPopups";
import SRContent from "components/accessibility/srcontent";
import CouponsAndBenefits from "services/CouponsAndBenefits";
import MenuFilters from "./components/MenuFilters/MenuFilters";
import MenuDisclaimer from "./components/MenuDisclaimer/MenuDisclaimer";
import clsx from "clsx";
import useGetMenuByMeta from "../../hooks/useGetMenuByMeta";
import { PROMO_MENU } from "constants/operational-promo-popups-state";
import EmarsysService from "utils/analyticsService/EmarsysService";
import DeepLinkCoupon from "services/DeepLinkCoupon";

const INITIAL_ANIMATION = 600;

function Menu() {
	const router = useRouter();
	const dispatch = useDispatch();
	const setPath = useSetMenuPath();
	const cartItems = useSelector((store) => store.cartData?.itemCount);
	const isInitialRender = useSelector((store) => store.isInitialRender);
	usePromotionalAndOperationalPopups(PROMO_MENU);
	const menuPath = useSelector((store) => store.menuPath);
	const [initialRequestsDone, setInitialRequestsDone] = useState(false);
	const [animationClass, setAnimationClass] = useState("off-screen");
	const deviceState = useSelector((store) => store.deviceState);
	const selectedBenefit = useSelector((store) => store.selectedBenefit);
	const [fadeAnimation, setFadeAnimation] = useState(false);
	const [disclaimerHidden, setDisclaimerHidden] = useState(false);
	const benefit = useEntryBenefit(true);
	const { hasOrder } = useOrder();
	const topNav = useGetMenuByMeta(META_ENUM.TOP_NAV);
	const translate = useTranslate();
	const [isScrolled, setIsScrolled] = useState(false);
	const promotionalAndOperationalPopups = useSelector(
		(store) => store.promoPopups,
	);

	const menus = useSelector((store) => store.menusData.menus);

	useLayoutEffect(() => {
		if (fadeAnimation) {
			setTimeout(() => {
				setFadeAnimation(false);
			}, 1);
		}
	}, [fadeAnimation]);

	useEffect(() => {
		if (promotionalAndOperationalPopups.length === 0 && isInitialRender) {
			const timeout = setTimeout(() => {
				setAnimationClass("animate-in");
			}, INITIAL_ANIMATION);

			return () => {
				clearTimeout(timeout);
			};
		}
	}, [promotionalAndOperationalPopups.length]);

	useEffect(() => {
		dispatch(Actions.hideFooter());
		if (hasOrder && !menuPath[META_ENUM.MAIN_NAV]) {
			setPath();
		}
	}, [hasOrder]);

	useEffect(() => {
		if (menuPath.mainNav) {
			const mainNavName = menus[menuPath.mainNav].nameUseCases.name;
			const topNavName = menuPath.topNav
				? menus[menuPath.topNav].nameUseCases.name
				: null;

			const categoryPath = topNavName
				? `${mainNavName} > ${topNavName}`
				: `${mainNavName}`;

			EmarsysService.setCategory(categoryPath);
		}
	}, [menuPath.mainNav, menuPath.topNav]);

	useEffect(() => {
		if (initialRequestsDone) {
			openWelcomePopup(onSuccessWelcome);
		}

		function onSuccessWelcome() {
			DeepLinkCoupon.openDeepLinkCoupon(onSucccessDeepLink);
		}

		function onSucccessDeepLink() {
			const { id, imageUrl, imageSize } = selectedBenefit;
			CouponsAndBenefits.openBuilderWithBenefit(id, imageUrl, imageSize);
		}
	}, [initialRequestsDone]);

	useEffect(() => {
		if (hasOrder) {
			Api.getCustomerActiveOrder({
				payload: {},
				onSuccess,
			});

			function onSuccess(data) {
				const activeOrder = data;
				if (activeOrder.basket?.products) {
					dispatch(Actions.addCatalogProducts(activeOrder.basket.products));
				}
				dispatch(Actions.setCart(activeOrder.basket));
				PizzaTreeService.init(() => setInitialRequestsDone(true));
			}
		} else {
			router.replace(Routes.root);
		}
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const distanceAmount = deviceState.isDesktop ? 100 : 40;
			setIsScrolled(scrollY > distanceAmount);
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	function openWelcomePopup(onSuccess) {
		if (benefit) {
			dispatch(
				Actions.addPopup({
					type: popupTypes.WELCOME_COUPON,
					payload: {
						onSuccess: () => {
							setTimeout(() => {
								onSuccess();
							}, 500);
						},
						onDecline: () => {
							setTimeout(() => {
								onSuccess();
							}, 500);
						},
					},
					priority: 3,
				}),
			);
		} else {
			onSuccess();
		}
	}

	const hasMultipleFilters = topNav?.elements?.length > 1;
	const hasPopups = !!promotionalAndOperationalPopups.length;

	function onDisclaimerHide() {
		setDisclaimerHidden(true);
	}

	if (!initialRequestsDone) {
		return null;
	}

	return (
		<div className={clsx(styles["menu-page-wrapper"])}>
			<MenuHeader headerTitle={menuPath[META_ENUM.MAIN_NAV]} />

			<HeaderFilters animationClass={animationClass} />

			<Animations />
			<div
				id="moving-product-image-popup-placeholder"
				className={LanguageDirectionService.isRTL() ? styles["rtl"] : styles["ltr"]}
			/>
			{!hasPopups && (
				<div
					className={clsx(
						styles["content-wrapper"],
						isInitialRender && styles[animationClass],
					)}>
					<RenderScreen />
				</div>
			)}
			<span className={clsx(styles["filter-wrapper"])}>
				<MenuFilters
					setFadeAnimation={setFadeAnimation}
					fixBottom={disclaimerHidden}
					onResetScroll={() => setIsScrolled(false)}
					isScrolled={isScrolled}
				/>
			</span>

			<SRContent
				message={
					cartItems === 0
						? translate("accessibility_emptyCart")
						: translate("accessibility_cart_itemsAmount").replace(
								"{items}",
								cartItems,
						  )
				}
				ariaLive={cartItems === 0 ? "off" : "polite"}
				role={"alert"}
			/>
			<MenuDisclaimer onHide={onDisclaimerHide} />
		</div>
	);
}

export default Menu;
