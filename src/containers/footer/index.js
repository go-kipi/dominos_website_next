import React from "react";
import styles from "./index.module.scss";

// Footers
import FooterTop from "./footer-top";
import FooterMid from "./footer-mid";
import FooterBottom from "./footer-bottom";
import { useSelector } from "react-redux";

function Footer() {
	const footerBottom = useSelector((store) => store.links.footerBottom);

	return (
		<footer className={styles["footer-container"]}>
			<FooterTop />

			<div className={styles["horizontal-container"]}>
				<div className={styles["horizontal-line"]} />
			</div>

			<FooterMid data={footerBottom} />

			<FooterBottom />
		</footer>
	);
}

export default Footer;
