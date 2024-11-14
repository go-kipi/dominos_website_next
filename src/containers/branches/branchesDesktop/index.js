import React, { useEffect, useState } from "react";
import ChooseBranchWithLocation from "../../../popups/components/Delivery/pickup/ChooseBranchFromListOrMap";
import styles from "./index.module.scss";
import clsx from "clsx";

export default function BranchesDesktop(props) {
	const [animation, setAnimation] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setAnimation(true);
		}, [250]);
	}, []);

	return (
		<div
			className={clsx(
				styles["branches-container"],
				animation ? styles[""] : styles["none"],
			)}>
			<ChooseBranchWithLocation
				showHeader={false}
				isOnBranchesScreen={true}
				useLink={true}
				addCustomScrollbar={true}
			/>
		</div>
	);
}
