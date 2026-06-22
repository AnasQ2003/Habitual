import { createFileRoute } from "@tanstack/react-router";
import PulseApp from "@/components/habit/PulseApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Habit Tracker" },
      { name: "description", content: "A beautifully animated habit tracker mobile app concept with 12+ fluid screens." },
      { property: "og:title", content: "Pulse — Habit Tracker" },
      { property: "og:description", content: "A beautifully animated habit tracker mobile app concept with 12+ fluid screens." },
    ],
  }),
  component: PulseApp,
});
