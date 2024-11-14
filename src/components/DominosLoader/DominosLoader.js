import React, { useState } from "react";
import LottieAnimation from "components/LottieAnimation";

import EnterAnimation from "animations/Loader/loader-enter.json";
import LoopAnimation from "animations/Loader/loader-loop.json";

import styles from "./DominosLoader.module.scss";
function DominosLoader(props) {
	const [animationState, setAnimationState] = useState("enter");

	function onEnterAnimationFinish() {
		setAnimationState("loop");
	}

	function Enter() {
		return (
			<div className={styles["dominos-loader-animation-wrapper"]}>
				<LottieAnimation
					animation={EnterAnimation}
					onComplete={onEnterAnimationFinish}
					autoplay={true}
					className={styles["dominos-loader-animation"]}
				/>
			</div>
		);
	}
	function Loop() {
		return (
			<div className={styles["dominos-loader-animation-wrapper"]}>
				<LottieAnimation
					animation={LoopAnimation}
					loop
					autoplay={true}
					className={styles["dominos-loader-animation"]}
				/>
			</div>
		);
	}

	return (
		<div
			className={styles["dominos-loader-wrapper"]}
			role={"alert"}
			aria-labelledby={"loading"}>
			<span
				id={"loading"}
				className={styles["none"]}>
				Loading
			</span>
			{animationState === "enter" && Enter()}
			{animationState === "loop" && Loop()}
		</div>
	);
}

export default DominosLoader;
