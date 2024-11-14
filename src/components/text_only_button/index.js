import clsx from 'clsx';
import React from 'react';
import styles from './index.module.scss';

export default function TextOnlyButton(props) {
    const {className = '', text = '', onClick = null, ariaDescribedBy = ''} = props;
    const hasText = typeof text === "string" && text.length > 0;
    const handleOnClick = () => {
        return typeof onClick === 'function' && onClick();
    }

    return (
        <button
            aria-describedby={ariaDescribedBy}
            className={clsx(styles['text-only-btn'], className)}
            onClick={handleOnClick}
        >
            {hasText && text}
        </button>
    )
}
