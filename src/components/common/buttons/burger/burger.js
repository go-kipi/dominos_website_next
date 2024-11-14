import React from "react";
import styles from "./burger.module.scss";

import BurgerIcon from "/public/assets/icons/menu-icon.svg";
import useBenefits from "hooks/useBenefits";
import useTranslate from "../../../../hooks/useTranslate";
import Notification from "components/notification";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

function Burger(props) {
	const benefits = useBenefits();
	const numberOfBenfits = benefits.length;
	const dispatch = useDispatch();
	const burgerState = useSelector((store) => store?.burgerState);
	const { onHomepageClick } = props;

	const handleBurgerClick = () => {
		dispatch(Actions.setBurger(true));
		AnalyticsService.navBarClick("nav_bar");
		typeof onHomepageClick === "function" && onHomepageClick();
	};

	const translate = useTranslate();
	return (
		<button
			className={styles["burger-icon"]}
			id="burger-icon"
			onClick={handleBurgerClick}
			aria-expanded={burgerState}
			aria-label={translate("accessibility_imageAlt_menu")}>
			<img
				src={BurgerIcon.src}
				alt={"menu"}
				aria-hidden={true}
			/>
			{!!numberOfBenfits && (
				<Notification
					className={styles["additional"]}
					text={numberOfBenfits}
				/>
			)}
		</button>
	);
}

export default Burger;
