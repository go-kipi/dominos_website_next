import { Provider, useSelector } from "react-redux";
import { reduxWrapper } from "redux/store";
import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider } from "react-dnd-multi-backend";
import ErrorBoundary from "components/error_boundary";
import { parseJTW } from "utils/functions";
import LanguageChange from "components/LanguageChange";
import { USER_PROPERTIES } from "constants/user-properties";
import LogRocket from "logrocket";

import ExternalScripts from "components/ExternalScripts/ExternalScripts";

import AllPages from "components/AllPages/AllPages";

if (isOnClient()) {
	LogRocket.init("fvg1z5/dominos");
}

const options = {
	enableMouseEvents: true,
	preview: true,
	delayTouchStart: 100,
	touchSlop: 20,
	ignoreContextMenu: true,
	// scrollAngleRanges: [{ start: 300 }, { end: 60 }, { start: 120, end: 240 }]
};
import "styles/accessibility.scss";
import "styles/blurPopup.scss";
import "styles/fullScreenPopup.scss";
import "styles/slidePopup.scss";
import "styles/popup.scss";
import "styles/app.scss";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "react-datepicker/dist/react-datepicker.css";
import "styles/slide.scss";
import LanguageDirectionService from "services/LanguageDirectionService";
import { isOnClient } from "utils/functions";
import { useEffect } from "react";
import Api from "api/requests";

const MyApp = ({ Component, ...rest }) => {
	const { store, props } = reduxWrapper.useWrappedStore(rest);
	if (store.getState().deviceState.isDesktop) delete options.delayTouchStart;
	if (store.getState().deviceState.isMobile) delete options.touchSlop;
	const getLayout = Component.getLayout ?? ((page) => page);

	useEffect(() => {
		Api.setGlobalStore(store);
	}, []);

	const asPath = rest.router.asPath;

	return (
		<>
			<ExternalScripts />

			<Provider store={store}>
				<ErrorBoundary>
					<DndProvider
						backend={TouchBackend}
						options={options}>
						<LanguageChange />
						<RenderComponentWithDirection>
							<AllPages path={asPath}>
								{getLayout(<Component {...props.pageProps} />)}
							</AllPages>
						</RenderComponentWithDirection>
					</DndProvider>
				</ErrorBoundary>
			</Provider>
		</>
	);
};

export default MyApp;

function RenderComponentWithDirection({ children }) {
	const lang = useSelector((store) => store.generalData.lang);

	return (
		<div
			id={"main"}
			className={!LanguageDirectionService.isRtlLanguage(lang) ? "ltr" : "rtl"}>
			{children}
		</div>
	);
}
