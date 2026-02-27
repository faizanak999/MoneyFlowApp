import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";
import { useEffect } from "react";

function useAppMeta() {
  useEffect(() => {
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
