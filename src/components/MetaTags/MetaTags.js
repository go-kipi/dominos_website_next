import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

const noIndexPages = [
	"menu",
	"cart",
	"tracker",
	"personal-area",
	"bit-payment",
	"benefits",
];

// const defaultTitle = "דומינו׳ס פיצה";
const defaultTitle = "Domino's Pizza";

function MetaTags({ path }) {
	let shouldIndex = true;
	for (const key in noIndexPages) {
		const page = noIndexPages[key];
		if (path.includes(page)) {
			shouldIndex = false;
		}
	}
	const metaTags = useSelector((store) => store.metaTags);

	const defaultCanonicalRoute =
		process.env.NEXT_PUBLIC_CANONICAL_HOSTNAME + path;

	const title = metaTags?.title || defaultTitle;
	const canonical = metaTags?.canonical || defaultCanonicalRoute;
	let metaIndexValue = !shouldIndex ? "noindex" : "index, follow";

	return (
		<Head>
			<meta
				httpEquiv="Content-Type"
				content="text/html; charset=utf-8"
			/>

			<title>{title}</title>
			<meta
				name="description"
				content={metaTags?.metaDescription}
			/>
			<link
				rel="canonical"
				href={canonical}
			/>
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes"
			/>
			<meta
				name="robots"
				content={"noindex"}
			/>
			<link
				rel="icon"
				href="/favicon.ico"
			/>
			<link
				rel="sitemap"
				type="application/xml"
				title="Sitemap"
				href="/sitemap.xml"
			/>
		</Head>
	);
}

export default MetaTags;
