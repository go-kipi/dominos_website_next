"use client";

import React, {useEffect, useRef, useState} from "react";

import styles from "./BirthdayEventsForm.module.scss";
import AnimatedInput from "components/forms/animated_input";
import useTranslate from "hooks/useTranslate";
import {useSelector} from "react-redux";
import clsx from "clsx";

import CalendarIcon from "/public/assets/icons/calendar.svg";
import Button from "components/button";
import AutoCompleteList
    from "popups/components/Delivery/delivery/ChooseAddressFromMap/AutoCompleteList/AutoCompleteList";
import {useOutsideClick} from "hooks/useOutsideClick";
import LanguageDirectionService from "services/LanguageDirectionService";
import TermsCheckbox from "components/TermsCheckbox/TermsCheckbox";

function BirthdayEventsForm(props) {
    const isRTL = LanguageDirectionService.isRTL();
    const {
        form,
        onChangeInput,
        firstTry,
        goToCalendar,
        onSubmit,
        isFormValid,
        errorMsg,
        cities,
        setSelecetedCity,
        onChange,
    } = props;
    const translate = useTranslate();
    const deviceState = useSelector((store) => store.deviceState);
    const [showList, setShowList] = useState(false);
    const [filteredCities, setFilteredCities] = useState();
    const wrapperRef = useRef(null);
    useOutsideClick(wrapperRef, onBlurCityInput);

    useEffect(() => {
        setFilteredCities(cities);
    }, [cities]);

    function showError(field) {
        return !firstTry && !form[field].valid;
    }

    function showErrorBtnHandler() {
        return !firstTry && !isFormValid;
    }

    function formatDate(date) {
        if (!date) {
            return date;
        }
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);

        return day + "/" + month + "/" + year;
    }

    function numricInputChange(e) {
        const {value} = e.target;

        const numericRegex = /^\d+$/;
        if (numericRegex.test(value) || value === "") {
            onChangeInput(e);
        }
    }

    function filterCities(value) {
        const newCities = [];
        for (const key in cities) {
            const city = cities[key];

            if (city.item.toLowerCase().includes(value.toLowerCase())) {
                newCities.push(city);
            }
        }
        setFilteredCities(newCities);
    }

    function onCityInputChange(e) {
        onChangeInput(e);
        filterCities(e.target.value);
        setShowList(true);
        setSelecetedCity(-1);
    }

    function onClickAutoCompleteItem(city) {
        setSelecetedCity(city.index);
        onChange("city", city.item);
        setShowList(false);
    }

    function onBlurCityInput() {
        setShowList(false);
    }

    function getCityInput() {
        return (
            <div className={styles["city-input-auto-complete"]} ref={wrapperRef}>
                <AnimatedInput
                    ref={form.city.ref}
                    name={"city"}
                    value={form.city.value}
                    onChange={onCityInputChange}
                    showCloseIcon
                    showError={showError("city")}
                    errorMsg={form.city.errorMsg}
                    placeholder={translate("birthDayEvents_form_city_placeholder")}
                    className={styles["input-wrapper"]}
                />
                <AutoCompleteList
                    onSelectItem={onClickAutoCompleteItem}
                    data={filteredCities}
                    showList={showList}
                    searchQuery={form.city.value}
                    keyToFind={"item"}
                    extraStyles={styles}
                />
            </div>
        );
    }

    function getNumberOfParticipantsAndDateInputs() {
        return (
            <div className={styles["row-wrapper"]}>
                <AnimatedInput
                    ref={form.numberOfParticipants.ref}
                    name={"numberOfParticipants"}
                    value={form.numberOfParticipants.value}
                    onChange={numricInputChange}
                    showCloseIcon
                    type="number"
                    showError={showError("numberOfParticipants")}
                    errorMsg={form.numberOfParticipants.errorMsg}
                    placeholder={translate(
                        "birthDayEvents_form_numberOfParticipants_placeholder"
                    )}
                    className={clsx(styles["input-wrapper"], styles["short-input"])}
                />
                <button
                    className={clsx(
                        styles["date-input-wrapper"],
                        !isRTL ? styles["flipped-dir"] : ""
                    )}
                    onClick={goToCalendar}
                >
                    <AnimatedInput
                        ariaHidden={true}
                        ref={form.date.ref}
                        name={"date"}
                        value={formatDate(form.date.value)}
                        onChange={goToCalendar}
                        showCloseIcon
                        showError={showError("date")}
                        errorMsg={form.date.errorMsg}
                        disabled={true}
                        placeholder={translate("birthDayEvents_form_date_placeholder")}
                        className={clsx(styles["input-wrapper"], styles["short-input"])}
                    />
                    <div className={styles["icon-wrapper"]}>
                        <img
                            src={CalendarIcon.src}
                            alt={translate("birthDay_calendar_alt")}
                        />
                    </div>
                </button>
            </div>
        );
    }

    function onChangeCheckBox(e) {
        const {id, checked} = e.target;
        onChange(id, checked);
    }

    function getCheckBox() {
        return (
            <div className={styles["checkbox-wrapper"]}>
                <TermsCheckbox
                    ref={form.terms.ref}
                    name="terms"
                    onChange={onChangeCheckBox}
                    value={form.terms.value}
                />
            </div>
        );
    }

    function getNameInput() {
        return (
            <AnimatedInput
                ref={form.name.ref}
                name={"name"}
                value={form.name.value}
                onChange={onChangeInput}
                showCloseIcon
                showError={showError("name")}
                errorMsg={form.name.errorMsg}
                placeholder={translate("birthDayEvents_form_name_placeholder")}
                className={styles["input-wrapper"]}
            />
        );
    }

    function getPhoneInput() {
        return (
            <AnimatedInput
                ref={form.phone.ref}
                name={"phone"}
                value={form.phone.value}
                onChange={onChangeInput}
                type="tel"
                showCloseIcon
                showError={showError("phone")}
                errorMsg={form.phone.errorMsg}
                placeholder={translate("birthDayEvents_form_phone_placeholder")}
                className={styles["input-wrapper"]}
            />
        );
    }

    function getEmailInput() {
        return (
            <AnimatedInput
                ref={form.email.ref}
                name={"email"}
                value={form.email.value}
                onChange={onChangeInput}
                showCloseIcon
                showError={showError("email")}
                errorMsg={form.email.errorMsg}
                placeholder={translate("birthDayEvents_form_email_placeholder")}
                className={styles["input-wrapper"]}
            />
        );
    }

    function renderMobile() {
        return (
            <div className={styles["form-wrapper"]}>
                {getCityInput()}
                {getNumberOfParticipantsAndDateInputs()}
                {getNameInput()}
                {getPhoneInput()}
                {getEmailInput()}
                {getCheckBox()}
            </div>
        );
    }

    function renderDesktop() {
        return (
            <div className={styles["form-wrapper"]}>
                <div className={styles["row-wrapper"]}>
                    {getNameInput()}
                    {getCityInput()}
                </div>
                {getNumberOfParticipantsAndDateInputs()}
                <div className={styles["row-wrapper"]}>
                    {getPhoneInput()}
                    {getEmailInput()}
                </div>
                {getCheckBox()}
            </div>
        );
    }

    const showErrorBtn = showErrorBtnHandler();

    return (
        <div className={styles["birth-day-form-wrapper-content"]}>
            <div className={styles["content"]}>
                <div className={styles["header"]}>
                    <h1 className={styles["title"]}>
                        {translate("birthDayEvents_form_title")}
                    </h1>
                    <h2 className={styles["subtitle"]}>
                        {translate("birthDayEvents_form_subtitle")}
                    </h2>
                </div>
                {deviceState.notDesktop ? renderMobile() : renderDesktop()}
            </div>
            <Button
                text={translate("birthDayEvents_form_submit_btn")}
                onClick={onSubmit}
                isError={showErrorBtn}
                isBtnOnForm={true}
                errorText={errorMsg}
                className={styles["btn-wrapper"]}
            />
        </div>
    );
}

export default BirthdayEventsForm;
