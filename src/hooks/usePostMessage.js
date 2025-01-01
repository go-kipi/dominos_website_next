import { isDomainAllowedToPostMessage } from "utils/functions";
import useTranslate from "./useTranslate";
import Actions from "redux/actions";
import * as popups from "constants/popup-types";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function usePostMessage(onSuccess, onError) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleError = (message) => {
		typeof onError === "function" && onError(message);

		dispatch(
			Actions.addPopup({
				type: popups.GENERAL_MESSAGE,
				payload: {
					text: translate(message),
					btnText: translate("errorPopup_btn_label"),
				},
			}),
		);
	};

	useEffect(() => {
		const onMessage = (message) => {
			const messageOrigin = message.origin;
			const isAllowed = isDomainAllowedToPostMessage(messageOrigin);
			if (isAllowed) {
				switch (message.data.action) {
					case "success":
						typeof onSuccess === "function" && onSuccess();
						break;
					case "error":
					default:
						handleError(message.data.message);
						break;
				}
			}
		};
		window.addEventListener("message", onMessage);
		return () => {
			window.removeEventListener("message", onMessage);
		};
	}, []);
}

export default usePostMessage;
