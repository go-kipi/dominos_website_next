import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getMobileOperatingSystem } from "utils/functions";
import styles from "./index.module.scss";

const SECOND = 1000;

function TrackerMessage({ status }) {
	const os = getMobileOperatingSystem();
	const isIOS = os === "iOS";
	const deviceState = useSelector((store) => store.deviceState);
	const trackerMessagesTranslations = useSelector(
		(store) => store.trackerMessagesTranslations,
	);
	const lang = useSelector((store) => store.generalData.lang);
	const trackerMessagesObject = trackerMessagesTranslations[status] ?? {};
	const [messageIndex, setMessageIndex] = useState(0);
	const [fadeClassName, setFadeClassName] = useState("fade-out");
	const timerId = useRef();
	const parentTi = useRef();
	const isMobile = deviceState.isMobile;
	const isHigherMessages = isMobile && isIOS;
	const { values = {}, changeTextEverySecond = 20 } = trackerMessagesObject;

	const messages = values[lang] ?? [];
	const isSingleMessage = messages.length === 1;

	const currentMessageIndex =
		messageIndex >= messages.length
			? messageIndex % messages.length
			: messageIndex;
	const currentMessage = messages[currentMessageIndex];

	useEffect(() => {
		if (!isSingleMessage) {
			setMessageIndex(0);
			setFadeClassName("fade-out");
			timerId.current && clearTimeout(timerId.current);
			parentTi.current && clearTimeout(parentTi.current);
		}
	}, [status]);

	useEffect(() => {
		let parentTi, ti;
		if (!isSingleMessage && fadeClassName === "fade-out") {
			parentTi = setTimeout(() => {
				setFadeClassName("fade-in");
				ti = setTimeout(() => {
					setFadeClassName("");
					clearTimeout(ti);
					clearTimeout(parentTi);
				}, 350);
			}, 350);
		}
		return () => {
			parentTi && clearTimeout(parentTi);
			ti && clearTimeout(ti);
		};
	}, [fadeClassName, messageIndex]);

	useEffect(() => {
		if (!isSingleMessage) {
			changeMessage();
		}
	}, [messageIndex]);

	function changeMessage() {
		const timeout = changeTextEverySecond * SECOND;
		parentTi.current = setTimeout(() => {
			const nextMessageIndex = (messageIndex + 1) % messages.length;
			const nextMessage = messages[nextMessageIndex];
			if (typeof nextMessage === "string") {
				setFadeClassName("fade-out");
				timerId.current = setTimeout(() => {
					setMessageIndex((prev) => prev + 1);
				}, 350);
			}
		}, timeout);
	}

	if (typeof trackerMessagesObject !== "object") return null;

	return (
		<div
			draggable={false}
			className={clsx(
				styles["message-text"],
				isHigherMessages ? styles["higher"] : "",
				fadeClassName.length > 0 ? styles[fadeClassName] : "",
			)}>
			{currentMessage}
		</div>
	);
}

export default React.memo(TrackerMessage);
