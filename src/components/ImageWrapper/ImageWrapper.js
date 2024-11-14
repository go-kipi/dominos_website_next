import React from "react";

function ImageWrapper({ className = "", alt = "", src, failSrc }) {
  const [loadedSrc, setLoadedSrc] = useState(src);

  function onError() {
    setLoadedSrc(failSrc);
  }

  return (
    <img src={loadedSrc} className={className} alt={alt} onError={onError} />
  );
}

export default ImageWrapper;
