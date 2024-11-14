import React from "react";
import BranchesContainer from "./branchesContainers";

function Layout({ children, isCityPage }) {
  return (
    <>
      <BranchesContainer isCityPage={isCityPage}>{children}</BranchesContainer>
    </>
  );
}

export default Layout;
