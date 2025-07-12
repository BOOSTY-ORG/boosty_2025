import { useEffect } from "react";
import { scrollToTopOnFirstLoad } from "../utils/scrollToTop";

export function useScrollToTop() {
  useEffect(() => {
    scrollToTopOnFirstLoad  ();
  }, []);
}
