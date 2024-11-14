import React from "react";
import styles from "./index.module.scss";

// Icons
import useTranslate from "hooks/useTranslate";

export default function Tags({ tags }) {
	const translate = useTranslate();

	return (
		<div className={styles["tags-container"]}>
			<div className={styles["tags"]}>
				{tags &&
					tags.map((tag) => {
						return (
							<div
								className={styles["tag"]}
								key={tag}>
								<img
									className={styles["icon"]}
									src={""}
								/>
								<span className={styles["text"]}>{translate(`storeTag.${tag}`)} </span>
							</div>
						);
					})}
			</div>
		</div>
	);
}
