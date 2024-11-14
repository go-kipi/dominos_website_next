import { useSelector } from "react-redux";

function useTranslate() {
  const translations = useSelector((store) => store.translations);

  return (text) => {
    return translations[text] || text;
  };
}
export default useTranslate;
