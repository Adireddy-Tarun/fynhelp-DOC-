import { createFileRoute } from "@tanstack/react-router";
import TransactionsPage from "@/pages/dashboard/TransactionsPage";

export const Route = createFileRoute("/_main/dashboard/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — FynHelp" },
      { name: "description", content: "Search and filter every transaction imported for your business." },
      { property: "og:title", content: "Transactions — FynHelp" },
      { property: "og:description", content: "Search and filter every transaction imported for your business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TransactionsPage,
});
