import { useEffect } from "react";
import * as popups from "constants/popup-types";
import useTranslate from "hooks/useTranslate";
import Actions from "redux/actions";
import { useDispatch } from "react-redux";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";

function Bit() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(
			Actions.addPopup({
				type: popups.GENERAL_MESSAGE,
				payload: {
					text: translate("bitPopup_text"),
					showCloseIcon: false,
					enableClickOutside: false,
				},
			}),
		);
	}, []);
	return (
		<>
			<BackgroundImage />
		</>
	);
}
export default Bit;
