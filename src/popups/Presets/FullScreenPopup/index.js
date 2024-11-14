import React, { useEffect, useImperativeHandle, useState } from "react";
import DesktopBG from "/public/assets/menu/desktop-background.png";
import MobileBG from "/public/assets/menu/mobile-background.png";
import Actions from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";

const FullScreenPopupRef = (props, ref) => {
	const dispatch = useDispatch();
	const deviceState = useSelector((store) => store.deviceState);
	const BG = deviceState.isDesktop ? DesktopBG : MobileBG;
	const {
		id,
		background = BG,
		children,

		gradient = false,
		className = "",
	} = props;
	const [animationClass, setAnimationClass] = useState("");
	useImperativeHandle(ref, () => ({
		animateOut,
	}));

	const animateOut = (callback) => {
		setAnimationClass("exit");
		setTimeout(() => {
			if (typeof callback === "function") {
				callback();
			}
			dispatch(Actions.removePopup(id));
		}, 200);
	};
	const animateIn = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setAnimationClass("active");
			});
		});
	};

	const completeAnimation = () => {
		if (animationClass !== "exit" && animationClass !== "done") {
			setAnimationClass("done");
		}
	};

	useEffect(() => {
		animateIn();
	}, []);

	return (
		<div
			className={clsx("backdrop", "fullscreenPopup", className, animationClass)}
			onTransitionEnd={completeAnimation}>
			<div className={clsx("popup_wrapper", animationClass)}>
				<div className={"popup_content"}>
					{background && (
						<div className={"background-image"}>
							<img
								src={background.src}
								alt="/"
							/>
						</div>
					)}
					<div className="content-wrapper">
						{gradient && <div className={"gradient"} />}

						<div
							className={clsx("content")}
							tabIndex={0}>
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
const FullScreenPopup = React.forwardRef(FullScreenPopupRef);

export default FullScreenPopup;
