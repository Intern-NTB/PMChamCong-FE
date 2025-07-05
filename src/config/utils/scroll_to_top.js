import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const scrollToTop = () => {
      const layoutContent = document.querySelector(".ant-layout-content");
      if (layoutContent) {
        layoutContent.scrollTop = 0;
      }
    };
    scrollToTop();
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
