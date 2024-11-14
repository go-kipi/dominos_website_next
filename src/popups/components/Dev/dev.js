import SlidePopup from "popups/Presets/SlidePopup";
import React, { useState } from "react";

import Button from "components/button";
import { useSelector } from "react-redux";

import Api from "api/requests";
import styles from "./dev.module.scss";
import LocalStorageService from "services/LocalStorageService";
import TextInput from "components/forms/textInput";

function DevPopup(props) {
	const phone = useSelector((store) => store.generalData.phone);

	const [phoneInput, setPhoneInput] = useState("");

	function changeUserStatus() {
		const newUser = {
			customerId: phone,
			termApproval: false,
			customerType: "default",
		};
		Api.setCustomerOnlyQA({ payload: newUser });
	}
	function newCustomer() {
		const newUser = {
			customerId: phone,
			termApproval: false,
			customerType: "new",
		};
		Api.setCustomerOnlyQA({ payload: newUser });
	}
	function getStoreList() {
		const payload = {
			lang: "he",
			onlyvisited: false,
		};
		for (let i = 0; i < 50; i++) {
			Api.getStoreList({ payload });
		}
	}

	function get500() {
		Api.generic({
			payload: {},
			config: {
				path: "https://httpstat.us/500",
			},
		});
	}

	function changeShowPopups() {
		const showPopups = Number(LocalStorageService.getItem("showPopups", 1));

		const op = !!showPopups ? 0 : 1;
		localStorage.setItem("showPopups", op);
	}

	function changeSubStatus() {
		const raw = JSON.stringify({
			phone: phoneInput,
		});

		const requestOptions = {
			method: "POST",

			body: raw,
		};
		fetch("/api/inforu", requestOptions);
	}

	return (
		<SlidePopup
			id={props.id}
			showCloseIcon
			className={styles["dev-popup"]}>
			<Button
				text={"שינוי סטטוס לקוח"}
				onClick={changeUserStatus}
			/>
			<Button
				text={"לקוח חדשששששש"}
				onClick={newCustomer}
			/>
			<Button
				text={"50 קריאות"}
				onClick={getStoreList}
			/>
			<Button
				text={"500 סתם כי בא לי"}
				onClick={get500}
			/>
			<Button
				text={"שנה מצב הצגת פופאפים מעצבנים"}
				onClick={changeShowPopups}
			/>
			<Button
				text={"שינוי סטטוס דיוור"}
				onClick={changeSubStatus}
			/>

			<TextInput
				value={phoneInput}
				onChange={(e) => setPhoneInput(e.target.value)}
				placeholder={"הזן מספר טלפון"}
			/>
		</SlidePopup>
	);
}

export default DevPopup;
