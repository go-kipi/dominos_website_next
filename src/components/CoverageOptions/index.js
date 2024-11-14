import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import Actions from "redux/actions";
import * as popupTypes from "constants/popup-types";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";

import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_HIDDEN,
} from "../../constants/accessibility-types";
import { VibrateDevice } from "utils/functions";

const TYPES_ENUM = {
	NONE: "NONE",
	QUARTER: "QUARTER",
	LEFT_HALF: "LEFT_HALF",
	RIGHT_HALF: "RIGHT_HALF",
	ALL_OVER: "ALL_OVER",
};

const COVERAGE_TYPES = {
	[TYPES_ENUM.NONE]: {
		text: "pizzaBuilder_toppingBuilder_coverage_none",
		className: styles["none"],
	},
	[TYPES_ENUM.QUARTER]: {
		text: "",
		className: styles["quarter"],
	},

	[TYPES_ENUM.LEFT_HALF]: {
		text: "",
		className: styles["left-half"],
	},
	[TYPES_ENUM.RIGHT_HALF]: {
		text: "",
		className: styles["right-half"],
	},
	[TYPES_ENUM.ALL_OVER]: {
		text: "",
		className: styles["all-over"],
	},
};

const CoverageOptions = (props) => {
	const {
		toppingId,
		onAdd = () => {},
		onRemove = () => {},
		onClose = () => {},
		isVisible = false,
		selectedTopping,
		selectedToppingRect,
		coverages,
		isSquare,
		hideQuarters = false,
		hideHalfLeft = false,
		hideHalfRight = false,
		hideFullPizza = false,
		pizzaId,
	} = props;
	const firstChildRef = useRef();
	const boxRef = useRef();
	const [triangleStyle, setTriangleStyle] = useState();
	const deviceState = useSelector((store) => store.deviceState);
	const isSquarePizza = isSquare === "sicilian" || isSquare === "glutenFree";
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect(() => {
		document.addEventListener("mousedown", clickListener);
		return () => {
			document.removeEventListener("mousedown", clickListener);
		};
	}, [isVisible]);

	const clickListener = (e) => {
		const mousePointerType = e.pointerType === "mouse";
		if (isVisible && boxRef.current && mousePointerType) {
			boxRef.current.children[0].focus();
			if (
				!e?.path?.includes(boxRef.current) &&
				!isClassInClassList(e?.target?.classList, "topping-selector-image")
			) {
				onClose();
			}
		}
	};

	function isClassInClassList(classList, className) {
		for (const index in classList) {
			const classI = classList[index];

			if (typeof classI === "string" && classI.includes(className)) {
				return true;
			}
		}
		return false;
	}

	const clickHandler = (type) => {
		if (type === TYPES_ENUM.NONE) {
			VibrateDevice(200);
			onRemove({ id: selectedTopping });
			onLastChildBlur();
			return;
		}
		const res = {
			id: selectedTopping,
			coverage: {
				q1: 0,
				q2: 0,
				q3: 0,
				q4: 0,
			},
		};
		switch (type) {
			case TYPES_ENUM.RIGHT_HALF:
				res.coverage.q1 = 1;
				res.coverage.q2 = 1;
				break;
			case TYPES_ENUM.LEFT_HALF:
				res.coverage.q3 = 1;
				res.coverage.q4 = 1;
				break;
			case TYPES_ENUM.ALL_OVER:
				res.coverage.q1 = 1;
				res.coverage.q2 = 1;
				res.coverage.q3 = 1;
				res.coverage.q4 = 1;
				break;
			case TYPES_ENUM.QUARTER:
				VibrateDevice(200);
				getQuarter();
				return;
		}
		VibrateDevice(200);
		onLastChildBlur();
		onAdd(res);
	};

	const getQuarter = () => {
		dispatch(
			Actions.addPopup({
				type: popupTypes.CHOOSE_QUARTER,
				payload: {
					selectedToppingId: selectedTopping,
					coverages,
					isSquare,
					pizzaId,
					onAdd: (coverage) => {
						const topping = {
							id: selectedTopping,
							coverage,
						};
						VibrateDevice(200);
						onLastChildBlur();
						onAdd(topping);
					},
				},
			}),
		);
	};

	const getTypes = () => {
		const types = Object.keys(COVERAGE_TYPES);
		if (hideFullPizza) {
			types.splice(4, 1);
		} else if (hideHalfRight) {
			types.splice(3, 1);
		} else if (hideHalfLeft) {
			types.splice(2, 1);
		} else if (hideQuarters) {
			types.splice(1, 1);
		}
		return types;
	};

	function normalizePoint(point, bound1, bound2) {
		// Assuming point, bound1, and bound2 are numbers
		// Sorting bounds to make sure bound1 is the smaller one and bound2 is the larger one
		const [minBound, maxBound] = [
			Math.min(bound1, bound2),
			Math.max(bound1, bound2),
		];

		// Ensuring the point is within the bounds
		const clampedPoint = Math.min(Math.max(point, minBound), maxBound);

		// Normalizing the point between 0 and 1
		const normalizedPoint = (clampedPoint - minBound) / (maxBound - minBound);

		return normalizedPoint;
	}

	const calcTriangle = () => {
		const PADDING = deviceState.isDesktopLarge ? 1.5 : 3;
		const parentRect = boxRef.current.getBoundingClientRect();
		const { width, x } = parentRect;
		const xStart = x;
		const xEnd = x + width;
		const selectedToppingX = selectedToppingRect.x;
		const point =
			Math.round(normalizePoint(selectedToppingX, xStart, xEnd) * 100) + PADDING;

		setTriangleStyle({ left: `${point}%` });
	};

	const openClassName = isVisible ? styles["open"] : "";

	useEffect(() => {
		if (!isVisible) {
			setTriangleStyle({ display: "none" });
			return;
		}
		if (deviceState.isDesktop && typeof selectedToppingRect === "object") {
			calcTriangle();
		}
		if (isVisible) {
			firstChildRef.current?.focus();
		}
		boxRef.current.children[0].focus();
	}, [isVisible, selectedTopping]);

	function onLastChildBlur() {
		const topping = document.getElementById(`topping-${toppingId}`);
		if (Array.isArray(topping?.children) && topping.children.length > 0) {
			topping.children[0]?.focus();
		}
		onClose();
	}

	const renderBody = () => {
		const types = getTypes();

		return (
			<div
				className={clsx(styles["coverage-options-wrapper"], openClassName)}
				ref={boxRef}>
				{deviceState.isDesktop ? (
					<div
						style={triangleStyle}
						className={styles["triangle"]}
					/>
				) : null}
				{types.map((type, idx) => {
					return (
						<button
							onBlur={idx === types.length - 1 ? onLastChildBlur : undefined}
							ref={idx === 0 ? firstChildRef : undefined}
							className={clsx(
								styles["coverage-option-wrapper"],
								isSquarePizza ? styles["square"] : "",
							)}
							key={`coverage-option-${type}`}
							onClick={clickHandler.bind(this, type)}
							aria-label={translate(`accessibility_label_toppingsCoverage_${type}`)}
							tabIndex={isVisible ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}>
							<div
								className={clsx(
									styles["coverage-option"],
									COVERAGE_TYPES[type].className,
								)}>
								{translate(COVERAGE_TYPES[type].text)}
							</div>
						</button>
					);
				})}
			</div>
		);
	};
	return renderBody();
};

export default CoverageOptions;
