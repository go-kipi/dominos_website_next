import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import * as Routes from "constants/routes";
import SavedPizzaArea from "../SavedPizzaArea/SavedPizzaArea";
import PersonalAreaMenuMobile from "../PersonalAreaMenuMobile/PersonalAreaMenuMobile";
import PersonalAreaDetailsMobile from "containers/PersonalArea/PersonalAreaDetailsMobile/PersonalAreaDetailsMobile";
import PersonalAreaAddressessMobile from "../PersonalAreaAdressessMobile/PersonalAreaAddressessMobile";

import styles from "./PersonalAreaMobile.module.scss";
import PersonalAreaLang from "../PersonalAreaLang/PersonalAreaLang";
import PersonalAreaCreditMobile from "../PersonalAreaCreditMobile/PersonalAreaCreditMobile";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";

import { TransitionGroup, CSSTransition } from "react-transition-group";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import PERSONAL_AREA_SCREEN_TYPES from "constants/personal-area-screen-types";
import useAnimationDirection from "hooks/useAnimationDirection";
import { useSelector } from "react-redux";
import useTranslate from "hooks/useTranslate";

function PersonalAreaMobile({ deleteCustomer }) {
	const [currentScreen, setStack] = useStack(STACK_TYPES.PERSONAL_AREA);
	const animationClassTransition = useAnimationDirection();
	const stackState = useSelector(
		(store) => store.stackState[STACK_TYPES.PERSONAL_AREA],
	);
	const translate = useTranslate();

	useEffect(() => {
		setStack({
			type: PERSONAL_AREA_SCREEN_TYPES.MAIN,
			params: {},
		});
	}, []);

	function renderPage() {
		switch (currentScreen.type) {
			case PERSONAL_AREA_SCREEN_TYPES.PERSONAL_DEATILS:
				return <PersonalAreaDetailsMobile />;
			case PERSONAL_AREA_SCREEN_TYPES.CREDIT_CARD:
				return <PersonalAreaCreditMobile />;

			case PERSONAL_AREA_SCREEN_TYPES.LANG:
				return <PersonalAreaLang />;
			case PERSONAL_AREA_SCREEN_TYPES.ADDRESS:
				return <PersonalAreaAddressessMobile />;

			case PERSONAL_AREA_SCREEN_TYPES.MAIN:
				return renderSavedPizza();
			default:
				return <div />;
		}
	}

	const renderSavedPizza = () => {
		return (
			<div className={styles["personal-area-main-screen"]}>
				<GeneralHeader
					hamburger={true}
					title={translate("personalArea_header_title")}
					className={styles["absolute"]}
					gradient
				/>
				<SavedPizzaArea />
				<div className={styles["personal-area-menu-mobile-wrapper"]}>
					<PersonalAreaMenuMobile deleteCustomer={deleteCustomer} />
				</div>
			</div>
		);
	};
	if (!stackState) {
		return null;
	}

	return (
		stackState && (
			<div className={styles["personal-area-mobile-wrapper"]}>
				<TransitionGroup
					className={`${styles["transition-wrapper"]} ${styles[animationClassTransition]}`}>
					<CSSTransition
						key={currentScreen.type}
						timeout={300}
						classNames={styles["slide"]}
						enter={stackState?.length > 0}>
						{renderPage()}
					</CSSTransition>
				</TransitionGroup>
			</div>
		)
	);
}

export default PersonalAreaMobile;
