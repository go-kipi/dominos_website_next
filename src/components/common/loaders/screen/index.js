import DominosLoader from "components/DominosLoader/DominosLoader";
import React from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

const Loader = ({
	onAnimationEnd = () => {},
	className = "",
	shouldAnimate = false,
}) => {
	return (
		<div
			tabIndex={0}
			className={clsx(
				styles["loader_wrapper"],
				styles[className],
				shouldAnimate ? styles["animate"] : "",
			)}
			role={"progressbar"}
			onAnimationEnd={onAnimationEnd}>
			<div className={styles["loader"]}>
				<DominosLoader />
			</div>
		</div>
	);
};
export default Loader;
