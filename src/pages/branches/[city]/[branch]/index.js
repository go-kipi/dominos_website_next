import React from "react";
import Layout from "containers/branches/layout";
import BranchPageContainer from "containers/branches/BranchPage";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";
import { useRouter } from "next/router";
import Api from "api/requests";

export default function BranchPage(props) {
	return <BranchPageContainer {...props} />;
}

BranchPage.getLayout = function getLayout(page) {
	return <Layout>{page}</Layout>;
};

export async function getStaticPaths({ locales }) {
	const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);
	if (isrEnabled) {
		const { cities, branches } = await ISR.BranchesCities(false);

		const paths = [];

		if (cities && branches) {
			let branchesLeft = JSON.parse(JSON.stringify(branches));

			let storesInCities = [];

			for (const key in cities) {
				const city = cities[key];
				const stores = city.stores;
				storesInCities = storesInCities.concat(stores);
			}

			branchesLeft = branchesLeft.filter((branch) =>
				storesInCities.includes(branch.id),
			);

			branchesLeft.map((branch) => {
				if (branch.url && branch.cityUrl) {
					for (const locale of locales) {
						paths.push({
							params: { branch: branch.url, city: branch.cityUrl },
							locale,
						});
					}
				}
			});
		}
		return { paths, fallback: "blocking" };
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

					const currentBranch = params["branch"];
					const currentCity = params["city"];
					const { branchFound } = await ISR.loadBranchData(
						currentBranch,
						currentCity,
						locale,
					);

					return {
						props: { ...params },
						revalidate: isrRevalidate,
						notFound: !branchFound,
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
