import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";
import { useEffect } from "react";
import svgPaths from "../../imports/svg-pwclppfmas";

const APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"><rect width="40" height="40" rx="8" fill="#CEF62E"/><path d="${svgPaths.p1dc30500}" fill="#0A080B"/></svg>`;

function useAppMeta() {
  useEffect(() => {
    // Favicon
    const svgBlob = new Blob([APP_ICON_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.type = "image/svg+xml";
    favicon.href = url;

    // Apple touch icon (data URI for compatibility)
    const svgDataUri = `data:image/svg+xml,${encodeURIComponent(APP_ICON_SVG)}`;
    let appleTouchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement("link");
      appleTouchIcon.rel = "apple-touch-icon";
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = svgDataUri;

    // Meta theme color
    let themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement("meta");
      themeColor.name = "theme-color";
      document.head.appendChild(themeColor);
    }
    themeColor.content = "#0D0A0F";

    // App title
    document.title = "FinFlow";

    // PWA meta tags
    let appleMobileWebAppCapable = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMobileWebAppCapable) {
      appleMobileWebAppCapable = document.createElement("meta");
      appleMobileWebAppCapable.name = "apple-mobile-web-app-capable";
      appleMobileWebAppCapable.content = "yes";
      document.head.appendChild(appleMobileWebAppCapable);
    }

    let appleMobileWebAppStatusBar = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMobileWebAppStatusBar) {
      appleMobileWebAppStatusBar = document.createElement("meta");
      appleMobileWebAppStatusBar.name = "apple-mobile-web-app-status-bar-style";
      appleMobileWebAppStatusBar.content = "black-translucent";
      document.head.appendChild(appleMobileWebAppStatusBar);
    }

    return () => URL.revokeObjectURL(url);
  }, []);
}

export function Layout() {
  useAppMeta();

  return (
    <div className="min-h-dvh bg-[#0D0A0F] flex justify-center">
      <div className="w-full max-w-[430px] relative overflow-y-auto overflow-x-hidden">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}