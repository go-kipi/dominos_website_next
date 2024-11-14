import React, { useEffect, useImperativeHandle, useState } from "react";
import DesktopBG from "/public/assets/menu/desktop-background.png";
import MobileBG from "/public/assets/menu/mobile-background.png";
import XIcon from "/public/assets/icons/x-icon-white.svg";
import Actions from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import useTranslate from "../../../hooks/useTranslate";

const BlurPopupRef = (props, ref) => {
	const {
		id,
		showCloseIcon = false,
		onClose,
		children,
		className = "",
		header = false,
		extraStyle = {},
		withBackground = false,
	} = props;
	const dispatch = useDispatch();
	const [animationClass, setAnimationClass] = useState("");
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const BG = deviceState.isDesktop ? DesktopBG : MobileBG;
	useImperativeHandle(ref, () => ({
		animateOut,
	}));

	useEffect(() => {
		animateIn();
	}, []);

	const animateOut = (callback) => {
		setAnimationClass("exit");
		setTimeout(() => {
			if (typeof callback === "function") {
				callback();
			}
			dispatch(Actions.removePopup(id));
		}, 200);
	};

	const completeAnimation = () => {
		if (animationClass !== "exit" && animationClass !== "done") {
			setAnimationClass("done");
		}
	};

	const animateIn = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setAnimationClass("active");
			});
		});
	};

	return (
		<div
			className={clsx("backdrop", "blur", className, animationClass)}
			onClick={() => animateOut()}
			onTransitionEnd={completeAnimation}
			role={"dialog"}>
			{withBackground && (
				<>
					<div className={clsx("gradient-top")} />
					<div className={clsx("background-image")}>
						<img
							src={BG.src}
							alt="/"
						/>
					</div>
					<div className={clsx("gradient-bottom")} />
				</>
			)}
			<div
				className={clsx("popup_wrapper", animationClass)}
				onClick={(e) => e.stopPropagation()}>
				{!header && showCloseIcon && (
					<button
						aria-label={translate("accessibility_aria_close")}
						className={clsx("close-icon-wrapper", extraStyle)}
						onClick={() => animateOut(onClose)}>
						<img
							src={XIcon.src}
							alt={""}
						/>
					</button>
				)}
				{typeof header === "function" && header()}
				<div
					className={"popup_content"}
					tabIndex={0}>
					{children}
				</div>
			</div>
		</div>
	);
};

const BlurPopup = React.forwardRef(BlurPopupRef);

export default BlurPopup;
