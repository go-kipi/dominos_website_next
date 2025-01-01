import { useEffect, useState } from "react";

export default function useIsSafari() {
	const [isSafari, setIsSafari] = useState(false);

	useEffect(() => {
		try {
			const match = navigator.userAgent.match(
				/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
			);
			const browser = match && match[1] ? match[1] : "";
			setIsSafari(browser.toLowerCase() === "safari");
		} catch (error) {
			console.warn("Error detecting Safari browser:", error);
			setIsSafari(false);
		}
	}, []);

	return isSafari;
}
