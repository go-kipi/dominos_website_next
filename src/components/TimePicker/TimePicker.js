import React, { useEffect, useRef, useState } from "react";
import TimeItem from "./TimeItem/TimeItem";
import styles from "./TimePicker.module.scss";
import BorderBottom from "/public/assets/icons/border-bottom-red.svg";

import ArrowUp from "/public/assets/icons/blue-arrow-up.svg";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_HIDDEN,
} from "../../constants/accessibility-types";

function TimePicker(props) {
	const { data = [], time, setTime } = props;

	const scroolPicker = useRef(null);

	const [initialized, setInitialized] = useState(false);
	const [timer, setTimer] = useState(null);
	const [itemHeight, setItemHeight] = useState(undefined);
	const translate = useTranslate();
	// const focusedElement = document.activeElement;
	// useEffect(() => {

	//   if(!focusedElement.className.includes(ITEM_WRAPPER_CLASSNAME)) {
	//     return
	//   }

	//   const parentElement = focusedElement.parentElement
	//   const index = Array.from(parentElement.children).indexOf(focusedElement);
	//   scrollToIndex(index)
	// }, [focusedElement])

	useEffect(() => {
		if (itemHeight && scroolPicker) {
			if (initialized) {
				return;
			}
			setInitialized(true);

			setTimer(
				setTimeout(() => {
					scrollToIndex(time.index);
				}, 500),
			);

			return () => {
				timer && clearTimeout(timer);
			};
		}
	}, [(initialized, time, scroolPicker, timer, itemHeight)]);

	function scrollToIndex(_selectedIndex) {
		const closestYPosition = _selectedIndex * itemHeight;
		scroolPicker?.current?.scrollTo({
			top: closestYPosition,
			left: 0,
			behavior: "smooth",
		});
	}

	function getIsNextOrPrevandIsSelected(data, timeObj, item) {
		let isFirstItem = false;
		let isLastItem = false;
		let isSelected = false;
		let isNext = false;
		let isPrev = false;
		const currentIndex = timeObj.index;

		if (currentIndex === 0) {
			isFirstItem = true;
		}
		if (currentIndex === data.length) {
			isLastItem = true;
		}
		if (!isLastItem && data[currentIndex + 1] === item) {
			isNext = true;
		} else if (!isFirstItem && data[currentIndex - 1] === item) {
			isPrev = true;
		} else if (data[currentIndex] === item) {
			isSelected = true;
		}

		return { isSelected, isPrev, isNext };
	}

	function handleScroll(e) {
		let y = 0;
		const window = e.target;
		const h = itemHeight;

		if (window) {
			y = window.scrollTop;
		}
		const _selectedIndex = Math.round(y / h);
		if (_selectedIndex !== time.index) {
			// onValueChange
			const selectedValue = data[_selectedIndex];
			setTime({ time: selectedValue, index: _selectedIndex });
			debounce(() => {
				scrollToIndex(_selectedIndex);
			}, 450);
		}
	}

	function debounce(callback, time) {
		clearTimeout(timer);
		const debounceTimer = setTimeout(callback, time);
		setTimer(debounceTimer);
	}

	function renderTimeItem(item, index) {
		const { isSelected, isPrev, isNext } = getIsNextOrPrevandIsSelected(
			data,
			time,
			item,
		);
		return (
			<TimeItem
				text={item}
				isSelected={isSelected}
				isPrev={isPrev}
				isNext={isNext}
				index={index}
				key={"time-item" + index}
				setHeight={setItemHeight}
			/>
		);
	}

	// const handleKeyboardEvents = (event) => {
	//     typeof handleTabBack === "function" && handleTabBack(event, focusBack);
	//     typeof handleTabPress === "function" && handleTabPress(event, focusForward);
	// };
	//
	// const focusBack = () => {
	//     document.querySelector("#back-btn").focus();
	// };
	//
	// const focusForward = () => {
	//     document.querySelector("#submit-btn").focus();
	// };

	function onArrowUpClick() {
		if (0 < time.index) {
			scrollToIndex(time.index - 1);
		}
	}

	function onArrowDownClick() {
		if (data.length > time.index) {
			scrollToIndex(time.index + 1);
		}
	}
	const selectedTime = `${time?.time?.hour}:${time?.time?.minute} ${time?.time?.date}`;
	return (
		<div className={styles["time-picker-container"]}>
			<button
				id="tp-up-arrow"
				aria-label={`${translate("accessibility_chooseTime_before").replace(
					"{time}",
					selectedTime,
				)}`}
				tabIndex={time.index === 0 ? TAB_INDEX_HIDDEN : TAB_INDEX_DEFAULT}
				className={clsx(styles["arrow"], styles["up"])}
				onClick={onArrowUpClick}>
				<img
					src={ArrowUp.src}
					alt={""}
				/>
			</button>
			<button
				id="tp-down-arrow"
				aria-label={`${translate("accessibility_chooseTime_after").replace(
					"{time}",
					selectedTime,
				)}`}
				className={clsx(styles["arrow"], styles["down"])}
				onClick={onArrowDownClick}>
				<img
					src={ArrowUp.src}
					alt={""}
				/>
			</button>
			<div className={styles["time-picker-wrapper"]}>
				<div className={styles["time-picker-select"]}>
					<div className={styles["time-picker-border-top"]} />
					<div className={styles["time-picker-border-bottom"]}>
						<img
							src={BorderBottom.src}
							aria-hidden={true}
							alt={""}
						/>
					</div>
				</div>
				<div className={styles["time-picker-container"]}>
					<div
						className={styles["time-picker"]}
						ref={scroolPicker}
						onScroll={handleScroll}
						role={"list"}>
						{data.map((item, index) => {
							return renderTimeItem(item, index);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

export default TimePicker;
