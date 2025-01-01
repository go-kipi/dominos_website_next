import React, { useState, useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";

const LottieAnimationRef = (props, animationRef) => {
	const [animationFinished, setAnimationFinished] = useState(false);
	const {
		animation,
		onComplete = false,
		onLoop = false,
		autoplay = true,
		loop = false,
		className = "",
		isPaused = false,
		speed,
	} = props;

	useEffect(() => {
		if (animationFinished) {
			typeof onComplete === "function" && onComplete();
		}
	}, [animationFinished]);

	useEffect(() => {
		setAnimationFinished(false);
	}, [animation]);

	useEffect(() => {
		if (isPaused) {
			animationRef?.current?.pause();
		} else {
			animationRef?.current?.play();
		}
	}, [isPaused]);

	const options = {
		src: animation,
		loop,
		autoplay: !isPaused || autoplay,
		className,
		keepLastFrame: true,
		speed,
	};

	const eventHandler = (event) => {
		if (event === "complete") {
			if (!animationFinished) {
				setAnimationFinished(true);
			}
		} else if (event === "loop") {
			typeof onLoop === "function" && onLoop();
		}
	};

	return (
		<Player
			{...options}
			onEvent={eventHandler}
			lottieRef={(instance) => {
				if (animationRef) {
					animationRef.current = instance;
				}
			}}
		/>
	);
};
const LottieAnimation = React.forwardRef(LottieAnimationRef);

export default LottieAnimation;
