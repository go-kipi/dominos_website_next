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
import VolcanoPizzaFoldAnimation from "animations/VolcanoPizzaFold.json";
import VolcanoRozePizzaFoldAnimation from "animations/VolcanoRozePizzaFold.json";
import VolcanoCacioPizzaFoldAnimation from "animations/VolcanoCacioPizzaFold.json";

import { Player } from "@lottiefiles/react-lottie-player";

const AnimatedPizzaRef = (props, ref) => {
	const { reversed = false, type = "classic", onLoadImage = () => {} } = props;

	useImperativeHandle(
		ref,
		() => ({
			reverse,
			play,
		}),
		[type],
	);

	const classic = RegularPizzaFoldAnimation;
	const glutenFree = SquarePizzaFoldAnimation;
	const volcanoRegular = VolcanoPizzaFoldAnimation;
	const volcanoRoze = VolcanoRozePizzaFoldAnimation;
	const volcanoCacio = VolcanoCacioPizzaFoldAnimation;

	const [classicClassName, setClassicClassName] = useState(styles["hide"]);
	const [glutenFreeClassName, setGlutenFreeClassName] = useState(styles["hide"]);
	const [volcanoRegularClassName, setVolcanoRegularClassName] = useState(
		styles["hide"],
	);
	const [volcanoRozeClassName, setVolcanoRozeClassName] = useState(
		styles["hide"],
	);
	const [volcanoCacioClassName, setVolcanoCacioClassName] = useState(
		styles["hide"],
	);

	const eventSent = useRef(false);

	const classicRef = useRef();
	const glutenFreeRef = useRef();
	const volcanoRegularRef = useRef();
	const volcanoRozeRef = useRef();
	const volcanoCacioRef = useRef();

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
		[
			glutenFreeRef,
			classicRef,
			volcanoRegularRef,
			volcanoRozeRef,
			volcanoCacioRef,
		].forEach((ref) => {
			ref.current?.setDirection(direction);
			shouldPlay && ref.current?.play();
		});

		const callBackFnc = () => {
			[
				glutenFreeRef,
				classicRef,
				volcanoRegularRef,
				volcanoRozeRef,
				volcanoCacioRef,
			].forEach((ref) => ref.current?.pause());
			typeof callback === "function" && callback();
		};
		callbackRef.current = callBackFnc;
	}

	function setClassName(type) {
		setClassicClassName(styles["hide"]);
		setGlutenFreeClassName(styles["hide"]);
		setVolcanoRegularClassName(styles["hide"]);
		setVolcanoRozeClassName(styles["hide"]);
		setVolcanoCacioClassName(styles["hide"]);

		switch (type) {
			case "glutenFree":
				setGlutenFreeClassName("");
				break;
			case "volcano_reg":
				setVolcanoRegularClassName("");
				break;
			case "volcano_roze":
				setVolcanoRozeClassName("");
				break;
			case "volcano_cachioapepe":
				setVolcanoCacioClassName("");
				break;
			default:
				setClassicClassName("");
				break;
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
		<div
			className={styles["image-wrapper"]}
			aria-hidden={true}>
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
			<Player
				src={volcanoRegular}
				loop={false}
				autoplay={false}
				keepLastFrame
				className={clsx(styles["img"], volcanoRegularClassName)}
				onEvent={eventHandler}
				lottieRef={(instance) => {
					if (volcanoRegularRef) {
						volcanoRegularRef.current = instance;
					}
				}}
			/>
			<Player
				src={volcanoRoze}
				loop={false}
				autoplay={false}
				keepLastFrame
				className={clsx(styles["img"], volcanoRozeClassName)}
				onEvent={eventHandler}
				lottieRef={(instance) => {
					if (volcanoRozeRef) {
						volcanoRozeRef.current = instance;
					}
				}}
			/>
			<Player
				src={volcanoCacio}
				loop={false}
				autoplay={false}
				keepLastFrame
				className={clsx(styles["img"], volcanoCacioClassName)}
				onEvent={eventHandler}
				lottieRef={(instance) => {
					if (volcanoCacioRef) {
						volcanoCacioRef.current = instance;
					}
				}}
			/>
		</div>
	);
};

const AnimatedPizza = forwardRef(AnimatedPizzaRef);

export default AnimatedPizza;
