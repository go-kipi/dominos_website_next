import HomePage from "containers/home";
import { reduxWrapper } from "redux/store";
import ApiISR from "utils/ISR/ApiISR";

export default function Home(props) {
	return (
		<>
			<main>
				<HomePage />
			</main>
		</>
	);
}

export const getStaticProps = reduxWrapper.getStaticProps(
	(store) =>
		async ({ params, locale }) => {
			const isrRevalidate = parseInt(process.env.NEXT_PUBLIC_ISR_REVALIDATE);
			const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

			if (isrEnabled) {
				try {
					await ApiISR.init(store);
					await ApiISR.sharedRequests(locale);
					await ApiISR.getGeneralMetaTags(locale, "/main");

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
