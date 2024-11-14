import axios from "axios";
import * as Routes from "constants/routes";

const baseUrl = process.env["NEXT_PUBLIC_CANONICAL_HOSTNAME"];
const excludeList = [
	"/",
	"/menu",
	"/personal-area",
	"/cart",
	"/tracker",
	"/personal-area/add-credit-card",
	"/personal-area/language",
	"/personal-area/saved-credit-cards",
	"/personal-area/saved-addresses",
	"/personal-area/personal-details",
	"/personal-area/saved-pizzas",
	"/benefits",
	"bit-payment",
];
const links = [];
const locales = ["", "/en"];

const SiteMapXmlService = (() => {
	let apiUrl = "";
	let accessToken = "";
	let cities = [];
	let stores = [];
	let cdnUrl = "";
	const versions = {};
	let urls = {};

	async function init() {
		addLinksFromStaticRoutes();
		await getApiCalls();
		addLinksFromCities();
		addLinksFromBranches();
		addLinkFromContent();

		return getXML();
	}

	async function apiCall(url, data, headers = {}, method = "post") {
		const settings = {
			url: url,
			data: data,
			method: method,
			headers: headers,
		};

		const res = await axios(settings);

		if (res.status === 200) {
			return res?.data;
		}
		return res;
	}

	async function getApiCalls() {
		const apiData = await apiCall(
			"https://ver-api.heilasystems.com/getServerValidateVersion",
			{
				deviceType: "web",
				appVersion: "0.13.0",
			},
		);
		apiUrl = apiData?.data?.servers?.api;
		cdnUrl = apiData?.data.servers.cdn;

		const tokens = await apiCall(apiUrl + "/connect", {
			lang: "he",
			hardware: "PC",
			runtime: "browser",
			appVersion: "0.97",
			browserType: "browser",
			os: "macOS",
			deviceModel: "",
			referrer: "",
		});
		accessToken = tokens?.data?.accessToken;
		const citiesRes = await apiCall(
			apiUrl + "/getCities",
			{},
			{ token: accessToken },
		);
		cities = citiesRes?.data?.cities;

		const storesRes = await apiCall(
			apiUrl + "/getStoreList",
			{},
			{ token: accessToken },
		);
		stores = storesRes?.data;

		await getVersion("url");

		const urlForUrl = cdnUrl + `url/urls.he.v${versions["url"]}.json`;
		urls = await apiCall(urlForUrl, undefined, {}, "get");
	}

	function addLinksFromStaticRoutes() {
		for (const locale of locales) {
			links.push({
				url: baseUrl + locale + Routes.root,
				changefreq: "daily",
				priority: 1,
			});
		}

		const routes = Object.values(Routes);

		const leftRoutes = routes.filter((route) => !excludeList.includes(route));

		for (var line = 0; line < leftRoutes.length; line++) {
			const url = leftRoutes[line];
			for (const locale of locales) {
				links.push({
					url: baseUrl + locale + url,
					changefreq: "daily",
					priority: 1,
				});
			}
		}
	}

	function addLinksFromCities() {
		for (const key in cities) {
			const city = cities[key];
			const url = city.url;
			for (const locale of locales) {
				links.push({
					url: `${baseUrl}${locale}/branches/${url}`,
					changefreq: "daily",
					priority: 0.5,
				});
			}
		}
	}

	function addLinksFromBranches() {
		for (const key in stores) {
			const store = stores[key];
			let url = "";
			if (store.cityUrl) {
				url += "/" + store.cityUrl;
			}
			if (store.url) {
				url += "/" + store.url;
			}

			if (url) {
				for (const locale of locales) {
					links.push({
						url: `${baseUrl}${locale}/branches${url}`,
						changefreq: "daily",
						priority: 0.8,
					});
				}
			}
		}
	}

	async function getVersion(path) {
		if (versions[path]) return versions[path];

		// If no version is found
		const fullPath = cdnUrl + `${path}/${path}.ver`;
		versions[path] = await apiCall(fullPath, undefined, {}, "get");

		return versions[path];
	}

	function addLinkFromContent() {
		const contentMap = urls.cdn.content;
		for (const url in contentMap) {
			links.push({
				url: `${baseUrl}/content/${url}`,
				changefreq: "daily",
				priority: 1,
			});
		}
	}

	function getXML() {
		let xml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
		for (const link of links) {
			const linkXML = `
                    <url>
                        <loc>${link.url}</loc>
                        <changefreq>${link.changefreq}</changefreq>
                        <priority>${link.priority}</priority>
						<lastmod>${new Date().toISOString()}</lastmod>
                    </url>`;

			xml += linkXML;
		}
		xml += "</urlset>";

		return `<xml version="1.0" encoding="UTF-8">
			${xml}
		</xml>`;
	}

	return {
		init,
	};
})();

export async function getServerSideProps({ res }) {
	// Generate the XML sitemap with the blog data

	const sitemap = await SiteMapXmlService.init();

	res.setHeader("Content-Type", "application/xml");
	// Send the XML to the browser
	res.write(sitemap);
	res.end();

	return {
		props: {},
	};
}

export default function SiteMap() {}
