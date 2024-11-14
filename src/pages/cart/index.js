import Api from "api/requests";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import ShoppingCart from "containers/ShoppingCart";
import React from "react";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";

function CartPage() {
	return (
		<>
			<BackgroundImage />
			<ShoppingCart />
		</>
	);
}

export default CartPage;

export const getStaticProps = reduxWrapper.getStaticProps(
	(store) =>
		async ({ params, locale }) => {
			ISR.setGlobalStore(store);
			const isrRevalidate = parseInt(process.env.NEXT_PUBLIC_ISR_REVALIDATE);
			const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

			if (isrEnabled) {
				try {
					await ISR.sharedRequests(locale);

					await ISR.getGeneralMetaTags(locale, "/cart");

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
