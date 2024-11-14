import React from 'react';
import styles from './index.module.scss';

import InfoIcon from '/public/assets/icons/info-blue.svg';

const InfoToolTip = (props) => {
    const {
        indicator = InfoIcon,
        text
    } = props;



    return (
    <div className={styles["info-tool-tip-wrapper"]}>
        <div className={styles['tool-tip-indicator-wrapper']}>
            <img src={indicator.src} alt={'More Info'} className={styles['tool-tip-image']}/>
        </div>
        <div className={styles['info-tool-tip-description']}>{text}</div>
    </div>);
};

export default InfoToolTip;