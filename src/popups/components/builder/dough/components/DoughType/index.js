import React, { useEffect, useRef } from "react";
import styles from "./index.module.scss";
import InfoToolTip from "components/InfoToolTip";
import InfoIcon from "/public/assets/icons/gray-info-icon.svg";

import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { notEmptyObject } from "utils/functions";
import PizzaTreeService from "services/PizzaTreeService";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";

const DoughType = (props) => {
	const divRef = useRef();
	const {
		shouldFocus = false,
		id,
		options,
		image,
		text,
		name,
		value,
		info = "",
		selected = false,
		comment,
		className = "",
		selectedText,
		onChange = () => {},
		role = "",
		ariaDescription,
		inModal = false,
		isChildrenInStock,
	} = props;

	const hasOptions = options ? notEmptyObject(options) : false;
	const translate = useTranslate();
	const pizza = useMenus(id, ActionTypes.PRODUCT);
	const isOutOfStock = typeof pizza === "object" ? pizza?.outOfStock : false;
	useEffect(() => {
		if (shouldFocus) {
			divRef.current?.focus();
		}
	}, [shouldFocus]);

	const onClickHandler = () => {
		if (hasOptions) {
			const pos = divRef.current?.getBoundingClientRect();
			const data = { ...props };
			onChange(name, value, pos, data);
		} else {
			onChange(name, value);
		}
	};

	const selectedClassName = selected ? styles["selected"] : "";
	return (
		<button
			ref={divRef}
			className={clsx(
				styles["dough-type-wrapper"],
				className,
				!inModal && (isOutOfStock || !isChildrenInStock) ? styles["disabled"] : "",
			)}
			aria-label={ariaDescription}
			onClick={onClickHandler}
			role={"radio"}
			aria-checked={selected}
			aria-haspopup={hasOptions}>
			<div className={clsx(styles["dough-type-image-wrapper"], selectedClassName)}>
				<img
					src={image}
					alt={text}
					className={styles["dough-type-image"]}
					aria-hidden={true}
				/>
			</div>
			<div className={styles["dough-type-title"]}>
				<div>
					<div className={clsx(styles["text"], selectedClassName)}>
						{selectedText ? selectedText : text}
					</div>

					{comment && (
						<div className={clsx(styles["dough-type-comment"])}>{comment}</div>
					)}
					{!inModal && (isOutOfStock || !isChildrenInStock) ? (
						<div className={styles["dough-type-outofstock"]}>
							{translate("builderModal_doughBuilder_outOfStock_dough")}
						</div>
					) : null}
				</div>

				{translate(info) !== info && (
					<InfoToolTip
						indicator={InfoIcon}
						text={translate(info)}
					/>
				)}
			</div>
		</button>
	);
};

export default DoughType;
