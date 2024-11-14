import { useRef, useState } from "react";
import useDebounce from "./useDebounce";

function usePreventRageClick(callback, delay) {
	const [isDisbaled, setIsDisabled] = useState(false);
	const isDisbaledRef = useRef(false);
	function callbackHandler(...args) {
		setIsDisabled(true);
		if (!isDisbaledRef.current) {
			isDisbaledRef.current = true;

			typeof callback === "function" && callback(...args);
		}
		setTimeout(() => {
			setIsDisabled(false);
			isDisbaledRef.current = false;
		}, 1500);
	}
	const debounce = useDebounce(callbackHandler, delay);

	return [debounce, isDisbaled];
}

export default usePreventRageClick;
