import React, { useEffect, useRef, useState } from "react";

import LottieAnimation from "components/LottieAnimation";
import { useRouter } from "next/router";
import { cart } from "../../../constants/routes";
import { animated, useSpring } from "@react-spring/web";

import styles from "./index.module.scss";
import EndOfSaleAnimation from "animations/end-of-sale.json";
import SlidePopup from "popups/Presets/SlidePopup";
import clsx from "clsx";
import XIcon from "/public/assets/icons/x-icon.svg";

import useTranslate from "hooks/useTranslate";
import { AnimatedCapsule } from "components/AnimatedCapsule/AnimatedCapsule";

export default function EndOfSalePopup(props) {
	const { payload = {} } = props;
	const { onCartClick = () => {}, onMenuHandler = () => {} } = payload;
	const router = useRouter();
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const topStyles = useSpring({ marginTop: shouldAnimate ? 0 : 100 });
	const bottomStyles = useSpring({
		marginTop: shouldAnimate ? 0 : 75,
		opacity: shouldAnimate ? 1 : 0,
	});
	const ref = useRef();
	const translate = useTranslate();
	const animateOut = (callback) => ref.current?.animateOut(callback);

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (!shouldAnimate) {
				setShouldAnimate((prev) => !prev);
				clearTimeout(timeout);
			}
		}, 350);
	}, [shouldAnimate]);

	const handleNavigateToMenu = () => {
		animateOut(() => {
			onMenuHandler();
		});
	};

	const handleNavigateToCart = () => {
		animateOut(() => {
			onCartClick(() => router.push(cart));
		});
	};

	return (
		<SlidePopup
			id={props.id}
			className={clsx(styles["end-of-sale-popup"])}
			showCloseIcon={false}
			ref={ref}
			enableClickOutside={false}>
			<div className={styles["end-of-sale-wrapper"]}>
				<button
					aria-label={"Close popup"}
					className={"close-icon-wrapper"}
					onClick={handleNavigateToMenu}>
					<img
						src={XIcon.src}
						alt={""}
					/>
				</button>

				<animated.div
					style={topStyles}
					className={styles["animation"]}>
					<LottieAnimation
						animation={EndOfSaleAnimation}
						onComplete={() => {}}
					/>
				</animated.div>
				<animated.h1
					style={topStyles}
					className={styles["title"]}
					tabIndex={0}>
					{translate("endOfSaleModal_itemsAddedToOrder_title")}
				</animated.h1>
				<animated.div style={bottomStyles}>
					<AnimatedCapsule
						className={styles["animated-capsule-delivery-type"]}
						bluePillText={translate("endOfSaleModal_takeMeToCart_btnLabelShort")}
						bluePillOnPress={handleNavigateToCart.bind(this, true)}
						redPillText={translate("endOfSaleModal_anotherItem_btnLabel")}
						redPillOnPress={handleNavigateToMenu.bind(this, false)}
					/>
				</animated.div>
			</div>
		</SlidePopup>
	);
}
