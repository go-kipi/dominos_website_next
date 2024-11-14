import React from "react";
import styles from "./index.module.scss";

import DynamicLink from "components/dynamic_link";

function FooterMid(props) {
	const { data } = props;

	const getLinkName = () => {
		return data.map((item, index) => {
			return (
				<React.Fragment key={"footer-mid" + index}>
					<DynamicLink link={item}>{item.nameUseCases}</DynamicLink>
					{index !== item.length - 1 && <span>|</span>}
				</React.Fragment>
			);
		});
	};

	return (
		<div className={styles["footer-mid-container"]}>
			<div className={styles["body"]}>{getLinkName()}</div>
		</div>
	);
}

export default FooterMid;
