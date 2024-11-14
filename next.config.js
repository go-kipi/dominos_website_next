const json = require("./public/redirects.json");

const { version } = require("./package.json");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
	reactStrictMode: false,

	i18n: {
		// These are all the locales you want to support in
		// your application
		locales: ["en", "he"],
		// This is the default locale you want to be used when visiting
		// a non-locale prefixed path e.g. `/hello`
		defaultLocale: "he",
		localeDetection: false,
	},

	async redirects() {
		const json = require("./public/redirects.json");

		return json;
	},

	async rewrites() {
		return [
			{
				source: "/assets/:slug*",
				destination: `https://dominos-cdn.heilasystems.com/assets/:slug*`,
			},
		];
	},

	publicRuntimeConfig: {
		version,
	},
	webpack: (config) => {
		config.resolve.alias.canvas = false;

		return config;
	},

	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "X-Permitted-Cross-Domain-Policies",
						value: "none",
					},
					{
						key: "Referrer-Policy",
						value: "no-referrer-when-downgrade",
					},
					{
						key: "Cross-Origin-Embedder-Policy",
						value: "unsafe-none",
					},
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin-allow-popups",
					},
				],
			},
		];
	},
});
