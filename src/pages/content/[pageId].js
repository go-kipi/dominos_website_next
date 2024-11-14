import { useEffect } from "react";
import styles from "./contentPage.module.scss";

import Api from "api/requests";
import ISR from "utils/ISR";
import { reduxWrapper } from "redux/store";
import { useSelector } from "react-redux";
import HTMLDisplay from "components/HTMLDisplay";
import { useRouter } from "next/router";
import SRContent from "../../components/accessibility/srcontent";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import Header from "containers/header";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import { getLanguageFromLocale } from "utils/functions";

function ContentPage({ pageId }) {
	const contentPages = useSelector((store) => store.contentPages);
	const contentCdn = useSelector((store) => store.links?.cdn?.content);
	const deviceState = useSelector((store) => store.deviceState);

	const contentId = contentCdn[pageId];
	const router = useRouter();
	const route = `${router.locale}${router.asPath}`;
	const pageContent = contentPages[route];

	useEffect(() => {
		if (!pageContent) {
			const lang = getLanguageFromLocale(router.locale.replace("/", ""));
			Api.getContentPage(lang, contentId, route, onFailure);
			function onFailure() {
				router.replace("/404");
			}
		}
	}, [contentPages]);
	const regex = /<[^>]+>/g;
	const htmlString = pageContent?.html?.replace(regex, "");
	return (
		<div className={styles["content-page"]}>
			<BackgroundImage />

			{deviceState.isDesktop ? (
				<Header showCart={false} />
			) : (
				<GeneralHeader
					hamburger
					gradient
				/>
			)}

			<SRContent
				ariaLive={"polite"}
				message={htmlString}
			/>
			<div className={styles["content"]}>
				<HTMLDisplay html={pageContent?.html} />
			</div>
		</div>
	);
}

export default ContentPage;

export async function getStaticPaths({ locales }) {
	const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

	if (isrEnabled) {
		const paths = [];
		const { cdnUrl } = await ISR.ApiServer(false);
		const links = await ISR.getLinks("he", false, cdnUrl);
		const contentPages = Object.keys(links?.cdn?.content ?? {});

		if (contentPages) {
			for (const index in contentPages) {
				const page = contentPages[index];

				for (const locale of locales) {
					paths.push({ params: { pageId: page }, locale });
				}
			}
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

					await ISR.BranchesCities(true, locale);
					const pageId = params["pageId"];
					const route = `${locale}/content/${pageId}`;
					const cdnContent = store.getState().links?.cdn?.content ?? {};
					const id = cdnContent[pageId];
					const contentPage = await ISR.getContentPage(locale, id, route);

					await ISR.getGeneralMetaTags(locale, `/content/${pageId}`);

					return {
						props: { ...params },
						revalidate: isrRevalidate,
						notFound: !contentPage,
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
