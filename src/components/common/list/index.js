import React, {Component} from 'react';

class List extends Component {

    render() {

        //Props
        //className  : string - a css class name for the list wrapping container
        //itemsArray : array of list items to render
        //groupSize  : integer - amount of items per row
        //ListItem   : react component for a single list item
        const { className, itemsArray, groupSize, ListItem } = this.props;

        //Map the items array into a new array of item components
        var items = itemsArray.map(function (item, index) {
            return <ListItem item = {item} key = {index} />
        });

        //Reduce the items array to an array of arrays according to group size
        var itemRows = items.reduce(function (rowsArray, element, index) {
            index % groupSize === 0 && rowsArray.push([]);
            rowsArray[rowsArray.length -1].push(element);
            return rowsArray;
        }, []);

        //Wrap row items with a row div
        let listContent = itemRows.map(function (rowContent, index) {
            return <div className="list-row clearfix" key = {index}>{rowContent}</div>
        });

        return (
            <div className = { className }>
                {listContent}
            </div>
        );
    }
}

export default List;