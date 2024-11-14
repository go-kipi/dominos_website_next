import React from 'react';
import {withRouter, NavLink} from 'react-router-dom';

import styles from './index.module.scss';

const BreadCrumbs = (props) =>{

    const {root = '', className = '', crumbs = []} = props;

    const printBreadCrumbs = () =>{
        const path = props.match.path.split('/').slice(1);

        let res = [];

        if (crumbs.length > 0){
            res.push(<a key={root.text} href={root.route}>{root.text}</a>);

            crumbs.forEach((item, index) =>{
                res.push(<a key={index} href={item.route}>{item.text}</a>);
            });
        }
        else if (path.length > 0){
            res.push(<NavLink key={root.text} to={root.route}>{root.text}</NavLink>);

            path.forEach((item, index) =>{
               res.push(
                   <a key={index}>{item}</a>
               );
            });
        }

        return res;
    };

    return(
        <div className={'bread-crumbs ' + className}>
            {printBreadCrumbs()}
        </div>
    )
};

export default withRouter(BreadCrumbs);