import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import LottieAnimation from "../../components/LottieAnimation";
import Animation from "../../animations/dominos-splash.json";
import DominosLoader from "components/DominosLoader/DominosLoader";

const Splash = (props) => {
	const [isSplashAnimationFinished, setIsSplashAnimationFinished] =
		useState(false);
	const [showLoader, setShowLoader] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setShowLoader(true);
		}, 2000);

		return timeout && clearTimeout(timeout);
	}, []);

	return (
		<div className={styles["splash-wrapper"]}>
			{!isSplashAnimationFinished && !showLoader ? (
				<LottieAnimation
					className={styles["splash-animation"]}
					animation={Animation}
					autoPlay
					loop={false}
					onComplete={() => setIsSplashAnimationFinished(true)}
				/>
			) : (
				<div className={styles["loader"]}>
					<DominosLoader />
				</div>
			)}
		</div>
	);
};

export default Splash;
