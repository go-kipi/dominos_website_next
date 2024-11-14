import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import * as Routes from "constants/routes";
import DropdownArrow from "/public/assets/icons/dropdown_arrow_black.svg";
import NetworkIcon from "/public/assets/icons/network.svg";
// import actions
import Actions from "redux/actions";
import styles from "./index.module.scss";
import { animated, useTransition } from "@react-spring/web";
import LanguageDirectionService from "services/LanguageDirectionService";

import * as popupTypes from "constants/popup-types";
import * as popupsTypes from "constants/popup-types";
import * as popups from "constants/popup-types";
import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";

import Menu from "/public/assets/icons/sidebar/menu.svg";
import Cart from "/public/assets/icons/sidebar/cart.svg";
import Timer from "/public/assets/icons/sidebar/timer.svg";
import HeilaLogo from "/public/assets/logos/heila-logo.svg";

import clsx from "clsx";
import Notification from "components/notification";
import useBenefits from "hooks/useBenefits";
import OrderStatusService from "services/OrderStatusService";
import { NO_ORDER_STATUS } from "constants/OrderStatus";
import useTranslate from "hooks/useTranslate";
import DynamicLink from "components/dynamic_link";
import { getFullMediaUrl } from "utils/functions";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_HIDDEN,
} from "constants/accessibility-types";
import XIcon from "/public/assets/icons/x-icon-white.svg";
import ReactFocusTrap from "components/accessibility/reactFocusTrap";
import {
	handleArrowLeftAndRight,
	handleArrowUpAndDown,
	handleEscClose,
} from "components/accessibility/keyboardsEvents";
import { onArrows } from "components/accessibility/acfunctions";
import AnalyticsService from "../../../utils/analyticsService/AnalyticsService";
import SelectLang from "components/forms/SelectLang/SelectLang";

export default function BurgerMenu(props) {
	const translate = useTranslate();

	const state = useSelector((store) => store.burgerState);
	const dispatch = useDispatch();
	const router = useRouter();

	const DEFAULT_NAME = translate("pizza_lover");

	const user = useSelector((store) => store.userData);
	const deviceState = useSelector((store) => store.deviceState);
	const cart = useSelector((store) => store.cartData);
	const username = user ? user?.firstName : DEFAULT_NAME;
	const benefits = useBenefits();
	const generalData = useSelector((store) => store.generalData);
	const userOrders = user.submittedOrders ?? [];
	const hasOrders = userOrders.length > 0;
	const greeting = translate(user?.greeting);
	const isUserLoggedIn = user.type !== "new" && user.type;
	const numberOfBenefits = benefits.length;
	const numberOfItemInCart = cart?.itemCount;

	const showOnboarding = !user.verifiedOTP;

	const sidebarSocial = useSelector((store) => store.links.sidebarSocial);
	const sidebarTerms = useSelector((store) => store.links.sidebarTerms);
	const sideBarMain = useSelector((store) => store.links.sideBarMain);

	const menuRef = useRef();
	const termsRef = useRef();
	const verifiedOTP = user.verifiedOTP;

	useEffect(() => {
		const userAgent = navigator.userAgent;

		if (state) {
			const popupContainer = document.querySelector("#burger-menu");
			if (!userAgent.match(/safari/i)) {
				disableBodyScroll(popupContainer);
			} else {
				// document.documentElement.style.overflow = "hidden";
				document.body.style.overflow = "hidden";
				document.body.style.WebkitOverflowScrolling = "none";
			}
		} else {
			if (!userAgent.match(/safari/i)) {
				clearAllBodyScrollLocks();
			} else {
				document.documentElement.style.overflow = null;
				document.body.style.overflow = null;
				document.body.style.WebkitOverflowScrolling = null;
			}
		}
	}, [state]);

	function onMenuClick() {
		if (router.pathname !== Routes.root) {
			setTimeout(() => {
				router.push(Routes.root);
			}, 100);
		}

		AnalyticsService.orderClick("order_click");
	}

	const topLinks = [
		{
			label: translate("sidebar_menu_label"),
			icon: Menu,
			onClick: onMenuClick,
		},
		{
			label: translate("sidebar_cart_label"),
			extraText:
				numberOfItemInCart > 0
					? numberOfItemInCart > 1
						? numberOfItemInCart + " " + translate("sidebar_itemsInCart_label")
						: translate("sidebar_itemInCart_label")
					: undefined,
			icon: Cart,
			link: {
				url: Routes.cart,
				relPath: true,
			},
		},
		!!hasOrders && {
			label: translate("sidebar_order_label"),
			icon: Timer,
			onClick: () => {
				router.push(
					{ pathname: Routes.tracker, query: { isFromDrawer: true } },
					undefined,
					{ shallow: true },
				);
				AnalyticsService.myOrderStatusEnteries("my_order_status_enteries");
			},
		},
	];

	const menuItem = {
		id: "menu",
		onClick: onMenuClick,
		nameUseCases: translate("sidebar_menu_label"),
	};

	const mainLinks = sideBarMain
		? deviceState.isDesktop
			? [menuItem, ...sideBarMain]
			: [...sideBarMain]
		: [];
	function getTopLinks() {
		return topLinks.map((item, index) => {
			const handleAnalytics = () => {
				if (item?.url === Routes.cart) {
					AnalyticsService.myCartEnteries("my_cart_enteries");
				}
			};

			return (
				<div
					className={clsx(styles["top-link-wrapper"], styles["link-wrapper"])}
					key={"top-link" + index}
					onClick={handleAnalytics}>
					<BurgerItem
						icon={item.icon}
						label={item.label}
						className={styles["top-link"]}
						onClick={item?.onClick}
						link={item?.link}
						tabIndex={state ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
					/>
					{item.extraText && (
						<span className={styles["top-link-extra-text"]}>{item.extraText}</span>
					)}
				</div>
			);
		});
	}

	function openLoginPopup(e) {
		e.stopPropagation();
		dispatch(
			Actions.addPopup({
				type: showOnboarding ? popupsTypes.IDENTIFICATION : popupTypes.ONBOARDING,
				payload: {
					inOnBoarding: false,
					justOTP: true,
					isFromDrawer: true,
				},
			}),
		);
		handleCloseClick();
	}

	const handleKeyboardEvents = (event) => {
		onArrows(event, menuRef);
	};

	const handleCloseClick = () => {
		dispatch(Actions.setBurger(false));
	};

	const renderSelectLanguage = () => {
		return (
			<SelectLang
				className={styles["custom-select"]}
				dropDownImg={DropdownArrow}
				additionalImg={NetworkIcon}
				customActiveClass={styles["custom-active"]}
				tabIndex={state ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
			/>
		);
	};

	const renderBurgerBody = () => {
		const analyticsBenefit = () => {
			AnalyticsService.myBenefitsEnteries("my_benefits_enteries");
		};

		const handleKeyBoardEvents = (e) => {
			typeof handleEscClose === "function" &&
				handleEscClose(e, () => handleCloseClick());
		};

		return (
			<div
				id={"burger-menu"}
				aria-hidden={!state}
				className={styles["burger-menu"]}
				onKeyDown={(event) => handleKeyBoardEvents(event)}>
				<div
					className={styles["burger-menu-conatiner"]}
					role="navigation">
					<div className={styles["burger-header"]}>
						<button
							className={styles["close-icon"]}
							onClick={handleCloseClick}
							tabIndex={state ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}>
							<img
								src={XIcon.src}
								alt={translate("accessibility_alt_close")}
							/>
						</button>
						<div className={clsx(styles["title"], styles["header-top-container"])}>
							<span className={styles["greeting-text"]}>
								{greeting} <span className={styles["username"]}>{username}</span>
							</span>
							{renderSelectLanguage()}
						</div>
						{isUserLoggedIn && (
							<div className={styles["header-links"]}>
								{numberOfBenefits > 0 && (
									<div
										className={clsx(styles["benefits"], styles["header-link-wrapper"])}
										onClick={analyticsBenefit}>
										<BurgerItem
											link={{
												url: Routes.benefits,
												relPath: true,
											}}
											label={translate("sidebar_benefits_label")}
											className={styles["header-link"]}
											tabIndex={state ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
										/>
										<Notification
											text={numberOfBenefits}
											className={styles["badge-wrapper"]}
										/>
									</div>
								)}
								{numberOfBenefits > 0 && <div className={styles["divider"]} />}

								<div
									className={clsx(
										styles["personal-area-wrapper"],
										styles["header-link-wrapper"],
									)}
									onClick={() => AnalyticsService.personalAreaEntries("personal-area")}>
									<BurgerItem
										link={{
											url: Routes.personalAreaSavedPizza,
											relPath: true,
										}}
										label={translate("sidebar_personal_area_label")}
										className={styles["header-link"]}
										tabIndex={state ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
									/>
								</div>
							</div>
						)}
						{!isUserLoggedIn && !verifiedOTP && (
							<div className={styles["header-links"]}>
								<div
									className={clsx(
										styles["login-wrapper"],
										styles["header-link-wrapper"],
									)}>
									<BurgerItem
										label={translate("sidebar_login_label")}
										className={styles["header-link"]}
										onClick={openLoginPopup}
										tabIndex={state ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
									/>
									<div className={styles["arrow"]} />
								</div>
							</div>
						)}
					</div>
					<div className={styles["background-top"]} />

					<ul className={styles["burger-menu-list"]}>
						<div
							role={"list"}
							className={clsx(
								styles["top-links-wrapper"],
								styles["all-links-wrapper"],
							)}>
							{getTopLinks()}
						</div>

						<div className={styles["seperator"]} />
						<div
							role={"list"}
							className={clsx(styles["links-wrapper"], styles["all-links-wrapper"])}
							onKeyDown={(event) => handleArrowUpAndDown(event, handleKeyboardEvents)}
							ref={menuRef}>
							<SlideInOpactiy
								list={mainLinks}
								itemClassName={styles["link-wrapper"]}
							/>
						</div>
						<div className={styles["social-media-icons-wrapper"]}>
							<SlideUpOpactiy list={sidebarSocial} />
						</div>
						<div
							className={styles["terms"]}
							onKeyDown={(event) =>
								handleArrowLeftAndRight(event, handleKeyboardEvents)
							}
							ref={termsRef}>
							{sidebarTerms &&
								sidebarTerms?.map((item, index) => {
									return (
										<React.Fragment key={`side-bar-term-${index}`}>
											<BurgerItem
												label={item.nameUseCases}
												link={item}
												tabIndex={state ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
											/>
											{sidebarTerms.length > 1 && index !== sidebarTerms.length - 1 && (
												<div className={styles["divider"]} />
											)}
										</React.Fragment>
									);
								})}
						</div>
					</ul>
				</div>
				<div className={styles["credits"]}>
					<a
						className={styles["credit-wrapper"]}
						href={"https://heilasystems.com/"}
						target="_blank"
						rel="noreferrer">
						<span className={styles["credit"]}>
							<img
								className={styles["credit-logo"]}
								src={HeilaLogo.src}
								alt={"heila"}
							/>
						</span>
					</a>
				</div>
				<div className={styles["credits"]}>
					<a
						className={styles["credit-wrapper"]}
						href={"https://www.inmanage.co.il/"}
						target="_blank"
						rel="noreferrer">
						<span className={styles["credit"]}>
							<span className={styles["credit-name"]}>
								{translate("sidebar_inmanage_credit")}
							</span>
						</span>
					</a>
					<div className={styles["divider"]} />

					<a
						className={styles["credit-wrapper"]}
						href={"https://www.uxpert.com/"}
						target="_blank"
						rel="noreferrer">
						<span className={styles["credit"]}>
							<span className={styles["credit-name"]}>
								{translate("sidebar_uxpert_credit")}
							</span>
						</span>
					</a>
				</div>
			</div>
		);
	};

	return (
		<BurgerMenuContainer
			className={clsx(
				styles["burger-menu-wrapper"],
				state ? styles["active"] : "",
			)}
			onClick={handleCloseClick}>
			<>
				<div className={styles["background-gradient"]}>
					<div className={styles["background-top"]} />
					<div className={styles["background-top"]} />

					<div className={styles["background-bottom"]} />
				</div>
				<ReactFocusTrap isActive={state && deviceState.isDesktop}>
					{renderBurgerBody()}
				</ReactFocusTrap>
			</>
		</BurgerMenuContainer>
	);
}

function BurgerMenuContainer(props) {
	const { className, children, onClick } = props;

	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const dragThreshold = 70;

	const handleStart = (e) => {
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		setIsDragging(true);
		setStartX(clientX);
	};

	const handleMove = (e) => {
		if (isDragging) {
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const deltaX = clientX - startX;
			const direction = LanguageDirectionService.isRTL() ? "right" : "left";

			if (Math.abs(deltaX) >= dragThreshold) {
				if (deltaX > 0 && direction === "right") {
					typeof onClick === "function" && onClick();
					return;
				}

				if (deltaX < 0 && direction === "left") {
					typeof onClick === "function" && onClick();
				}
			}
		}
	};

	const handleEnd = () => {
		setStartX(0);
		setIsDragging(false);
	};

	return (
		<div
			className={className}
			onClick={onClick}
			onTouchStart={handleStart}
			onTouchMove={handleMove}
			onTouchEnd={handleEnd}>
			{children}
		</div>
	);
}

function BurgerItem(props) {
	const {
		label,
		className,
		icon = undefined,
		onClick = () => {},
		tabIndex = 0,
		link,
	} = props;
	const [isActive, setIsActive] = useState(false);

	function onHoverHandler() {
		setIsActive(true);
	}

	function onHoverOutHandler() {
		setIsActive(false);
	}

	if (link) {
		return (
			<DynamicLink
				className={clsx(
					styles["burger-item"],
					className,
					isActive ? styles["hover"] : "",
				)}
				link={link}
				tabIndex={tabIndex}>
				{renderContent()}
			</DynamicLink>
		);
	}

	return (
		<div
			className={clsx(
				styles["burger-item"],
				className,
				isActive ? styles["hover"] : "",
			)}
			onClick={onClick}
			role="button"
			tabIndex={tabIndex}>
			{renderContent()}
		</div>
	);

	function renderContent() {
		const isIconUrl = typeof icon === "string";
		return (
			<>
				{icon && (
					<div className={styles["icon-wrapper"]}>
						<img
							src={isIconUrl ? icon : icon.src}
							alt={"icon"}
							aria-hidden={true}
						/>
					</div>
				)}

				<span
					className={styles["label"]}
					onMouseEnter={onHoverHandler}
					onMouseLeave={onHoverOutHandler}>
					{label}
				</span>

				<div className={styles["line"]} />
			</>
		);
	}
}

function SocialMediaItem(props) {
	const { className = "", item } = props;
	const deviceState = useSelector((store) => store.deviceState);

	const icon = getFullMediaUrl(
		item,
		MEDIA_TYPES.URL_LIST,
		deviceState.isDesktop ? MEDIA_ENUM.WEB : MEDIA_ENUM.WEB_MOBILE,
		"svg",
	);

	return (
		<DynamicLink
			className={clsx(styles["social-media-item"], className)}
			link={item}
			tabIndex={TAB_INDEX_DEFAULT}
			ariaLabel={item?.id}>
			<img
				src={icon}
				alt={item?.id}
			/>
		</DynamicLink>
	);
}

function SlideInOpactiy({ list = [], itemClassName = "" }) {
	const isBurgerOpen = useSelector((store) => store.burgerState);
	const deviceState = useSelector((store) => store.deviceState);
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setIsActive(true);
		}, 300);
	}, []);

	return list.map((item, index) => {
		const { url, relPath, id, iconLocal = null, onClick } = item;

		const link = { url, relPath };

		const handleAnalytics = () => {
			AnalyticsService.navBarInsideClick(item?.label);
			if (Routes.branches === link?.url) {
				AnalyticsService.branchesEnteries("branches_enteries");
			}
		};
		const iconItem = { id: item.id, assetVersion: item?.assetVersion };
		const icon = getFullMediaUrl(
			iconItem,
			MEDIA_TYPES.URL_LIST,
			deviceState.isDesktop ? MEDIA_ENUM.WEB : MEDIA_ENUM.WEB_MOBILE,
			"svg",
		);

		const burgerProps = {
			className: clsx(styles[`link`]),
			label: item.nameUseCases,
			icon: iconLocal ?? icon,

			tabIndex: isBurgerOpen ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN,
			onClick: onClick,
		};
		if (url) {
			burgerProps.link = link;
		}

		return (
			<div
				key={"link-" + id}
				className={clsx(
					itemClassName,
					styles["slide-in-item"],
					isActive ? styles["active"] : "",
				)}
				onClick={handleAnalytics}
				style={{ "--index": index }}>
				<BurgerItem {...burgerProps} />
			</div>
		);
	});
}
function SlideUpOpactiy({ list = [] }) {
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setIsActive(true);
		}, 300);
	}, []);
	if (!list) {
		return null;
	}

	return list.map((item, index) => {
		return (
			<div
				key={"social-media" + index}
				style={{ "--index": index }}
				className={clsx(styles["slide-up-item"], isActive ? styles["active"] : "")}>
				<SocialMediaItem item={item} />
			</div>
		);
	});
}
