import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Assets
import styles from "./MenuHeader.module.scss";

import Logo from "/public/assets/logos/dominos-logo.svg";
import CouponMenu from "/public/assets/icons/coupon-menu.svg";
import CartIcon from "/public/assets/icons/cart.svg";
// routing constants
import * as Routes from "constants/routes";
import * as popupsTypes from "constants/popup-types";

// Actions
import Notification from "components/notification";
import Link from "next/link";
import clsx from "clsx";
import Burger from "components/common/buttons/burger/burger";
import useTranslate from "hooks/useTranslate";

import CouponHe from "/public/assets/icons/coupon-menu-he.svg";
import CouponEn from "/public/assets/icons/coupon-menu-enUS.svg";
import Actions from "redux/actions";
import { LANGUAGES } from "constants/Languages";
import dynamic from "next/dynamic";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";
// Components
const BurgerMenu = dynamic(() => import("containers/header/BurgerMenu"), {
	loading: () => <div />,
});

function MenuHeader(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const cartData = useSelector((store) => store.cartData);
	const [badgeClassName, setBadgeClassName] = useState("");
	const lang = useSelector((store) => store.generalData?.lang);
	const utm = useSelector((store) => store.generalData?.utmSource);

	const translate = useTranslate();
	const dispatch = useDispatch();

	const [isOnTop, setIsOnTop] = useState(true);

	useEffect(() => {
		setBadgeClassName(styles["scale"]);
		setTimeout(() => {
			setBadgeClassName("");
		}, 300);
	}, [cartData?.itemCount]);

	useEffect(() => {
		window.addEventListener("scroll", onScrollHandler);
		return () => {
			window.removeEventListener("scroll", onScrollHandler);
		};
	}, [deviceState]);

	function openCouponPopup() {
		dispatch(
			Actions.addPopup({
				type: popupsTypes.COUPON,
				payload: {},
			}),
		);
	}

	function onScrollHandler(e) {
		if (deviceState.isDesktop) {
			setIsOnTop(window.scrollY === 0);
		} else {
			setIsOnTop(true);
		}
	}

	const Coupon =
		lang === LANGUAGES.HEBREW.name
			? CouponHe
			: lang === LANGUAGES.ENGLISH.name
			? CouponEn
			: null;

	const renderHeader = () => {
		const cartLabel = cartData?.itemCount
			? translate("accessibility_cart_itemsAmount").replace(
					"{items}",
					cartData?.itemCount,
			  )
			: "";
		return (
			<div className={styles["header"]}>
				<div className={styles["header-inner"]}>
					<div className={styles["header-right"]}>
						<Burger />
					</div>

					<div className={styles["header-middle"]}>
						{deviceState.isDesktop && (
							<Link
								className={clsx(styles["hiddable"], !isOnTop ? styles["hide"] : "")}
								href={utm ? Routes.root + utm : Routes.root}
								aria-label={translate("accessibility_logo_toHomePage")}>
								<div className={styles["logo"]}>
									<img
										src={Logo.src}
										alt={""}
										aria-hidden={true}
									/>
								</div>
							</Link>
						)}

						{deviceState.notDesktop && (
							<h1
								className={styles["header-title"]}
								aria-live={"polite"}>
								{translate("menu_header_title")}
							</h1>
						)}
					</div>
					<div className={styles["header-left"]}>
						<button
							className={clsx(
								styles["coupon-btn"],
								styles["hiddable"],
								!isOnTop ? styles["hide"] : "",
							)}
							onClick={openCouponPopup}>
							<div className={styles["coupon-img"]}>
								{deviceState.notDesktop ? (
									<img
										src={Coupon.src}
										alt={"coupon"}
									/>
								) : (
									<>
										<img
											className={styles["coupon-menu-img"]}
											src={CouponMenu.src}
										/>
										<span className={styles["coupon-text"]}>
											{translate("menu_header_couponTitle")}
										</span>
									</>
								)}
							</div>
						</button>
						<Link
							role={"button"}
							className={styles["cart-img-wrapper"]}
							aria-label={`${createAccessibilityText(
								translate("accessibility_labelCart"),
								cartLabel,
							)}`}
							href={Routes.cart}
							id={"cart-icon"}>
							<div
								className={styles["cart-img"]}
								id="cart-icon">
								<img
									src={CartIcon.src}
									alt={""}
								/>
								<Notification
									className={clsx(styles["additional"], badgeClassName)}
									text={cartData?.itemCount}
									isCartNotification={true}
								/>
							</div>
						</Link>
					</div>
				</div>
			</div>
		);
	};

	return (
		<header className={styles["menu-header-wrapper"]}>
			{renderHeader()}
			<BurgerMenu />
		</header>
	);
}

export default MenuHeader;
