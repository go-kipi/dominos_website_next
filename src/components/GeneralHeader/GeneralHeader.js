import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Routes from "constants/routes";

import Notification from "components/notification";

import Back from "/public/assets/icons/back.svg";
import Logo from "/public/assets/logos/dominos-logo-with-name.svg";
import { useRouter } from "next/router";

import styles from "./GeneralHeader.module.scss";

import CartIcon from "/public/assets/icons/cart.svg";
import Link from "next/link";
import useTranslate from "../../hooks/useTranslate";
import Burger from "components/common/buttons/burger/burger";
import dynamic from "next/dynamic";

const BurgerMenu = dynamic(() => import("containers/header/BurgerMenu"), {
	loading: () => <div />,
});

function GeneralHeader(props) {
	const {
		title,
		back,
		hamburger,
		className,
		cart,
		backLink,
		href = "/",
		gradient,
		backOnClick = undefined,

		headerAsH1 = true,
	} = props;
	const deviceState = useSelector((store) => store.deviceState);
	const dispatch = useDispatch();
	const router = useRouter();
	const cartData = useSelector((store) => store.cartData);
	const translate = useTranslate();
	const catalogProducts = useSelector(
		(store) => store.menusData?.catalogProducts,
	);

	const handleGoBack = () => {
		if (backOnClick && typeof backOnClick === "function") {
			return backOnClick();
		}
		router.back();
	};

	function renderHeader() {
		return (
			<div className={`${styles["header"]}  ${className}`}>
				<div className={styles["header-right"]}>
					{hamburger && <Burger />}
					{back && (
						<button
							className={styles["back-icon"]}
							aria-label={translate("accessibility_alt_arrowBack")}
							onClick={handleGoBack}>
							<img
								src={Back.src}
								alt={""}
							/>
						</button>
					)}
					{backLink && (
						<Link
							href={href}
							className={styles["back-icon"]}
							aria-hidden={true}>
							<img
								src={Back.src}
								alt="arrow icon"
							/>
						</Link>
					)}
				</div>

				{deviceState.notDesktop && (
					<div className={styles["header-middle"]}>
						{headerAsH1 ? (
							<h1 className={styles["header-title"]}>{title}</h1>
						) : (
							<span className={styles["header-title"]}>{title}</span>
						)}
					</div>
				)}

				{deviceState.notDesktop && cart && (
					<div className={styles["header-left"]}>
						<Link href={Routes.cart}>
							<div
								aria-label={translate("accessibility_labelCart")}
								role={"button"}
								className={styles["cart-img"]}
								id="cart-icon">
								<img
									src={CartIcon.src}
									alt={""}
								/>
								<Notification
									className={styles["additional"]}
									text={cartData?.itemCount}
									isCartNotification={true}
								/>
							</div>
						</Link>
					</div>
				)}
				{deviceState.isDesktop && (
					<div className={styles["header-left"]}>
						<button
							onClick={() => router.push(Routes.root)}
							className={styles["header-logo-wrapper"]}
							aria-label={translate("accessibility_logo_toHomePage")}>
							<img
								src={Logo.src}
								alt={""}
							/>
						</button>
					</div>
				)}
			</div>
		);
	}

	return (
		<header
			className={`${styles["general-header-wrapper"]} ${
				gradient ? styles["gradient"] : ""
			}`}>
			{renderHeader()}
			<BurgerMenu />
		</header>
	);
}

export default GeneralHeader;
