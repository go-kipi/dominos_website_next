import React from "react";

import styles from "./BackgroundImage.module.scss";
import clsx from "clsx";
import Image from "next/image";

import MobileBackgroud from "/public/assets/menu/mobile-background.png";
import DesktopBackgroud from "/public/assets/menu/desktop-background.png";
import { useSelector } from "react-redux";

export default function BackgroundImage({ className = "", src }) {
	const deviceState = useSelector((store) => store.deviceState);
	const backgroundImage = deviceState.isDesktop
		? DesktopBackgroud
		: MobileBackgroud;
	const width = deviceState.isDesktop ? 1920 : 1119;
	const height = 1080;
	return (
		<div className={clsx(styles["background-img"], className)}>
			<Image
				aria-hidden={true}
				alt="background=image"
				src={src ?? backgroundImage.src}
				width={width}
				height={height}
				className={styles["img"]}
			/>
		</div>
	);
}
