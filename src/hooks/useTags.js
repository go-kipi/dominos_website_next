import { MEDIA_ENUM } from "constants/media-enum";
import { MEDIA_TYPES } from "constants/media-types";
import { getFullMediaUrl } from "utils/functions";

function useTags(tags) {
  let url = undefined;
  let label = undefined;

  if (tags) {
    for (const key in tags) {
      const tag = tags[key];

      if (tag.type === "icon") {
        url = getFullMediaUrl(
          tag,
          MEDIA_TYPES.PRODUCT_TAG,
          MEDIA_ENUM.TAG,
          "png"
        );
      }
    }
  }

  return {
    url,
    label,
  };
}

export default useTags;
