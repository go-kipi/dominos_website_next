import clsx from "clsx";
import React from "react";

import styles from "./index.module.scss";
import Digits from "components/Revolver/Revolver";
import {useSelector} from "react-redux";

/*
    *** ---- MB Productions present ---- ***
    no notification when 0 items or deliveryFee Item
    blue notification when deliveryFee && only coupons
    red notification when at least 1 item or more!
*/
function Notification(props) {
    const {className, text, isCartNotification = false} = props;
    const cartData = useSelector(store => store?.cartData)

    const couponNotification = () => {
        if (!cartData || !cartData.items) return false;
        if (cartData.itemCount > 0) return false;

        const allCouponsInCart = cartData.items.every(
            (subItem) =>
                (
                    cartData?.products?.[subItem?.productId]?.meta === "coupon" ||
                    cartData?.products?.[subItem?.productId]?.meta === "discountCoupon"
                ) ||
                cartData?.products?.[subItem?.productId]?.meta === "deliveryFee",
        );
        return allCouponsInCart && isCartNotification;
    };

    const deliveryNotification = () => {
        if (!cartData || !cartData.items) return false;
        if (cartData.itemCount > 0) return false;

        const isAllDeliveryFee = cartData.items.every(
            (subItem) => {
                return cartData?.products?.[subItem?.productId]?.meta === "deliveryFee"
            }
        );
        return isAllDeliveryFee && isCartNotification;
    };

    const isDeliveryFee = deliveryNotification();
    const isAllCoupon = couponNotification();

    const noItemCount = cartData?.itemCount === 0;
    const noCartItems = !cartData?.items || cartData?.items?.length === 0;
    const isObjectCartEmpty = typeof cartData === 'object' && Object.keys(cartData)?.length === 0;

    const noItems = ((noItemCount && noCartItems) || isObjectCartEmpty || isDeliveryFee) && isCartNotification // dont show notification

    if (noItems) {
        return <></>
    }

    return (
        <div
            className={clsx(
                styles["notification"],
                isAllCoupon ? styles["blue"] : "",
                className,
            )}>
            {!isAllCoupon && text && <Digits value={text}/>}
        </div>
    );
}

export default Notification;
