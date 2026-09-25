export const communicationProjects = [
  {
    slug: "vendanges-2025",
    columns: [
      ["tote-bag.png", "gourdes.png", "flasques.png"],
      ["bougie.png", "cles-usb.png", "sac-vendanges.png"],
    ],
  },
  {
    slug: "noel-2025",
    columns: [
      ["portrait-femme.png", "bougies.png", "flasque.png"],
      ["coffret.png", "portrait-homme.png", "bougie-cloche.png"],
    ],
  },
  {
    slug: "reseaux-sociaux",
    columns: [
      ["goutte-simonnet.png", "vadin-plateau.png", "coffret-cp.png"],
      ["moineaux.png", "pots.png", "coeur-doger.png"],
    ],
  },
] as const;

export type CommunicationProject = (typeof communicationProjects)[number];

export function getCommunicationProject(slug: string) {
  return communicationProjects.find((project) => project.slug === slug);
}
