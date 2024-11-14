import PersonalAreaCreditCardDesktop from "containers/PersonalArea/PersonalAreaCreditCardDesktop/PersonalAreaCreditCardDesktop";
import React from "react";
import Layout from "../layout";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";
import Api from "api/requests";

export default function SavedCreditCardsPage() {
	return (
		<>
			<PersonalAreaCreditCardDesktop />
		</>
	);
}
SavedCreditCardsPage.getLayout = function getLayout(page) {
	return <Layout>{page}</Layout>;
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

					await ISR.getGeneralMetaTags(locale, "/personal-area");

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
