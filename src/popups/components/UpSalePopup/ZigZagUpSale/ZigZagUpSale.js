import useCartInMenu from "hooks/useCartInMenu";
import Button from "components/button";
import TextOnlyButton from "components/text_only_button";
import React from "react";
import UpSaleProduct from "./Product/ZigZagProduct";

import styles from "./ZigZagUpSale.module.scss";
import useTranslate from "hooks/useTranslate";
function ZigZagUpSale(props) {
	const { hasElements, accept = () => {}, decline = () => {}, menu } = props;

	const item1 = hasElements ? menu.elements[0] : {};
	const item2 = hasElements ? menu.elements[1] : {};
	const [quantity1, _1, removeFromBasket1] = useCartInMenu(item1?.id);
	const [quantity2, _2, removeFromBasket2] = useCartInMenu(item2?.id);
	const showBtn = quantity1 > 0 || quantity2 > 0;
	const translate = useTranslate();
	function onDeclineHandler() {
		return typeof decline === "function" && decline();
	}

	return (
		<div className={styles["zig-zag-up-sale-wrapper"]}>
			<div className={styles["zig-zag-up-sale-products"]}>
				{hasElements && (
					<>
						<UpSaleProduct
							item={item1}
							isReversed={false}
							accept={accept}
							quantity={quantity1}
							removeFromBasket={removeFromBasket1}
							index={1}
						/>
						<UpSaleProduct
							item={item2}
							isReversed={true}
							accept={accept}
							quantity={quantity2}
							removeFromBasket={removeFromBasket2}
							index={2}
						/>
					</>
				)}
			</div>
			<div className={styles["actions"]}>
				{showBtn && (
					<Button
						className={styles["accept-btn"]}
						text={translate("upsale_product_continueAcceptBtn_label")}
						onClick={onDeclineHandler}
					/>
				)}
				{!showBtn && (
					<TextOnlyButton
						className={styles["decline-btn"]}
						text={translate("upsale_product_declineBtn_label")}
						onClick={onDeclineHandler}
					/>
				)}
			</div>
		</div>
	);
}

export default ZigZagUpSale;
