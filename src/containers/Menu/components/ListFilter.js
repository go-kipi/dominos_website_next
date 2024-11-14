import React from "react";
import { useSelector } from "react-redux";

import useSetMenuPath from "hooks/useSetMenuPath";

import { META_ENUM } from "constants/menu-meta-tags";
import HeaderFilterItem from "./HeaderFilterItem/HeaderFilterItem";
import useGetMenuByMeta from "hooks/useGetMenuByMeta";

function ListFilter(props) {
  const deviceState = useSelector((store) => store.deviceState);
  const setMeta = useSetMenuPath();
  const menuPath = useSelector((store) => store.menuPath);
  const ListFilterId = menuPath[META_ENUM.LIST_FILTER];
  const filters = useGetMenuByMeta(META_ENUM.LIST_FILTER);

  if (deviceState.notDesktop) {
    return <></>;
  }

  function handleChangeSelected(id) {
    setMeta(META_ENUM.LIST_FILTER, id);
  }

  return (
    <div style={deviceState.isDesktop ? {display: 'flex' } : {}}>
      {filters?.elements.map((filter, index) => (
        <HeaderFilterItem
          key={"filter-" + filter.id}
          index={filter.id}
          handleChangeSelected={handleChangeSelected}
          isSelected={filter.id === ListFilterId}
          text={filter.label}
        />
      ))}
    </div>
  );
}

export default ListFilter;
