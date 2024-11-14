import React, { useRef } from "react";
import SlidePopup from "../../Presets/SlidePopup";
import TermOfServiceIcon from "/public/assets/icons/term_of_service.svg";
import styles from "./index.module.scss";
import Button from "components/button";
import useTranslate from "hooks/useTranslate";

const TERM_OF_SERVICE = "https://www.google.com";
function IdentificationPopup(props) {
	const ref = useRef();
	const translate = useTranslate();

	function RenderPopup() {
		return (
			<>
				<img
					className={styles["icon"]}
					src={TermOfServiceIcon.src}
					alt={"icon"}
				/>
				<p
					className={styles["sub-title"]}
					tabIndex={0}>
					<span>{translate("termOfServiceModal_subTitle_changes")}</span>
					<a
						className={styles["link"]}
						href={TERM_OF_SERVICE}>
						{" "}
						{translate("termOfServiceModal_subTitle_termOfService")}{" "}
					</a>
					<span>{translate("termOfServiceModal_subTitle_ours")}</span>
				</p>
				<h1
					className={styles["title"]}
					tabIndex={0}>
					{translate("termOfServiceModal_title_yourApproval")}
				</h1>

				<Button
					className={styles["custom-btn"]}
					text={translate("termOfServiceModal_buttonText")}
					onClick={() => ref?.current?.animateOut()}
				/>
			</>
		);
	}
	return (
		<SlidePopup
			id={props.id}
			ref={ref}
			className={styles["term-of-service"]}
			showCloseIcon>
			<div className={styles["content"]}>{RenderPopup()}</div>
		</SlidePopup>
	);
}

export default IdentificationPopup;
