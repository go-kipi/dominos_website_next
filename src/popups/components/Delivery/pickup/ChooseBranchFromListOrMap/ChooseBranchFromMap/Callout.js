import React from "react";
import basic from "./Callout.module.scss";
import RedClock from "/public/assets/icons/red-clock.svg";
import BlueClock from "/public/assets/icons/blue-clock.svg";
import Navigation from "/public/assets/icons/navigation.svg";

import { animated, useSpring } from "@react-spring/web";
import Button from "components/button";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";

export default function Callout(props) {
	const { branch, onBtnClick, zIndex = 0 } = props;
	const translate = useTranslate();

	const [styles] = useSpring(() => ({
		from: {
			y: 200,
		},
		to: {
			y: 0,
		},
	}));
	const [btnStyle] = useSpring(() => ({
		from: {
			opacity: 0,
		},
		to: {
			opacity: 1,
		},
		delay: 300,
	}));
	const { name, storeAddress, distance, isOpen, statusMessage, id } = branch;

	const handleOnClick = () => {
		typeof onBtnClick === "function" && onBtnClick(id);
	};

	return (
		<animated.div
			style={{ ...styles, zIndex }}
			className={basic["callout-wrapper"]}>
			<div className={basic["container"]}>
				<div className={basic["text-wrapper"]}>
					<div
						className={basic["branch-name"]}
						tabIndex={0}>
						{name}
					</div>
					<div
						className={basic["branch-address"]}
						tabIndex={0}>
						{storeAddress}
					</div>
				</div>

				<div className={basic["separator"]} />
				<div className={basic["bottom-wrapper"]}>
					<div className={basic["bottom-area-top"]}>
						<div className={basic["time-wrapper"]}>
							<div className={basic["time-icon"]}>
								<img
									src={isOpen ? BlueClock.src : RedClock.src}
									alt={""}
								/>
							</div>
							<span
								className={clsx(basic["time-text"], !isOpen ? basic["closed"] : "")}
								tabIndex={0}>
								{translate(statusMessage?.message)?.replace(
									"{time}",
									statusMessage?.values?.time,
								)}
							</span>
						</div>
						{distance && (
							<div className={basic["distance-wrapper"]}>
								<div className={basic["distance-icon"]}>
									<img
										src={Navigation.src}
										alt={""}
									/>
								</div>
								<span
									className={basic["distance-text"]}
									tabIndex={0}>
									{parseFloat(distance).toFixed(1)} <span>&nbsp;</span>
									{translate("km")}
								</span>
							</div>
						)}
					</div>
				</div>
				<animated.div
					style={btnStyle}
					className={basic["callout-button-wrapper"]}>
					<Button
						onClick={handleOnClick}
						className={basic["callout-btn"]}
						textClassName={basic["callout-btn-text"]}
						text={translate("deliveryPopup_chooseBranchFromMap_calloutBtnLabel")}
					/>
				</animated.div>
			</div>
		</animated.div>
	);
}
