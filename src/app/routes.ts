import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomeScreen } from "./components/HomeScreen";
import { LedgerScreen } from "./components/LedgerScreen";
import { AIAssistantScreen } from "./components/AIAssistantScreen";
import { ReportsScreen } from "./components/ReportsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomeScreen },
      { path: "ledger", Component: LedgerScreen },
      { path: "assistant", Component: AIAssistantScreen },
      { path: "reports", Component: ReportsScreen },
    ],
  },
]);
