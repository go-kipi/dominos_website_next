import { createSlice } from "@reduxjs/toolkit";
import { stackScreenSlice } from "../state";

const Slices = [];
let formReducers = {};
let formActions = {};

export const contactSlice = createSlice({
	name: "contactForm",
	initialState: {},
	reducers: {
		updateContactForm: (state, action) => {
			return { ...state, ...action.payload };
		},
		resetContactForm: () => {
			return {};
		},
	},
});
Slices.push(contactSlice);
/* --------------------------------------------------------------- */
export const filterBranchesSlice = createSlice({
	name: "filterBranches",
	initialState: {
		query: "",
		fields: [],
	},
	reducers: {
		updateFilterBranches: (state, action) => {
			return { ...state, ...action.payload };
		},
		resetFilterBranches: () => {
			return { query: "", fields: [] };
		},
	},
});
// Action creators are generated for each case reducer function
Slices.push(filterBranchesSlice);

/* --------------------------------------------------------------- */
export const addAddressFormSlice = createSlice({
	name: "addAddressForm",
	initialState: {},
	reducers: {
		updateAddAddressForm: (state, action) => {
			return { ...state, ...action.payload };
		},
		resetAddAddressForm: () => {
			return {};
		},
	},
});
// Action creators are generated for each case reducer function
Slices.push(addAddressFormSlice);

/* --------------------------------------------------------------- */

export const specialRequestCartSlice = createSlice({
	name: "specialRequestCart",
	initialState: {},
	reducers: {
		updateSpecialRequest: (state, action) => {
			return { ...state, ...action.payload };
		},
		resetSpecialRequest: () => ({}),
	},
});
Slices.push(specialRequestCartSlice);
/* --------------------------------------------------------------- */

export const savedPizzaTitle = createSlice({
	name: "savedPizzaTitle",
	initialState: {},
	reducers: {
		updateSavedPizzaName: (state, action) => {
			const { activeIndex } = action.payload;
			const { value } = action.payload;
			return { ...state, [activeIndex]: value };
		},
		resetSavedPizzaName: () => ({}),
	},
});
Slices.push(savedPizzaTitle);

export const builderSlice = createSlice({
	name: "builder",
	initialState: {
		bundles: {},
		toppings: {},
		dough: {},
		pizzaId: {},
		pizzaSpecialRequests: {},
		savedKits: {},
		selectedSize: {},
		toppingsArray: {},
		shouldFadeOut: false,
	},
	reducers: {
		updateBuilder: (state, action) => {
			return { ...state, ...action.payload };
		},
		updateDough: (state, action) => {
			const { step, data } = action.payload;
			if (!state.dough[step]) {
				state.dough[step] = {
					...data,
				};
			} else {
				state.dough[step] = {
					...state.dough[step],
					...data,
				};
			}
		},
		updateBundle: (state, action) => {
			return { ...state, bundles: { ...state.bundles, ...action.payload } };
		},
		updateBuilderSavedKits: (state, action) => {
			return { ...state, savedKits: { ...state.savedKits, ...action.payload } };
		},
		updateTopping: (state, action) => {
			const {
				id,
				coverage,
				assetVersion = 0,
				isMix = false,
				step = 0,
			} = action.payload;

			if (!state.toppingsArray || !state.toppingsArray[step]) {
				state.toppingsArray = { [step]: [] };
			}
			state.toppingsArray[step].push(id);

			if (!state.toppings[step]) {
				state.toppings[step] = {
					[id]: {
						...state.toppings[id],
						coverage: { ...state.toppings[id]?.coverage, ...coverage },
						assetVersion,
						isMix,
					},
				};
			} else {
				state.toppings[step] = {
					...state.toppings[step],
					[id]: {
						...state.toppings[step][id],
						coverage: { ...state.toppings[step][id]?.coverage, ...coverage },
						assetVersion,
						isMix,
					},
				};
			}
		},
		updatePizzaSpecialRequests: (state, action) => {
			const { id, step = 0 } = action.payload;

			if (!state.pizzaSpecialRequests[step]) {
				state.pizzaSpecialRequests[step] = [];
			}

			state.pizzaSpecialRequests[step].push({
				productId: id,
				quantity: 1,
				quarters: null,
			});
		},
		setToppings: (state, action) => {
			const { step, data } = action.payload;
			return {
				...state,
				toppings: {
					...state.toppings,
					[step]: data,
				},
			};
		},
		setDough: (state, action) => {
			const { step, data } = action.payload;
			return {
				...state,
				dough: {
					...state.dough,
					[step]: data,
				},
			};
		},
		setPizzaId: (state, action) => {
			const { step, id } = action.payload;
			return {
				...state,
				pizzaId: {
					...state.pizzaId,
					[step]: id,
				},
			};
		},
		setPizzaSpecialRequests: (state, action) => {
			const { step, data } = action.payload;
			return {
				...state,
				pizzaSpecialRequests: {
					...state.pizzaSpecialRequests,
					[step]: data,
				},
			};
		},
		removeTopping: (state, action) => {
			const { step, id } = action.payload;

			const newState = JSON.parse(JSON.stringify(state));

			newState.toppingsArray[step ?? 0] =
				newState.toppingsArray?.[step ?? 0]?.filter((t) => t !== id) ?? [];
			delete newState.toppings[step ?? 0][id];
			return newState;
		},
		resetPizzaSpecialRequests: (state, action) => {
			const step = action.payload;
			return {
				...state,
				pizzaSpecialRequests: {
					...state.pizzaSpecialRequests,
					[step]: [],
				},
			};
		},
		resetToppings: (state, action) => {
			const step = action.payload;
			return {
				...state,
				toppings: {
					...state.toppings,
					[step]: {},
				},
			};
		},
		setShouldFadeOut: (state, action) => {
			return {
				...state,
				shouldFadeOut: action.payload,
			};
		},
		/* Reset all builder settings */
		resetBuilder: () => {
			return {
				bundles: {},
				toppings: {},
				dough: {},
				pizzaId: {},
				pizzaSpecialRequests: {},
				savedKits: {},
				shouldFadeOut: false,
			};
		},
		resetDough: (state, action) => {
			const step = action.payload;
			return {
				...state,
				dough: {
					...state.dough,
					[step]: undefined,
				},
			};
		},
		resetBundles: (state) => {
			return { ...state, bundles: {} };
		},
		setSelectedSize: (state, action) => {
			return { ...state, selectedSize: action.payload };
		},
	},
	extraReducers: (builder) => {
		builder.addCase(
			stackScreenSlice.actions.duplicateSubStack,
			(state, action) => {
				const { currentIndex, steps, shouldDuplicateLast = false } = action.payload;
				const keys = Object.keys(state);
				const stepsToDuplicate = (shouldDuplicateLast ? 1 : 0) + steps;
				keys.forEach((k) => {
					for (let i = 1; i < stepsToDuplicate; i++) {
						if (typeof state[k] === "boolean" || typeof state[k] === "string") {
							continue;
						}
						state[k][currentIndex + i] =
							typeof state[k][currentIndex] === "string" ||
							Array.isArray(state[k][currentIndex])
								? state[k][currentIndex]
								: { ...state[k][currentIndex] };
					}
				});
			},
		);
	},
});

Slices.push(builderSlice);

/* --------------------------------------------------------------- */

// build export objects
for (const Slice of Slices) {
	formActions = { ...formActions, ...Slice.actions };
	const reducer = { [Slice.name]: Slice.reducer };
	formReducers = { ...formReducers, ...reducer };
}

export { formActions };
export { formReducers };
