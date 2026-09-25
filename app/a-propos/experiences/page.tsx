import type { Metadata } from "next";
import { ExperiencesSlider } from "@/components/experiences-slider";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();
const experiences = messages.about.experiences;

export const metadata: Metadata = {
  title: `${experiences.title} — ${messages.brand.name}`,
  description: experiences.items.map((item) => item.role.replaceAll("\n", " ")).join(", "),
};

export default function ExperiencesPage() {
  return (
    <ExperiencesSlider
      title={experiences.title}
      signature={messages.about.signature}
      backLabel={messages.navigation.backToContents}
      continueLabel={messages.navigation.continue}
      items={experiences.items}
      olderItems={experiences.olderItems}
      skills={experiences.skills}
    />
  );
}
