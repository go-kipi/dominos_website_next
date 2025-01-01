import React, { useRef } from "react";
import styles from "./index.module.scss";

// Icons
import useTranslate from "hooks/useTranslate";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { useSelector } from "react-redux";

export default function Tags({ tags }) {
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);

	return (
		<div className={styles["tags-container"]}>
			<div className={styles["tags"]}>
				<Swiper
					slidesPerView={deviceState.isMobile ? 3 : tags?.length}
					navigation
					enabled={deviceState.isMobile}
					modules={[Navigation]}>
					{tags &&
						tags.map((tag) => {
							return (
								<SwiperSlide key={tag}>
									<div
										className={styles["tag"]}
										key={tag}>
										<img
											className={styles["icon"]}
											src={""}
										/>
										<span className={styles["text"]}>
											{translate(`storeTag.${tag}`)}{" "}
										</span>
									</div>
								</SwiperSlide>
							);
						})}
				</Swiper>
			</div>
		</div>
	);
}
