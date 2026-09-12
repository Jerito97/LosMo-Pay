import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LosMo Pay",
    short_name: "LosMo Pay",
    description: "Cumpleaños y gastos compartidos del grupo.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f2ec",
    theme_color: "#4a0e1a",
    icons: [
      {
        src: "/logo-losmo-pay.png",
        sizes: "1254x1254",
        type: "image/png",
      },
    ],
  };
}
