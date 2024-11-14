import clsx from "clsx";
import Price from "components/Price";

import styles from "./RenderCartPrices.module.scss";
import useTranslate from "hooks/useTranslate";

function RenderPrices({
	showPriceBeforeDiscount = false,
	price = 0,
	newPrice = 0,
	className = "",
}) {
	return (
		<div className={clsx(styles["prices-wrap"], className)}>
			<div className={styles["price-wrapper-block"]}>
				{showPriceBeforeDiscount ? (
					<Price
						className={clsx(styles["price"], styles["old"])}
						value={price}
						currency={"shekel"}
						extraStyles={styles}
						mark
					/>
				) : null}
			</div>

			<div className={styles["price-wrapper-block"]}>
				<Price
					className={styles["price"]}
					value={newPrice}
					currency={"shekel"}
					extraStyles={styles}
				/>
			</div>
		</div>
	);
}

export default RenderPrices;

function RenderInculde({
	price = 0,
	newPrice = 0,
	showPriceBeforeDiscount = false,
}) {
	const translate = useTranslate();

	return !newPrice ? (
		<div className={styles["prices-wrap"]}>
			<div className={styles["price-wrapper-block"]} />

			<div className={styles["price-wrapper-block"]}>
				<span className={styles["include"]}>
					{translate("shoppingCart_item_included")}
				</span>
			</div>
		</div>
	) : (
		<RenderPrices
			newPrice={newPrice}
			price={price}
			showPriceBeforeDiscount={showPriceBeforeDiscount}
		/>
	);
}

export { RenderInculde };
