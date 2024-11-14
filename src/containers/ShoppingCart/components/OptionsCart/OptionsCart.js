import React from "react";

import styles from "./OptionsCart.module.scss";
import MultipleOptionsIndicator from "components/MultipleOptionsIndicator";
import clsx from "clsx";
import LanguageDirectionService from "services/LanguageDirectionService";

function OptionsCart({ options = {} }) {
	const isRTL = LanguageDirectionService.isRTL() ? styles["rtl"] : styles["ltr"];

	return options.length ? (
		<MultipleOptionsIndicator
			options={options}
			className={clsx(styles["toppings-actions"], isRTL)}
			extraStyles={styles}
		/>
	) : (
		<div className={styles["no-toppings-actions"]} />
	);
}

export default OptionsCart;
