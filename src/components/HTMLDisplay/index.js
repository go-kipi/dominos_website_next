import React, { useRef } from "react";
import parse from "html-react-parser";
import HiddableScroolBar from "components/HiddableScrollBar/HiddableScrollBar";

import styles from "./index.module.scss";

export default function HTMLDisplay({
	className = "",
	html = "",
	onScroll = () => {},
}) {
	const ref = useRef();

	const handleScroll = (e) => {
		const bottom =
			e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
		const top = e.target.scrollTop === 0;
		typeof onScroll === "function" && onScroll(top, bottom);
	};

	return (
		<HiddableScroolBar
			isOpen={true}
			listref={ref}
			onScroll={handleScroll}
			extraStyles={styles}>
			<div
				className={className}
				ref={ref}>
				{parse(html)}
			</div>
		</HiddableScroolBar>
	);
}
