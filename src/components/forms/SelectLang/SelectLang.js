import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DropDown from "/public/assets/icons/drop-down.svg";

import basic from "./SelectLang.module.scss";
import useTranslate from "hooks/useTranslate";
import { useRouter } from "next/router";
import { LANGUAGES } from "constants/Languages";
import { useDispatch, useSelector } from "react-redux";
import Api from "api/requests";
import { Store } from "redux/store";
import Actions from "redux/actions";

const NO_HIGHLIGHT = -1;

function SelectLang(props) {
	const {
		onChange,
		name,
		className = "",
		dropDownImg = DropDown,
		extraStyles = {},
		additionalImg = "",
		customActiveClass = "",
		tabIndex = 0,
		onHomepageClick,
	} = props;
	const mainContainer = useRef();
	const translate = useTranslate();
	const lang = useSelector((store) => store.generalData.lang);
	const generalData = useSelector((store) => store.generalData);
	const label = translate(lang);
	const router = useRouter();
	const dispatch = useDispatch();

	const options = [
		{
			id: LANGUAGES.HEBREW.name,
			text: translate("he"),
			locale: LANGUAGES.HEBREW.nextName,
		},
		{
			id: LANGUAGES.ENGLISH.name,
			text: translate("en"),
			locale: LANGUAGES.ENGLISH.nextName,
		},
	];

	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedItem, setHighlightedItem] = useState(NO_HIGHLIGHT);
	const [selectedItem, setSelectedItem] = useState({ id: -1, text: label });
	const dropRef = useRef();

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keyup", onDocumentKeyDown);
		}
		return () => {
			document.removeEventListener("keyup", onDocumentKeyDown);
		};
	}, [isOpen]);

	const onDocumentKeyDown = useCallback(() => {
		if (!mainContainer.current?.contains(document.activeElement)) {
			setIsOpen(false);
		}
	}, []);

	const handleClick = (event) => {
		// hanles when user clicks the button
		event.stopPropagation();
		const newState = !isOpen;
		setIsOpen(newState);
		typeof onHomepageClick === "function" && onHomepageClick();
	};

	const focusHighlight = (highlight) => {
		if (highlight !== NO_HIGHLIGHT) {
			dropRef.current.children[highlight].focus();
		}
	};
	const handleKeyDown = (event) => {
		let highlightedItemCounter = highlightedItem;
		let selectedItemCounter = selectedItem;
		switch (event.key) {
			case "ArrowDown":
				if (isOpen) {
					event.preventDefault();
					highlightedItemCounter + 1 > options.length - 1
						? (highlightedItemCounter = 0)
						: highlightedItemCounter++;

					focusHighlight(highlightedItemCounter);
					setHighlightedItem(highlightedItemCounter);

					setIsOpen(true); // When its lose focus i need to bring focus back
				}
				break;

			case "ArrowUp":
				if (isOpen) {
					event.preventDefault();
					highlightedItemCounter - 1 < 0
						? (highlightedItemCounter = options.length - 1)
						: highlightedItemCounter--;

					focusHighlight(highlightedItemCounter);
					setHighlightedItem(highlightedItemCounter);
					setIsOpen(true); // When its lose focus i need to bring focus back
				}
				break;

			case "Enter":
				selectedItemCounter = options[highlightedItemCounter];
				if (selectedItemCounter && highlightedItemCounter !== NO_HIGHLIGHT) {
					typeof onChange === "function" &&
						onChange(name, selectedItemCounter.id, selectedItemCounter.text);
					setSelectedItem(selectedItemCounter);
					setHighlightedItem(NO_HIGHLIGHT);
				}
				setIsOpen(false);
				break;

			case "Escape":
				setIsOpen(false);
				setHighlightedItem(NO_HIGHLIGHT);
				break;
			default:
				if (!mainContainer.current?.contains(document.activeElement)) {
					setIsOpen(false);
					setHighlightedItem(NO_HIGHLIGHT);
				}
				break;
		}
	};

	function onChildFocus() {
		setIsOpen(true);
	}

	function onChildBlur() {
		setIsOpen(false);
	}

	const updateAppLang = (lang) => {
		const onSuccessCustomerDetails = (res) => {
			dispatch(Actions.setUser(res.data));
		};

		const onSuccessSetLang = () => {
			Api.getCustomerDetails({
				payload: { gpsstatus: generalData?.gpsstatus ?? GPS_STATUS.OFF },
				onSuccessCB: onSuccessCustomerDetails,
			});
		};

		Api.setLang({
			payload: { lang },
			onSuccess: onSuccessSetLang,
		});
	};

	const activeClass = isOpen ? styles("active") : "";
	return (
		<div
			ref={mainContainer}
			onKeyDown={handleKeyDown}
			className={clsx(
				styles("select-wrapper"),
				isOpen ? customActiveClass : "",
				activeClass,
				className,
			)}>
			<button
				className={clsx(styles("select_button"))}
				onClick={handleClick}
				aria-label={translate("accessibility_chooseLanguage")}
				aria-haspopup={"true"}
				aria-expanded={isOpen}
				type="button"
				tabIndex={tabIndex}>
				{additionalImg && (
					<img
						src={additionalImg.src}
						alt={""}
						aria-hidden={true}
					/>
				)}
				{label}
				<img
					src={dropDownImg.src}
					className={styles("dropdown-img")}
					alt={translate("accessibility_imageAlt_dropDown")}
				/>
			</button>
			<ul
				ref={dropRef}
				className={styles("dropdown_menu")}
				role={"list"}>
				{options.map((item, index) => {
					let activeOption = "";
					let hightlightedOption = "";

					if (item.id === selectedItem.id) {
						activeOption = styles("active");
					}

					if (index === highlightedItem) {
						hightlightedOption = styles("highlight");
					}

					let href = "";

					if (item.locale !== router.defaultLocale) {
						href += "/" + item.locale;
					}

					href += router.asPath;

					return (
						<li
							hidden={!isOpen}
							role={"listitem"}
							key={index}
							aria-hidden={!isOpen}
							aria-label={item.text}>
							<span
								className={clsx(
									styles("select-option"),
									activeOption,
									hightlightedOption,
								)}
								onClick={(e) => {
									e.preventDefault();
									if (
										// hebrew
										item.locale === router.defaultLocale &&
										router.locale !== router.defaultLocale
									) {
										router.replace(href, undefined, {
											shallow: false,
											locale: router.defaultLocale,
										});
									} else if (item.locale !== router.locale) {
										// english

										router.push(href, undefined, {
											shallow: false,
											locale: item.locale,
										});
									}
									updateAppLang(item.id);
									setIsOpen(false);
								}}>
								{item.text}
							</span>
						</li>
					);

					// leave it for now, see it they want a reload or the old way

					// return (
					// 	<Link
					// 		href={router.asPath}
					// 		className={clsx(
					// 			styles("select-option"),
					// 			activeOption,
					// 			hightlightedOption,
					// 		)}
					// 		key={index}
					// 		role={"listitem"}
					// 		aria-label={item.text}
					// 		locale={item.locale}
					// 		tabIndex={isOpen ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
					// 		onClick={() => {
					// 			setIsOpen(false);
					// 			LanguageDirectionService.changeLanguage(item.id);
					// 		}}>
					// 		{item.text}
					// 	</Link>
					// );
				})}
			</ul>
		</div>
	);
}

export default SelectLang;
