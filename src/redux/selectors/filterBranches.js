import { createSelector } from "reselect";

const openKey = "Open";
const kosherKey = "Kosher";

export const filterBranches = createSelector(
  (state) => state?.branches,
  (state) => state?.filters,
  (state) => state?.isKosher,
  (state) => state?.branchesToInclude,
  (allbranches, filters, isKosherByDefault, branchesToInclude = []) => {
    const branches = JSON.parse(JSON.stringify(allbranches));

    if (!branches || !filters) {
      return branches;
    }

    const filterdBranches = [];

    const query = filters?.query?.toLowerCase();
    const fields = filters?.fields;

    for (const key in branches) {
      const branch = branches[key];

      if (branch.isOpen) {
        if (branch.tags) {
          branch.tags.push(openKey);
        } else {
          branch.tags = [openKey];
        }
      }

      if (!branchesToInclude.length) {
        if (
          IsTagsContains(branch.tags, fields) &&
          (branch.name.toLowerCase().includes(query.toLowerCase()) ||
            branch.storeAddress.toLowerCase().includes(query.toLowerCase())) &&
          (isKosherByDefault
            ? branch?.tags
              ? branch.tags.includes(kosherKey)
              : false
            : true)
        ) {
          filterdBranches.push(branch);
        }
      } else {
        if (branchesToInclude.includes(branch.id)) {
          filterdBranches.push(branch);
        }
      }
    }
    return filterdBranches;
  }
);

function IsTagsContains(tags, filteredTags) {
  if (!filteredTags || filteredTags.length === 0) {
    return true;
  }
  if (!tags && filteredTags && filteredTags.length > 0) {
    return false;
  }

  if (filteredTags.length > tags.length) {
    return false;
  }
  const isInArray = filteredTags.every((ele) => tags.includes(ele));
  return isInArray;
}
