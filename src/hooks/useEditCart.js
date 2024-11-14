import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import useMenus from "./useMenus";
import ActionTypes from "constants/menus-action-types";
import Api from "api/requests";
import { notEmptyObject } from "utils/functions";

const useEditCart = (props = {}) => {
	const { templateId = {}, itemId, step } = props;
	const [saleTemplate, setSaleTemplate] = useState();
	const hasSteps = Array.isArray(saleTemplate?.steps);
	const hasPriceOverrides =
		typeof saleTemplate?.priceOverrides === "object" &&
		notEmptyObject(saleTemplate?.priceOverrides);
	const priceOverrides = hasPriceOverrides ? saleTemplate.priceOverrides : null;
	const currentSteps = hasSteps ? saleTemplate.steps : null;
	const product = useMenus(itemId, ActionTypes.PRODUCT);
	const [tabs, setTabs] = useState(currentSteps);
	const [overrides, setOverrides] = useState(priceOverrides);

	const getTemplate = useCallback(
		(templateId) => {
			const onSuccess = (res) => {
				setSaleTemplate(res);
				setTabs(res.steps ? res.steps : product);
				setOverrides(res.priceOverrides);
			};

			if (typeof templateId === "string" && tabs === null) {
				const payload = { id: templateId };
				Api.getProductTemplate({
					payload,
					onSuccess,
				});
			}
		},
		[templateId],
	);

	React.useMemo(() => {
		if (itemId && product && notEmptyObject(product)) {
			const productTemplateId = product.templateId;
			if (productTemplateId) {
				getTemplate(productTemplateId);
				return;
			}
		} else if (templateId) {
			getTemplate(templateId);
			return;
		}
		setTabs(null);
		setOverrides(null);
	}, []);
	return [tabs, overrides, saleTemplate];
};

export default useEditCart;
