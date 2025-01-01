import React, { forwardRef } from "react";

import styles from "./TermsCheckbox.module.scss";
import Checkbox from "components/forms/checkbox";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";
import { CHECKBOX_VARAINTS } from "constants/checkbox-variants";
import DynamicLink from "components/dynamic_link";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import LanguageDirectionService from "services/LanguageDirectionService";

const TermsCheckbox = forwardRef((props, ref) => {
	const { name = "terms", value, onChange, onFocus, onBlur } = props;
	const translate = useTranslate();

	const sidebarTerms = useSelector((store) => store.links.sidebarTerms);
	const terms = sidebarTerms.find((t) => t.id === "TermOfService");
	const privacy = sidebarTerms.find((t) => t.id === "Privacy_policy");
	const dispatch = useDispatch();

	function closeAllPopups() {
		dispatch(Actions.resetPopups());
	}

	const screenReaderContent = () => {
		return `${translate("term_i_accept")} ${translate(
			"terms_termOfService",
		)} ${translate("and")} ${translate("privacy__label")}`;
	};

	return (
		<Checkbox
			ref={ref}
			id={name}
			className={clsx(styles["checkbox"], styles["term-of-service"])}
			name={name}
			value={value}
			variant={CHECKBOX_VARAINTS.DARK}
			onChange={onChange}
			extraStyles={styles}
			tabIndex={0}
			onFocus={onFocus}
			onBlur={onBlur}
			ariaLabel={screenReaderContent()}>
			<div className={styles["terms-and-conds-container"]}>
				<span
					className={styles["label"]}
					aria-hidden={true}>
					{translate("term_i_accept")}
				</span>
				<DynamicLink
					link={terms}
					className={`${styles["link"]} ${styles["no-space"]} ${LanguageDirectionService.isRTL() && styles["terms-link-rtl"]}`}
					onClick={closeAllPopups}>
					{translate("terms_termOfService")}
				</DynamicLink>
				<span
					className={styles["label"]}
					aria-hidden={true}>
					{translate("and")}
				</span>
				<DynamicLink
					link={privacy}
					className={`${styles["link"]} ${styles["no-space"]}`}
					onClick={closeAllPopups}>
					{translate("privacy__label")}
				</DynamicLink>
			</div>
		</Checkbox>
	);
});

TermsCheckbox.displayName = "TermsCheckbox";

export default TermsCheckbox;
