import { createSlice } from "@reduxjs/toolkit";
import BENEFITS_TYPES from "constants/BenefitsTypes";
import { HYDRATE } from "next-redux-wrapper";
import { defaultHYDRATE, isObjectEqual, notEmptyObject } from "utils/functions";

const Slices = [];
let dataReducers = {};
let dataActions = {};

export const generalSlice = createSlice({
	name: "generalData",
	initialState: {},
	reducers: {
		setGeneralData: (state, action) => {
			return { ...state, ...action.payload };
		},
		setLanguage: (state, action) => {
			state.lang = action.payload;
		},
		setPhoneNum: (state, action) => {
			state.phone = action.payload;
		},
		setKosher: (state, action) => {
			state.kosher = action.payload;
		},
		setTemporarilyNotKosher: (state, action) => {
			state.temporarilyNotKosher = action.payload;
		},
		setGpsStatus: (state, action) => {
			state.gpsstatus = action.payload;
		},
		setTokens: (state, action) => {
			state.tokenData = action.payload;
		},
		resetTokens: (state, action) => {
			state.tokenData = false;
		},
		setShowenLoactionModal: (state, action) => {
			state.showenLoactionModal = Number(action.payload);
		},
		setSystemGPSStatus: (state, action) => {
			state.systemGPSStatus = action.payload;
		},
		setOnBoarding: (state, action) => {
			state.onboarding = action.payload;
		},
		setTranslationsLastestVersion: (state, action) => {
			return {
				...state,
				latestVersion: {
					...state.latestVersion,
					[action.payload.paltform]: action.payload.version,
				},
			};
		},
		setLinksLastestVersion: (state, action) => {
			return {
				...state,
				latestVersion: {
					...state.latestVersion,
					links: action.payload,
				},
			};
		},
		setSeoLastestVersion: (state, action) => {
			return {
				...state,
				latestVersion: {
					...state.latestVersion,
					seo: action.payload,
				},
			};
		},
		setContentLastestVersion: (state, action) => {
			return {
				...state,
				latestVersion: {
					...state.latestVersion,
					content: action.payload,
				},
			};
		},
		setUTMSource: (state, action) => {
			return {
				...state,
				utmSource: action.payload,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "generalData"),
	},
});
Slices.push(generalSlice);

/* --------------------------------------------------------------- */

export const contentPagesSlice = createSlice({
	name: "contentPages",
	initialState: {},
	reducers: {
		addContentPage: (state, action) => {
			const { route, data } = action.payload;
			return {
				...state,
				[route]: data,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "contentPages"),
	},
});

// Action creators are generated for each case reducer function
Slices.push(contentPagesSlice);

/* --------------------------------------------------------------- */

export const globalParamsSlice = createSlice({
	name: "globalParams",
	initialState: false,
	reducers: {
		setGlobalParams: (_, action) => action.payload,
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "globalParams"),
	},
});

// Action creators are generated for each case reducer function
Slices.push(globalParamsSlice);

/* --------------------------------------------------------------- */

export const menusSlice = createSlice({
	name: "menusData",
	initialState: {},
	reducers: {
		addMenu: (state, action) => {
			const menus = {};
			for (let key in action.payload) {
				const menu = action.payload[key];
				const id = action.payload[key]?.id ?? "";
				menus[id] = menu;
			}

			state.menus = { ...state.menus, ...menus };
		},
		setMenu: (state, action) => {
			const menus = {};
			for (let key in action.payload) {
				const menu = action.payload[key];
				const id = action.payload[key]?.id ?? "";
				menus[id] = menu;
			}

			state.menus = menus;
		},
		addToMenu: (state, action) => {
			const temp = JSON.parse(JSON.stringify(state));

			const formatData = (key) => {
				const stateValue = state[key];
				let newValue = action.payload[key];

				if (stateValue && newValue) {
					if (Array.isArray(newValue)) {
						const res = {};
						for (const menuId in stateValue) {
							const menu = stateValue[menuId];
							res[menu.id] = menu;
						}
						for (const menu of newValue) {
							res[menu.id] = menu;
						}
						return res;
					}
					return { ...stateValue, ...newValue };
				}
				if (newValue) {
					if (Array.isArray(newValue)) {
						const res = {};

						for (const menu of newValue) {
							res[menu.id] = menu;
						}
						return { ...res };
					}
					return { ...newValue };
				}
				if (!newValue) {
					return stateValue;
				}
				return [];
			};

			temp.menus = formatData("menus");
			temp.recommendedKits = formatData("recommendedKits");
			temp.savedKits = formatData("savedKits");
			temp.catalogProducts = formatData("catalogProducts");

			return temp;
		},
		addCatalogProducts: (state, action) => {
			state.catalogProducts = { ...state.catalogProducts, ...action.payload };
			return state;
		},
		setKits: (state, action) => {
			state.savedKits = action.payload;
		},
		setRecommendedKits: (state, action) => {
			state.recommendedKits = action.payload;
		},
		setProducts: (state, action) => {
			state.catalogProducts = action.payload;
		},
		resetMenus: (state, action) => {
			return {};
		},
		extraReducers: (builder) => {
			builder.addCase(priceListSlice.actions.setPriceList, (state, action) => {
				// TODO: Add case for when adding a single menu from getMenu api request.
				if (!notEmptyObject(state)) {
					if (typeof action.payload === "object" && notEmptyObject(action.payload)) {
						if (
							typeof state.catalogProducts === "object" &&
							Object.values(state.catalogProducts).length > 0
						) {
							state.catalogProducts = {
								...state.catalogProducts,
								...action.payload.catalogProducts,
							};
						}
					}
				}
			});
		},
	},
});
Slices.push(menusSlice);

/* --------------------------------------------------------------- */
export const apiSlice = createSlice({
	name: "apiData",
	initialState: false,
	reducers: {
		setApiData: (state, action) => action.payload,
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "apiData"),
	},
});

// Action creators are generated for each case reducer function
Slices.push(apiSlice);
/* --------------------------------------------------------------- */
export const cartSlice = createSlice({
	name: "cartData",
	initialState: {},
	reducers: {
		setCart: (_, action) => action.payload,
		updateCartItemCount: (state, action) => {
			state.itemCount += action.payload;
			return state;
		},
	},
});
Slices.push(cartSlice);

/* --------------------------------------------------------------- */
export const cartItemSlice = createSlice({
	name: "cartItem",
	initialState: {},
	reducers: {
		resetCartItem: () => ({}),
		setCartItem: (state, action) => {
			return { ...state, ...action.payload };
		},
		updateCartItem: (state, action) => {
			state.subitems.push(action.payload);
		},
		clearSubItem: (state, action) => {
			state.subitems?.splice(action.payload, 1);
		},
		setCartItemSubitem: (state, action) => {
			const { index, data } = action.payload;
			if (
				Array.isArray(state.subitems) &&
				typeof state.subitems[index] === "object"
			) {
				state.subitems[index].subitems = [...data];
			}
			// state?.subItems?.[index] = Array.isArray(state?.subItems) && state?.subItems.length > 0 ? data : data;
		},
		setCartItemPizzaId: (state, action) => {
			const { index, id } = action.payload;
			if (Array.isArray(state.subitems)) {
				if (state.subitems[index]) {
					state.subitems[index].productId = id;
				} else {
					state.subitems[index] = {
						productId: id,
					};
				}
			} else {
				state.productId = id;
			}
		},
	},
});
Slices.push(cartItemSlice);
/* --------------------------------------------------------------- */

export const userSlice = createSlice({
	name: "userData",
	initialState: false,
	reducers: {
		setUser: (state, action) => {
			return { ...state, ...action.payload };
		},
		setCurrentLocation: (state, action) => {
			return { ...state, currentLocation: action.payload };
		},
		setUserAddresses: (state, action) => {
			return { ...state, addresses: action.payload };
		},
		setUserBranches: (state, action) => {
			const userBranches = JSON.parse(JSON.stringify(state.branches ?? [])); // deep copy array of))
			let leftBranches = [];

			if (Array.isArray(userBranches)) {
				leftBranches = userBranches.filter((b) => b?.orderFromBranch !== true);
			}

			const leftBranchesIds = new Set(leftBranches.map((obj) => obj.id));

			const branchesNotInLeft = action.payload.filter(
				(b) => !leftBranchesIds.has(b.id),
			);

			return { ...state, branches: leftBranches.concat(branchesNotInLeft) };
		},
		updateUserBranches: (state, action) => {
			const allUserBranches = JSON.parse(JSON.stringify(state.branches || []));

			const index = allUserBranches.findIndex(
				(branch) => branch.id === action.payload.id,
			);

			if (index >= 0) {
				allUserBranches.splice(index, 1);
			}
			return {
				...state,
				branches: [action.payload, ...allUserBranches],
			};
		},
		deleteUserAddress: (state, action) => {
			const { id } = action.payload;
			const addresses = JSON.parse(JSON.stringify(state.addresses));

			return { ...state, addresses: addresses.filter((a) => a.id !== id) };
		},
		addUserBranch: (state, action) => {
			const prevBranches = JSON.parse(JSON.stringify(state?.branches ?? []));

			let branches = [];
			branches.push(action.payload);

			const restBranches = prevBranches.filter((b) => b.id !== action.payload.id);

			branches = branches.concat(restBranches);

			return {
				...state,
				branches: branches,
			};
		},

		setDontShowDuplicatePizzaModal: (state, action) => {
			return { ...state, showDuplicatePizza: action.payload };
		},
		setDontShowUpgradePizzaModal: (state, action) => {
			return { ...state, showUpgradePizza: action.payload };
		},
		setDontShowMarketingModal: (state, action) => {
			return { ...state, dontShowMarketingModal: action.payload };
		},
		setDontShowPeresntMarketingModal: (state, action) => {
			return { ...state, dontShowPresentMarketingModal: action.payload };
		},
		setUserCards: (state, action) => {
			return { ...state, savedCreditCards: action.payload };
		},
		setUserOrderData: (state, action) => {
			const { hash, data } = action.payload;
			const orderData = { ...state.orders, [hash]: data };
			return { ...state, orders: orderData };
		},
		resetUserOrders: (state) => {
			const newState = { ...state };
			delete newState.orders;
			return { ...newState };
		},
		setOrderStatus: (state, action) => {
			return {
				...state,
				activeOrderStatus: {
					...state.activeOrderStatus,
					status: action.payload,
				},
			};
		},
		removeEntreyFromUser: (state, action) => {
			state.benefits = state?.benefits.filter(
				(benefit) => benefit.benefitType !== BENEFITS_TYPES.ENTREY,
			);
			return state;
		},
		resetUser: () => ({}),
		resetUnsavedAddresses: (state) => {
			return { ...state, notSavedAddresses: [] };
		},
	},
});

Slices.push(userSlice);

/* --------------------------------------------------------------- */

export const metaTagsSlice = createSlice({
	name: "metaTags",
	initialState: {},
	reducers: {
		setMetaTags: (state, action) => {
			return { ...state, ...action.payload };
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "metaTags"),
	},
});
Slices.push(metaTagsSlice);

export const translationsSlice = createSlice({
	name: "translations",
	initialState: {},
	reducers: {
		setTranslations: (state, action) => {
			return { ...state, ...action.payload };
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "translations"),
	},
});

// Action creators are generated for each case reducer function
Slices.push(translationsSlice);

// /*---------------------------------------------------------------*/
export const trackerMessagesTranslationsSlice = createSlice({
	name: "trackerMessagesTranslations",
	initialState: {},
	reducers: {
		setTrackerTranslations: (state, action) => {
			return { ...state, ...action.payload };
		},
	},
});

// Action creators are generated for each case reducer function
Slices.push(trackerMessagesTranslationsSlice);

// /*---------------------------------------------------------------*/
export const orderSlice = createSlice({
	name: "order",
	initialState: {},
	reducers: {
		updateOrder: (state, action) => {
			return { ...state, ...action.payload };
		},
		resetOrder: (state, action) => {
			return {};
		},
	},
});
Slices.push(orderSlice);
/* --------------------------------------------------------------- */
export const branchesSlice = createSlice({
	name: "branches",
	initialState: false,
	reducers: {
		setBranchesData: (_, action) => action.payload,
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "branches"),
	},
});
Slices.push(branchesSlice);

/* --------------------------------------------------------------- */
export const defaultLocationSlice = createSlice({
	name: "defaultLocation",
	initialState: { lat: 32.04771, lng: 34.7452 },
});
Slices.push(defaultLocationSlice);

/* --------------------------------------------------------------- */
export const priceListSlice = createSlice({
	name: "priceList",
	initialState: false,
	reducers: {
		setPriceList: (state, action) => action.payload,
	},
});
Slices.push(priceListSlice);
/* --------------------------------------------------------------- */
export const pizzaSelectionSlice = createSlice({
	name: "pizzaSelection",
	initialState: {},
	reducers: {
		setPizzaSelection: (state, action) => action.payload,
	},
});

// Action creators are generated for each case reducer function
Slices.push(pizzaSelectionSlice);
/* --------------------------------------------------------------- */
export const uniqueCouponSlice = createSlice({
	name: "addUniqueCoupon",
	initialState: false,
	reducers: {
		setAddUniqueCoupon: (state, action) => action.payload,
	},
});
Slices.push(uniqueCouponSlice);
/* --------------------------------------------------------------- */
export const doublingCouponSlice = createSlice({
	name: "addDoublingCoupon",
	initialState: false,
	reducers: {
		setAddDoublingCoupon: (state, action) => action.payload,
	},
});
Slices.push(doublingCouponSlice);

/* --------------------------------------------------------------- */
export const currentProductTemplateSlice = createSlice({
	name: "currentProductTemplate",
	initialState: false,
	reducers: {
		setCurrentProductTemplate: (state, action) => {
			return { ...state, ...action.payload };
		},
		resetCurrentProductTemplate: (state, action) => false,
	},
});

// Action creators are generated for each case reducer function
Slices.push(currentProductTemplateSlice);
/* --------------------------------------------------------------- */
export const currentProductsCounterSlice = createSlice({
	name: "currentProductsCounter",
	initialState: {},
	reducers: {
		updateProduct: (state, action) => {
			const { productId, quantity } = action.payload;
			state[productId] += quantity;
			return state;
		},
	},
	extraReducers: (cart) => {
		cart.addCase(cartSlice.actions.setCart, (state, action) => {
			state = {};

			if (action.payload?.items && typeof action.payload?.items === "object") {
				const items = action.payload?.items;
				for (const item of items) {
					const id = item.productId;
					const quantity = item.quantity;
					if (state[id]) {
						state[id] += quantity;
					} else {
						state[id] = quantity;
					}
				}
			}
			return state;
		});
	},
});

Slices.push(currentProductsCounterSlice);
/* --------------------------------------------------------------- */

export const payemtSlice = createSlice({
	name: "payment",
	initialState: {},
	reducers: {
		addPayment: (state, action) => {
			return { ...state, [action.payload.data.id]: { ...action.payload } };
		},
	},
});

// Action creators are generated for each case reducer function
Slices.push(payemtSlice);

/* --------------------------------------------------------------- */

export const savedPizzasSlice = createSlice({
	name: "savedPizzas",
	initialState: {},
	reducers: {
		setSavedPizzas: (state, action) => {
			state = action.payload;
		},
	},
});

// Action creators are generated for each case reducer function
Slices.push(savedPizzasSlice);

export const creditCardTokensSlice = createSlice({
	name: "creditCardTokens",
	initialState: {
		tokens: [],
		isAddedCreditCard: false,
	},
	reducers: {
		addCreditCardTokens: (state, action) => {
			state.tokens = action.payload;
		},
		toggleIsAddedCreditCard: (state, action) => {
			state.isAddedCreditCard = action.payload;
		},
	},
});

// Action creators are generated for each case reducer function
Slices.push(creditCardTokensSlice);

/* --------------------------------------------------------------- */

export const branchesDetailsSlice = createSlice({
	name: "branchesDetails",
	initialState: {},
	reducers: {
		setBranchDetails: (state, action) => ({ ...state, ...action.payload }),
		resetAllBrachDetails: () => ({}),
	},
	extraReducers: {
		[HYDRATE]: (state, action) =>
			defaultHYDRATE(state, action, "branchesDetails"),
	},
});

// Action creators are generated for each case reducer function
Slices.push(branchesDetailsSlice);

/* --------------------------------------------------------------- */
export const orderPrize = createSlice({
	name: "orderPrize",
	initialState: false,
	reducers: {
		setPrize: (state, action) => action.payload,
		resetPrize: (state, action) => false,
	},
});

// Action creators are generated for each case reducer function
Slices.push(orderPrize);

/* --------------------------------------------------------------- */
export const AddToBasketBenefits = createSlice({
	name: "addToBasketBenefits",
	initialState: [],
	reducers: {
		AddToBasketBenefits: (state, action) => [...state, action.payload],
		RemoveBenefitFromBenfits: (state, action) => {
			const index = state.indexOf(action.payload);

			state.splice(index, 1);
			return state;
		},
		resetAddToBasketBenefits: (state, action) => [],
	},
});

// Action creators are generated for each case reducer function
Slices.push(AddToBasketBenefits);

/* --------------------------------------------------------------- */
export const selectedBenefit = createSlice({
	name: "selectedBenefit",
	initialState: false,
	reducers: {
		setBenefit: (state, action) => action.payload,
		resetBenefit: (state, action) => false,
	},
});

// Action creators are generated for each case reducer function
Slices.push(selectedBenefit);

/* --------------------------------------------------------------- */
export const citiesSlice = createSlice({
	name: "cities",
	initialState: false,
	reducers: {
		setCities: (_, action) => action.payload,
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "cities"),
	},
});
Slices.push(citiesSlice);

/* --------------------------------------------------------------- */
export const linksSlice = createSlice({
	name: "links",
	initialState: {},
	reducers: {
		setLinks: (_, action) => action.payload,
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "links"),
	},
});
Slices.push(linksSlice);

// Action creators are generated for each case reducer function

/* --------------------------------------------------------------- */
export const trackerDetailsSlice = createSlice({
	name: "trackerOrderDetails",
	initialState: {},
	reducers: {
		updateTrackerOrder: (state, action) => {
			const { key, value } = action.payload;

			return { ...state, [key]: { ...state[key], ...value } };
		},
		updateTrackerOrderRoleta: (state) => {
			return { ...state, order: { ...state.order, isShownedRoleta: true } };
		},
		resetTrackerOrder: () => ({}),
	},
});

// Action creators are generated for each case reducer function
Slices.push(trackerDetailsSlice);

/* --------------------------------------------------------------- */

export const paymentsSlice = createSlice({
	name: "payments",
	initialState: {},
	reducers: {
		setPayments: (state, action) => action.payload,
	},
});
Slices.push(paymentsSlice);

/* --------------------------------------------------------------- */
export const promoPopupsSlice = createSlice({
	name: "promoPopups",
	initialState: [],
	reducers: {
		setPromoPopups: (state, action) => action.payload,
		addPromoPopup: (state, action) => {
			state.push(action.payload);
		},
		removePromoPopup: (state, action) => {
			state.shift();
		},
	},
});
Slices.push(promoPopupsSlice);

/* --------------------------------------------------------------- */
export const promoPopupsStateSlice = createSlice({
	name: "promoPopupsState",
	initialState: "",
	reducers: {
		setPromoPopupState: (state, action) => action.payload,
		resetPromoPopupState: (state, action) => "",
	},
});
Slices.push(promoPopupsStateSlice);

/* --------------------------------------------------------------- */

export const selectedMethodSlice = createSlice({
	name: "selectedMethod",
	initialState: null,
	reducers: {
		setSelectedMethod: (state, action) => action.payload,
		resetSelectedMethod: (state, action) => null,
	},
});
Slices.push(selectedMethodSlice);

/* --------------------------------------------------------------- */

export const logsSlice = createSlice({
	name: "logs",
	initialState: [],
	reducers: {
		addLog: (state, action) => {
			return [...state, action.payload];
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "logs"),
	},
});
Slices.push(logsSlice);

/* --------------------------------------------------------------- */

export const apiIsrFailureLogs = createSlice({
	name: "apiIsrFailureLogs",
	initialState: [],
	reducers: {
		addApiFailureLog: (state, action) => {
			return [...state, action.payload];
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) =>
			defaultHYDRATE(state, action, "apiIsrFailureLogs"),
	},
});
Slices.push(apiIsrFailureLogs);

/* --------------------------------------------------------------- */
export const reduxCheck = createSlice({
	name: "reduxCheck",
	initialState: {
		reduxStart: null,
		apiCalls: [],
		apiResponse: [],
	},
	reducers: {
		startRedux: (state, action) => {
			return { ...state, reduxStart: action.payload };
		},
		addApiCall: (state, action) => {
			return { ...state, apiCalls: [...state.apiCalls, action.payload] };
		},
		addApiResponse: (state, action) => {
			return { ...state, apiResponse: [...state.apiResponse, action.payload] };
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => defaultHYDRATE(state, action, "reduxCheck"),
	},
});
Slices.push(reduxCheck);
/* --------------------------------------------------------------- */

export const deepLinkCouponSlice = createSlice({
	name: "deepLinkCoupon",
	initialState: null,
	reducers: {
		setDeepLinkCoupon: (state, action) => action.payload,
		resetDeepLinkCoupon: (state, action) => null,
	},
});
Slices.push(deepLinkCouponSlice);

// build export objects
for (const Slice of Slices) {
	dataActions = { ...dataActions, ...Slice.actions };
	const reducer = { [Slice.name]: Slice.reducer };
	dataReducers = { ...dataReducers, ...reducer };
}

export { dataActions };
export { dataReducers };
