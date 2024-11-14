import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import useResizeObserver from "hooks/useResizerObserver";
import clsx from "clsx";

function Scrollbar({
	children,
	className = "",
	contentClassName = "",
	onScroll,
}) {
	const trackRef = useRef(null);
	const thumbRef = useRef(null);
	const contentContainerRef = useRef(null);
	const contentRef = useRef(null);
	useResizeObserver(contentRef, measureContent);
	useResizeObserver(contentContainerRef, measureContent);

	const [shouldHideScrollbar, setShouldHideScrollbar] = useState(false);

	useEffect(() => {
		measureContent();
	}, []);

	function measureContent() {
		const thumbEle = thumbRef.current;
		const contentEle = contentContainerRef.current;
		if (!thumbEle || !contentEle) {
			return;
		}

		const scrollRatio = contentEle.clientHeight / contentEle.scrollHeight;

		if (scrollRatio < 1) {
			setShouldHideScrollbar(false);

			const thumbHeight = Math.max(scrollRatio * 100, 20);
			thumbEle.style.height = `${thumbHeight}%`;
		} else {
			setShouldHideScrollbar(true);
		}
	}

	const handleScrollContent = (e) => {
		const thumbEle = thumbRef.current;
		const contentEle = contentContainerRef.current;
		if (!thumbEle || !contentEle) {
			return;
		}

		const trackHeight = thumbEle.parentElement.clientHeight;
		const thumbHeight = thumbEle.clientHeight;
		const maxScrollTop = trackHeight - thumbHeight;

		const scrollRatio =
			contentEle.scrollTop / (contentEle.scrollHeight - contentEle.clientHeight);
		const thumbTop = maxScrollTop * scrollRatio;

		thumbEle.style.top = `${thumbTop}px`;

		typeof onScroll === "function" && onScroll(e);
	};

	const handleClickTrack = (e) => {
		const trackEle = trackRef.current;
		const contentEle = contentContainerRef.current;
		if (!trackEle || !contentEle) {
			return;
		}
		const bound = trackEle.getBoundingClientRect();
		const percentage = (e.clientY - bound.top) / bound.height;
		contentEle.scrollTop =
			percentage * (contentEle.scrollHeight - contentEle.clientHeight);
	};

	const handleMouseDown = useCallback((e) => {
		const ele = thumbRef.current;
		const contentEle = contentContainerRef.current;
		if (!ele || !contentEle) {
			return;
		}
		const startPos = {
			top: contentEle.scrollTop,
			x: e.clientX,
			y: e.clientY,
		};

		const handleMouseMove = (e) => {
			const dy = e.clientY - startPos.y;
			const scrollRatio = contentEle.clientHeight / contentEle.scrollHeight;
			contentEle.scrollTop = startPos.top + dy / scrollRatio;
			updateCursor(ele);
		};

		const handleMouseUp = () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			resetCursor(ele);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	}, []);

	const handleTouchStart = useCallback((e) => {
		const ele = thumbRef.current;
		const contentEle = contentContainerRef.current;
		if (!ele || !contentEle) {
			return;
		}
		const touch = e.touches[0];
		const startPos = {
			top: contentEle.scrollTop,
			x: touch.clientX,
			y: touch.clientY,
		};

		const handleTouchMove = (e) => {
			const touch = e.touches[0];
			const dy = touch.clientY - startPos.y;
			const scrollRatio = contentEle.clientHeight / contentEle.scrollHeight;
			contentEle.scrollTop = startPos.top + dy / scrollRatio;
			updateCursor(ele);
		};

		const handleTouchEnd = () => {
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
			resetCursor(ele);
		};

		document.addEventListener("touchmove", handleTouchMove);
		document.addEventListener("touchend", handleTouchEnd);
	}, []);

	const updateCursor = (ele) => {
		ele.style.userSelect = "none";
		document.body.style.userSelect = "none";
	};

	const resetCursor = (ele) => {
		ele.style.userSelect = "";
		document.body.style.userSelect = "";
	};

	return (
		<div className={clsx(styles["wrapper"], className)}>
			<div
				className={clsx(styles["container-content"], contentClassName)}
				ref={contentContainerRef}
				onScroll={handleScrollContent}>
				<div ref={contentRef}>{children}</div>
			</div>

			<div
				className={clsx(
					styles["scrollbar"],
					shouldHideScrollbar ? styles["hide"] : "",
				)}>
				<div
					className={styles["scrollbar-track"]}
					ref={trackRef}
					onClick={(e) => handleClickTrack(e.nativeEvent)}
				/>
				<div
					className={clsx(styles["scrollbar-thumb"])}
					ref={thumbRef}
					onMouseDown={(e) => handleMouseDown(e.nativeEvent)}
					onTouchStart={(e) => handleTouchStart(e.nativeEvent)}
				/>
			</div>
		</div>
	);
}

export default Scrollbar;
