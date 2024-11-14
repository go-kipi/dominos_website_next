import React from 'react';

import * as types from '../../../constants/share-types';

const ShareButton = (props) =>{

    const {type, link = '', title = '', content = null, className = ''} = props;

    let buttonToRender = null;

    function createButton() {
        switch (type) {

            case (types.FACEBOOK):
                buttonToRender = <a className={'share-logo ' + className}
                                    href={"http://www.facebook.com/sharer/sharer.php?u=" + link + "&t=" + title}
                                    rel="noopener noreferrer"
                                    target="_blank">
                    {content}</a>;
                break;
            case (types.EMAIL):
                buttonToRender = <a className={'share-logo ' + className}
                                    href={"mailto:?subject=" + title + "&amp;body=Check out this site " + link + "."}
                                    rel="noopener noreferrer"
                                    title="Share by Email">
                    {content}</a>;
                break;
            case (types.WHATSAPP):
                buttonToRender = <a className={'share-logo ' + className}
                                    href={'https://wa.me/?text=' + link}
                                    data-action="share/whatsapp/share"
                                    rel="noopener noreferrer"
                                    target="_blank">
                    {content}
                </a>;
                break;
            default:
                break;
        }
    }

    createButton();

    return (
        buttonToRender
    )
};

export default ShareButton;