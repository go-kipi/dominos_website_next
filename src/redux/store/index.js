import { configureStore } from "@reduxjs/toolkit";
import Reducers from "redux/reducers";

import { createWrapper } from "next-redux-wrapper";

let Store;
const makeStore = () => {
	Store = configureStore({
		reducer: Reducers,
		/* remove warning for non serialized data in store */
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false,
			}),
	});
	return Store;
};

export const reduxWrapper = createWrapper(makeStore);

export { Store };
