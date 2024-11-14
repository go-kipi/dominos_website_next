import React, { useEffect, useRef } from "react";
// import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { useRouter } from "next/router";

import PersonalAreaMenuDesktop from "../PersonalAreaMenuDesktop/PersonalAreaMenuDesktop";

import * as Routes from "constants/routes";

import styles from "./PersonalAreaDesktop.module.scss";

import clsx from "clsx";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import useTranslate from "hooks/useTranslate";

function PersonalAreaDesktop({ deleteCustomer, children }) {
	const router = useRouter();
	const mainContainerRef = useRef();
	const translate = useTranslate();

	useEffect(() => {
		mainContainerRef.current?.focus();
	}, [children]);

	return (
		<div className={styles["perosnal-area-wrapper-desktop"]}>
			<GeneralHeader
				className={styles["personal-custom-header"]}
				hamburger
				title={translate("personalArea_header_title")}
			/>

			<div className={styles["personal-area-container"]}>
				<PersonalAreaMenuDesktop deleteCustomer={deleteCustomer} />
				<div
					ref={mainContainerRef}
					className={clsx(
						styles["personal-area-main-container"],
						isWhiteBackground(router.pathname) ? styles["white"] : "",
					)}
					tabIndex={0}>
					{children}
				</div>
			</div>
		</div>
	);
}

export default PersonalAreaDesktop;

function isWhiteBackground(path) {
	const transparentPaths = [Routes.personalAreaSavedPizza];
	return !transparentPaths.includes(path);
}
