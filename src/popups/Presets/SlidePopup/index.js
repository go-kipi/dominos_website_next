import React, {
	useEffect,
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { useDispatch } from "react-redux";

import Actions from "redux/actions";
import XIcon from "/public/assets/icons/x-icon.svg";
import clsx from "clsx";

const SlidePopupRef = (props, ref) => {
	const {
		id,
		showCloseIcon = false,
		children,
		className = "",
		extraStyles = {},
		header = false,
		animateOutCallback = () => {},
		enableClickOutside = true,
		role = "dialog",
	} = props;

	const [animationClass, setAminationClass] = useState("");
	const dispatch = useDispatch();
	const modalRef = useRef();
	const initialY = useRef();
	const backdropRef = useRef();
	const startedOnPopup = useRef();

	useImperativeHandle(ref, () => ({
		animateOut,
	}));

	const animateIn = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setAminationClass("active");
			});
		});
	};
	useEffect(() => {
		animateIn();
	}, []);

	const completeAnimation = () => {
		if (animationClass !== "exit" && animationClass !== "done") {
			setAminationClass("done");
		}
	};
	const animateOut = (callback) => {
		setAminationClass("exit");
		setTimeout(() => {
			if (typeof callback === "function") {
				callback();
			}

			dispatch(Actions.removePopup(id));
		}, 200);
	};

	function handleOnTouchStart(e) {
		// Get TouchEvent ClientY

		const clientY = Math.round(e.changedTouches[0].clientY);
		initialY.current = clientY;
	}

	function handleOnTouchRelease(e) {
		const clientY = e.changedTouches[0].clientY;

		if (window.innerHeight - window.innerHeight / 5 <= clientY) {
			animateOut();
		} else {
			modalRef.current.style.top = `0px`;
		}
	}

	function onTouchMove(e) {
		const clientY = e.changedTouches[0].clientY;
		if (clientY > initialY.current) {
			modalRef.current.style.top = `${Math.abs(initialY.current - clientY)}px`;
		}
	}

	return (
		<div
			className={clsx("backdrop", "slidePopup", className, animationClass)}
			onMouseDown={(e) => {
				startedOnPopup.current = e.nativeEvent.target !== backdropRef.current;
			}}
			onClick={() =>
				enableClickOutside && !startedOnPopup.current
					? animateOut(animateOutCallback)
					: null
			}
			onTransitionEnd={completeAnimation}
			role={role}
			ref={backdropRef}>
			{typeof header === "function" && header()}
			<div
				className={clsx("popup_wrapper", animationClass)}
				onClick={(e) => e.stopPropagation()}
				ref={modalRef}>
				{showCloseIcon && (
					<button
						className={"close-icon-wrapper"}
						aria-label={"Close popup"}
						onClick={() => animateOut(animateOutCallback)}>
						<img
							src={XIcon.src}
							alt={""}
						/>
					</button>
				)}
				{enableClickOutside && (
					<div
						className={"gesture-handler"}
						onTouchMove={(e) => onTouchMove(e)}
						onTouchEnd={(e) => handleOnTouchRelease(e)}
						onTouchStart={(e) => handleOnTouchStart(e)}
					/>
				)}
				<div
					className={"popup_content"}
					aria-live={"assertive"}>
					{children}
				</div>
			</div>
		</div>
	);
};
const SlidePopup = forwardRef(SlidePopupRef);

export default SlidePopup;
