import React, { useRef } from 'react';

import SlidePopup from 'popups/Presets/SlidePopup';

import BranchAboutToCloseIcon from '/public/assets/icons/branch-about-to-close.svg';

import styles from './index.module.scss';
import Button from 'components/button';
import useTranslate from 'hooks/useTranslate';

function BranchAboutToClosePopup(props) {
  const ref = useRef();
  const translate = useTranslate();

  const handleClose = () => {
    ref.current.animateOut();
  };

  return (
    <SlidePopup showCloseIcon id={props.id} className={styles["branch-about-to-close"]} ref={ref}>
      <div className={styles["branch-about-to-close-wrapper"]}>
        <div className={styles["branch-about-to-close-img"]}>
          <img src={BranchAboutToCloseIcon.src} alt="branch-about-to-close-icon" />
        </div>
        <h1 className={styles["branch-about-to-close-title"]} tabIndex={0}>{translate('branchAboutToCloseModal_title')}</h1>
        <h2 className={styles["branch-about-to-close-subtitle"]} tabIndex={0}>{translate('branchAboutToCloseModal_subtitle')}</h2>
        <div className={styles['hurry-up-wrapper']}>
          <h3 className={styles['hurry-up-text']} tabIndex={0}>{translate('branchAboutToCloseModal_hurryUpMsg_1')}</h3>
          <h3 className={styles['delivery-ETA-Text']} tabIndex={0}>
            {translate('branchAboutToCloseModal_hurryUpMsg_2')}
          </h3>
        </div>
        <h3 className={styles['hurry-up-text']} tabIndex={0}>{translate('branchAboutToCloseModal_hurryUpMsg_3')}</h3>
        <Button
          className={styles['confirm-btn']}
          textClassName={styles['confirm-btn-text']}
          text={translate('branchAboutToCloseModal_confirmBtn_label')}
          onClick={handleClose}
        />
      </div>
    </SlidePopup>
  );
}

export default BranchAboutToClosePopup;
