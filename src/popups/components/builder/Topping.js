import clsx from "clsx";
import React, { useEffect, useState } from "react";

export default function Topping(props) {
	const { isAnimated = false, src, className, delay = 0 } = props;
	const [animatedClassName, setAnimatedClassName] = useState(
		isAnimated ? "animated" : "",
	);

	function onLoad() {
		setAnimatedClassName(isAnimated ? "animated" : "");
		if (isAnimated) {
			const timeout = setTimeout(() => {
				setAnimatedClassName("");
				clearTimeout(timeout);
			}, 50);
		}
	}

	return (
		<img
			className={clsx(className, animatedClassName)}
			src={src}
			alt={""}
			onLoad={onLoad}
			height={40}
			width={40}
		/>
	);
}
