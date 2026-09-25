import { PortfolioIntro } from "@/components/portfolio-intro";

type HomeProps = {
  searchParams: Promise<{ menu?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  return <PortfolioIntro initialMenuOpen={params.menu === "open"} />;
}
