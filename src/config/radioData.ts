export const radioData = {
  name: "Rádio Sinta",
  domain: "radiosinta.com.br",
  iframeUrl: "https://livemus.com.br/player_barra_moderno/index.php?porta=28118",
  phoneRaw: "31988487320",
  phoneFormatted: "(31) 98848-7320",
  whatsappLink: "https://wa.me/5531988487320",
  instagramLink: "https://www.instagram.com/radiosinta",
  slogan: "Sinta a presença de Deus",
  pixKey: "apoie@radiosinta.com.br",
  pixHolder: "Rádio Sinta Digital / Banco Vinculado",
  nowPlaying: "Você está ouvindo: Conexão Viva — Rádio Sinta",
  credits: {
    text: "Desenvolvido por Douglas Borges - Smart Local",
    url: "https://smartlocal.com.br",
  },
  nav: [
    { label: "Início", href: "#inicio" },
    { label: "Programação", href: "#essencia" },
    { label: "Sintonize", href: "#sintonize" },
    { label: "Apoie", href: "#semeadores" },
  ],
  artists: [
    "Bruna Karla",
    "Fernandinho",
    "Aline Barros",
    "Gabriela Rocha",
    "Isaias Saad",
    "Morada",
    "Leandro Borges",
    "Anderson Freire",
    "Kemuel",
  ],
} as const;

export type RadioData = typeof radioData;
