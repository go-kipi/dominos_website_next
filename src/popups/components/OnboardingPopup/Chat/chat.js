import Button from "components/button";
import React from "react";
import styles from "./chat.module.scss";
import useTranslate from "hooks/useTranslate";
import ChatIcon from "/public/assets/icons/chat-popup-icon.svg";
import BackIcon from "/public/assets/icons/back-black.svg";

function Chat(props) {
	const translate = useTranslate();

	const onBackClick = () => {
		props.navigateToPhone();
	};

	function onButtonClick() {
		window.open("https://wa.me/972732487007", "_blank");
	}

	return (
		<div className={styles["chat-wrapper"]}>
			<button
				aria-label={translate("accessibility_alt_arrowBack")}
				className={styles["back-icon-wrapper"]}
				onClick={onBackClick}>
				<img
					src={BackIcon.src}
					alt={""}
					className={styles["icon"]}
				/>
			</button>
			<div className={styles["icon-wrapper"]}>
				<img
					className={styles["close-icon"]}
					src={ChatIcon.src}
					alt={"Close"}
				/>
			</div>
			<h4
				className={styles["title-label"]}
				aria-labelledby={translate("chat_popup_msg")}
				aria-live={"polite"}
				tabIndex={0}>
				{translate("chat_popup_msg")}
			</h4>
			<Button
				className={styles["chat-btn"]}
				text={translate("chat_popup_btn_label")}
				onClick={onButtonClick}
			/>
		</div>
	);
}

export default Chat;
