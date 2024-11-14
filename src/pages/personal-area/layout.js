import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import React from "react";
import PersonalArea from "../../containers/PersonalArea/PersonalArea";

function Layout({ children }) {
  return (
    <>
      <BackgroundImage />

      <PersonalArea>{children}</PersonalArea>
    </>
  );
}

export default Layout;
