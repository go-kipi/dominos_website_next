import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import * as Routes from "constants/routes";
import Layout from "../layout";
import ISR from "utils/ISR";
import { reduxWrapper } from "redux/store";
import Api from "api/requests";

export default function AddCreditCardPage() {
	const router = useRouter();
	const deviceState = useSelector((store) => store.deviceState);
	useEffect(() => {
		if (!deviceState.isMobile) {
			router.push(Routes.personalArea);
		}
	}, []);

	return <></>;
}

AddCreditCardPage.getLayout = function getLayout(page) {
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
