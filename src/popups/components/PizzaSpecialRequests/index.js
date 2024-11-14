import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "../../../redux/actions";

import Button from "../../../components/button";

import SpecialRequestsIcon from "/public/assets/icons/multipleOptionsIndicator/pizza-special-requests-icon.svg";

import styles from "./index.module.scss";
import RequestSelector from "./components/RequestSelector";
import CartService from "../../../services/CartService";
import BlurPopup from "../../Presets/BlurPopup";
import useTranslate from "hooks/useTranslate";
import CartItemEntity from "entitiesCartItem/FunctionalCartItem";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import useCartItem from "hooks/useCartItem";

const title = "specialRequestsModal_toppingsBuilder_title";
const btnLabel = "specialRequestsModal_toppingsBuilder_continueBtn_label";

export default function PizzaSpecialRequests(props) {
	const ref = useRef();
	const { payload = {} } = props;
	const { stepIndex = 0, choices = [], isSale, trigger = "" } = payload;

	const dispatch = useDispatch();
	const deviceState = useSelector((store) => store.deviceState);
	const saleObj = useSelector((store) => store.cartItem);
	const pizzaSpecialRequests = useSelector(
		(store) => store.builder.pizzaSpecialRequests[stepIndex ?? 0],
	);

	const builder = useSelector((store) => store.builder);

	const { filterSpecialRequests } = useCartItem();

	const translate = useTranslate();

	const [requestsArray, setRequestsArray] = useState([]);
	useEffect(() => {
		if (Array.isArray(pizzaSpecialRequests)) {
			setRequestsArray(pizzaSpecialRequests);
		}
	}, []);

	const handleOnClosePress = () => {
		ref.current?.animateOut();
	};

	const onContinueButtonPress = () => {
		const currentPizzaSubItems = filterSpecialRequests();
		const newToppings = [...currentPizzaSubItems, ...requestsArray];
		let temp = JSON.parse(JSON.stringify(saleObj));
		dispatch(
			Actions.setPizzaSpecialRequests({
				step: stepIndex,
				data: requestsArray,
			}),
		);

		const selectedPizzaId = isSale
			? saleObj.subitems?.[stepIndex].productId
			: saleObj.productId;

		const item = CartItemEntity.getObjectLiteralItem(
			selectedPizzaId,
			1,
			newToppings,
			null,
			null,
			saleObj?.uuid,
		);
		if (isSale) {
			temp.subitems[stepIndex] = item;
		} else {
			temp = item;
		}
		const payload = {
			item: temp,
			step: "special request",
			insteadOf: temp?.uuid,
		};

		CartService.validateAddToCart(
			payload,
			(res) => {
				dispatch(Actions.setCartItem(payload.item));
			},
			trigger,
		);
		mealAnalytics();
		handleOnClosePress();
	};

	function mealAnalytics() {
		let changeStr = "";
		if (Array.isArray(requestsArray)) {
			changeStr = requestsArray.map(({ title }) => title).join("-");
		}
		const payload = {
			item: "Customize Meal",
			type: builder?.dough?.type,
			method: builder?.dough?.vegan ? "vegan meal" : "regular meal",
			size: builder?.selectedSize,
			item_variant: changeStr,
		};
		AnalyticsService.orderMealSpecialInstructions(payload);
	}

	const onRequestChange = (
		id,
		replace,
		changedTitle,
		isDefaultElement = false,
	) => {
		const payload = {
			productId: id,
			quantity: 1,
			quarters: null,
			title: changedTitle,
		};
		const temp = requestsArray.filter((r) => r.productId !== replace);
		// We don't want to add the request if its a default element
		if (!isDefaultElement) {
			temp.push(payload);
		}
		setRequestsArray(temp);
	};

	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			showCloseIcon
			className={styles["pizza-special-requests-popup"]}>
			<div className={styles["content"]}>
				<div className={styles["scroll-area"]}>
					<div className={styles["special-requests-header-wrapper"]}>
						{deviceState.notDesktop && (
							<div className={styles["header-icon"]}>
								<img
									src={SpecialRequestsIcon.src}
									alt={""}
								/>
							</div>
						)}
						<span
							className={styles["header-title"]}
							tabIndex={0}>
							{translate(title)}
						</span>
					</div>
					<div className={styles["requests-wrapper"]}>
						{choices.map((choice) => {
							return (
								<RequestSelector
									key={`request-${choice.id}`}
									menuId={choice.id}
									stepIndex={stepIndex}
									onChangeRequest={onRequestChange}
									requestsArray={requestsArray}
								/>
							);
						})}
					</div>
					<Button
						className={styles["save-btn"]}
						text={translate(btnLabel)}
						animated={false}
						onClick={onContinueButtonPress}
					/>
				</div>
			</div>
		</BlurPopup>
	);
}
