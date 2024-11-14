import { createSlice } from "@reduxjs/toolkit";

import { generateUniqueId } from "utils/functions";
import * as onboardinTypes from "constants/onboarding-types";
import { META_ENUM } from "../../../constants/menu-meta-tags";

const Slices = [];
let stateReducers = {};
let stateActions = {};

export const deviceSlice = createSlice({
	name: "deviceState",
	initialState: false,
	reducers: {
		setDeviceState: (state, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(deviceSlice);

export const languageFlag = createSlice({
	name: "languageFlag",
	initialState: false,
	reducers: {
		changeLanguage: (state, action) => {
			return action.payload;
		},
		resetLanguageFlag: () => false,
	},
});

// Action creators are generated for each case reducer function
Slices.push(languageFlag);

export const showFooter = createSlice({
	name: "showFooter",
	initialState: false,
	reducers: {
		showFooter: () => true,
		hideFooter: () => false,
	},
});

// Action creators are generated for each case reducer function
Slices.push(showFooter);

/* --------------------------------------------------------------- */

export const loaderSlice = createSlice({
	name: "loaderState",
	initialState: false,
	reducers: {
		setLoader: (state, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(loaderSlice);

/* --------------------------------------------------------------- */

export const popupsSlice = createSlice({
	name: "popupsArray",
	initialState: [],
	reducers: {
		addPopup: (state, action) => {
			const { payload = {}, type, priority = 1 } = action.payload;
			const key = generateUniqueId(5);
			const popup = {
				payload,
				type,
				priority,
				key,
			};
			state.push(popup);
			state.sort((a, b) => a.priority - b.priority);
			return state;
		},
		removePopup: (state, action) => {
			const key = action.payload;
			if (key) {
				return state.filter((popup) => popup.key !== key);
			} else {
				return state.slice(0, state.length - 1);
			}
		},
		resetPopups: () => [],
	},
});

// Action creators are generated for each case reducer function
Slices.push(popupsSlice);

/* --------------------------------------------------------------- */

export const requestingSlice = createSlice({
	name: "requestingState",
	initialState: false,
	reducers: {
		requestStarted: () => true,
		requestEnded: () => false,
	},
});

// Action creators are generated for each case reducer function
Slices.push(requestingSlice);
/* --------------------------------------------------------------- */

export const isBuilderActiveSlice = createSlice({
	name: "isBuilderActive",
	initialState: false,
	reducers: {
		setIsBuilderActive: (state, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(isBuilderActiveSlice);
/* --------------------------------------------------------------- */

export const isFlowStopperSlice = createSlice({
	name: "isFlowStopper",
	initialState: false,
	reducers: {
		setIsFlowStopper: (state, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(isFlowStopperSlice);

/* --------------------------------------------------------------- */

export const burgerSlice = createSlice({
	name: "burgerState",
	initialState: false,
	reducers: {
		setBurger: (_, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(burgerSlice);

/* --------------------------------------------------------------- */

/* --------------------------------------------------------------- */

export const onboardingPopupSlice = createSlice({
	name: "onboardingState",
	initialState: {
		type: onboardinTypes.PHONE,
		params: {},
	},
	reducers: {
		setOnboarding: (_, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(onboardingPopupSlice);

/* --------------------------------------------------------------- */

export const deliveryPopupSlice = createSlice({
	name: "deliveryState",
	initialState: {
		type: "",
		params: {},
	},
	reducers: {
		setDeliveryPopup: (state, action) => action.payload,
	},
});
Slices.push(deliveryPopupSlice);

/* --------------------------------------------------------------- */

export const stackScreenSlice = createSlice({
	name: "stackState",
	initialState: {
		onboarding: [],
		delivery: [],
		identification: [],
	},
	reducers: {
		updateStack: (state, action) => {
			const { key, value } = action.payload;
			if (!state[key]) {
				state[key] = [];
			}
			const { type } = value;
			const current = state[key].length - 1;

			if (
				state[key][current]?.type !== type &&
				type !== state[key][current - 1]?.type
			) {
				state[key].push({
					...value,
				});
				state.direction = "forward";
			} else if (
				type === state[key][current - 1]?.type &&
				type &&
				state[key][current - 1]?.type
			) {
				state[key] = state[key].slice(0, -2);
				state[key].push({
					...value,
				});
				state.direction = "backward";
			}
		},
		updateSubStack: (state, action) => {
			const { stack, index, value } = action.payload;
			let updatedState = state[stack];
			if (!Array.isArray(updatedState)) {
				updatedState = [];
			}
			if (updatedState.length === index && !updatedState?.[index]) {
				updatedState.push([]);
			}

			const current =
				updatedState[index]?.length !== 0 ? updatedState[index]?.length - 1 : 0;
			// if(!current && current !== 0){
			//   updatedState[index].push([]);
			//   current = 0;
			// }
			const { type } = value;
			if (!Array.isArray(updatedState[index])) {
				updatedState[index] = [];
			}

			if (
				updatedState[index]?.[current]?.type !== type &&
				type !== updatedState[index]?.[current - 1]?.type
			) {
				updatedState[index].push({
					...value,
				});
				state.direction = "forward";
			} else if (
				type === updatedState[index][current - 1]?.type &&
				type &&
				updatedState[index][current - 1]?.type
			) {
				updatedState[index] = updatedState[index]?.slice(0, -2);
				updatedState[index].push({
					...value,
				});
				state.direction = "backward";
			}

			state[stack] = updatedState;
		},
		duplicateSubStack: (state, action) => {
			const {
				currentIndex,
				steps,
				stack,
				shouldDuplicateLast = false,
			} = action.payload;
			let updatedState = state[stack];
			const stackToCopy = updatedState[currentIndex];
			const stepsToDuplicate = (shouldDuplicateLast ? 1 : 0) + steps;
			for (let i = 1; i < stepsToDuplicate; i++) {
				updatedState[currentIndex + i] = [...stackToCopy];
			}
			state[stack] = updatedState;
		},
		goBack: (state, action) => {
			const { key } = action.payload;
			state[key] = state[key]?.slice(0, -1);
			state.direction = "backward";
		},
		removeScreen: (state, action) => {
			const { key, value } = action.payload;
			state[key] = state[key]?.filter((s) => s.type !== value);
		},
		removeFrom2DStack: (state, action) => {
			const { key, index, removeIndex } = action.payload;
			state[key][index].splice(removeIndex, 1);
		},
		subGoBack: (state, action) => {
			const { key, index } = action.payload;
			state[key][index] = state[key][index]?.slice(0, -1);
			state.direction = "backward";
		},
		replaceStack: (state, action) => {
			const { key, index, payload } = action.payload;
			state[key][index][state[key][index].length - 1] = payload;
		},
		resetStack: (state, action) => {
			const key = action.payload;
			return { ...state, [key]: [] };
		},
		setStackDirection: (state, action) => {
			state.direction = action.payload ? "forward" : "backward";
		},
	},
});
Slices.push(stackScreenSlice);

/* --------------------------------------------------------------- */

export const currentScreenSlice = createSlice({
	name: "currentScreenState",
	initialState: {
		onboarding: -1,
		delivery: -1,
	},
	reducers: {
		increamentScreen: (state, action) => ({
			...state,
			[action.payload]: state[action.payload] + 1,
		}),
		decreamentScreen: (state, action) => ({
			...state,
			[action.payload]: state[action.payload] - 1,
		}),
		resetCurrentScreen: (state, action) => ({ ...state, [action.payload]: -1 }),
	},
});
Slices.push(currentScreenSlice);

export const menuPath = createSlice({
	name: "menuPath",
	initialState: {
		[META_ENUM.MAIN_NAV]: null,
		[META_ENUM.TOP_NAV]: null,
		[META_ENUM.LIST_FILTER]: null,
		[META_ENUM.MID_AREA_SECTIONS]: null,
		[META_ENUM.INITIAL]: "digitalMenu",
		selected: [META_ENUM.INITIAL],
	},
	reducers: {
		setPath: (state, action) => {
			const tempState = { selected: [] };
			const menuArray = action.payload;
			for (let i = 0; i < menuArray.length; i++) {
				if (menuArray[i + 1]) {
					const menu = menuArray[i];
					const nextMenu = menuArray[i + 1];
					tempState[menu.meta] = nextMenu.menuId;
				}
			}
			const metaArray = menuArray.map((m) => m.meta);
			tempState.selected = metaArray;

			return tempState;
		},

		clearPath: (state, action) => {
			const { meta } = action.payload;
			state[meta] = null;
		},
		clearAllPath: (state, _) => {
			return { selected: [] };
		},
	},
});

// Action creators are generated for each case reducer function
Slices.push(menuPath);

/* --------------------------------------------------------------- */

export const animationArraySlice = createSlice({
	name: "animationArray",
	initialState: [],
	reducers: {
		addAnimation: (state, action) => {
			state.push({ id: generateUniqueId(16), ...action.payload });
		},
		removeAnimation: (state, action) => {
			return state.filter((item) => item.id !== action.payload);
		},
	},
});

// Action creators are generated for each case reducer function
Slices.push(animationArraySlice);
/* --------------------------------------------------------------- */

/* --------------------------------------------------------------- */

export const openOrderPopupSlice = createSlice({
	name: "opeOrderPopup",
	initialState: null,
	reducers: {
		setOrderPpoupState: (state, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(openOrderPopupSlice);
/* --------------------------------------------------------------- */

/*---------------------------------------------------------------*/

export const showTutorialSlice = createSlice({
	name: "hasShownTutorial",
	initialState: false,
	reducers: {
		setHasShownTutorial: (state, action) => action.payload,
	},
});
Slices.push(showTutorialSlice);
/*---------------------------------------------------------------*/

export const isBackButtonBlockedSlice = createSlice({
	name: "isBackButtonBlocked",
	initialState: false,
	reducers: {
		setIsBackButtonBlocked: (state, action) => action.payload,
	},
});
Slices.push(isBackButtonBlockedSlice);

/* --------------------------------------------------------------- */
export const userAgreeToReset = createSlice({
	name: "userAgreeToReset",
	initialState: false,
	reducers: {
		setIsUserAgreeToReset: (state, action) => action.payload,
	},
});
Slices.push(userAgreeToReset);

/* --------------------------------------------------------------- */
export const isEditMode = createSlice({
	name: "isEditMode",
	initialState: false,
	reducers: {
		setIsEditMode: (state, action) => action.payload,
	},
});
Slices.push(isEditMode);

/* --------------------------------------------------------------- */
export const isEditGiftCardMode = createSlice({
	name: "isEditGiftCardMode",
	initialState: {
		editStatus: {},
		isEditMode: false,
	},
	reducers: {
		setIsEditGiftCardMode: (state, action) => {
			const { uuid, isEdit } = action.payload;
			state.editStatus[uuid] = isEdit;

			state.isEditMode = Object.values(state.editStatus).some((status) => status);
		},
		resetIsEditGiftCardMode: (state) => {
			state.editStatus = {};
			state.isEditMode = false;
		},
	},
});

Slices.push(isEditGiftCardMode);

/* --------------------------------------------------------------- */
export const isInitialRender = createSlice({
	name: "isInitialRender",
	initialState: true,
	reducers: {
		setIsInitialRender: (state, action) => action.payload,
	},
});
Slices.push(isInitialRender);

/* --------------------------------------------------------------- */

export const hasErrorSlice = createSlice({
	name: "hasError",
	initialState: false,
	reducers: {
		setHasError: (state, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(hasErrorSlice);

export const cartApprovedSlice = createSlice({
	name: "cartApproved",
	initialState: false,
	reducers: {
		setCartApproved: (state, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(cartApprovedSlice);

for (const Slice of Slices) {
	stateActions = { ...stateActions, ...Slice.actions };
	const reducer = { [Slice.name]: Slice.reducer };
	stateReducers = { ...stateReducers, ...reducer };
}

export { stateActions };
export { stateReducers };
