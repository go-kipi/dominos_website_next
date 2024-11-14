import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import basic from "./index.module.scss";

import { conditionalClass } from "../../utils/functions";
import clsx from "clsx";
import LottieAnimation from "components/LottieAnimation";

import UnfoldAnimation from "animations/blue-button-open1.json";
import FoldAnimation from "animations/blue-button-close.json";
import SRContent from "../accessibility/srcontent";
import { useSelector } from "react-redux";
import { subscribe, unsubscribe } from "services/events";
import { EVENTS } from "constants/events";
import { HTTP_STATUS } from "constants/httpStatus";
import useEventEmitter from "hooks/useEventEmitter";

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
		animated = true,
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
	// const isRequesting = useSelector((store) => store.requestingState);
	const [animationState, setAnimationState] = useState();
	const [isRequesting, setIsRequesting] = useState(false);
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
		setTimeout(() => {
			if (animationState === "fold") {
				setAnimationState("unfold");
			}
		}, 3000);
		typeof onClick === "function" && onClick();
	}

	function handleHttpEvent(event) {
		if (cachedEvent.current !== event.detail) {
			cachedEvent.current = event.detail;

			if (event.detail === HTTP_STATUS.START) {
				setIsRequesting(true);
			} else {
				setIsRequesting(false);
			}
			if (
				event.detail === HTTP_STATUS.FAILED ||
				event.detail === HTTP_STATUS.REJECT
			) {
				setAnimationState("unfold");
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
					styles("btn-wrapper"),
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
	return RenderAnimation();
};

const Button = React.forwardRef(ButtonRef);

export default Button;
