import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

import RegularPizzaFoldAnimation from "animations/RegularPizzaFold.json";
import SquarePizzaFoldAnimation from "animations/SquarePizzaFold.json";

import { Player } from "@lottiefiles/react-lottie-player";

const AnimatedPizzaRef = (props, ref) => {
	const { reversed = false, type = "classic", onLoadImage = () => {} } = props;

	useImperativeHandle(
		ref,
		() => {
			return {
				reverse,
				play,
			};
		},
		[type],
	);

	const classic = RegularPizzaFoldAnimation;
	const glutenFree = SquarePizzaFoldAnimation;

	const [classicClassName, setClassicClassName] = useState(styles["hide"]);
	const [glutenFreeClassName, setGlutenFreeClassName] = useState(styles["hide"]);

	const eventSent = useRef(false);

	const classicRef = useRef();
	const glutenFreeRef = useRef();

	const callbackRef = useRef();

	const didReversedAnimation = useRef(false);

	useEffect(() => {
		setClassName(type);
		if (reversed && !didReversedAnimation.current) {
			setLottieProps(1, undefined, true);
			didReversedAnimation.current = true;
		} else {
			setLottieProps(-1, undefined, false);
		}
	}, [type]);

	function onLoad() {
		if (!eventSent.current) {
			onLoadImage();
		}
		eventSent.current = true;
	}

	const play = (callback) => {
		setLottieProps(1, callback, true);
	};

	const reverse = (callback) => {
		setLottieProps(-1, callback, true);
	};

	function setLottieProps(direction, callback, shouldPlay = true) {
		glutenFreeRef.current?.setDirection(direction);
		classicRef.current?.setDirection(direction);

		if (shouldPlay) {
			glutenFreeRef?.current?.play();
			classicRef?.current?.play();
		}

		const callBackFnc = () => {
			glutenFreeRef?.current?.pause();
			classicRef?.current?.pause();
			typeof callback === "function" && callback();
		};
		callbackRef.current = callBackFnc;
	}

	function setClassName(type) {
		if (type === "glutenFree") {
			setClassicClassName(styles["hide"]);
			setGlutenFreeClassName("");
		} else {
			setClassicClassName("");
			setGlutenFreeClassName(styles["hide"]);
		}
	}

	const eventHandler = (event) => {
		if (event === "complete") {
			typeof callbackRef.current === "function" && callbackRef.current();
		} else if (event === "load") {
			typeof onLoad === "function" && onLoad();
		}
	};

	return (
		<div className={styles["image-wrapper"]} aria-hidden={true}>
			<Player
				src={classic}
				loop={false}
				autoplay={false}
				keepLastFrame
				className={clsx(styles["img"], classicClassName)}
				onEvent={eventHandler}
				lottieRef={(instance) => {
					if (classicRef) {
						classicRef.current = instance;
					}
				}}
			/>
			<Player
				src={glutenFree}
				loop={false}
				autoplay={false}
				keepLastFrame
				className={clsx(styles["img"], glutenFreeClassName)}
				onEvent={eventHandler}
				lottieRef={(instance) => {
					if (glutenFreeRef) {
						glutenFreeRef.current = instance;
					}
				}}
			/>
		</div>
	);
};

const AnimatedPizza = forwardRef(AnimatedPizzaRef);

export default AnimatedPizza;
