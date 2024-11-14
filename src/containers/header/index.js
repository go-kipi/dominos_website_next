import React from "react";
import { useSelector } from "react-redux";
// Components

import Separator from "../../components/common/separator";

// Assets
import styles from "./index.module.scss";

import Logo from "/public/assets/logos/dominos-logo-with-name.svg";
import Arrow from "/public/assets/icons/arrow_right.svg";
import ChatIcon from "/public/assets/icons/wa-chat-icon.svg";
import CartIcon from "/public/assets/icons/cart.svg";

import TrackerIcon from "/public/assets/icons/general_tracker.svg";

// routing constants
import * as Routes from "constants/routes";
import Link from "next/link";

// Actions
import Notification from "components/notification";
import useKosher from "hooks/useKosher";

// Services
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import Burger from "components/common/buttons/burger/burger";
import AnalyticsService from "../../utils/analyticsService/AnalyticsService";
import SelectLang from "components/forms/SelectLang/SelectLang";
import dynamic from "next/dynamic";

const BurgerMenu = dynamic(() => import("./BurgerMenu"), {
	loading: () => <div />,
});

function Header(props) {
	const {
		title,
		className,
		gradient = true,
		useH1Title = true,
		isHomePage = false,
		showCart = true,
	} = props;
	const deviceState = useSelector((store) => store.deviceState);
	const cartData = useSelector((store) => store.cartData);
	const user = useSelector((store) => store.userData);
	const isKosher = useKosher();
	const translate = useTranslate();
	const usersOrders = user.submittedOrders ?? [];
	const hasActiveOrder = usersOrders.length > 0;

	const utm = useSelector((store) => store.generalData?.utmSource);

	const DEFAULT_NAME = translate("pizza_lover");

	const renderHelloUserText = () => {
		const hasTitle = typeof title === "string" && title.length > 0;
		const name = user?.firstName ? user?.firstName : DEFAULT_NAME;
		const text = translate(user?.greeting) + " " + name;

		if (!user && !hasTitle) {
			return null;
		}
		return (
			<span className={styles["hello-user"]}>{hasTitle ? title : text}</span>
		);
	};

	const chatAnalytics = () => {
		AnalyticsService.homepage("support");
		AnalyticsService.supportHomePage("support_home_chat");
	};

	const renderOrderStatus = () => {
		const handleAnalytics = () => {
			AnalyticsService.myOrderStatusEnteries("my_order_status_enteries");
		};

		return (
			<Link
				href={Routes.tracker}
				onClick={handleAnalytics}>
				<div className={styles["order-status-icon"]}>
					<img
						src={TrackerIcon.src}
						alt={translate("accessibility_imageAlt_statusOrders")}
					/>
				</div>
			</Link>
		);
	};

	const renderMobileHeader = () => {
		return (
			<div
				className={`${styles["header"]}${
					gradient ? " " + styles["gradient"] : ""
				}`}>
				<Burger
					onHomepageClick={() => {
						isHomePage && AnalyticsService.homepage("Nav menu");
					}}
				/>

				{renderHelloUserText()}
				<button
					className={styles["chat-wrapper"]}
					onClick={chatAnalytics}>
					<a
						href="https://wa.me/972732487007"
						target={"_blank"}
						rel="noopener noreferrer"
						className={styles["chat-icon"]}>
						<img
							src={ChatIcon.src}
							className={styles["logo"]}
							alt="chat-icon"
						/>
					</a>
					<span className={styles["chat-text"]}>
						{translate("header_chat_text")}
					</span>
				</button>
			</div>
		);
	};

	const handleAnalytics = () => {
		AnalyticsService.myCartEnteries("my_cart_enteries");
	};
	const renderDesktopHeader = () => {
		return (
			<div className={clsx(styles["header"], className)}>
				<div className={styles["header-right"]}>
					<Burger
						onHomepageClick={() => {
							isHomePage && AnalyticsService.homepage("Nav menu");
						}}
					/>

					<Separator
						className={clsx(styles["horizontal-line"], styles["right-space"])}
					/>

					<SelectLang
						className={styles["select-additional"]}
						dropDownImg={Arrow}
						extraStyles={styles}
						onHomepageClick={() => {
							isHomePage && AnalyticsService.homepage("Language");
						}}
					/>

					<Separator
						className={clsx(styles["horizontal-line"], styles["left-space"])}
					/>

					<button
						onClick={() => {
							isHomePage && AnalyticsService.homepage("Jobs");
						}}>
						<a
							href="https://www.dominos.co.il/jobs/"
							target="_blank"
							rel="noreferrer"
							className={styles["wanted"]}>
							{translate("needed")}
						</a>
					</button>
				</div>
				{title && (
					<div className={styles["header-middle"]}>
						{useH1Title ? (
							<h1 className={styles["title"]}>{title}</h1>
						) : (
							<span className={styles["title"]}>{title}</span>
						)}
					</div>
				)}
				<div className={styles["header-left"]}>
					{hasActiveOrder ? renderOrderStatus() : null}
					{hasActiveOrder ? (
						<Separator className={styles["horizontal-line"]} />
					) : null}
					{showCart && (
						<>
							<button
								onClick={() => {
									AnalyticsService.homepage("Cart");
								}}>
								<Link
									href={Routes.cart}
									aria-label={translate("accessibility_labelCart")}>
									<div
										className={styles["cart-img"]}
										onClick={handleAnalytics}>
										<img
											src={CartIcon.src}
											alt={""}
											aria-hidden={true}
										/>
										<Notification
											className={"additional"}
											text={cartData?.itemCount}
											isCartNotification={true}
										/>
									</div>
								</Link>
							</button>
							<Separator className={styles["horizontal-line"]} />
						</>
					)}
					<button
						onClick={() => {
							isHomePage && AnalyticsService.homepage("Homepage");
						}}>
						<Link
							href={utm ? Routes.root + utm : Routes.root}
							passHref
							className={styles["logo"]}>
							<img
								src={Logo.src}
								alt={translate("accessibility_logo_toHomePage")}
							/>
							{isKosher ? (
								<span className={styles["kosher-title"]}>
									{translate("home_kosher_title")}
								</span>
							) : null}
						</Link>
					</button>
				</div>
			</div>
		);
	};

	const renderHeader = () => {
		return deviceState?.isDesktop ? renderDesktopHeader() : renderMobileHeader();
	};

	return (
		<>
			<div className={gradient ? styles["gradient"] : undefined}></div>
			<header className={clsx(styles["header-wrapper"])}>{renderHeader()}</header>
			<BurgerMenu />
		</>
	);
}

export default Header;
