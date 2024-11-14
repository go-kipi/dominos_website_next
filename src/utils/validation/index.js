import { Store } from "../../redux/store";

export default function Validate(value, rules) {
	const translations = Store.getState().translations;

	function rearangeDate(originalDate) {
		if (!originalDate) {
			return "";
		}
		const parts = originalDate.split("/");
		return parts[2] + "-" + parts[1] + "-" + parts[0];
	}
	const isDateReal = (dateString) => {
		const rearangeDateString = rearangeDate(dateString);
		const date = new Date(rearangeDateString);
		const newDate =
			date.getFullYear() +
			"-" +
			(date.getMonth() + 1).toString().padStart(2, "0") +
			"-" +
			date.getDate().toString().padStart(2, "0");
		return rearangeDateString === newDate;
	};
	const Validations = {
		no_validation: {
			valid: (val) => true,
			msg: "",
		},
		not_empty: {
			valid: (val) => val !== "" && val !== undefined,
			msg: translations["input_missing_errorMsg"],
		},
		minLength:{
			valid: (val) => /^.{2,}$/.test(val),
			msg: translations["input_minLength_error"]
		},
		date: {
			valid: (val) =>
				!val ||
				(/^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/.test(
					val,
				) &&
					isDateReal(val)),
			msg: translations["validate_date_error"],
		},
		notes_for_courier: {
			valid: (val) =>
				/^$|^[a-zA-Z\d+\u0590-\u05FF/\s,. \\/()?!/\\'’";[\]#*+\-,.]{1,50}$/g.test(
					val,
				),
			msg: translations.input_notesForCourier_errorMsg,
		},
		apartment: {
			valid: (val) =>
				/^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|[1-9][0-9][0-9][0-9][0-9])$/g.test(
					val,
				),
			msg: translations["input_apartment_errorMsg"],
		},
		bussiness_name: {
			valid: (val) =>
				/^$|^[a-zA-Z\d+\u0590-\u05FF/\s,. \\/()?!/\\'"’׳;[\]#*+\-,.]{1,20}$/g.test(
					val,
				),
			msg: translations["input_bussinessName_errorMsg"],
		},
		floor: {
			valid: (val) => /^[\w\u0590-\u05FF/\s_@./#&+-]{1,3}$/g.test(val),
			msg: translations["input_floor_errorMsg"],
		},
		entrance: {
			valid: (val) => {
				if (val === undefined) return true;
				else return /^$|^[\w\u0590-\u05FF/\s]{1,3}$/g.test(val);
			},
			msg: translations["input_entrance_errorMsg"],
		},
		address: {
			valid: (val) => val !== "" && val !== undefined,
			msg: "יש לבחור כתובת למשלוח",
		},
		package: {
			valid: (val) => val !== "" && val !== undefined,
			msg: "יש לבחור מסלול",
		},
		email: {
			valid: (val) =>
				/^([\w!#$%&'*+-/=?^`{|}~]+\.)*[\w!#$%&'*+-/=?^`{|}~]+@((((([a-zA-Z0-9]{1}[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]{1})|[a-zA-Z])\.)+[a-zA-Z]{2,6})|(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?)$/.test(
					val,
				),
			msg: translations.input_email_error,
		},
		cell: {
			valid: (val) =>
				/^(?:(0(?:50|51|52|53|54|55|56|58|72|73|74|76|77|78)[-]?[0-9]{7}))$/.test(
					val,
				),
			msg: translations["input_phone_errorMsg"],
		},
		phone: {
			valid: (val) =>
				/^(?:(0(?:2|3|4|8|9|7|50|51|52|53|54|55|56|58|59|72|73|74|76|77|78)[-]?[0-9]{7}))$/.test(
					val,
				),
			msg: translations["input_phone_errorMsg"],
		},
		phoneJustNumbers: {
			valid: (val) =>
				/^(?:(0(?:2|3|4|8|9|7|50|51|52|53|54|55|56|58|59|72|73|74|76|77|78)?[0-9]{7}))$/.test(
					val,
				),
			msg: translations["input_phone_errorMsg"],
		},
		id: {
			valid: (val) => /^[0-9]*$/.test(val) && val.length === 9,
			msg: "תעודת זהות לא תקינה",
		},
		full_name: {
			valid: (val) =>
				/^([\w\u0590-\u05FF]{2,})+\s+([\w\u0590-\u05FF\s]{2,})+$/.test(val),
			msg: "יש למלא שם פרטי ושם משפחה",
		},
		last_digits: {
			valid: (val) => /^[0-9]*$/.test(val) && val.length === 4,
			msg: "אנא הזינו 4 ספרות אחרונות בכרטיס האשראי",
		},
		checkbox: {
			valid: (val) => val,
			msg: "שדה חובה",
		},
		checkbox_term_of_service: {
			valid: (val) => val,
			msg: "חובה לסמן תנאי שירות",
		},
		required_select: {
			valid: (val) => {
				if (val === undefined) return false;
				return val !== -1;
			},
			msg: "שדה חובה",
		},
		required_radio: {
			valid: (val) => {
				if (val === undefined) return false;
				// return val != -1;
				return true;
			},
			msg: "שדה חובה",
		},
		home_phone: {
			valid: (val) =>
				/^(?:(0(?:2|3|4|8|9|7|72|73|74|76|77|78)[-]?[0-9]{7}))$/.test(val),
			msg: "מספר קווי שגוי",
		},
		mobile_phone: {
			valid: (val) =>
				/^(?:(0(?:50|51|52|53|54|55|56|57|58|59)[-]?[0-9]{7}))$/.test(val),
			msg: "מספר נייד שגוי",
		},
	};

	let valid = true;
	let msg = "";

	for (const rule of rules) {
		if (typeof rule === "function") {
			valid = rule();
			msg = "שדה חובה";
		} else {
			if (!Validations[rule].valid(value)) {
				valid = false;
				msg = Validations[rule].msg;
				break;
			}
		}
	}

	return { valid, msg };
}
