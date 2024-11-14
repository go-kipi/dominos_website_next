import React, { useState } from "react";
import { getFullMediaUrl } from "../../../../utils/functions";
import styles from "./index.module.scss";
import { MEDIA_TYPES } from "../../../../constants/media-types";
import { MEDIA_ENUM } from "../../../../constants/media-enum";
import { useSelector } from "react-redux";
import Tags from "../Tags";
import HTMLDisplay from "../../../../components/HTMLDisplay";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";

export default function BranchDescription({
	id,
	openingHours,
	description,
	assetVersion,
	tags,
}) {
	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();
	const [showGradientTop, setShowGradientTop] = useState(true);
	const [showGradientBottom, setShowGradientBottom] = useState(false);

	const item = {
		assetVersion: assetVersion,
		id: id,
		label: translate("branchScreen_branchImage"),
	};

	const getDescription = () => {
		return (
			<HTMLDisplay
				className={styles["description"]}
				html={description}
				onScroll={(isTop, isBottom) => {
					setShowGradientBottom(isBottom);
					setShowGradientTop(isTop);
				}}
			/>
		);
	};

	function renderComponent() {
		return (
			<>
				<div className={styles["branch-top-details"]}>
					<div className={styles["tags-opening-hours-wrapper"]}>
						<Tags tags={tags} />

						<div className={styles["opening-hours-container"]}>
							<h2 className={styles["title"]}>
								{translate("branchScreen_openingHours")}
							</h2>
							<div className={styles["opening-hours-wrapper"]}>
								<HTMLDisplay
									className={styles["opening-hours-data"]}
									html={openingHours}
								/>
							</div>
						</div>
					</div>

					{!deviceState.isDesktop && (
						<h2 className={styles["title"]}>
							{translate("branchScreen_aboutBranch")}
						</h2>
					)}

					<div className={styles["details"]}>
						<img
							className={styles["image"]}
							src={getFullMediaUrl(
								item,
								MEDIA_TYPES.STORE,
								MEDIA_ENUM.STORE_PAGE,
								"jpeg",
							)}
						/>
					</div>
				</div>
				<div className={styles["description-wrapper"]}>
					{!showGradientTop && getGradient("top")}
					{getDescription()}
					{!showGradientBottom && getGradient("bottom")}
				</div>
			</>
		);
	}

	const getGradient = (position) => {
		if (!deviceState.isDesktop) return;

		return <div className={clsx(styles["gradient"], styles[position])} />;
	};

	return (
		<div className={styles["branch-description-container"]}>
			{renderComponent()}
		</div>
	);
}
