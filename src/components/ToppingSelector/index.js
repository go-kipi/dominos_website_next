import React, { useEffect, useRef } from "react";
import { useDrag, useDragDropManager } from "react-dnd";
import { usePreview } from "react-dnd-preview";
import { ItemTypes } from "constants/draggable-types";
import styles from "./index.module.scss";
import { useSelector } from "react-redux";

import ClearCoverageIcon from "/public/assets/icons/clear-topping-icon.svg";
import MixInfoIcon from "/public/assets/icons/mix-info-icon.svg";
import { generateUniqueId, VibrateDevice } from "../../utils/functions";
import clsx from "clsx";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import useTranslate from "../../hooks/useTranslate";
import { META_ENUM } from "constants/menu-meta-tags";

const QUARTER_ENUM = {
	Q1: "q1",
	Q2: "q2",
	Q3: "q3",
	Q4: "q4",
};

export default function ToppingSelector(props) {
	const {
		isDraggable = false,
		image,
		row,
		isSavePizzaPreview = false,

		onClick = () => {},
		isOnPizza = false,
		clicked = false,
		coverage = {
			q1: 0,
			q2: 0,
			q3: 0,
			q4: 0,
		},
		id,
		assetVersion = 0,
		onAdd = () => {},
		onRemove = () => {},
		onShowMixInfo = () => {},
		resetToppingsFilter = () => {},
		className = "",
		setPreviewSrc,
		onToppingChange,
		showCloseIcon = true,
		showInfoIcon = true,
	} = props;
	const toppingRef = useRef();
	const deviceState = useSelector((store) => store.deviceState);
	const product = useMenus(id, ActionTypes.PRODUCT);
	const translate = useTranslate();
	const name = product?.nameUseCases?.Title;
	const isOutOfStock = product.outOfStock;
	const dragDropManager = useDragDropManager();
	const monitor = dragDropManager.getMonitor();
	const lastOffset = useRef();
	const currentTime = useRef();
	const startTime = useRef();
	const isMix = product?.meta === META_ENUM.MIX_TOPPING_ITEM;

	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: ItemTypes.TOPPING,
			item: {
				id,
				name,
				isMix,
			},
			canDrag: isDraggable && !isOutOfStock,
			collect: (monitor) => ({
				isDragging: !!monitor.isDragging(),
			}),
		}),

		[image, isMix],
	);

	useEffect(() => {
		const unsub = monitor.subscribeToOffsetChange(() => {
			if (!startTime.current) {
				startTime.current = new Date().getTime();
			}
			const initialOffset = monitor.getDifferenceFromInitialOffset();
			if (initialOffset && isDragging) {
				lastOffset.current = initialOffset;
			}
		});
		if (!isDragging) {
			unsub();
		}
	}, [monitor, isDragging]);

	const clickHandler = (e) => {
		if (!isOutOfStock) {
			currentTime.current = new Date().getTime();
			// If there is an elapsed time user is dragging, if its NaN its a press event.
			const elapsedTime = startTime.current - currentTime.current;
			startTime.current = undefined;
			currentTime.current = undefined;
			const PADDING = 60;
			const { x } = lastOffset?.current ?? { x: 1000 };
			const isDroppingWithClick = x < PADDING || x > -PADDING;
			VibrateDevice(200);
			if (!isMix) {
				if (isDroppingWithClick && !Number.isNaN(elapsedTime)) {
					return;
				}
				const rect = deviceState.isDesktop
					? toppingRef.current.getBoundingClientRect()
					: null;
				onClick(id, row, isDragging, rect);
			} else {
				typeof resetToppingsFilter === "function" && resetToppingsFilter();
				onAdd({
					id,
					coverage: {
						q1: 1,
						q2: 1,
						q3: 1,
						q4: 1,
					},
					assetVersion,
					isMix,
				});
			}
		}
	};

	useEffect(() => {
		if (isDragging) {
			VibrateDevice(200);
			typeof onToppingChange === "function" && onToppingChange(id);
			setPreviewSrc(image);
		} else {
			typeof onToppingChange === "function" && onToppingChange(null);

			typeof setPreviewSrc === "function" && setPreviewSrc("");
		}
	}, [isDragging]);

	const isFullCircle = (coverage) => {
		const { q1 = 0, q2 = 0, q3 = 0, q4 = 0 } = coverage;
		return q1 && q2 && q3 && q4;
	};

	const isHalfCircle = (coverage) => {
		const { q1 = 0, q2 = 0, q3 = 0, q4 = 0 } = coverage;
		// NOTE: (q1 && q2) - top only, (q3 && q4) - bottom only, (q1 && q4) - left only, (q2 && q3) - right only.
		return (
			(q1 === q2 && q2 !== 0) ||
			(q3 === q4 && q4 !== 0) ||
			(q1 === q4 && q4 !== 0) ||
			(q2 === q3 && q3 !== 0)
		);
	};

	const isVerticalHalf = (coverage) => {
		const { q1 = 0, q2 = 0, q3 = 0, q4 = 0 } = coverage;
		// NOTE: (q1 && q4) - top only, (q3 && q2) - bottom only, (q3 && q4) - left only, (q2 && q1) - right only.
		return (q1 && q2) || (q3 && q4);
	};

	const renderCoverage = () => {
		const res = [];
		const rendered = [];
		const { q1 = 0, q2 = 0, q3 = 0, q4 = 0 } = coverage ?? {};
		if (isFullCircle(coverage ?? {})) {
			res.push(
				<div
					className={styles["full-circle"]}
					key={generateUniqueId(3)}
				/>,
			);
			return res;
		} else if (isHalfCircle(coverage ?? {})) {
			if (isVerticalHalf(coverage ?? {})) {
				const style = styles["vertical-half-circle"];
				if (q3 && q4) {
					res.push(
						<div
							className={clsx(style, styles["left-only"])}
							key={generateUniqueId(3)}
						/>,
					);
					rendered.push(QUARTER_ENUM.Q3);
					rendered.push(QUARTER_ENUM.Q4);
				} else if (q2 && q1) {
					res.push(
						<div
							className={clsx(style, styles["right-only"])}
							key={generateUniqueId(3)}
						/>,
					);
					rendered.push(QUARTER_ENUM.Q1);
					rendered.push(QUARTER_ENUM.Q2);
				}
			} else {
				const style = styles["quarter"];
				if (q1 && q4) {
					res.push(
						<div
							className={clsx(style, styles["top-left"])}
							key={generateUniqueId(3)}
						/>,
					);
					res.push(
						<div
							className={clsx(style, styles["top-right"])}
							key={generateUniqueId(3)}
						/>,
					);
					rendered.push(QUARTER_ENUM.Q1);
					rendered.push(QUARTER_ENUM.Q4);
				} else if (q2 && q3) {
					res.push(
						<div
							className={clsx(style, styles["bottom-right"])}
							key={generateUniqueId(3)}
						/>,
					);
					res.push(
						<div
							className={clsx(style, styles["bottom-left"])}
							key={generateUniqueId(3)}
						/>,
					);
					rendered.push(QUARTER_ENUM.Q2);
					rendered.push(QUARTER_ENUM.Q3);
				}
			}
		}
		const style = styles["quarter"];
		if (q4 && !rendered.includes(QUARTER_ENUM.Q4)) {
			res.push(
				<div
					className={clsx(style, styles["top-left"])}
					key={generateUniqueId(3)}
				/>,
			);
		}
		if (q1 && !rendered.includes(QUARTER_ENUM.Q1)) {
			res.push(
				<div
					className={clsx(style, styles["top-right"])}
					key={generateUniqueId(3)}
				/>,
			);
		}
		if (q2 && !rendered.includes(QUARTER_ENUM.Q2)) {
			res.push(
				<div
					className={clsx(style, styles["bottom-right"])}
					key={generateUniqueId(3)}
				/>,
			);
		}
		if (q3 && !rendered.includes(QUARTER_ENUM.Q3)) {
			res.push(
				<div
					className={clsx(style, styles["bottom-left"])}
					key={generateUniqueId(3)}
				/>,
			);
		}
		return res;
	};

	// eslint-disable-next-line
	const renderQuantity = () => {
		const rendered = [];
		const quantities = [];
		const { q1, q2, q3, q4 } = coverage;
		if (q1 === q2 && q2 === q3 && q3 === q4 && q1 > 1) {
			quantities.push(
				<div
					className={clsx(
						styles["topping-quantity"],
						styles["topping-quantity-all-over"],
					)}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q1}
				</div>,
			);
			return quantities;
		}
		if (q2 === q3 && q2 > 1) {
			quantities.push(
				<div
					className={clsx(
						styles["topping-quantity"],
						styles["topping-quantity-right-half"],
					)}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q2}
				</div>,
			);
			rendered.push(QUARTER_ENUM.Q2);
			rendered.push(QUARTER_ENUM.Q3);
		} else if (q1 === q2 && q1 > 1 && q1 !== q4) {
			quantities.push(
				<div
					className={clsx(
						styles["topping-quantity"],
						styles["topping-quantity-top-half"],
					)}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q1}
				</div>,
			);
			rendered.push(QUARTER_ENUM.Q1);
			rendered.push(QUARTER_ENUM.Q2);
		}
		if (q1 === q4 && q1 > 1) {
			quantities.push(
				<div
					className={clsx(
						styles["topping-quantity"],
						styles["topping-quantity-left-half"],
					)}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q1}
				</div>,
			);
			rendered.push(QUARTER_ENUM.Q1);
			rendered.push(QUARTER_ENUM.Q4);
		} else if (q3 === q4 && q3 > 1 && q2 !== q3) {
			quantities.push(
				<div
					className={clsx(
						styles["topping-quantity"],
						styles["topping-quantity-bottom-half"],
					)}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q3}
				</div>,
			);
			rendered.push(QUARTER_ENUM.Q3);
			rendered.push(QUARTER_ENUM.Q4);
		}
		if (q1 > 1 && !rendered.includes(QUARTER_ENUM.Q1)) {
			quantities.push(
				<div
					className={clsx(styles["topping-quantity"], styles["topping-quantity-q1"])}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q1}
				</div>,
			);
		}
		if (q2 > 1 && !rendered.includes(QUARTER_ENUM.Q2)) {
			quantities.push(
				<div
					className={clsx(styles["topping-quantity"], styles["topping-quantity-q2"])}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q2}
				</div>,
			);
		}
		if (q3 > 1 && !rendered.includes(QUARTER_ENUM.Q3)) {
			quantities.push(
				<div
					className={clsx(styles["topping-quantity"], styles["topping-quantity-q3"])}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q3}
				</div>,
			);
		}
		if (q4 > 1 && !rendered.includes(QUARTER_ENUM.Q4)) {
			quantities.push(
				<div
					className={clsx(styles["topping-quantity"], styles["topping-quantity-q4"])}
					key={generateUniqueId(5)}>
					<span className={styles["topping-quantity-duplicator"]}>x</span>
					{q4}
				</div>,
			);
		}
		return quantities;
	};

	const getCoverageLabel = () => {
		let result = "";
		const { q1, q2, q3, q4 } = coverage;
		if (isFullCircle(coverage)) {
			result = "accessibility_label_toppingsCoverage_ALL_OVER";
		} else if (isHalfCircle(coverage) || isVerticalHalf(coverage)) {
			result = "accessibility_label_toppingsCoverage_HALF";
		} else if (q1 && !q2 && !q3 && !q4) {
			result = "accessibility_label_toppingsCoverage_QUARTER";
		} else if (!q1 && q2 && !q3 && !q4) {
			result = "accessibility_label_toppingsCoverage_QUARTER";
		} else if (!q1 && !q2 && q3 && !q4) {
			result = "accessibility_label_toppingsCoverage_QUARTER";
		} else if (!q1 && !q2 && !q3 && q4) {
			result = "accessibility_label_toppingsCoverage_QUARTER";
		} else {
			result = "accessibility_label_toppingsCoverage_NONE";
		}

		return translate(result);
	};

	const renderTopping = () => {
		const selectedClassName =
			isOnPizza || clicked || isDragging ? styles["selected"] : "";
		const label = coverage ? getCoverageLabel() : "";
		return (
			<div
				className={clsx(
					styles["topping-selector-wrapper"],
					className,
					isOutOfStock ? styles["out-of-stock"] : "",
				)}
				ref={toppingRef}
				id={`topping-${id}`}>
				{isOnPizza && showCloseIcon && (
					<button
						onClick={() =>
							onRemove({
								id,
								coverage: {
									q1: 1,
									q2: 1,
									q3: 1,
									q4: 1,
								},
								assetVersion,
								isMix,
							})
						}
						className={styles["clear-topping-icon"]}>
						<img
							src={ClearCoverageIcon.src}
							alt={translate("accessibility_label_removeTopping") + " " + name}
						/>
					</button>
				)}
				{isMix && showInfoIcon && (
					<button
						onClick={() => onShowMixInfo(id)}
						className={styles["mix-info-icon"]}
						aria-haspopup={true}>
						<img
							src={MixInfoIcon.src}
							alt={name + " " + translate("accessibility_label_showMix")}
						/>
					</button>
				)}
				{/* {isDragging && <ToppingPreview img={image} />} */}
				<div>
					<button
						onClick={clickHandler}
						ref={isDraggable ? drag : null}
						className={clsx(styles["topping-img-wrapper"], selectedClassName)}
						aria-expanded={selectedClassName.length > 0}>
						{renderCoverage()}
						{/* {additionalStyle && <div className={additionalStyle}/>} */}
						<img
							onDrag={(e) => e.preventDefault()}
							onDragStart={(e) => e.preventDefault()}
							src={image}
							style={isDraggable && isDragging ? { opacity: 0 } : { opacity: 1 }}
							className={clsx(
								styles["topping-selector-image"],
								isDraggable ? styles["no-touch"] : "",
							)}
							alt={
								name
									? name + " " + label
									: translate("accessibility_imageAlt_topping") + " " + label
							}
						/>
						{/* {renderQuantity()} */}
					</button>
				</div>
				<span className={clsx(styles["topping-name"], selectedClassName)}>
					{name}
				</span>
			</div>
		);
	};

	return renderTopping();
}

const ToppingPreviewMemo = ({ img }) => {
	const deviceState = useSelector((store) => store.deviceState);
	const { display, _itemType, _item, style } = usePreview();

	if (!display) {
		return null;
	}

	const size = deviceState.isMobile || deviceState.isTablet ? 56 : 64;
	const top = -(deviceState.isMobile || deviceState.isTablet ? 40 : 0);

	const getVWSize = (size) => {
		let designSize;
		if (deviceState.isMobile) {
			designSize = 375;
		} else if (deviceState.isTablet) {
			designSize = 768;
		} else if (deviceState.isDesktop) {
			designSize = 1200;
		} else if (deviceState.isDesktopLarge) {
			designSize = 1500;
		}
		return (size / designSize) * 100 + "vw";
	};

	return (
		<img
			src={img}
			style={{
				...style,
				height: getVWSize(size),
				width: getVWSize(size),
				zIndex: 10000,
				top: top,
			}}
		/>
	);
};

export const ToppingPreview = React.memo(ToppingPreviewMemo);
