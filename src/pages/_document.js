import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<meta charSet="UTF-8" />
					<link
						rel="preload"
						href="/fonts/EzerDoo-Black.woff"
						as="font"
						type="font/woff"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						href="/fonts/EzerDoo-Regular.woff"
						as="font"
						type="font/woff"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						href="/fonts/EzerDoo-Book.woff"
						as="font"
						type="font/woff"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						href="/fonts/EzerDoo-Bold.woff"
						as="font"
						type="font/woff"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						href="/fonts/EzerDoo-Medium.woff"
						as="font"
						type="font/woff"
						crossOrigin="anonymous"
					/>
				</Head>
				<body>
					<noscript>
						<iframe
							src="https://www.googletagmanager.com/ns.html?id=GTM-WFF3NR"
							height="0"
							width="0"
							style={{ display: "none" }}></iframe>
					</noscript>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
