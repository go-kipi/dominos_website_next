import { useSelector } from "react-redux";

export default function useKosher() {
  const isKosherLS = useSelector((store) => store.generalData?.kosher);
  const user = useSelector((store) => store.userData);

  const isLoggedIn = user.type !== "new";
  const approvedTerms = user.approvedTerms === true;

  if (isLoggedIn && approvedTerms) {
    if (!user.preferences) {
      return false;
    }
    const isUserKosher = user.preferences.includes("kosher");
    return isUserKosher;
  } else {
    return !!isKosherLS;
  }
}
