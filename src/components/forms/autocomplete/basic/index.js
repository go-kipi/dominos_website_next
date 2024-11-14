import React         from 'react';
import { Component } from 'react';
import { generateUniqueId } from 'app/functions';

import styles from './index.module.scss';

class AutoComplete extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open : false,
            highlighted_item : -1,
        }
    }

    handleClick = (e) => {

        //prevent form submission
        e.preventDefault();

        //fix for enter keyup event triggering click events - 0 = Enter key, 1 = click event
        if (!(e.detail === 0)) {
            let newState = !this.state.open;
            this.setState({open: newState});
        }
    }

    handleClickOutside = () =>{
        this.setState({open: false});
    }

    handleKeyUp = (event) => {
        let highlighted_item   = this.state.highlighted_item;
        let highlighted_option = document.getElementsByClassName("highlight");
        let selected_option_id = -1;

        if(highlighted_option.length > 0) {
            selected_option_id = highlighted_option[0].getAttribute('id');
        }

        switch(event.key) {
            case('ArrowDown'): (highlighted_item + 1) > this.props.options.length -1 ?
                highlighted_item = 0
                :  highlighted_item++;
                this.setState({highlighted_item: highlighted_item});
                break;

            case('ArrowUp'):   (highlighted_item - 1) < 0 ?
                highlighted_item = this.props.options.length -1
                :  highlighted_item--;
                this.setState({highlighted_item: highlighted_item});
                break;

            case('Enter'):     if(this.state.open === false) {
                this.setState({open: true})
            } else {
                let selected_item = this.props.options.find(option => option.id === parseInt(selected_option_id));
                this.props.onSelect(selected_item.id, selected_item.text);
                this.setState({open: false})
            }
                break;

            case('Escape'):    this.setState({highlighted_item: 0, open: false});
                break;
            default:           break;

        }
    }
    
    handleOptionClick = (e, id)  => {
        e.preventDefault();
        this.setState({open: false});
        this.props.onSelect(this.props.name, id);
    }
    
    getList = (options) => {
        let list    = [];

        for(let item in options) {
            let activeOption      = options[item].id === this.props.selected_id ? 'active' : '';
            let highlightedOption = options[item].id === this.state.highlighted_item ? ' highlight' : '';

            list.push(<li className   = { "auto_option " + activeOption + highlightedOption }
                          key         = { options[item].id }
                          id          = { options[item].id }
                          onMouseDown = { (e) => this.handleOptionClick(e, options[item].id) }>
                          { options[item].text }
            </li>);
        }
        return list;
    }
    
    filterOptions = (options) => {
        let filteredOptions = options.filter(option => option.text.indexOf(this.props.query) !== -1);

        return filteredOptions;
    }

    render() {
        const {
            options,
            selected_id = -1,
            name        = 'missing-name-prop',
            label       = '',
            placeholder = '',
            query       = '',
            id          = generateUniqueId(16),
            disabled    = false,
            className,
            tabIndex,
            onChange,
        } = this.props;

        let activeClass = (this.state.open && options.length > 0) ? 'active' : '';

        //filter and sort autocomplete options by query
        let filteredOptions = query === '' ? options :  this.filterOptions(options);

        return (
            <>
                { label !== '' &&
                    <label htmlFor = { id }> { label } </label>
                }
                <div className = {'auto_wrapper ' + className + ' ' + activeClass + (disabled ? ' disable' : '')  }
                     tabIndex  = { tabIndex }
                     onBlur    = { this.handleClickOutside }
                     onKeyUp   = { this.handleKeyUp }>

                    <input className    = "auto-input"
                           name         = { name }
                           type         = "text"
                           autoComplete = "off"
                           placeholder  = { placeholder }
                           onClick      = { (e) => this.handleClick(e) }
                           onChange     = { (e) => onChange(e) }
                           value        = { query }
                    />

                    <ul className = 'auto-menu'>
                        { this.getList(filteredOptions) }
                    </ul>
                </div>
            </>
        )
    }
}
export default AutoComplete;
