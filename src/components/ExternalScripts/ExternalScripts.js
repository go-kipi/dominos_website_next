import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";
import BitService from "services/Bit";

export default function ExternalScripts() {
	const router = useRouter();

	useEffect(() => {
		if (router.pathname === "/") {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.defer = "defer";
			script.src = "https://bringthemhomenow.net/1.1.0/hostages-ticker.js";
			script.setAttribute(
				"integrity",
				"sha384-DHuakkmS4DXvIW79Ttuqjvl95NepBRwfVGx6bmqBJVVwqsosq8hROrydHItKdsne",
			);
			script.setAttribute("crossorigin", "anonymous");
			document.getElementsByTagName("body")[0].appendChild(script);
		}
	}, []);

	return (
		<>
			<Script
				id="google-tag-manager"
				strategy="afterInteractive">
				{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-WFF3NR');`}
			</Script>

			<Script
				id="bit"
				src={"https://public.bankhapoalim.co.il/bitcom/sdk"}
				onLoad={() => {
					if (window.BitPayment) {
						BitService.setBitPayment(window.BitPayment);
					}
				}}></Script>

			<Script
				src="https://www.google.com/recaptcha/api.js?render=6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
				onLoad={() => {
					window.grecaptcha.ready(() => {
						const element = document.querySelector(".grecaptcha-badge");
						element.setAttribute("aria-hidden", "true");
					});
				}}></Script>

			<Script
				id="scarab-js"
				strategy="afterInteractive">
				{`
					var ScarabQueue = ScarabQueue || [];
					(function(id) {
						if (document.getElementById(id)) return;
						var js = document.createElement('script'); js.id = id;
						js.src = '//cdn.scarabresearch.com/js/19FA5F5B30298B5E/scarab-v2.js';
						var fs = document.getElementsByTagName('script')[0];
						fs.parentNode.insertBefore(js, fs);
					})('scarab-js-api');
				`}
			</Script>
		</>
	);
}
