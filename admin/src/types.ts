export type Category = {
  id: string
  name: string
  slug: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type ProjectImage = {
  id: string
  project_id: string
  storage_path: string
  alt_text: string
  sort_order: number
  created_at: string
  public_url: string
}

export type Project = {
  id: string
  title: string
  slug: string
  content: string
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category_ids: string[]
  images: ProjectImage[]
}

export type ProjectDraft = Pick<
  Project,
  'title' | 'slug' | 'content' | 'is_published' | 'sort_order' | 'category_ids'
>
