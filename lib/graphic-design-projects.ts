export const graphicDesignProjects = [
  {
    slug: "huret-colas",
    columns: [
      ["bouteille-etiquette.png", "bouteille-bleue.png", "millesime-2012.png"],
      ["carte-logo.png", "bouteille-portrait.png", "monogramme.png"],
    ],
  },
  {
    slug: "menetrier",
    columns: [
      ["etui.png", "aquarelle.png", "etui-suite.png"],
      ["detail-aquarelle.png", "gamme-etuis.png", "site-web.png"],
    ],
  },
  {
    slug: "take-happiness",
    columns: [
      ["illustration-blanche.png", "sac-bouteille.png", "croquis.png"],
      ["sous-verre.png", "sac-fleurs.png", "tshirt.png"],
    ],
  },
  {
    slug: "vadin-plateau",
    columns: [
      ["tablette-dessin.png", "bouteille.png", "detail-illustration.png"],
      ["coiffe.png", "etiquette-a-plat.png", "detail-bouteille.png"],
    ],
  },
  {
    slug: "adam-mereaux",
    columns: [
      ["bouteille-face.png", "bouteille-angle.png", "rouleaux-etiquettes.png"],
      ["detail-etiquette.png", "lifestyle.png", "dorure.png"],
    ],
  },
  {
    slug: "illustrations",
    columns: [
      ["faites-petiller-la-vie.png", "verre-plein.png", "champagne.png"],
      ["plus-de-bulles.png", "toujours-a-flot.png", "verres.png"],
    ],
  },
] as const;

export type GraphicDesignProject = (typeof graphicDesignProjects)[number];

export function getGraphicDesignProject(slug: string) {
  return graphicDesignProjects.find((project) => project.slug === slug);
}
