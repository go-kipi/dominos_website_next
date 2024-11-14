import React from "react";
import Link from "next/link";

import styles from "./index.module.scss";

export default function DesktopMenu(props) {
  const getNavLinks = () => {
    const links = props.data.map((item, index) => {
      if (item.route !== "/") {
      }
      const exact = { exact: item.route === "/" };
      return (
        <Link
          href={item.route}
          activeClassName={styles["active"]}
          className={styles["desktop-menu-item"]}
          key={index}
          {...exact}
        >
          <h4 className={styles["menu-item"]}>{item.text}</h4>
        </Link>
      );
    });
    return links;
  };

  return <nav className={styles["desktop-menu"]}>{getNavLinks()}</nav>;
}
