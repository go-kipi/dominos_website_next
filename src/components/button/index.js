import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import basic from "./index.module.scss";

import { conditionalClass } from "../../utils/functions";
import clsx from "clsx";
import LottieAnimation from "components/LottieAnimation";

import UnfoldAnimation from "animations/blue-button-open1.json";
import FoldAnimation from "animations/buttonToBall";
import SRContent from "../accessibility/srcontent";
import { EVENTS } from "constants/events";
import { HTTP_STATUS } from "constants/httpStatus";
import useEventEmitter from "hooks/useEventEmitter";
import DominosLoader from "components/DominosLoader/DominosLoader";

const ButtonRef = (props, ref) => {
	const {
		id = "",
		text = "",
		onClick,
		className = "",
		textClassName = "",
		autoFocus = false,
		disabled = false,
		isError = false,
		costumeError = false,
		errorText = "",
		animated = false,
		isBtnOnForm = false,
		show = true,
		type = "",
		ariaLive = "",
		extraStyles = {},
		ariaLabel = "",
		tabIndex = 0,
		ariaDescription = "",
		disabledClickNeeded = true,
	} = props;

	const buttonRef = useRef();
	const cachedEvent = useRef(null);
	const [animationState, setAnimationState] = useState();
	const [isRequesting, setIsRequesting] = useState(false);
	const [showLoader, setShowLoader] = useState(false);
	useEventEmitter(EVENTS.HTTP_REQUEST, handleHttpEvent, animated);

	const hasText = text.length > 0 ? text : undefined;

	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};

	const disabledClassName = disabled ? styles("disabled") : "";
	const errorClass =
		isError && costumeError ? styles("error2") : isError ? styles("error") : "";

	useEffect(() => {
		if (animated && !isError) {
			setAnimationState("unfold");
		} else {
			onUnfoldAnimationFinish();
		}
	}, [animated]);

	function onUnfoldAnimationFinish() {
		setAnimationState("btn");
		if (props.focus) {
			const to = setTimeout(() => {
				buttonRef.current?.focus();
				clearTimeout(to);
			}, 250);
		}
	}

	function onFoldAnimation() {
		if (animationState === "fold") {
			typeof onClick === "function" && onClick();
			setTimeout(() => {
				setShowLoader(true);
			}, 150);
		}
		const timeout = setTimeout(() => {
			// handle the the case of uncatched error
			if (animationState !== "unfold") {
				setShowLoader(false);
				setAnimationState("unfold");
				clearTimeout(timeout);
			}
		}, 4000);
	}

	function handleHttpEvent(event) {
		if (cachedEvent.current !== event.detail) {
			cachedEvent.current = event.detail;

			if (
				event.detail === HTTP_STATUS.FAILED ||
				event.detail === HTTP_STATUS.REJECT
			) {
				setAnimationState("unfold");
				setShowLoader(false);
				return;
			}
		}
	}

	const onClickHandler = (e) => {
		if (disabled) {
			return;
		}
		if (isBtnOnForm || !animated) {
			return typeof onClick === "function" && onClick(e);
		} else {
			setAnimationState("fold");
		}
	};

	const renderErrorText = () => {
		return (
			<>
				<SRContent
					role={"alert"}
					ariaAtomic={"true"}
					message={errorText}
				/>
				{errorText}
			</>
		);
	};

	function RenderUnfoldAnimation() {
		return (
			<div
				className={clsx(
					styles("animation-unfolding-wrapper"),
					conditionalClass(className),
				)}>
				<LottieAnimation
					animation={UnfoldAnimation}
					onComplete={onUnfoldAnimationFinish}
				/>
			</div>
		);
	}

	function RenderFoldAnimation() {
		return (
			<div
				className={clsx(
					styles("animation-folding-wrapper"),
					conditionalClass(className),
					showLoader && styles("disappear"),
				)}>
				<LottieAnimation
					animation={FoldAnimation}
					onComplete={onFoldAnimation}
				/>
			</div>
		);
	}

	function RenderButton() {
		return (
			<button
				ref={buttonRef}
				id={id}
				type={type}
				aria-live={ariaLive}
				autoFocus={autoFocus}
				aria-label={ariaLabel}
				aria-disabled={disabled}
				tabIndex={tabIndex}
				className={clsx(
					styles("btn"),
					conditionalClass(disabledClassName),
					conditionalClass(errorClass),
					conditionalClass(className),
				)}
				onClick={onClickHandler}
				disabled={!show || disabled || (disabledClickNeeded && isRequesting)}
				aria-describedby={ariaDescription}>
				{hasText && (
					<div className={clsx(styles("btn-text"), conditionalClass(textClassName))}>
						{isError ? renderErrorText() : text}
					</div>
				)}
			</button>
		);
	}

	function RenderAnimation() {
		if (animationState === "unfold") {
			return RenderUnfoldAnimation();
		} else if (animationState === "fold") {
			return RenderFoldAnimation();
		} else if (animationState === "btn") {
			return RenderButton();
		} else {
			return null;
		}
	}

	return (
		<>
			{showLoader && (
				<div className={basic["loader-wrapper"]}>
					<DominosLoader extraStyles={basic} />
				</div>
			)}
			{RenderAnimation()}
		</>
	);
};

const Button = React.forwardRef(ButtonRef);

export default Button;
