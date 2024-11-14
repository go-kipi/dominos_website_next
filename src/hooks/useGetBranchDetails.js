import React, { useMemo } from "react";

import { useSelector } from "react-redux";

import Api from "api/requests";

export default function useGetBranchDetails(id) {
  const branches = useSelector((store) => store.branchesDetails);
  const sendGetMenuRequest = () => {
    const payload = { id };
    Api.getStoreDetails({
      payload,
    });
    return {};
  };

  return useMemo(() => {
    const branchDetails = branches ? branches[id] : undefined;

    if (typeof branchDetails === "object") {
      return branchDetails;
    } else if (branchDetails === undefined && id) {
      return sendGetMenuRequest();
    } else {
      return {};
    }
  }, [id, branches]);
}
