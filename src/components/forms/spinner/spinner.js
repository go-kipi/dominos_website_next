import React, {Component} from 'react';

const Spinner  = ({className, label, amount, onClick }) =>
            <div className = {className}>
                <div className="label">{ label }</div>
                <div className="plus_btn btn_effects noselect" onClick={() => onClick('plus')}>
                    <span>+</span>
                </div>
                <div className="amount">{ amount }</div>
                <div className="minus_btn btn_effects noselect" onClick={() => onClick('minus')}>
                    <span>-</span>
                </div>
            </div>;

export default Spinner;