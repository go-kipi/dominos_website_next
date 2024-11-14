import React from "react";

import styles from "./BirthdayEventsCalendar.module.scss";

import DatePicker from "react-datepicker";
import useTranslate from "hooks/useTranslate";

import Arrow from "/public/assets/icons/blue-arrow-grey-background.svg";

import clsx from "clsx";
import LanguageDirectionService from "services/LanguageDirectionService";

import he from "date-fns/locale/he";
import enUS from "date-fns/locale/en-US";
import { useSelector } from "react-redux";
import { LANGUAGES } from "constants/Languages";

function BirthdayEventsCalendar(props) {
  const { goToForm, onChange, form } = props;
  const translate = useTranslate();
  const minDate = addDays(new Date(), 3);
  const lang = useSelector((store) => store.generalData.lang);
  const isRTL = LanguageDirectionService.isRTL();

  function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
  }

  function calendarHeader({ date, decreaseMonth, increaseMonth }) {
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    return (
      <div className={styles["calendar-header-wrapper"]}>
        <span className={styles["month-year"]} tabIndex={0}>
          {translate(`monthNames_${month}`)} {year}
        </span>
        <div className={styles["arrows"]}>
          <button
            className={clsx(
              styles["arrow"],
              !isRTL ? styles["flipped-icon"] : ""
            )}
            onClick={decreaseMonth}
          >
            <img src={Arrow.src} alt={translate("birthDay_arrrow_alt")} />
          </button>
          <button
            className={clsx(
              styles["arrow"],
              isRTL ? styles["flipped-icon"] : ""
            )}
            onClick={increaseMonth}
          >
            <img src={Arrow.src} alt={translate("birthDay_arrrow_alt")} />
          </button>
        </div>
      </div>
    );
  }

  const locale =
    lang === LANGUAGES.HEBREW.name
      ? he
      : lang === LANGUAGES.ENGLISH.name
      ? enUS
      : he;

  return (
    <div className={styles["birthday-events-calenndar-wrapper"]}>
      <div className={styles["header"]}>
        <span className={styles["title"]} tabIndex={0}>
          {translate("birthDayEvents_calendar_title")}
        </span>
      </div>
      <DatePicker
        inline
        renderCustomHeader={calendarHeader}
        minDate={minDate}
        selected={form.date.value}
        locale={locale}
        onChange={(date) => {
          onChange("date", date);
          setTimeout(() => {
            goToForm();
          }, 400);
        }}
      />
    </div>
  );
}

export default BirthdayEventsCalendar;
