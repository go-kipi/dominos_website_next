import useTranslate from "hooks/useTranslate";
import React from "react";
import defaultStyles from "./index.module.scss";

const MaxFreeDipsMessage = (props) => {
	const { styles = defaultStyles, overrides, components } = props;
	const translate = useTranslate();

	const maxFreeDips = overrides?.[0]?.maxQtty ?? 0;
	const minChooseDipsInCmp = components?.[0]?.min ?? 0;
	const maxChooseDipsInCmp = components?.[0]?.max ?? 0;

	const isAllPricesZero =
		overrides?.[0]?.products &&
		Object.values(overrides[0].products).every((price) => price === 0);

	const noFreeDipsMessage = () => {
		if (minChooseDipsInCmp > 1) {
			return translate("mandatory_dips").replace(
				"{mandatory_dips}",
				minChooseDipsInCmp,
			);
		} else {
			return translate("no_free_dips");
		}
	};

	const getFreeDipsMessage = () => {
		const conditionsMap = {
			sameMinMax: minChooseDipsInCmp === maxChooseDipsInCmp,
			noFreeDips: maxFreeDips <= 0,
			oneFreeDip: maxFreeDips === 1 && isAllPricesZero,
			selectDips: maxFreeDips === 1 && !isAllPricesZero,
			maxFreeDips: maxFreeDips > 1,
		};

		const messageKey = Object.keys(conditionsMap).find(
			(key) => conditionsMap[key],
		);

		const messages = {
			sameMinMax: (
				<span className={styles["extraTitle"]}>
					{translate("general_select_dips")}
				</span>
			),
			noFreeDips: (
				<span className={styles["extraTitle"]}>{noFreeDipsMessage()}</span>
			),
			oneFreeDip: (
				<span className={styles["extraTitle"]}>{translate("one_free_dip")}</span>
			),
			selectDips: (
				<span className={styles["extraTitle"]}>
					{translate("general_select_dips")}
				</span>
			),
			maxFreeDips: (
				<span className={styles["extraTitle"]}>
					{translate("max_free_dips").replace("{maxDips}", maxFreeDips)}
				</span>
			),
		};
		return messages[messageKey] || null;
	};

	const renderFreeDipsMessage = () => {
		const title = translate("dips_title");
		const message = getFreeDipsMessage();

		return (
			<div className={styles["freeDipsWrapper"]}>
				<span className={styles["freeDipsMessage"]}>{title}</span>
				{message}
			</div>
		);
	};

	return (
		<div className={styles["maxFreeDipsContainer"]}>
			{renderFreeDipsMessage()}
		</div>
	);
};

export default MaxFreeDipsMessage;
