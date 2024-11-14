import useTranslate from "hooks/useTranslate";
import CloseIcon from "/public/assets/icons/x-icon-white.svg";

import styles from "./MenuDisclaimer.module.scss";
import {useEffect, useState} from "react";
import clsx from "clsx";
import SRContent from "../../../../components/accessibility/srcontent";
import {useSelector} from "react-redux";

function MenuDisclaimer({onHide}) {
	const translate = useTranslate();
	const popupArr = useSelector(store => store.popupsArray)

	const d = new Date();
	d.setMonth(d.getMonth() + 1);
	d.setDate(0);

	const text = translate("menuDisclaimer_text").replace(
		"{date}",
		`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
	);
	const [show, setShow] = useState(true);

	useEffect(() => {
		if (!show) {
			typeof onHide === 'function' && onHide();
		}
	}, [show]);

	function onCloseClick() {
		setShow(false);
	}

	return (
		<div className={clsx(styles['disclaimer-container'], !show ? styles['hide'] : '')} aria-hidden={popupArr.length > 0}>
			<SRContent message={text} role={'alert'} ariaLive={'off'} />
			<div className={clsx(styles["wrapper"])} aria-hidden={true}>
				<div className={styles["filler"]} />
				<div className={styles["content"]}>
					<span>{text}</span>
				</div>
				<div
					role={'button'}
					aria-hidden={true}
					aria-label={translate('accessibility_aria_close')}
					className={clsx(styles["close-icon"])}
					onClick={onCloseClick}>
					<img src={CloseIcon.src}/>
				</div>
			</div>
		</div>
	);
}
export default MenuDisclaimer;
