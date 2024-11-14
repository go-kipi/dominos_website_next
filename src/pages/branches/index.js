import React from "react";
import { useSelector } from "react-redux";

import BranchesMobile from "../../containers/branches/branchesMobile";
import BranchesDesktop from "../../containers/branches/branchesDesktop";
import Layout from "../../containers/branches/layout";

import useTranslate from "hooks/useTranslate";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";
import Api from "api/requests";

function BranchesPage(props) {
	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();

	return deviceState.isDesktop ? (
		<BranchesDesktop title={translate("branchesScreen_header_title")} />
	) : (
		<BranchesMobile title={translate("branchesScreen_header_title")} />
	);
}

export default BranchesPage;

BranchesPage.getLayout = function getLayout(page) {
	return <Layout isBranchScreen={false}>{page}</Layout>;
};

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
					await ISR.getGeneralMetaTags(locale, "/branches");

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
