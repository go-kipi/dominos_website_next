import React, { useEffect, useState } from "react";

import styles from "./bigOrders.module.scss";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import useTranslate from "hooks/useTranslate";
import BigOrdersForm from "components/BigOrdersForm/BigOrdersForm";
import BreadCrumbs from "components/breadcrumbs";
import * as Routes from "constants/routes";
import Header from "containers/header";
import { useSelector } from "react-redux";
import clsx from "clsx";
import STACK_TYPES from "constants/stack-types";
import useStack from "hooks/useStack";
import BIG_ORDERS_SCREEN_TYPES from "constants/bigOrdersScreenTypes";
import BigOrdersSuccess from "components/BigOrdersSuccess/BigOrdersSuccess";
import SlideAnimation from "components/SlideAnimation/SlideAnimation";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";
import Api from "api/requests";

function BigOrders(props) {
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const stackState =
		useSelector((store) => store.stackState[STACK_TYPES.BIG_ORDERS]) ?? [];
	const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.BIG_ORDERS);

	useEffect(() => {
		setStack({ type: BIG_ORDERS_SCREEN_TYPES.FORM, params: {} });
	}, []);

	function RenderScreen() {
		let component;

		switch (currentScreen.type) {
			case BIG_ORDERS_SCREEN_TYPES.FORM:
				component = <BigOrdersForm setStack={setStack} />;
				break;

			case BIG_ORDERS_SCREEN_TYPES.SUCCESS:
				component = <BigOrdersSuccess onCloseClick={goBack} />;
				break;

			default:
				component = (
					<div
						className={"visually-hidden"}
						tabIndex={0}
					/>
				); // Must for focusTrap to work!
				break;
		}

		return component;
	}

	return (
		<div className={styles["bigOrders-page-wrapper"]}>
			<BackgroundImage className={styles["background-image"]} />

			{deviceState.isDesktop ? (
				<>
					<div className={clsx(styles["liner"], styles["liner-right"])} />
					<div className={clsx(styles["liner"], styles["liner-left"])} />

					<Header title={translate("bigOrdersScreen_header_title")} />
				</>
			) : (
				<>
					<div className={styles["liner-top"]} />
					<GeneralHeader
						hamburger
						title={translate("bigOrdersScreen_header_title")}
					/>
				</>
			)}

			<BreadCrumbs
				root={{ route: Routes.root, name: translate("breadcrumbs_root") }}
				crumbs={{
					routes: [Routes.bigOrders],
					names: [translate("breadcrumbs_bigOrders")],
				}}
				className={styles["custom-breadcrumbs"]}
			/>
			<div className={styles["big-orders-form-wrapper"]}>
				<SlideAnimation stack={STACK_TYPES.BIG_ORDERS}>
					{RenderScreen()}
				</SlideAnimation>
			</div>
		</div>
	);
}

export default BigOrders;

export const getStaticProps = reduxWrapper.getStaticProps(
	(store) =>
		async ({ params, locale }) => {
			ISR.setGlobalStore(store);
			const isrRevalidate = parseInt(process.env.NEXT_PUBLIC_ISR_REVALIDATE);
			const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

			if (isrEnabled) {
				try {
					await ISR.sharedRequests(locale);
					await ISR.BranchesCities(true, locale);
					await ISR.getGeneralMetaTags(locale, "/large-orders");

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
