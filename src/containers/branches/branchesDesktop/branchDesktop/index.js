import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import BranchDetails from "../../components/BranchDetails";
import BranchDescription from "../../components/BranchDescription";
import clsx from "clsx";
import BranchAreaIcon from "/public/assets/icons/navigate-branch-icon.svg";

import BlueArrowIcon from "/public/assets/icons/blue-arrow-icon.svg";
import Button from "../../../../components/button";
import Link from "next/dist/client/link";
import * as Routes from "constants/routes";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

export default function BranchDesktop({
	data,
	id,
	handleNavigation,
	handleOrder,
	city,
	isOnCityPage,
}) {
	const [animation, setAnimation] = useState(false);
	const translate = useTranslate();

	useEffect(() => {
		setTimeout(() => {
			setAnimation(true);
		}, [250]);
	}, []);

	const href = `${Routes.branches}/${city?.url}`;

	const nav = () => {
		handleNavigation(data.lat, data.lng);
		AnalyticsService.specificBranchesEnteries("navigation");
	};

	const order = () => {
		AnalyticsService.specificBranchesEnteries("order");
		handleOrder(id);
	};

	return (
		<div
			className={clsx(
				styles["branch-desktop-container"],
				animation ? styles[""] : styles["none"],
			)}>
			<BranchDetails
				name={data.name}
				city={city}
				address={data.storeAddress}
				navigation={{
					lng: data.lng,
					lat: data.lat,
				}}
				phone={data.directPhone}
				email={data.email}
				isOnCityPage={isOnCityPage}
				cityName={data.cityName}
			/>
			<div className={styles["content"]}>
				<Separator className={styles["separator"]} />
				<BranchDescription
					openingHours={data.openingHoursTextual}
					description={data.description}
					assetVersion={data.assetVersion}
					tags={data.tags}
					id={id}
				/>
				<div className={styles["bottom"]}>
					{!isOnCityPage ? (
						<Link
							href={href}
							className={styles["branches-area"]}>
							<img
								className={styles["icon"]}
								src={BranchAreaIcon.src}
							/>
							<span className={styles["branches-area-text"]}>
								{translate("branchScreen_branchesArea")}
							</span>
							<img
								className={styles["arrow-icon"]}
								src={BlueArrowIcon.src}
							/>
						</Link>
					) : (
						<div className={styles["branches-area"]} />
					)}
					<div className={styles["buttons-container"]}>
						<Button
							className={clsx(
								styles["custom-button"],
								styles["margin"],
								styles["transparent"],
							)}
							onClick={nav}
							text={translate("branchScreen_details_navigate")}
							animated={false}
							textClassName={clsx(styles["custom-btn-text"], styles["custom-text"])}
						/>
						<Button
							className={styles["custom-button"]}
							onClick={order}
							text={translate("branchScreen_submitBtn_toOrder")}
							textClassName={styles["custom-text"]}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function Separator({ className }) {
	return <div className={className} />;
}
