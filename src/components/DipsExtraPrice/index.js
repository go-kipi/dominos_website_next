import useTranslate from "hooks/useTranslate";
import React from "react";
import styles from "./index.module.scss";
import { useSelector } from "react-redux";
import LanguageDirectionService from "services/LanguageDirectionService";

const DipsExtraPrice = (props) => {
	const {
		option,
		overrides = {},
		isTotalItemsSelectedBitMaxQtty = true,
		hasOverides,
	} = props;
	const translate = useTranslate();
	const catalogItems = useSelector((store) => store.menusData.catalogProducts);
	const catalogItemPrice = catalogItems[option.id].price;
	const getUpdatePricePerDip = () => {
		const dipPrice = overrides[0]?.products[option.id];

		return checkIfShowPrice(dipPrice);
	};

	const checkIfShowPrice = (dipPrice) => {
		const isRTL = LanguageDirectionService.isRTL();
		const priceTxt = isRTL ? "[{dip_price}+₪]" : "[₪+{dip_price}]" ;
		
		if (isTotalItemsSelectedBitMaxQtty) {
			const price = priceTxt.replace("{dip_price}", catalogItemPrice);
			if (catalogItemPrice > 0) {
				return <span className={styles["extra-price-dip"]}>{price}</span>;
			} else {
				return <></>;
			}
		} else {
			const price = priceTxt.replace("{dip_price}", dipPrice);
			if (dipPrice > 0) {
				return <span className={styles["extra-price-dip"]}>{price}</span>;
			} else {
				return <></>;
			}
		}
	};

	return hasOverides ? getUpdatePricePerDip() : "";
};

export default DipsExtraPrice;
