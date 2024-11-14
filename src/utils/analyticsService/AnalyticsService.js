import {
	ITEM_CATEGORY,
	ITEM_CATEGORY2,
	ITEM_CATEGORY3,
} from "constants/AnalyticsTypes";
import { MEDIA_ENUM } from "constants/media-enum";
import { Store } from "redux/store";

const AnalyticsService = (() => {
	const SHOW_LOG = process.env.NODE_ENV === "development";

	const ProductTemplate = Object.freeze({
		item_id: "",
		item_name: "",
		coupon: "",
		currency: "ILS",
		discount: "",
		index: "",
		item_brand: "",
		item_category: "",
		item_category2: "",
		item_category3: "",
		item_variant: "",
		price: "",
		quantity: "",
	});

	const Templates = {
		onboarding: {
			language: {
				event: "onboarding_language_set",
				page: "onboarding/step1/choose_language",
			},
			onboardingMethod: {
				event: "onboarding_method",
				page: "onboarding/step2/onboard_method",
			},
			login: { event: "login", page: "onboarding/step3/login" },
			onboardingLoginFailed: {
				event: "onboarding_login_failed",
				page: "onboarding/step3/login",
			},
			onboardingCoupon: {
				event: "onboarding_coupon",
				page: "onboarding/step4/coupon",
			},
			onboardingKosher: {
				event: "onboarding_kosher_select",
				page: "onboarding/step4.1/kosher",
			},
			onboardingMeatOrVegan: {
				event: "onboarding_meat_or_vegan_select",
				page: "onboarding/step4.2/veganOrMeat",
			},
			onboardingFinish: {
				event: "onboarding_finish",
				page: "onboarding/step5/finish",
			},
		},
		signup: {
			signupPhone: { event: "signup_phone", page: "signup/step1/phone_number" },
			signupOTP: { event: "signup_otp", page: "signup/step2/otp" },
			signupOTPFail: { event: "signup_otp_fail", page: "signup/step2/otp" },
			signup: { event: "sign_up", page: "signup/step3/form" },
		},
		homepage: { event: "homepage_click", page: "homepage" },
		delivery: {
			chooseShipping: { event: "choose_shipping_method", page: "shipping" },
			chooseShippmentLocation: {
				event: "choose_shippment_location",
				page: "shipping/step1/whereTo",
			},
			chooseNewShippmentLocation: {
				event: "choose_new_shippment_location",
				page: "shipping/step1.1/newLocation",
			},
			chooseShippmentTime: {
				event: "choose_shippment_time",
				page: "shipping/step2/deliveryTime",
			},
			chooseLaterShippmentTimeConfirm: {
				event: "choose_later_shippment_time_confirm",
				page: "shipping/step2.1/deliveryTime-later-shippment",
			},
			choosePickupLocation: {
				event: "choose_pickup_location",
				page: "pickup/step1/pickupLocation",
			},
			chooseNewBranchLocation: {
				event: "choose_new_branch_location",
				page: "pickup/step1.1/newBranch",
			},
			choosePickupTime: {
				event: "choose_pickup_time",
				page: "pickup/step2/pickupTime",
			},
			chooseLaterPickupTimeConfirm: {
				event: "choose_later_pickup_time_confirm",
				page: "pickup/step2.1/pickupTime-later-pickup",
			},
		},
		personalArea: {
			personalAreaEntries: {
				event: "personal_area_entries",
				page: "personalArea",
			},
			personalAreaNav: { event: "personal_area_nav", page: "personalArea" },
			personalAreaNavVegan: {
				event: "personal_area_nav_vegan",
				page: "personalArea",
			},
			personalAreaNavKosher: {
				event: "personal_area_nav_kosher",
				page: "personalArea",
			},
			personalAreaLatestOrdersViewCart: {
				event: "personal_area_latest_orders_view_cart",
				page: "last-order/step2/view-cart",
			},
			personalAreaDetailsEnteries: {
				event: "personal_area_details_enteries",
				page: "last-order/step5/order-complete",
			},
			personalAreaDetailsUpdate: {
				event: "personal_area_details_update",
				page: "personalArea/personalDetails",
			},
			personalAreaAddCreditCard: {
				event: "personal_area_add_credit_card",
				page: "personalArea/creditDetails",
			},
			personalAreaAddCreditCardNewDetails: {
				event: "personal_area_add_credit_card_new_details",
				page: "personalArea/creditDetails/newCard",
			},
			personalAreaRemoveCreditCard: {
				event: "personal_area_remove_credit_card",
				page: "personalArea/creditDetails",
			},
			personalAreaChooseLanguage: {
				event: "personal_area_choose_language",
				page: "personalArea/deliveryDetails/newLocation",
			},
			personalAreaLogout: { event: "personal_area_logout", page: "personalArea" },
			personalAreaLogoutPopupConfirm: {
				event: "personal_area_logout_popup_confirm",
				page: "personalArea/popup/logout",
			},
			personalAreaDeleteAccount: {
				event: "personal_area_delete_account",
				page: "personalArea",
			},
			personalAreaDeleteAccountPopupConfirm: {
				event: "personal_area_delete_account_popup_confirm",
				page: "personalArea/popup/deleteAccount",
			},
			personalAreaDeleteOwnPizza: {
				event: "personal_area_delete_own_pizza",
				page: "personalArea",
			},
		},
		coupons: {
			enterCouponCode: { event: "enter_coupon_code", page: "couppon/popup" },
			enterCouponCodeFail: {
				event: "enter_coupon_code_fail",
				page: "couppon/popup",
			},
			enterCouponCodeSuccess: {
				event: "enter_coupon_code_success",
				page: "couppon/popup",
			},
		},
		navBar: {
			navBarClick: { event: "nav_bar_click", page: "navbar" },
			navBarInsideClick: { event: "nav_bar_inside_click", page: "navbar" },
			orderClick: { event: "order_click", page: "navbar" },
			myCartEnteries: { event: "my_cart_enteries", page: "navbar" },
			myOrderStatusEnteries: { event: "my_order_status_enteries", page: "navbar" },
			myOrderStatusSetFavoritePizza: {
				event: "my_order_status_set_favorite_pizza",
				page: "tracker",
			},
			bigOrdersSend: { event: "big_orders_send", page: "navbar" },
			myBenefitsEnteries: { event: "my_benefits_enteries", page: "navbar" },
			myBenefitsAddToCard: {
				event: "my_benefits_add_to_cart",
				page: "navbar/myBenefits",
			},
			branchesEnteries: { event: "branches_enteries", page: "navbar" },
			selectSpecificBranch: { event: "select_specific_branch", page: "branches" },
			specificBranchesEnteries: {
				event: "specific_branches_enteries",
				page: "branches",
			},
		},
		support: {
			supportChat: { event: "support_chat", page: "navbar" },
			supportHomePage: { event: "support_home_page", page: "homepage" },
			supportSocialPlatforms: {
				event: "support_social_platforms",
				page: "navbar",
			},
		},
		meal: {
			orderMealCustomized: {
				event: "order_meal_customized",
				page: "order/step2/customizeMeal",
			},
			orderMealCustomizedSelect: {
				event: "order_meal_customized_select",
				page: "order/step2/customizeMeal",
			},
			orderMealCustomizedTopping: {
				event: "order_meal_customized_topping",
				page: "order/step3/topping",
			},
			orderMealCustomizedToppingConfirm: {
				event: "order_meal_customized_topping_confirm",
				page: "order/step3/topping",
			},
			orderMealSpecialInstructions: {
				event: "order_meal_special_instruction",
				page: "order/step3/topping",
			},
		},
		shippingAndChoosingProducts: {
			shippingInfo: { event: "add_shipping_info" },
		},
		viewItemList: {
			event: "view_item_list",
			shipping_tier: "",
			affiliation: "",
			item_list_id: "",
			item_list_name: "",
			items: [],
		},
		addToCart: {
			event: "add_to_cart",
			shipping_tier: "",
			affiliation: "",
			currency: "",
			value: "",
			items: [],
		},
		viewPromotion: {
			event: "view_promotion",
			shipping_tier: "",
			affiliation: "",
			creative_name: "",
			creative_slot: "",
			promotion_id: "",
			promotion_name: "",
			items: [],
		},
		beginCheckout: {
			event: "begin_checkout",
			shipping_tier: "",
			affiliation: "",
			currency: "",
			value: "",
			coupon: "",
			items: [],
		},
		selectItem: {
			event: "select_item",
			shipping_tier: "",
			affiliation: "",
			item_list_id: "",
			item_list_name: "",
			items: [],
		},
		viewCart: {
			event: "view_cart",
			shipping_tier: "",
			affiliation: "",
			currency: "",
			value: "",
			items: [],
		},
		selectPromotion: {
			event: "select_promotion",
			shipping_tier: "",
			affiliation: "",
			creative_name: "",
			creative_slot: "",
			promotion_id: "",
			promotion_name: "",
			items: [],
		},
		addPaymentInfo: {
			event: "add_payment_info",
			shipping_tier: "",
			affiliation: "",
			currency: "",
			value: "",
			coupon: "",
			payment_type: "",
			items: [],
		},
		viewItem: {
			event: "view_item",
			shipping_tier: "",
			affiliation: "",
			currency: "",
			value: "",
			items: [],
		},
		removeFromCart: {
			event: "remove_from_cart",
			shipping_tier: "",
			affiliation: "",
			currency: "",
			value: "",
			items: [],
		},
		purchase: {
			event: "purchase",
			shipping_tier: "",
			affiliation: "",
			currency: "",
			value: "",
			coupon: "",
			payment_type: "",
			transaction_id: "",
			tax: "",
			shipping: "",
			items: [],
		},
	};

	const generateProductTemplate = () => {
		return Object.assign({}, JSON.parse(JSON.stringify(ProductTemplate)));
	};

	const generateTemplate = (category, type) => {
		const template = {};
		if (!category) {
			return Object.assign(template, JSON.parse(JSON.stringify(Templates[type])));
		}
		return Object.assign(
			template,
			JSON.parse(JSON.stringify(Templates[category][type])),
		);
	};

	const removeEmptyFields = (product) => {
		for (const key in product) {
			const value = product[key];
			if (value === undefined || value === "" || value === null) {
				product[key] = "";
			}
		}
	};

	const createProduct = (data, product, array) => {
		const lang = Store.getState()?.generalData?.lang;
		product.item_name = data?.name ?? data?.nameUseCases?.title?.[lang];
		product.item_id = data?.id;
		product.item_list_id = data?.id;
		product.item_list_name = data?.name;
		product.price = data?.price;
		product.item_brand = data?.groups?.[14] ?? "";
		product.item_category = data.item_category
			? data.item_category
			: ITEM_CATEGORY.CREATE_YOURSELF;
		product.item_category2 =
			data?.item_category2 ?? ITEM_CATEGORY2.SINGLE_PRODUCT;
		product.item_category3 = data?.item_category3 ?? ITEM_CATEGORY3.SELF_CHOICE;
		product.index = data?.index + 1;
		product.coupon =
			data?.meta === "coupon" || data?.meta === "discountCoupon" ? data?.name : "";
		product.discount =
			data?.priceBeforeDiscount > data?.price
				? Number((data.priceBeforeDiscount - data.price).toFixed(2))
				: 0;
		product.item_variant = data?.item_variant ? data.item_variant : "";
		product.quantity = typeof data?.quantity === "object" ? 1 : data?.quantity;
		removeEmptyFields(product);
		array.push(product);
	};

	const getShippingInfo = () => {
		const order = Store.getState().order;
		if (typeof order === "object") {
			const isFutureOrder = order.isPickup
				? order.pickup?.hasOwnProperty("timedto")
				: order.delivery?.hasOwnProperty("timedto");
			const branchName = order.isPickup ? order.pickup?.storeName : "";
			const time = order.isPickup
				? order.pickup?.promiseTime
				: order.delivery?.promiseTime;
			const shipping_tier = order.isPickup
				? `pickup - ${isFutureOrder ? "later" : time + "minutes"}`
				: `shipping - ${isFutureOrder ? "later" : time + "minutes"}`;
			let shippingInfo = {
				affiliation: branchName,
				shipping_tier: shipping_tier,
			};
			return shippingInfo;
		}
		return {};
	};

	const addShippingInfoAndListData = (listData, ecommerce) => {
		const shippingInfo = getShippingInfo();
		const {
			id,
			name,
			value,
			currency = 'ILS',
			creative_name,
			creative_slot,
			promotion_id,
			promotion_name,
			payment_type,
			tax,
			transaction_id,
			coupon,
			shipping,
		} = listData;

		const { affiliation, shipping_tier } = shippingInfo;
		if (ecommerce.hasOwnProperty("item_list_id")) {
			ecommerce.item_list_id = id;
		}
		if (ecommerce.hasOwnProperty("item_list_name")) {
			ecommerce.item_list_name = name;
		}
		if (ecommerce.hasOwnProperty("creative_name")) {
			ecommerce.creative_name = creative_name;
		}
		if (ecommerce.hasOwnProperty("creative_slot")) {
			ecommerce.creative_slot = creative_slot;
		}
		if (ecommerce.hasOwnProperty("promotion_id")) {
			ecommerce.promotion_id = promotion_id;
		}
		if (ecommerce.hasOwnProperty("promotion_name")) {
			ecommerce.promotion_name = promotion_name;
		}
		if (ecommerce.hasOwnProperty("payment_type")) {
			ecommerce.payment_type = payment_type;
		}
		if (ecommerce.hasOwnProperty("tax")) {
			ecommerce.tax = tax;
		}
		if (ecommerce.hasOwnProperty("transaction_id")) {
			ecommerce.transaction_id = transaction_id;
		}
		if (ecommerce.hasOwnProperty("coupon")) {
			ecommerce.coupon = coupon;
		}
		if (ecommerce.hasOwnProperty("shipping")) {
			ecommerce.shipping = shipping;
		}
		ecommerce.shipping_tier = shipping_tier;
		ecommerce.affiliation = affiliation;

		value ? (ecommerce.value = value) : delete ecommerce["value"];
		currency ? (ecommerce.currency = currency) : delete ecommerce["currency"];
		removeEmptyFields(ecommerce);
		return ecommerce;
	};

	const onBoardingLanguageSet = (type) => {
		const payload = generateTemplate("onboarding", "language");
		const { event, page } = payload;
		const eventPayload = {
			type: type,
		};
		push(event, eventPayload, page);
	};

	const onBoardingMethod = (method) => {
		const payload = generateTemplate("onboarding", "onboardingMethod");
		const { event, page } = payload;
		const eventPayload = {
			method: method,
		};
		push(event, eventPayload, page);
	};

	const login = (method) => {
		const payload = generateTemplate("onboarding", "login");
		const { event, page } = payload;
		const eventPayload = {
			method: method,
		};
		push(event, eventPayload, page);
	};

	const onboardingLoginFailed = (reason) => {
		const payload = generateTemplate("onboarding", "onboardingLoginFailed");
		const { event, page } = payload;
		const eventPayload = {
			reason: reason,
		};
		push(event, eventPayload, page);
	};

	const onboardingCoupon = (type) => {
		const payload = generateTemplate("onboarding", "onboardingCoupon");
		const { event, page } = payload;
		const eventPayload = {
			type: type,
		};
		push(event, eventPayload, page);
	};

	const onboardingKosher = (type) => {
		const payload = generateTemplate("onboarding", "onboardingKosher");
		const { event, page } = payload;
		const eventPayload = {
			type: type,
		};
		push(event, eventPayload, page);
	};

	const onboardingMeatOrVegan = (type) => {
		const payload = generateTemplate("onboarding", "onboardingMeatOrVegan");
		const { event, page } = payload;
		const eventPayload = {
			type: type,
		};
		push(event, eventPayload, page);
	};

	const onboardingFinish = (type) => {
		const payload = generateTemplate("onboarding", "onboardingFinish");
		const { event, page } = payload;
		const eventPayload = {
			type: type,
		};
		push(event, eventPayload, page);
	};

	const signupPhone = (method) => {
		const payload = generateTemplate("signup", "signupPhone");
		const { event, page } = payload;
		const eventPayload = {
			method: method,
		};
		push(event, eventPayload, page);
	};

	const signupOTP = (method) => {
		const payload = generateTemplate("signup", "signupOTP");
		const { event, page } = payload;
		const eventPayload = {
			method: method,
		};
		push(event, eventPayload, page);
	};

	const signupOTPFail = (reason) => {
		const payload = generateTemplate("signup", "signupOTPFail");
		const { event, page } = payload;
		const eventPayload = {
			reason: reason,
		};
		push(event, eventPayload, page);
	};

	const signup = (method) => {
		const payload = generateTemplate("signup", "signup");
		const { event, page } = payload;
		const eventPayload = {
			method: method,
		};
		push(event, eventPayload, page);
	};

	const homepage = (type) => {
		const payload = generateTemplate("", "homepage");
		const { event, page } = payload;
		const eventPayload = {
			type: type,
		};
		push(event, eventPayload, page);
	};

	const chooseShipping = (method) => {
		const payload = generateTemplate("delivery", "chooseShipping");
		const { event, page } = payload;
		const eventPayload = {
			method: method,
		};
		push(event, eventPayload, page);
	};

	const chooseShippmentLocation = (method) => {
		const payload = generateTemplate("delivery", "chooseShippmentLocation");
		const { event, page } = payload;
		const eventPayload = {
			method: method,
		};
		push(event, eventPayload, page);
	};

	const chooseNewShippmentLocation = (method, type) => {
		const payload = generateTemplate("delivery", "chooseNewShippmentLocation");
		const { event, page } = payload;
		const eventPayload = {
			method: method,
			type: type,
		};
		push(event, eventPayload, page);
	};

	const chooseShippmentTime = (method) => {
		const payload = generateTemplate("delivery", "chooseShippmentTime");
		const { event, page } = payload;
		const eventPayload = { method: method };
		push(event, eventPayload, page);
	};

	const chooseLaterShippmentTimeConfirm = (method) => {
		const payload = generateTemplate(
			"delivery",
			"chooseLaterShippmentTimeConfirm",
		);
		const { event, page } = payload;
		const eventPayload = { method: method };
		push(event, eventPayload, page);
	};

	const choosePickupLocation = (method) => {
		const payload = generateTemplate("delivery", "choosePickupLocation");
		const { event, page } = payload;
		const eventPayload = { method: method };
		push(event, eventPayload, page);
	};

	const chooseNewBranchLocation = (filter, item) => {
		const payload = generateTemplate("delivery", "chooseNewBranchLocation");
		const { event, page } = payload;
		const eventPayload = { filter: filter, item: item };
		push(event, eventPayload, page);
	};

	const choosePickupTime = (method) => {
		const payload = generateTemplate("delivery", "choosePickupTime");
		const { event, page } = payload;
		const eventPayload = { method: method };
		push(event, eventPayload, page);
	};

	const chooseLaterPickupTimeConfirm = (method) => {
		const payload = generateTemplate("delivery", "chooseLaterPickupTimeConfirm");
		const { event, page } = payload;
		const eventPayload = { method: method };
		push(event, eventPayload, page);
	};

	const personalAreaEntries = (type) => {
		const payload = generateTemplate("personalArea", "personalAreaEntries");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaNav = (category) => {
		const payload = generateTemplate("personalArea", "personalAreaNav");
		const { event, page } = payload;
		const eventPayload = { category: category };
		push(event, eventPayload, page);
	};

	const personalAreaNavVegan = (category) => {
		const payload = generateTemplate("personalArea", "personalAreaNavVegan");
		const { event, page } = payload;
		const eventPayload = { category: category };
		push(event, eventPayload, page);
	};

	const personalAreaNavKosher = (category) => {
		const payload = generateTemplate("personalArea", "personalAreaNavKosher");
		const { event, page } = payload;
		const eventPayload = { category: category };
		push(event, eventPayload, page);
	};

	const personalAreaLatestOrdersViewCart = (category) => {
		const payload = generateTemplate(
			"personalArea",
			"personalAreaLatestOrdersViewCart",
		);
		const { event, page } = payload;
		const eventPayload = { category: category };
		push(event, eventPayload, page);
	};

	const personalAreaDetailsEnteries = (type) => {
		const payload = generateTemplate(
			"personalArea",
			"personalAreaDetailsEnteries",
		);
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaDetailsUpdate = (type) => {
		const payload = generateTemplate("personalArea", "personalAreaDetailsUpdate");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaAddCreditCard = (type) => {
		const payload = generateTemplate("personalArea", "personalAreaAddCreditCard");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaRemoveCreditCard = (type) => {
		const payload = generateTemplate(
			"personalArea",
			"personalAreaRemoveCreditCard",
		);
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaChooseLanguage = (type) => {
		const payload = generateTemplate(
			"personalArea",
			"personalAreaChooseLanguage",
		);
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaLogout = (type) => {
		const payload = generateTemplate("personalArea", "personalAreaLogout");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaLogoutPopupConfirm = (type) => {
		const payload = generateTemplate(
			"personalArea",
			"personalAreaLogoutPopupConfirm",
		);
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaDeleteAccount = (type) => {
		const payload = generateTemplate("personalArea", "personalAreaDeleteAccount");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaDeleteAccountPopupConfirm = (type) => {
		const payload = generateTemplate(
			"personalArea",
			"personalAreaDeleteAccountPopupConfirm",
		);
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const personalAreaDeleteOwnPizza = (type) => {
		const payload = generateTemplate(
			"personalArea",
			"personalAreaDeleteOwnPizza",
		);
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const enterCouponCode = (type) => {
		const payload = generateTemplate("coupons", "enterCouponCode");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const enterCouponCodeFail = (type) => {
		const payload = generateTemplate("coupons", "enterCouponCodeFail");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const enterCouponCodeSuccess = (item, method, type) => {
		const payload = generateTemplate("coupons", "enterCouponCodeSuccess");
		const { event, page } = payload;
		const eventPayload = { item: item, method: method, type: type };
		push(event, eventPayload, page);
	};

	const navBarClick = (item) => {
		const payload = generateTemplate("navBar", "navBarClick");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const navBarInsideClick = (item) => {
		const payload = generateTemplate("navBar", "navBarInsideClick");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const orderClick = (item) => {
		const payload = generateTemplate("navBar", "orderClick");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const myCartEnteries = (item) => {
		const payload = generateTemplate("navBar", "myCartEnteries");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const myOrderStatusEnteries = (item) => {
		const payload = generateTemplate("navBar", "myOrderStatusEnteries");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const myOrderStatusSetFavoritePizza = (item) => {
		const payload = generateTemplate("navBar", "myOrderStatusSetFavoritePizza");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const bigOrdersSend = (item) => {
		const payload = generateTemplate("navBar", "bigOrdersSend");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const myBenefitsEnteries = (item) => {
		const payload = generateTemplate("navBar", "myBenefitsEnteries");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const myBenefitsAddToCard = (props) => {
		const payload = generateTemplate("navBar", "myBenefitsAddToCard");
		const { event, page } = payload;
		const eventPayload = { ...props };
		push(event, eventPayload, page);
	};

	const branchesEnteries = (item) => {
		const payload = generateTemplate("navBar", "branchesEnteries");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const selectSpecificBranch = (props) => {
		const payload = generateTemplate("navBar", "selectSpecificBranch");
		const { event, page } = payload;
		const eventPayload = { ...props };
		push(event, eventPayload, page);
	};

	const specificBranchesEnteries = (type) => {
		const payload = generateTemplate("navBar", "specificBranchesEnteries");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const supportChat = (item) => {
		const payload = generateTemplate("support", "supportChat");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const supportHomePage = (item) => {
		const payload = generateTemplate("support", "supportHomePage");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const supportSocialPlatforms = (type) => {
		const payload = generateTemplate("support", "supportSocialPlatforms");
		const { event, page } = payload;
		const eventPayload = { type: type };
		push(event, eventPayload, page);
	};

	const orderMealCustomized = (item) => {
		const payload = generateTemplate("meal", "orderMealCustomized");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const orderMealCustomizedSelect = (props) => {
		const payload = generateTemplate("meal", "orderMealCustomizedSelect");
		const { event, page } = payload;
		const eventPayload = { ...props };
		push(event, eventPayload, page);
	};

	const orderMealCustomizedTopping = (item) => {
		const payload = generateTemplate("meal", "orderMealCustomizedTopping");
		const { event, page } = payload;
		const eventPayload = { item: item };
		push(event, eventPayload, page);
	};

	const orderMealCustomizedToppingConfirm = (type, item) => {
		const payload = generateTemplate("meal", "orderMealCustomizedToppingConfirm");
		const { event, page } = payload;
		const eventPayload = { type: type, item: item };
		push(event, eventPayload, page);
	};

	const orderMealSpecialInstructions = (props) => {
		const payload = generateTemplate("meal", "orderMealSpecialInstructions");
		const { event, page } = payload;
		const eventPayload = { ...props };
		push(event, eventPayload, page);
	};

	// Ecommerce from here
	const shippingInfo = (props) => {
		const payload = generateTemplate(
			"shippingAndChoosingProducts",
			"shippingInfo",
		);
		const { event, page } = payload;
		const eventPayload = { ...props };
		push(event, eventPayload, page, true);
	};

	const viewItemList = (data, listData) => {
		const payload = generateTemplate("", "viewItemList");
		const { event, items } = payload;
		addShippingInfoAndListData(listData, payload);
		data.forEach((value, index) => {
			const product = generateProductTemplate();
			const newValue = Object.assign({ index: index + 1 }, value);
			createProduct(newValue, product, items, listData);
		});
		push(event, payload, "", true);
	};

	const addToCart = (data, listData) => {
		const payload = generateTemplate("", "addToCart");
		const product = generateProductTemplate();
		const { event, items } = payload;
		addShippingInfoAndListData(listData, payload);
		createProduct(data, product, items);
		push(event, payload, "", true);
	};

	const viewPromotion = (data, listData) => {
		const payload = generateTemplate("", "viewPromotion");
		const product = generateProductTemplate();
		const { event, items } = payload;
		addShippingInfoAndListData(listData, payload);
		createProduct(data, product, items);
		//push to data layer
		push(event, payload, "", true);
	};

	const beginCheckout = (data, listData) => {
		const payload = generateTemplate("", "beginCheckout");
		const { event, items } = payload;
		addShippingInfoAndListData(listData, payload);
		data.forEach((value) => {
			const product = generateProductTemplate();
			createProduct(value, product, items);
		});
		push(event, payload, "", true);
	};

	const selectItem = (data, listData) => {
		const payload = generateTemplate("", "selectItem");
		const { event, items } = payload;
		const product = generateProductTemplate();
		addShippingInfoAndListData(listData, payload);
		createProduct(data, product, items);
		push(event, payload, "", true);
	};

	const viewCart = (data, listData) => {
		const payload = generateTemplate("", "viewCart");
		const { event, items } = payload;
		addShippingInfoAndListData(listData, payload);
		data.forEach((value) => {
			const product = generateProductTemplate();
			createProduct(value, product, items);
		});
		push(event, payload, "", true);
	};

	const selectPromotion = (data, listData) => {
		const payload = generateTemplate("", "selectPromotion");
		const { event, items } = payload;
		const product = generateProductTemplate();
		addShippingInfoAndListData(listData, payload);
		createProduct(data, product, items);

		push(event, payload, "", true);
	};

	const addPaymentInfo = (data, listData) => {
		const payload = generateTemplate("", "addPaymentInfo");
		const { event, items } = payload;
		addShippingInfoAndListData(listData, payload);
		data.forEach((value) => {
			const product = generateProductTemplate();
			createProduct(value, product, items ?? []);
		});

		push(event, payload, "", true);
	};

	const viewItem = (data, listData) => {
		const payload = generateTemplate("", "viewItem");
		const { event, items } = payload;
		const product = generateProductTemplate();
		addShippingInfoAndListData(listData, payload);
		createProduct(data, product, items);

		push(event, payload, "", true);
	};

	const removeFromCart = (data, listData) => {
		const payload = generateTemplate("", "removeFromCart");
		const { event, items } = payload;
		const product = generateProductTemplate();
		addShippingInfoAndListData(listData, payload);
		createProduct(data, product, items);
		push(event, payload, "", true);
	};

	const purchase = (data, listData) => {
		const email = Store.getState()?.userData?.email;
		const phone = Store.getState()?.generalData.phone;
		const userDetails = { email: email, phone: phone };

		const payload = generateTemplate("", "purchase");
		const { event, items } = payload;
		addShippingInfoAndListData(listData, payload);

		data.forEach((value) => {
			const product = generateProductTemplate();
			createProduct(value, product, items);
		});

		push(event, payload, "", true, userDetails);
	};

	const setUserProperties = (data = {}) => {
		for (const key in data) {
			pushUserProperty({ [key]: data[key] });
		}
	};

	const pushUserProperty = (data) => {
		if (SHOW_LOG) {
			// console.log('[GOOGLE ANALYTICS]: Sending User Property: ', data);
		}
		window.dataLayer.push(data);
	};

	const push = (
		event,
		payload,
		page,
		ecommerceWrap = false,
		userDetails = null,
	) => {
		//ecommerceWrap if its have productTemplate
		if (SHOW_LOG) {
			// console.log('[GOOGLE ANALYTICS]: Sending ', event, ' event with ', payload);
		}
		if (ecommerceWrap) delete payload["event"];
		const eventPayload = {
			event,
			...(userDetails && { email: userDetails.email, phone: userDetails.phone }),
			...(ecommerceWrap ? { ecommerce: payload } : { ...payload }),
		};
		if (page && page.length > 0) {
			eventPayload.page = page;
		}
		window.dataLayer.push(eventPayload);
	};
	return {
		onBoardingLanguageSet,
		onBoardingMethod,
		login,
		onboardingLoginFailed,
		onboardingCoupon,
		onboardingKosher,
		onboardingMeatOrVegan, // No usage - There is no selection between mean or vegan at onboarding.
		onboardingFinish,
		signupPhone,
		signupOTP,
		signupOTPFail,
		signup,
		homepage,
		chooseShipping,
		chooseShippmentLocation,
		chooseNewShippmentLocation,
		chooseShippmentTime,
		chooseLaterShippmentTimeConfirm,
		choosePickupLocation,
		chooseNewBranchLocation,
		choosePickupTime,
		chooseLaterPickupTimeConfirm,
		personalAreaEntries,
		personalAreaNav,
		personalAreaNavVegan, // No usage - There is no selection of vegan or not in personal area.
		personalAreaNavKosher,
		personalAreaLatestOrdersViewCart, // No usage - There is no cart button in personal area.
		personalAreaDetailsEnteries,
		personalAreaDetailsUpdate,
		personalAreaAddCreditCard, // No usage - We removed the ability to add a credit card.
		personalAreaRemoveCreditCard,
		personalAreaChooseLanguage,
		personalAreaLogout,
		personalAreaLogoutPopupConfirm,
		personalAreaDeleteAccount,
		personalAreaDeleteAccountPopupConfirm,
		personalAreaDeleteOwnPizza,
		enterCouponCode,
		enterCouponCodeFail,
		enterCouponCodeSuccess,
		navBarClick,
		navBarInsideClick,
		orderClick,
		myCartEnteries,
		myOrderStatusEnteries,
		myOrderStatusSetFavoritePizza, // No usage - no option to save pizza from navbar.
		bigOrdersSend, // No usage - ???
		myBenefitsEnteries,
		myBenefitsAddToCard, // No usage - missing parameters.
		branchesEnteries,
		selectSpecificBranch,
		specificBranchesEnteries,
		supportChat,
		supportHomePage,
		supportSocialPlatforms,
		orderMealCustomized,
		orderMealCustomizedSelect,
		orderMealCustomizedTopping,
		orderMealCustomizedToppingConfirm,
		orderMealSpecialInstructions,
		shippingInfo,
		viewItemList,
		addToCart,
		viewPromotion,
		beginCheckout,
		selectItem,
		viewCart,
		selectPromotion,
		addPaymentInfo,
		viewItem,
		removeFromCart,
		purchase,
		setUserProperties,
	};
})();

export default AnalyticsService;
