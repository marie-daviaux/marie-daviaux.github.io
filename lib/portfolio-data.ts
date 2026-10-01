import { communicationProjects } from "@/lib/communication-projects";
import { graphicDesignProjects } from "@/lib/graphic-design-projects";
import { getDictionary } from "@/i18n/dictionaries";

export type PortfolioImage = {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
};

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  paragraphs: string[];
  sortOrder: number;
  columns: [PortfolioImage[], PortfolioImage[]];
};

type CategorySlug = "communication" | "design-graphique";

type DatabaseProject = {
  id: string;
  slug: string;
  title: string;
  content: string;
  sort_order: number;
};

type DatabaseImage = {
  id: string;
  project_id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

const cache = new Map<CategorySlug, Promise<PortfolioProject[]>>();

function encodeStoragePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function query<T>(path: string, supabaseUrl: string, publishableKey: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

async function loadFromSupabase(categorySlug: CategorySlug) {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return null;
  }

  const categories = await query<Array<{ id: string }>>(
    `categories?select=id&slug=eq.${categorySlug}&limit=1`,
    supabaseUrl,
    publishableKey,
  );
  const category = categories[0];

  if (!category) {
    return [];
  }

  const links = await query<Array<{ project_id: string }>>(
    `project_categories?select=project_id&category_id=eq.${category.id}`,
    supabaseUrl,
    publishableKey,
  );
  const projectIds = links.map(({ project_id }) => project_id);

  if (!projectIds.length) {
    return [];
  }

  const ids = `(${projectIds.join(",")})`;
  const [projects, images] = await Promise.all([
    query<DatabaseProject[]>(
      `projects?select=id,slug,title,content,sort_order&id=in.${ids}&is_published=eq.true&order=sort_order.asc`,
      supabaseUrl,
      publishableKey,
    ),
    query<DatabaseImage[]>(
      `project_images?select=id,project_id,storage_path,alt_text,sort_order&project_id=in.${ids}&order=sort_order.asc`,
      supabaseUrl,
      publishableKey,
    ),
  ]);

  return projects.map((project) => {
    const projectImages = images
      .filter(({ project_id }) => project_id === project.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        id: image.id,
        url: `${supabaseUrl}/storage/v1/object/public/project-images/${encodeStoragePath(image.storage_path)}`,
        altText: image.alt_text,
        sortOrder: image.sort_order,
      }));

    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      paragraphs: project.content.split(/\n\s*\n/).filter(Boolean),
      sortOrder: project.sort_order,
      columns: [
        projectImages.filter((_, index) => index % 2 === 0),
        projectImages.filter((_, index) => index % 2 === 1),
      ],
    };
  }) as PortfolioProject[];
}

function loadFallback(categorySlug: CategorySlug): PortfolioProject[] {
  const messages = getDictionary();
  const isCommunication = categorySlug === "communication";
  const projects = isCommunication ? communicationProjects : graphicDesignProjects;
  const content = isCommunication
    ? messages.communication.projects
    : messages.graphicDesign.projects;

  return projects.map((project, projectIndex) => ({
    id: `${categorySlug}-${project.slug}`,
    slug: project.slug,
    title: content[projectIndex].subtitle,
    paragraphs: [...content[projectIndex].paragraphs],
    sortOrder: projectIndex,
    columns: project.columns.map((column, columnIndex) =>
      column.map((filename, imageIndex) => ({
        id: `${project.slug}-${filename}`,
        url: `/${categorySlug}/${project.slug}/${filename}`,
        altText: `${content[projectIndex].subtitle} — ${content[projectIndex].imageAlts[columnIndex][imageIndex]}`,
        sortOrder: columnIndex + imageIndex * 2,
      })),
    ) as [PortfolioImage[], PortfolioImage[]],
  }));
}

export function getPortfolioProjects(categorySlug: CategorySlug) {
  const cached = cache.get(categorySlug);
  if (cached) return cached;

  const projects = loadFromSupabase(categorySlug).then(
    (remoteProjects) => remoteProjects ?? loadFallback(categorySlug),
  );
  cache.set(categorySlug, projects);
  return projects;
}
