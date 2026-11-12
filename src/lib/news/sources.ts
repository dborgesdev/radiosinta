export const feedSources = {
  regional: {
    name: "DeFato Online",
    url: "https://defatoonline.com.br/feed/",
    hosts: ["defatoonline.com.br", "www.defatoonline.com.br"],
    imageHosts: ["defatoonline.com.br", "www.defatoonline.com.br", "cdn.defatoonline.com.br"],
  },
  gospel: {
    name: "Folha Gospel",
    url: "https://folhagospel.com/feed/",
    hosts: ["folhagospel.com", "www.folhagospel.com"],
    imageHosts: [
      "folhagospel.com",
      "www.folhagospel.com",
      "i0.wp.com",
      "i1.wp.com",
      "i2.wp.com",
      "i3.wp.com",
    ],
  },
} as const;
export type FeedSource = keyof typeof feedSources;
