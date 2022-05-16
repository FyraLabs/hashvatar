import { createSvg } from "./api/createSvg";
import { Variants } from "./api/defs";

const variants = ["normal", "stagger", "spider", "flower", "gem"];

const getHash = async (str: string) => {
  const hash = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    new TextEncoder().encode(str)
  );

  const hashArray = Array.from(new Uint8Array(hash));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    let handler = pathname.substr(1).trim().replace(".svg", "");

    // Type can be normal, stagger, spider, flower, gem
    let variant: Variants = "stagger";

    if (handler.includes("/")) {
      const split = handler.split("/");
      handler = split[0];

      if (variants.includes(split[1])) {
        variant = split[1] as Variants;
      }
    }

    const handlerHash = await getHash(handler);

    const svg = createSvg({
      hash: handlerHash,
      variant: variant,
    });

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
      },
    });
  },
};
