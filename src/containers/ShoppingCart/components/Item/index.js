import React from "react";

import styles from "./index.module.scss";

import clsx from "clsx";
import CouponIcon from "/public/assets/icons/coupon-icon.svg";
import useTranslate from "hooks/useTranslate";
import { RenderCartItemSubItems } from "../RenderCartItemSubItems/RenderCartItemSubItems";
import OptionsCart from "../OptionsCart/OptionsCart";
import RenderPrices from "../RenderCartPrices/RenderCartPrices";
const Item = (props) => {
	const {
		image,
		isCouponItem = false,
		onRemoveUpgrade,
		newPrice,
		price,
		subText,
		text,
		subItems,
		options,
		isBenefitItem = false,
		showPriceBeforeDiscount = false,
		onEditItem,
	} = props;

	const translate = useTranslate();
	``;
	return (
		<div className={clsx(styles["conatiner"])}>
			<div className={clsx(styles["item-ticket"])}>
				<div className={clsx(styles["item-ticket-inner"])}>
					{isCouponItem ? (
						<div className={styles["coupon-img-wrap"]}>
							<img
								className={styles["image"]}
								src={CouponIcon.src}
								alt={"image"}
								aria-hidden={true}
							/>
						</div>
					) : (
						<div className={`${styles["img-wrap"]}`}>
							<img
								className={`${styles["image"]} `}
								src={image}
								alt={"image"}
								aria-hidden={true}
							/>
						</div>
					)}
					<div className={styles["item-ticket-body"]}>
						<div className={styles["body-inner"]}>
							<div className={styles["item-ticket-right"]}>
								{isCouponItem ? (
									<div className={styles["text-wrap"]}>
										<span className={styles["coupon-text"]}>
											{translate("coupon")}

											<span className={styles["coupon-text-inner"]}>{text}</span>
										</span>
										<span className={clsx(styles["sub"], styles["text"])}>{subText}</span>
									</div>
								) : isBenefitItem ? (
									<div className={styles["text-wrap"]}>
										<span className={styles["coupon-text"]}>
											{text + " "}
											<span className={styles["coupon-text-inner"]}>
												{translate("coupon_item_for_free")}
											</span>
										</span>
										<span className={clsx(styles["sub"], styles["text"])}>{subText}</span>
									</div>
								) : null}
							</div>

							<div className={styles["item-ticket-left"]}>
								<RenderPrices
									newPrice={newPrice}
									showPriceBeforeDiscount={showPriceBeforeDiscount}
									price={price}
								/>
							</div>
						</div>
					</div>
				</div>

				<OptionsCart options={options} />
			</div>

			<RenderCartItemSubItems
				onRemoveUpgrade={onRemoveUpgrade}
				subItems={subItems}
				onEditItem={onEditItem}
			/>
		</div>
	);
};

export default Item;
