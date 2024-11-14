import { useEffect, useState } from "react";

export default function useIsSafari() {
	const [isSafari, setIsSafari] = useState(false);

	useEffect(() => {
		const browser = navigator.userAgent.match(
			/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
		)[1];
		setIsSafari(browser.toLocaleLowerCase() === "safari");
	}, []);
	return isSafari;
}
