import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";

import PriceListIcon from "/public/assets/icons/price-list-icon.svg";
import PriceListRow from "../../../components/PriceListRow";
import useMenus from "hooks/useMenus";
import ActionTypes from "constants/menus-action-types";
import BlurPopup from "../../Presets/BlurPopup";
import useTranslate from "hooks/useTranslate";
import useGetMenuData from "hooks/useGetMenuData";
import { MENUS } from "constants/menu-types";
import TabSelector from "components/TabSelector/TabSelector";
import { notEmptyObject } from "utils/functions";
import clsx from "clsx";
import SRContent from "../../../components/accessibility/srcontent";
import { createAccessibilityText } from "../../../components/accessibility/acfunctions";

function PriceListPopup(props) {
	const ref = useRef();

	const priceList = useGetMenuData({
		id: MENUS.PRICE_LIST,
		isInBuilder: true,
		showLoader: false,
	});

	useEffect(() => {
		if (notEmptyObject(priceList)) {
			onTabChange(priceList?.defaultElement);
		}
	}, [priceList]);

	const description = priceList?.nameUseCases?.Description ?? "";
	const title = priceList?.nameUseCases?.name ?? "";
	const hasDescription =
		typeof description === "string" && description.length > 0;
	const translate = useTranslate();

	const [selectedTab, setSelectedTab] = useState();

	function onTabChange(id) {
		setSelectedTab(id);
	}
	const srText = createAccessibilityText(
		title,
		description,
		translate("priceListDisclaimer_text"),
	);
	return (
		<BlurPopup
			id={props.id}
			ref={ref}
			className={styles["price-list"]}
			showCloseIcon>
			<SRContent
				message={srText}
				ariaLive={"off"}
				role={"alert"}
			/>
			<div className={styles["price-list-img-wrapper"]}>
				<img
					src={PriceListIcon.src}
					alt={"Pizza icon"}
					aria-hidden={true}
				/>
			</div>
			<div className={styles["price-row-list-wrapper"]}>
				<span
					className={styles["price-list-title"]}
					aria-hidden={true}>
					{title}
				</span>
				{hasDescription ? (
					<span
						className={styles["price-list-subtitle"]}
						aria-hidden={true}>
						{description}
					</span>
				) : null}
				<div className={styles["tab-selector-wrapper"]}>
					<TabSelector
						tabs={priceList?.elements ?? []}
						selectedTab={selectedTab}
						onTabChange={onTabChange}
					/>
				</div>

				<PriceList id={selectedTab} />
			</div>
			<div
				className={styles["disclaimer"]}
				tabIndex={0}>
				<span
					className={clsx(styles["disclaimer-text"], styles["asterisk"])}
					aria-label={translate("accessibility_aria_note")}>
					<span aria-hidden={true}>{translate("asterisk")}</span>
				</span>
				<span
					className={styles["disclaimer-text"]}
					aria-hidden={true}>
					{translate("priceListDisclaimer_text")}
				</span>
			</div>
		</BlurPopup>
	);
}

function PriceList({ id }) {
	const menu = useGetMenuData({
		id: id,
		isInBuilder: true,
		showLoader: false,
	});

	return (
		<div className={styles["price-row-list"]}>
			{menu?.elements?.map((item, idx) => (
				<RenderPriceListRow
					type={menu.nameUseCases.name}
					index={idx}
					id={item.id}
					key={"price-list-row-" + idx}
				/>
			))}
		</div>
	);
}

function RenderPriceListRow(props) {
	const { id, index, type } = props;
	const item = useMenus(id, ActionTypes.PRODUCT);

	return (
		<>
			<PriceListRow
				type={type}
				className={styles["row"]}
				text={item?.nameUseCases?.Title}
				price={item.price}
				oldPrice={item.priceBeforeDiscount}
				showPriceBeforeDiscount={item.showPriceBeforeDiscount}
			/>
		</>
	);
}

export default PriceListPopup;
