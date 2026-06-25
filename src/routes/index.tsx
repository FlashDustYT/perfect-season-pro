import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Legacy League — Sports Career Life Sim" },
      {
        name: "description",
        content:
          "Legacy League is a mobile and desktop sports career life simulator. Build an athlete from birth, manage training, family, agents, and chase a hall of fame legacy.",
      },
      { property: "og:title", content: "Legacy League — Sports Career Life Sim" },
      {
        property: "og:description",
        content:
          "Build an athlete from birth across basketball, football, soccer, boxing, and MMA. Chase the perfect legacy on mobile and desktop.",
      },
    ],
    links: [{ rel: "icon", href: "/game/assets/icon.svg", type: "image/svg+xml" }],
  }),
  component: GamePage,
});

function GamePage() {
  return (
    <iframe
      src="/game/index.html"
      title="Legacy League"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "0",
      }}
      allow="fullscreen"
    />
  );
}
