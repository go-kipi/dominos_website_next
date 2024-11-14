import React, { useCallback, useEffect, useRef, useState } from "react";
import basic from "./HiddableScrollBar.module.scss";

const SCROLL_BOX_MIN_HEIGHT = 20;

export default function HiddableScroolBar({
	children,
	className,
	extraStyles = {},
	onScroll = () => {},

	...restProps
}) {
	function styles(className) {
		return (basic[className] || "") + " " + (extraStyles[className] || "");
	}

	const thumbRef = useRef();
	const [lastScrollThumbPosition, setScrollThumbPosition] = useState(0);
	const [isDragging, setDragging] = useState(false);
	const handleDocumentMouseUp = useCallback(
		(e) => {
			if (isDragging) {
				e.preventDefault();
				setDragging(false);
			}
		},
		[isDragging],
	);

	const handleDocumentMouseMove = useCallback(
		(e) => {
			if (isDragging) {
				e.preventDefault();
				e.stopPropagation();
				const scrollHostElement = scrollHostRef.current;
				const listRef = restProps.listref.current;

				const { offsetHeight } = scrollHostElement;
				const { scrollHeight } = listRef;

				let deltaY = e.clientY - lastScrollThumbPosition;
				let percentage = deltaY * (scrollHeight / offsetHeight);
				setScrollThumbPosition(e.clientY);
				//todo: to add scrollBoxTop
				const scrollBoxTop = 0;
				const topValue = Math.min(
					Math.max(0, scrollBoxTop + deltaY),
					offsetHeight -
						parseFloat(thumbRef.current?.style?.height.replace("px", "")),
				);
				thumbRef.current.style.top = topValue + "px";
				scrollHostElement.scrollTop = Math.min(
					scrollHostElement.scrollTop + percentage,
					scrollHeight - offsetHeight,
				);
			}
		},
		[isDragging, lastScrollThumbPosition],
	);

	const handleScrollThumbMouseDown = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		setScrollThumbPosition(e.clientY);
		setDragging(true);
	}, []);

	const handleScroll = useCallback(() => {
		if (!scrollHostRef) {
			return;
		}

		const scrollHostElement = scrollHostRef.current;

		const { scrollTop, offsetHeight } = scrollHostElement;
		const listRef = restProps.listref.current;
		const { scrollHeight } = listRef;

		const currentHeight = parseFloat(
			thumbRef.current?.style?.height.replace("px", ""),
		);
		let newTop =
			(parseInt(scrollTop, 10) / parseInt(scrollHeight, 10)) * offsetHeight;

		newTop = Math.min(newTop, offsetHeight - currentHeight);
		thumbRef.current.style.top = newTop + "px";
	}, []);

	const scrollHostRef = useRef();

	useEffect(() => {
		const scrollHostElement = scrollHostRef.current;
		const listRef = restProps.listref.current;
		const clientHeight = parseFloat(
			window.getComputedStyle(scrollHostElement).height.replace("px", ""),
		);

		const { clientHeight: scrollHeight } = listRef;
		const scrollThumbPercentage = clientHeight / scrollHeight;

		let scrollThumbHeight = Math.max(
			scrollThumbPercentage * clientHeight,
			SCROLL_BOX_MIN_HEIGHT,
		);

		if (clientHeight >= scrollHeight) {
			scrollThumbHeight = 0;
		}
		thumbRef.current.style.height = scrollThumbHeight + "px";
	}, [restProps.numberOfOptions, restProps.listref.current]);

	useEffect(() => {
		const scrollHostElement = scrollHostRef.current;

		scrollHostElement.addEventListener("scroll", handleScroll, true);
		return function cleanup() {
			scrollHostElement.removeEventListener("scroll", handleScroll, true);
		};
	}, []);

	useEffect(() => {
		//this is handle the dragging on scroll-thumb
		document.addEventListener("mousemove", handleDocumentMouseMove);
		document.addEventListener("mouseup", handleDocumentMouseUp);
		document.addEventListener("mouseleave", handleDocumentMouseUp);
		//   restProps.listref.current.addEventListener("resize", (e)=>{

		//  });

		return function cleanup() {
			document.removeEventListener("mousemove", handleDocumentMouseMove);
			document.removeEventListener("mouseup", handleDocumentMouseUp);
			document.removeEventListener("mouseleave", handleDocumentMouseUp);
		};
	}, [handleDocumentMouseMove, handleDocumentMouseUp]);

	const activeClass = restProps.isOpen ? "active" : "";

	return (
		<div
			className={`${styles("hiddable-scrollhost-container")} ${styles(
				activeClass,
			)}`}>
			<div
				ref={scrollHostRef}
				className={`${styles("scrollhost")} ${className} `}
				onScroll={onScroll}
				id="scroll-host">
				{children}
			</div>
			<div className={`${styles("scroll-bar")}`}>
				<div
					ref={thumbRef}
					className={`${styles("scroll-thumb")}`}
					onMouseDown={handleScrollThumbMouseDown}
				/>
			</div>
		</div>
	);
}
