import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Routes from "constants/routes";

import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import Layout from "containers/branches/layout";
import Button from "components/button";
import ChooseBranchWithLocation from "popups/components/Delivery/pickup/ChooseBranchFromListOrMap";

import BranchIcon from "/public/assets/icons/branch.svg";
import styles from "./city.module.scss";
import BackIcon from "/public/assets/icons/back-black.svg";
import Link from "next/dist/client/link";
import BranchPageContainer from "containers/branches/BranchPage";
import useCityBranches from "hooks/useCityBranches";
import useTranslate from "hooks/useTranslate";
import { useRouter } from "next/router";
import Actions from "redux/actions";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";

function CityPage({ city }) {
	const { isBranch } = useCityBranches(city);

	return isBranch === undefined ? null : isBranch ? (
		<BranchPageContainer
			city={undefined}
			branch={city}
			isOnCityPage={true}
		/>
	) : (
		<RenderCityPage city={city} />
	);
}

export default CityPage;

function RenderCityPage({ city }) {
	const cities = useSelector((store) => store.cities);
	const translate = useTranslate();
	const router = useRouter();
	const dispatch = useDispatch();
	const deviceState = useSelector((store) => store.deviceState);

	const cityData = cities && cities?.find((cityData) => cityData.url === city);

	function goToHomePage() {
		dispatch(Actions.setOrderPpoupState(true)); // pickup
		router.push(Routes.root);
	}

	function aboutCity() {
		return (
			<div className={styles["about-wrapper"]}>
				<h2 className={styles["about-title"]}>
					{translate("citiesScreen_cityAboutTitle").replace(
						"{city}",
						cityData?.name,
					)}
				</h2>
				<p className={styles["content"]}>{cityData?.about}</p>
			</div>
		);
	}

	return (
		<div className={styles["city-wrapper"]}>
			{city ? (
				deviceState.isDesktop ? (
					<CityDesktop
						city={cityData}
						aboutCity={aboutCity}
						onBtnClick={goToHomePage}
					/>
				) : (
					<CityMobile
						city={cityData}
						aboutCity={aboutCity}
						onBtnClick={goToHomePage}
					/>
				)
			) : null}
		</div>
	);
}

function CityMobile({ city, aboutCity, onBtnClick }) {
	const translate = useTranslate();

	return (
		<div className={styles["container"]}>
			<GeneralHeader
				backLink
				href={Routes.branches}
				title={translate("branchesScreen_header_title")}
				headerAsH1={false}
			/>

			<div className={styles["branch-icon-wrapper"]}>
				<img
					src={BranchIcon.src}
					alt="branch"
				/>
			</div>
			<h1 className={styles["title"]}>
				{translate("citiesScreen_cityTitle").replace("{city}", city.name)}
			</h1>
			<Button
				className={styles["order-button"]}
				text={translate("citiesScreen_btnText")}
				onClick={onBtnClick}
			/>

			<div className={styles["popup-like"]}>
				<ChooseBranchWithLocation
					showHeader={false}
					isOnBranchesScreen={true}
					showFilter={false}
					branchesToInclude={city.stores ?? []}
					extraDataFunc={aboutCity}
					useLink={true}
					showAutoComplete={true}
				/>
			</div>
		</div>
	);
}

function CityDesktop({ city, aboutCity, onBtnClick }) {
	const translate = useTranslate();

	return (
		<div className={styles["container-desktop"]}>
			<div className={styles["header"]}>
				<Link
					href={Routes.branches}
					className={styles["back-wrapper"]}>
					<div className={styles["back-icon-wrapper"]}>
						<img
							src={BackIcon.src}
							alt={"back"}
						/>
					</div>
				</Link>

				<h1 className={styles["title"]}>
					{translate("citiesScreen_cityTitle").replace("{city}", city.name)}
				</h1>
				<h2 className={styles["subtitle"]}>
					{translate("citiesScreen_citySubtitle")}
				</h2>
			</div>
			<ChooseBranchWithLocation
				showHeader={false}
				isOnBranchesScreen={true}
				showFilter={false}
				branchesToInclude={city.stores}
				extraDataFunc={aboutCity}
				addCustomScrollbar={true}
				useLink={true}
				shouldAsk={false}
			/>
			<div className={styles["gradient-bottom"]}>
				<Button
					className={styles["order-button"]}
					text={translate("citiesScreen_btnText")}
					onClick={onBtnClick}
				/>
			</div>
		</div>
	);
}

CityPage.getLayout = function getLayout(page) {
	return <Layout isCityPage={true}>{page}</Layout>;
};

export async function getStaticPaths({ locales }) {
	const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

	if (isrEnabled) {
		const { cities, branches } = await ISR.BranchesCities(false);

		const paths = [];

		if (cities && branches) {
			let branchesLeft = JSON.parse(JSON.stringify(branches));

			for (const key in cities) {
				const city = cities[key];
				const stores = city.stores ?? [];

				branchesLeft = branchesLeft.filter((branch) => !stores.includes(branch.id));
			}

			cities.map((city) => {
				if (city.url) {
					for (const locale of locales) {
						paths.push({ params: { city: city.url }, locale });
					}
				}
			});

			branchesLeft.map((branch) => {
				if (branch.url) {
					for (const locale of locales) {
						paths.push({ params: { city: branch.url }, locale });
					}
				}
			});
		}

		return { paths: paths, fallback: "blocking" };
	} else {
		return { paths: [], fallback: "blocking" };
	}
}

export const getStaticProps = reduxWrapper.getStaticProps(
	(store) =>
		async ({ params, locale }) => {
			ISR.setGlobalStore(store);
			const isrRevalidate = parseInt(process.env.NEXT_PUBLIC_ISR_REVALIDATE);
			const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

			if (isrEnabled) {
				try {
					await ISR.sharedRequests(locale);

					const currentBranch = params["city"];
					const { branchFound, cityFound } = await ISR.loadBranchData(
						"",
						currentBranch,
						locale,
					);

					return {
						props: { ...params },
						revalidate: isrRevalidate,
						notFound: !branchFound && !cityFound,
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
