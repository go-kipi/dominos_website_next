import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";

import TitleHe from "/public/assets/icons/Roleta/roleta-title-he.svg";
import TitleEn from "/public/assets/icons/Roleta/roleta-title-en.svg";
import Triangle from "/public/assets/icons/Roleta/spinning-wheel-triangle.png";
import Beverage from "/public/assets/icons/Roleta/beverage.svg";
import Slice from "/public/assets/icons/Roleta/slice.png";
import Spatula from "/public/assets/icons/Roleta/spatula.png";
import Pizza from "/public/assets/icons/Roleta/pizza.png";
import Dessert from "/public/assets/icons/Roleta/dessert.svg";
import SideDish from "/public/assets/icons/Roleta/side-dish.svg";

import styles from "./Spin.module.scss";
import Button from "components/button";
import clsx from "clsx";
import { LANGUAGES } from "constants/Languages";
import useTranslate from "hooks/useTranslate";
import SRContent from "../../../../components/accessibility/srcontent";
import { createAccessibilityText } from "../../../../components/accessibility/acfunctions";

function Spin(props) {
	const { prize } = props;

	const ang = useRef(0);
	const angStart = useRef(0);
	const radius = useRef(0);
	const touchStartTime = useRef();
	const { animateOut, onPrizeShowen, exitRoletaModal } = props;
	const lang = useSelector((store) => store.generalData?.lang);
	const deviceState = useSelector((store) => store.deviceState);
	const prizeImg = getPrizeByMeta(prize?.meta);
	const [isSpinAlready, setIsSpinAlready] = useState(false);
	const [isEndSpinnig, setIsEndSpinnig] = useState(false);

	// animation classes
	const [spinningAnimationClass, setSpinningAnimationClass] = useState("");
	const [titleAnimationClass, setTitleAnimationClass] = useState("");
	const [sptulaAnimationClass, setSptulaAnimationClass] = useState("");
	const [sliceAnimationClass, setSliceAnimationClass] = useState("");
	const [triangleAnimationClass, setTriangleAnimationClass] = useState("");
	const [buttonAnimationClass, setButtonAnimationClass] = useState("");
	const [skipAnimationClass, setSkipAnimationClass] = useState("");
	const [spinningAnimatedStyle, setSpinningAnimatedStyle] = useState({});
	const translate = useTranslate();
	const timer = useRef();

	function SpinTheWheel() {
		if (!isSpinAlready) {
			setIsSpinAlready(true);
			setSpinningAnimationClass(styles["rotate"]);
			setTriangleAnimationClass(styles["reverse-rotate"]);
			setTimeout(() => {
				setTriangleAnimationClass(styles["rotate"]);
			}, 700);
			setTitleAnimationClass(styles["hide"]);
			setButtonAnimationClass(styles["hide"]);
			setSkipAnimationClass(styles["hide"]);
			setTimeout(() => {
				setTriangleAnimationClass("");
				setIsEndSpinnig(true);
				timer.current = setTimeout(() => {
					spatulaDown();
					timer.current = setTimeout(() => {
						spatulaUp();
						sliceUp();
						triangleUp();
						timer.current = setTimeout(() => {
							sliceOut();
							spatulaOut();
							triangleOut();
							timer.current = setTimeout(() => {
								typeof onPrizeShowen === "function" && onPrizeShowen();
							}, 1000);
						}, 300);
					}, 1000);
				}, 1000);
			}, 6000);
		}
	}

	function spatulaDown() {
		setSptulaAnimationClass(styles["down"]);
	}

	function spatulaUp() {
		setSptulaAnimationClass(clsx(styles["down"], styles["up"]));
	}

	function sliceUp() {
		setSliceAnimationClass(styles["up"]);
	}

	function triangleUp() {
		setTriangleAnimationClass(styles["up"]);
	}

	function sliceOut() {
		setSliceAnimationClass(clsx(styles["up"], styles["out"]));
	}

	function spatulaOut() {
		setSptulaAnimationClass(clsx(styles["up"], styles["out"]));
	}

	function triangleOut() {
		setTriangleAnimationClass(clsx(["up"], styles["out"]));
	}

	function getPrizeByMeta(meta) {
		switch (meta) {
			case "sideDishPrize":
				return SideDish;
			case "dessertPrize":
				return Dessert;
			case "beveragePrize":
			default:
				return Beverage;
		}
	}

	const image =
		lang === LANGUAGES.HEBREW.name
			? TitleHe
			: lang === LANGUAGES.ENGLISH.name
			? TitleEn
			: null;

	function RenderMobile() {
		return (
			<div className={styles["mobile-wrapper"]}>
				{RenderTitle()}
				{RenderWheel()}
				{RenderSkip()}
			</div>
		);
	}

	function RenderDesktop() {
		return (
			<div className={styles["desktop-wrapper"]}>
				<div className={clsx(styles["right-side"], titleAnimationClass)}>
					{RenderTitle()}
					{RenderButton()}
					{RenderSkip()}
				</div>

				<div className={styles["left-side"]}>{RenderWheel()}</div>
			</div>
		);
	}

	function RenderTitle() {
		return (
			<div className={clsx(styles["title-wrapper"], titleAnimationClass)}>
				<span className={styles["title"]}>{translate("roleta_spin_title")}</span>

				<div className={styles["spin-image-title"]}>
					<img
						src={image?.src}
						alt={translate("roleta_spin_image_title_alt")}
					/>
				</div>
			</div>
		);
	}

	function RenderSpatula() {
		return isEndSpinnig ? (
			<div className={clsx(styles["spatula"], sptulaAnimationClass)}>
				<img src={Spatula.src} />
			</div>
		) : null;
	}

	function RenderButton() {
		return (
			<Button
				show={!isSpinAlready}
				className={clsx(styles["start-spinning"], buttonAnimationClass)}
				onClick={SpinTheWheel}
				text={translate("roleta_spin_startSpining_buttonLabel")}
				ariaLabel={translate("roleta_spin_startSpining_buttonLabel")}
			/>
		);
	}

	function angXY(ev) {
		const bcr = ev.target.getBoundingClientRect();
		radius.current = bcr.width / 2;
		const { clientX, clientY } = ev.touches ? ev.touches[0] : ev;
		const y = clientY - bcr.top - radius.current; // y from center
		const x = clientX - bcr.left - radius.current; // x from center
		return (Math.atan2(y, x) * 180) / Math.PI;
	}

	const [startDragX, setStartDragX] = useState();

	function onTouchStart(e) {
		e.clientX && setStartDragX(e.clientX);
		if (!isSpinAlready) {
			angStart.current = angXY(e) - ang.current;
			touchStartTime.current = Date.now().valueOf();
		}
	}

	function onTouchMove(e) {
		if (!isSpinAlready) {
			ang.current = angXY(e) - angStart.current;
			setSpinningAnimatedStyle({
				transform: `rotate(${ang.current}deg)`,
			});
		}
	}

	function onTouchEnd(e) {
		if (e.clientX) {
			// Can be on drag events, if its mobile its will be undefined
			const THRESHOLD = 100;
			const currentX = e.clientX;
			const finalDragDistance = currentX - startDragX;
			if (Math.abs(finalDragDistance) > THRESHOLD) {
				setSpinningAnimatedStyle({});
				SpinTheWheel();
			}
			setStartDragX(null);
		} else {
			const now = Date.now().valueOf();
			const then = touchStartTime.current;
			const deltaAngle = ang.current - angStart.current;
			const deltaTime = now - then;
			const angularVelocity = deltaAngle / deltaTime;
			const velocityLimit = deviceState.isMobile ? 1 : 0.2;
			if (angularVelocity >= velocityLimit) {
				setSpinningAnimatedStyle({});
				SpinTheWheel();
			}
		}
	}

	const hasDraggedEnough = (start, end) => {
		const THRESHOLD = 50;
		const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
		return distance >= THRESHOLD;
	};

	function RenderWheel() {
		return (
			<div className={styles["pizza-pointer-wrapper"]}>
				<div className={styles["pizza-content-wrapper"]}>
					<div className={clsx(styles["triangle"], triangleAnimationClass)}>
						<img
							src={Triangle.src}
							alt={""}
						/>
					</div>
					<button
						className={clsx(styles["pizza-wrapper"], spinningAnimationClass)}
						style={{ pointerEvents: "none" }}
						draggable={false}
						aria-label={translate("accessibility_ariaLabel_RouletteSpin")}>
						<div
							className={styles["pizza-inner-content"]}
							style={spinningAnimatedStyle}>
							<div className={styles["prize"]}>
								<img
									src={prizeImg?.src}
									alt="prize"
									aria-hidden={true}
								/>
							</div>
							<div className={styles["prize"]}>
								<img
									src={prizeImg?.src}
									alt="prize"
									aria-hidden={true}
								/>
							</div>
							<div className={styles["pizza"]}>
								<img
									src={Pizza.src}
									alt={""}
									aria-hidden={true}
								/>
							</div>
							{RenderSpatula()}
							<div className={clsx(styles["slice"], sliceAnimationClass)}>
								<img src={Slice.src} />
							</div>
						</div>
					</button>
					<button
						className={clsx(styles["pizza-wrapper"], spinningAnimationClass)}
						onClick={SpinTheWheel}
						onDragStart={onTouchStart}
						onDrag={onTouchMove}
						onDragEnd={onTouchEnd}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						draggable={true}
						onTouchEnd={onTouchEnd}
						aria-label={translate("accessibility_roleta_spin_callForAction")}
						style={{ position: "absolute" }}
					/>
				</div>
			</div>
		);
	}

	const hidePopup = () => {
		typeof animateOut === "function" && animateOut();
		typeof exitRoletaModal === "function" && exitRoletaModal();
	};

	function RenderSkip() {
		return (
			<button
				className={clsx(styles["skip-wrapper"], skipAnimationClass)}
				onClick={hidePopup}>
				<span className={styles["skip"]}>{translate("roleta_skip")}</span>
			</button>
		);
	}
	const srText = createAccessibilityText(
		spinningAnimationClass
			? translate("accessibility_rouletteDescription_startAnimation")
			: createAccessibilityText(
					translate("roleta_spin_title"),
					translate("roleta_spin_image_title_alt"),
			  ),
	);
	return (
		<div className={styles["spin-wrapper"]}>
			<SRContent
				role={"alert"}
				ariaLive={"polite"}
				message={srText}
			/>
			{deviceState.isDesktop ? RenderDesktop() : RenderMobile()}
		</div>
	);
}

export default Spin;
