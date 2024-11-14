import React from "react";
import DeleteIcon from "/public/assets/icons/delete-icon.svg";
import styles from "./AddressListItem.module.scss";
import useTranslate from "../../../hooks/useTranslate";
import SRContent from "../../../components/accessibility/srcontent";

function AddressListItem(props) {
	const { onClick = () => {}, address = {} } = props;

	const handleOnClick = () => {
		typeof onClick === "function" && onClick(address);
	};

	const translate = useTranslate();
	return (
		<div className={styles["address-list-item-wrapper"]}>
			<div className={styles["address-text"]}>{address.fullAddress}</div>
			<button
				onClick={handleOnClick}
				className={styles["address-delete-icon"]}>
				<SRContent
					message={
						translate("accessibility_imageAlt_deleteAddress") +
						" " +
						address.fullAddress
					}
				/>
				<img
					src={DeleteIcon.src}
					alt={""}
					aria-hidden={true}
				/>
			</button>
		</div>
	);
}

export default AddressListItem;
