import React, { Component } from "react";
import styles from "./index.module.scss"

// function Collapse(props) {
//
//     const {
//         title = '',
//         childrens = [],
//     } = props;
//
//     return(
//         <div className={'collapse-wrapper'}>
//
//             <div className={'collapse-title-wrapper'}>
//                 <span className={'collapse-title'}>{title}</span>
//             </div>
//
//             <div className={'collapse-data-wrapper'}>
//                 {
//                     childrens.forEach(data => {
//                         return(
//                             <span className={'collapse-data'}>{data}</span>
//                         );
//                     })
//                 }
//             </div>
//         </div>
//     );
// }
//
// export default Collapse;
class Collapse extends Component {
  constructor(props) {
    super(props);
    this.contentRef = React.createRef();
  }

  componentDidMount() {
    this.forceUpdate();
  }

  render() {
    const { open = false } = this.props;
    const style = {};
    if (open && this.contentRef.current !== null) {
      const height = this.contentRef.current.clientHeight;
      style.height = height;
    }

    return (
      <div className="collapse-wrapper" style={style}>
        <div className="collapse-content" ref={this.contentRef}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Collapse;
