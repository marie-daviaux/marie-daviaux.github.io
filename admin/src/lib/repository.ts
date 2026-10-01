import { imageBucket, supabase } from './supabase'
import type { Category, Project, ProjectDraft, ProjectImage } from '../types'

type ProjectRow = Omit<Project, 'category_ids' | 'images'> & {
  project_categories: { category_id: string }[] | null
  project_images: Omit<ProjectImage, 'public_url'>[] | null
}

function client() {
  if (!supabase) {
    throw new Error('La configuration Supabase est absente.')
  }

  return supabase
}

function projectFromRow(row: ProjectRow): Project {
  const api = client()
  const images = [...(row.project_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      ...image,
      public_url: api.storage.from(imageBucket).getPublicUrl(image.storage_path).data.publicUrl,
    }))

  return {
    ...row,
    category_ids: (row.project_categories ?? []).map(({ category_id }) => category_id),
    images,
  }
}

export async function loadPortfolio() {
  const api = client()
  const [categoriesResult, projectsResult] = await Promise.all([
    api.from('categories').select('*').order('sort_order').order('name'),
    api
      .from('projects')
      .select('*, project_categories(category_id), project_images(*)')
      .order('sort_order')
      .order('updated_at', { ascending: false }),
  ])

  if (categoriesResult.error) throw categoriesResult.error
  if (projectsResult.error) throw projectsResult.error

  return {
    categories: categoriesResult.data as Category[],
    projects: (projectsResult.data as ProjectRow[]).map(projectFromRow),
  }
}

export async function saveCategory(category: Pick<Category, 'name' | 'slug'> & { id?: string }) {
  const api = client()
  const query = category.id
    ? api.from('categories').update({ name: category.name, slug: category.slug }).eq('id', category.id)
    : api.from('categories').insert({ name: category.name, slug: category.slug })
  const { data, error } = await query.select().single()

  if (error) throw error
  return data as Category
}

export async function removeCategory(id: string) {
  const { error } = await client().from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function saveProject(id: string | undefined, draft: ProjectDraft) {
  const api = client()
  const projectValues = {
    title: draft.title,
    slug: draft.slug,
    content: draft.content,
    is_published: draft.is_published,
    sort_order: draft.sort_order,
  }
  const projectQuery = id
    ? api.from('projects').update(projectValues).eq('id', id)
    : api.from('projects').insert(projectValues)
  const { data, error } = await projectQuery.select().single()

  if (error) throw error

  const projectId = data.id as string
  const { error: deleteLinksError } = await api
    .from('project_categories')
    .delete()
    .eq('project_id', projectId)
  if (deleteLinksError) throw deleteLinksError

  if (draft.category_ids.length) {
    const { error: categoryLinksError } = await api.from('project_categories').insert(
      draft.category_ids.map((categoryId) => ({
        project_id: projectId,
        category_id: categoryId,
      })),
    )
    if (categoryLinksError) throw categoryLinksError
  }

  return projectId
}

export async function setProjectPublished(id: string, isPublished: boolean) {
  const { error } = await client()
    .from('projects')
    .update({ is_published: isPublished })
    .eq('id', id)
  if (error) throw error
}

export async function removeProject(project: Project) {
  const api = client()
  if (project.images.length) {
    const { error: storageError } = await api.storage
      .from(imageBucket)
      .remove(project.images.map(({ storage_path }) => storage_path))
    if (storageError) throw storageError
  }

  const { error } = await api.from('projects').delete().eq('id', project.id)
  if (error) throw error
}

export async function uploadProjectImages(projectId: string, files: File[], startAt = 0) {
  const api = client()

  for (const [index, file] of files.entries()) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `${projectId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await api.storage.from(imageBucket).upload(storagePath, file, {
      cacheControl: '31536000',
      contentType: file.type,
    })
    if (uploadError) throw uploadError

    const { error: imageError } = await api.from('project_images').insert({
      project_id: projectId,
      storage_path: storagePath,
      alt_text: '',
      sort_order: startAt + index,
    })
    if (imageError) {
      await api.storage.from(imageBucket).remove([storagePath])
      throw imageError
    }
  }
}

export async function updateImage(imageId: string, values: { alt_text?: string; sort_order?: number }) {
  const { error } = await client().from('project_images').update(values).eq('id', imageId)
  if (error) throw error
}

export async function removeImage(image: ProjectImage) {
  const api = client()
  const { error: storageError } = await api.storage.from(imageBucket).remove([image.storage_path])
  if (storageError) throw storageError

  const { error } = await api.from('project_images').delete().eq('id', image.id)
  if (error) throw error
}

export async function requestDeployment() {
  const { data, error } = await client().functions.invoke('deploy-portfolio', {
    body: { requested_at: new Date().toISOString() },
  })

  if (error) throw error
  return data as { queued: boolean; run_url?: string }
}
