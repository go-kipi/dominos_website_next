import React, { useState } from "react";
import HeaderTitle from "../HeaderTitle/HeaderTitle";

import FullCheckbox from "/public/assets/icons/full-radio.svg";
import EmptyCheckbox from "/public/assets/icons/empty-radio.svg";

import styles from "./PersonalAreaLang.module.scss";
import { useSelector } from "react-redux";
import Checkbox from "components/forms/checkbox";
import Button from "components/button";
import LanguageDirectionService from "services/LanguageDirectionService";
import { LANGUAGES } from "constants/Languages";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import PERSONAL_AREA_SCREEN_TYPES from "constants/personal-area-screen-types";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "../../../components/accessibility/keyboardsEvents";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { useRouter } from "next/router";

function PersonalAreaLang(props) {
	const lang = useSelector((store) => store.generalData.lang);
	const router = useRouter();
	const [selectedLanguage, setSelectedLanguage] = useState(lang);
	const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.PERSONAL_AREA);
	const [focusElement, setFocusElement] = useState(false);
	const translate = useTranslate();

	function onChangeHandler(e) {
		const { id } = e.target;
		setSelectedLanguage(id);
	}

	const text = selectedLanguage
		? selectedLanguage === LANGUAGES.HEBREW.name
			? translate("onboarding_language_btn_text_he")
			: selectedLanguage === LANGUAGES.ENGLISH.name
			? translate("onboarding_language_btn_text_en")
			: ""
		: "";

	function onClickHandler() {
		const locale = selectedLanguage
			? selectedLanguage === LANGUAGES.HEBREW.name
				? LANGUAGES.HEBREW.nextName
				: selectedLanguage === LANGUAGES.ENGLISH.name
				? LANGUAGES.ENGLISH.nextName
				: ""
			: "";

		// LanguageDirectionService.changeLanguage(selectedLanguage);
		// setStack({
		// 	type: PERSONAL_AREA_SCREEN_TYPES.MAIN,
		// 	params: {},
		// });
		AnalyticsService.personalAreaChooseLanguage(selectedLanguage);

		let href = window.location.origin;

		if (locale !== router.defaultLocale) {
			href += "/" + locale;
		}

		href += router.asPath;

		window.location.href = href;

		// router.push(router.asPath, router.asPath, { locale: locale });
	}

	const onKeyDown = () => {
		if (!focusElement) {
			return;
		}
		onChangeHandler(focusElement);
	};
	const onFocus = (event) => {
		setFocusElement(event);
	};

	const onBlur = () => {
		setFocusElement(false);
	};

	return (
		<div className={styles["personal-area-lang"]}>
			<GeneralHeader
				title={translate("personalArea_lang_title")}
				back
				backOnClick={goBack}
				gradient
			/>

			<div className={styles["personal-area-lang-wrapper"]}>
				<div
					className={styles["choose-language"]}
					onKeyDown={(event) => handleKeyPress(event, onKeyDown)}>
					<Checkbox
						className={styles["lang-radio"]}
						id={LANGUAGES.HEBREW.name}
						name={"lang"}
						label={translate("personalArea_lang_he_text")}
						value={selectedLanguage === LANGUAGES.HEBREW.name}
						emptyImage={EmptyCheckbox}
						checkedImage={FullCheckbox}
						overrideVariant
						onChange={onChangeHandler}
						extraStyles={styles}
						onFocus={onFocus}
						onBlur={onBlur}
					/>
					<div className={styles["separator"]} />
					<Checkbox
						className={styles["lang-radio"]}
						id={LANGUAGES.ENGLISH.name}
						name={"lang"}
						label={translate("personalArea_lang_en_text")}
						value={selectedLanguage === LANGUAGES.ENGLISH.name}
						emptyImage={EmptyCheckbox}
						checkedImage={FullCheckbox}
						overrideVariant
						onChange={onChangeHandler}
						extraStyles={styles}
						onFocus={onFocus}
						onBlur={onBlur}
					/>
					<div className={styles["separator"]} />
				</div>
				<div className={styles["actions"]}>
					{selectedLanguage !== lang && (
						<Button
							text={text}
							onClick={onClickHandler}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

export default PersonalAreaLang;
