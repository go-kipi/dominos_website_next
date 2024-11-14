import useGetMenuData from "hooks/useGetMenuData";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

import styles from "./index.module.scss";
import useTranslate from "hooks/useTranslate";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";

const cheeseTitle = "specialRequestsModal_toppingsBuilder_cheeseAmount_title";
const sauceTitle = "specialRequestsModal_toppingsBuilder_sauceAmount_title";
const sliceTitle = "specialRequestsModal_toppingsBuilder_sliceAmount_title";
const bakeTitle = "specialRequestsModal_toppingsBuilder_bakeAmount_title";
const doughTitle = "specialRequestModal_toppingsBuilder_doughAmount_title";

export default function RequestSelector(props) {
	const {
		stepIndex = 0,
		menuId,
		onChangeRequest = () => {},
		requestsArray,
	} = props;
	const menus = useSelector((store) => store.menusData.menus);

	const requestMenu = menus[menuId];
	const requests = menus[menuId]?.elements ?? [];
	const [selected, setSelected] = useState();
	const [title, setTitle] = useState("");
	const translate = useTranslate();
	const hasValidRequests = Array.isArray(requests) && requests.length > 0;

	const getStateFromMenu = () => {
		if (menuId.includes("cheese")) {
			setTitle(translate(cheeseTitle));
		}
		if (menuId.includes("cuts")) {
			setTitle(translate(sliceTitle));
		}
		if (menuId.includes("dough")) {
			setTitle(translate(doughTitle));
		}
		if (menuId.includes("souce")) {
			setTitle(translate(sauceTitle));
		}
		if (menuId.includes("prep")) {
			setTitle(translate(bakeTitle));
		}
	};

	useEffect(() => {
		getStateFromMenu();
	}, []);

	useEffect(() => {
		setSelected(findSelected());
	}, [requestsArray]);

	function findSelected() {
		for (const requestKey in requests) {
			const request = requests[requestKey];
			for (const specialKey in requestsArray) {
				const special = requestsArray[specialKey];
				if (request.id === special.productId) {
					return request.id;
				}
			}
		}
		return requestMenu?.defaultElement;
	}

	const handleChangeSelected = (id, changedTitle) => {
		const isDefaultElement = id === requestMenu?.defaultElement;
		onChangeRequest(id, selected, changedTitle, isDefaultElement);

		setSelected(id);
	};
	return (
		<div className={styles["request-selector-wrapper"]}>
			<h2 className={styles["request-title"]}>{title}</h2>
			<div className={styles["requests-wrapper"]}>
				{hasValidRequests
					? requests?.map((request, idx) => (
							<RequestOption
								key={`request-selector-item-${request.id}-${idx}`}
								selected={selected}
								handleChangeSelected={handleChangeSelected}
								request={request}
								stepIndex={stepIndex}
								title={title}
								menuId={menuId}
							/>
					  ))
					: null}
			</div>
		</div>
	);
}

export function RequestOption(props) {
	const { request, handleChangeSelected, title, stepIndex, selected, menuId } =
		props;
	const product = useMenus(request.id, ActionTypes.PRODUCT);
	return (
		<button
			onClick={() => handleChangeSelected(request.id, menuId)}
			className={
				product.id === selected
					? styles["selected-request-wrapper"]
					: styles["request-wrapper"]
			}
			aria-label={title + " " + product.nameUseCases?.Title}
			role={"radio"}
			aria-checked={product.id === selected}>
			<span
				className={
					product.id === selected
						? styles["selected-request-name"]
						: styles["request-name"]
				}>
				{product.nameUseCases?.Title}
			</span>
		</button>
	);
}
