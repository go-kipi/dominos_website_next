import React from "react";
import clsx from "clsx";
import styles from "./index.module.scss";
import Link from "next/link";

export default function BreadCrumbs(props) {
  const { id, root, crumbs, className } = props;

  const crumbsLength = crumbs.names.length > 0;

  return (
    <div
      id={id}
      className={clsx(styles["breadcrumbs-container"], className)}
      role={"listbox"}
    >
      <div className={"crumb-container root"}>
        <Link href={root.route}>
          <span
            className={styles["crumb"]}
            aria-label={`bread crumbs ${root.name}`}
          >
            {root.name}
          </span>
        </Link>
        {crumbsLength && <span className={styles["crumb"]}>{">"}</span>}
      </div>
      {crumbs.names.map((crumb, index) => {
        const isLast = index === crumbs.names.length - 1;
        return (
          <div key={index} className={styles["crumb-container"]}>
            <Link href={crumbs?.routes?.[index]}>
              <span
                className={styles["crumb"]}
                aria-label={`bread crumbs ${crumb}`}
              >
                {crumb}
              </span>
            </Link>
            {!isLast && <span className={styles["crumb"]}>{">"}</span>}
          </div>
        );
      })}
    </div>
  );
}
