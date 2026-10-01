import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  loadPortfolio,
  removeCategory,
  removeImage,
  removeProject,
  requestDeployment,
  saveCategory,
  saveProject,
  setProjectPublished,
  updateImage,
  uploadProjectImages,
} from './lib/repository'
import { hasSupabaseConfig, supabase } from './lib/supabase'
import type { Category, Project, ProjectDraft, ProjectImage } from './types'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.'
}

function Icon({ name, className = 'size-5' }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    folder: <path d="M3 7.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    logout: <path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />,
    search: <path d="m21 21-4.3-4.3m2.3-5.2A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0" />,
    edit: <path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2zM14.5 7.1l2.8 2.8" />,
    trash: <path d="M4 7h16M9 11v6M15 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
    image: <path d="M4 5h16v14H4zM4 15l4-4 4 4 2-2 6 6M15 9h.01" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    upload: <path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14" />,
    check: <path d="m5 12 4 4L19 6" />,
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function ConfigurationScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 px-6">
      <section className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
        <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-stone-950 text-white">
          <span className="text-lg font-semibold">P</span>
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Configuration requise</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Connecter ce portfolio</h1>
        <p className="mt-3 leading-7 text-stone-600">
          Copiez <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm">.env.example</code> vers{' '}
          <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm">.env.local</code>, puis ajoutez l’URL et la
          clé publique de la base Supabase.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-2xl bg-stone-950 p-5 text-sm leading-6 text-stone-200">
          VITE_SUPABASE_URL=...{`\n`}VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
        </pre>
      </section>
    </main>
  )
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase!.auth.signInWithPassword({ email, password })
    if (authError) setError('Adresse e-mail ou mot de passe incorrect.')
    setLoading(false)
  }

  return (
    <main className="grid min-h-screen bg-[#f4f2ed] lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-stone-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-32 top-1/3 size-[34rem] rounded-full bg-amber-200/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10 font-semibold">P</span>
          <span className="font-medium">Portfolio Admin</span>
        </div>
        <div className="relative max-w-lg">
          <p className="mb-5 text-sm uppercase tracking-[0.24em] text-amber-200">Un espace simple et commun</p>
          <h1 className="text-5xl font-medium leading-[1.08] tracking-[-0.04em]">Vos projets, vos images, votre portfolio.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-stone-400">
            Gérez le contenu sans toucher au code. Chaque portfolio conserve sa propre base et ses propres accès.
          </p>
        </div>
        <p className="relative text-sm text-stone-500">Administration sécurisée par Supabase</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-10 grid size-12 place-items-center rounded-2xl bg-stone-950 text-lg font-semibold text-white lg:hidden">P</div>
          <p className="text-sm font-medium text-amber-700">Espace privé</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-stone-950">Bienvenue</h2>
          <p className="mt-3 text-stone-600">Connectez-vous pour administrer le portfolio.</p>

          <label className="mt-9 block text-sm font-medium text-stone-800">
            Adresse e-mail
            <input
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-950 focus:ring-4 focus:ring-stone-950/5"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="mt-5 block text-sm font-medium text-stone-800">
            Mot de passe
            <input
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-950 focus:ring-4 focus:ring-stone-950/5"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button
            className="mt-7 flex w-full items-center justify-center rounded-xl bg-stone-950 px-5 py-3.5 font-medium text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </section>
    </main>
  )
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        published ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
      }`}
    >
      <span className={`size-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-stone-400'}`} />
      {published ? 'Publié' : 'Brouillon'}
    </span>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-stone-100 text-stone-500">
        <Icon name="image" className="size-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-stone-900">Aucun projet ici</h3>
      <p className="mt-2 text-sm text-stone-500">Créez un premier projet ou modifiez vos filtres.</p>
      <button onClick={onCreate} className="mt-6 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800">
        Ajouter un projet
      </button>
    </div>
  )
}

function ProjectCard({
  project,
  categories,
  onEdit,
  onToggle,
}: {
  project: Project
  categories: Category[]
  onEdit: () => void
  onToggle: () => void
}) {
  const projectCategories = categories.filter(({ id }) => project.category_ids.includes(id))

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-200/60">
      <button onClick={onEdit} className="block w-full text-left">
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
          {project.images[0] ? (
            <img src={project.images[0].public_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          ) : (
            <div className="grid size-full place-items-center text-stone-300">
              <Icon name="image" className="size-10" />
            </div>
          )}
          <div className="absolute right-3 top-3"><StatusPill published={project.is_published} /></div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-stone-950">{project.title}</h3>
              <p className="mt-1 text-sm text-stone-500">{projectCategories.map(({ name }) => name).join(' · ') || 'Sans catégorie'}</p>
            </div>
            <span className="rounded-lg p-1.5 text-stone-400 transition group-hover:bg-stone-100 group-hover:text-stone-900">
              <Icon name="arrow" />
            </span>
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
        <span className="text-xs text-stone-400">{project.images.length} image{project.images.length > 1 ? 's' : ''}</span>
        <button onClick={onToggle} className="text-xs font-medium text-stone-600 hover:text-stone-950">
          {project.is_published ? 'Dépublier' : 'Publier'}
        </button>
      </div>
    </article>
  )
}

function CategoriesDialog({
  categories,
  onClose,
  onChanged,
  onDeploy,
}: {
  categories: Category[]
  onClose: () => void
  onChanged: () => Promise<void>
  onDeploy: () => Promise<void>
}) {
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit(category?: Category) {
    setEditing(category ?? null)
    setName(category?.name ?? '')
    setError('')
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await saveCategory({ id: editing?.id, name: name.trim(), slug: slugify(name) })
      setName('')
      setEditing(null)
      await onChanged()
      await onDeploy()
    } catch (saveError) {
      setError(messageFrom(saveError))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » ? Les projets seront conservés.`)) return
    try {
      await removeCategory(category.id)
      await onChanged()
      await onDeploy()
    } catch (deleteError) {
      setError(messageFrom(deleteError))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <header className="sticky top-0 flex items-center justify-between border-b border-stone-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Organisation</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">Catégories</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-stone-500 hover:bg-stone-100"><Icon name="close" /></button>
        </header>

        <div className="p-6">
          <form onSubmit={handleSave} className="flex gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nom de la catégorie"
              className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-950"
              required
            />
            <button disabled={saving} className="rounded-xl bg-stone-950 px-4 font-medium text-white disabled:opacity-60">
              {editing ? 'Modifier' : 'Ajouter'}
            </button>
            {editing && <button type="button" onClick={() => startEdit()} className="rounded-xl border border-stone-200 px-3 text-sm">Annuler</button>}
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-6 divide-y divide-stone-100 rounded-2xl border border-stone-200">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="grid size-9 place-items-center rounded-lg bg-stone-100 text-stone-500"><Icon name="folder" className="size-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">{category.name}</p>
                  <p className="truncate text-xs text-stone-400">/{category.slug}</p>
                </div>
                <button onClick={() => startEdit(category)} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900"><Icon name="edit" className="size-4" /></button>
                <button onClick={() => handleDelete(category)} className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"><Icon name="trash" className="size-4" /></button>
              </div>
            ))}
            {!categories.length && <p className="px-4 py-8 text-center text-sm text-stone-500">Aucune catégorie.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

function ProjectEditor({
  project,
  categories,
  onClose,
  onSaved,
  onDeploy,
}: {
  project: Project | null
  categories: Category[]
  onClose: () => void
  onSaved: () => Promise<void>
  onDeploy: () => Promise<void>
}) {
  const [draft, setDraft] = useState<ProjectDraft>({
    title: project?.title ?? '',
    slug: project?.slug ?? '',
    content: project?.content ?? '',
    is_published: project?.is_published ?? false,
    sort_order: project?.sort_order ?? 0,
    category_ids: project?.category_ids ?? [],
  })
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateTitle(title: string) {
    setDraft((current) => ({
      ...current,
      title,
      slug: !current.slug || current.slug === slugify(current.title) ? slugify(title) : current.slug,
    }))
  }

  function toggleCategory(id: string) {
    setDraft((current) => ({
      ...current,
      category_ids: current.category_ids.includes(id)
        ? current.category_ids.filter((categoryId) => categoryId !== id)
        : [...current.category_ids, id],
    }))
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const projectId = await saveProject(project?.id, draft)
      if (files.length) await uploadProjectImages(projectId, files, project?.images.length ?? 0)
      await onSaved()
      if (project?.is_published || draft.is_published) await onDeploy()
      onClose()
    } catch (saveError) {
      setError(messageFrom(saveError))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteProject() {
    if (!project || !window.confirm(`Supprimer définitivement « ${project.title} » et toutes ses images ?`)) return
    setSaving(true)
    try {
      await removeProject(project)
      await onSaved()
      if (project.is_published) await onDeploy()
      onClose()
    } catch (deleteError) {
      setError(messageFrom(deleteError))
      setSaving(false)
    }
  }

  async function handleRemoveImage(image: ProjectImage) {
    if (!window.confirm('Supprimer cette image ?')) return
    try {
      await removeImage(image)
      await onSaved()
      if (project?.is_published) await onDeploy()
    } catch (deleteError) {
      setError(messageFrom(deleteError))
    }
  }

  async function handleAlt(image: ProjectImage, altText: string) {
    if (altText === image.alt_text) return
    try {
      await updateImage(image.id, { alt_text: altText })
      await onSaved()
      if (project?.is_published) await onDeploy()
    } catch (updateError) {
      setError(messageFrom(updateError))
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-stone-950/35 backdrop-blur-[2px]">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 cursor-default" />
      <form onSubmit={handleSave} className="relative flex h-full w-full max-w-3xl flex-col bg-[#faf9f6] shadow-2xl">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{project ? 'Modification' : 'Nouveau projet'}</p>
            <h2 className="mt-1 font-semibold text-stone-950">{project?.title || 'Projet sans titre'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50">Annuler</button>
            <button disabled={saving} className="rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {error && <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
              <label className="text-sm font-medium text-stone-800">
                Titre
                <input
                  value={draft.title}
                  onChange={(event) => updateTitle(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-950"
                  placeholder="Nom du projet"
                  required
                />
              </label>
              <label className="text-sm font-medium text-stone-800">
                Ordre
                <input
                  type="number"
                  value={draft.sort_order}
                  onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-950"
                />
              </label>
            </div>
            <label className="mt-5 block text-sm font-medium text-stone-800">
              URL du projet
              <div className="mt-2 flex items-center rounded-xl border border-stone-300 bg-stone-50 px-4 focus-within:border-stone-950">
                <span className="text-stone-400">/</span>
                <input
                  value={draft.slug}
                  onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })}
                  className="min-w-0 flex-1 bg-transparent py-3 outline-none"
                  required
                />
              </div>
            </label>
            <label className="mt-5 block text-sm font-medium text-stone-800">
              Texte
              <textarea
                value={draft.content}
                onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                className="mt-2 min-h-44 w-full resize-y rounded-xl border border-stone-300 px-4 py-3 leading-7 outline-none focus:border-stone-950"
                placeholder="Présentez le projet, le contexte et votre démarche…"
              />
            </label>
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <h3 className="font-semibold text-stone-950">Catégories</h3>
            <p className="mt-1 text-sm text-stone-500">Un projet peut appartenir à plusieurs catégories.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = draft.category_ids.includes(category.id)
                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                      selected ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {selected && <Icon name="check" className="size-3.5" />}
                    {category.name}
                  </button>
                )
              })}
              {!categories.length && <p className="text-sm text-amber-700">Créez d’abord une catégorie depuis le tableau de bord.</p>}
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-stone-950">Images</h3>
                <p className="mt-1 text-sm text-stone-500">JPG, PNG, WebP ou GIF. Ajoutez un texte alternatif pour l’accessibilité.</p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
                <Icon name="upload" className="size-4" /> Ajouter
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                />
              </label>
            </div>

            {files.length > 0 && (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {files.length} nouvelle{files.length > 1 ? 's' : ''} image{files.length > 1 ? 's' : ''} sera ajoutée à l’enregistrement.
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {project?.images.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-xl border border-stone-200">
                  <div className="relative aspect-[4/3] bg-stone-100">
                    <img src={image.public_url} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image)}
                      className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-stone-600 shadow-sm backdrop-blur hover:text-red-600"
                    >
                      <Icon name="trash" className="size-4" />
                    </button>
                  </div>
                  <input
                    defaultValue={image.alt_text}
                    onBlur={(event) => handleAlt(image, event.target.value)}
                    placeholder="Texte alternatif"
                    className="w-full border-t border-stone-200 px-3 py-2.5 text-sm outline-none focus:bg-stone-50"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div>
              <h3 className="font-semibold text-stone-950">Publication</h3>
              <p className="mt-1 text-sm text-stone-500">Un brouillon reste invisible sur le portfolio public.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.is_published}
              onClick={() => setDraft({ ...draft, is_published: !draft.is_published })}
              className={`relative h-7 w-12 rounded-full transition ${draft.is_published ? 'bg-emerald-600' : 'bg-stone-300'}`}
            >
              <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${draft.is_published ? 'left-6' : 'left-1'}`} />
            </button>
          </section>

          {project && (
            <section className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 sm:p-6">
              <h3 className="font-semibold text-red-900">Zone sensible</h3>
              <p className="mt-1 text-sm text-red-700">La suppression du projet et de ses images est définitive.</p>
              <button type="button" onClick={handleDeleteProject} className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100">
                Supprimer le projet
              </button>
            </section>
          )}
        </div>
      </form>
    </div>
  )
}

function Admin({ user }: { user: User }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [editedProjectId, setEditedProjectId] = useState<string | 'new' | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [deploymentNotice, setDeploymentNotice] = useState<{
    kind: 'loading' | 'success' | 'error'
    text: string
  } | null>(null)

  async function queueDeployment() {
    setDeploymentNotice({ kind: 'loading', text: 'Publication en préparation…' })

    try {
      await requestDeployment()
      setDeploymentNotice({
        kind: 'success',
        text: 'Publication lancée. Le site sera à jour dans quelques minutes.',
      })
      window.setTimeout(() => {
        setDeploymentNotice((notice) => notice?.kind === 'success' ? null : notice)
      }, 8000)
    } catch (deploymentError) {
      const message = messageFrom(deploymentError)
      setDeploymentNotice({
        kind: 'error',
        text: `Le contenu est enregistré, mais la publication n’a pas démarré : ${message}`,
      })
    }
  }

  async function refresh() {
    try {
      const data = await loadPortfolio()
      setCategories(data.categories)
      setProjects(data.projects)
      setError('')
    } catch (loadError) {
      setError(messageFrom(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- initial remote data load
    void refresh()
  }, [])

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return projects.filter((project) => {
      const matchesQuery = !normalizedQuery || project.title.toLowerCase().includes(normalizedQuery)
      const matchesCategory = categoryFilter === 'all' || project.category_ids.includes(categoryFilter)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && project.is_published) ||
        (statusFilter === 'draft' && !project.is_published)
      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [projects, query, categoryFilter, statusFilter])

  const editedProject = editedProjectId && editedProjectId !== 'new'
    ? projects.find(({ id }) => id === editedProjectId) ?? null
    : null

  async function togglePublish(project: Project) {
    try {
      await setProjectPublished(project.id, !project.is_published)
      await refresh()
      await queueDeployment()
    } catch (publishError) {
      setError(messageFrom(publishError))
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-stone-900 lg:grid lg:grid-cols-[15rem_1fr]">
      {deploymentNotice && (
        <div
          className={`fixed bottom-5 left-5 right-5 z-[70] mx-auto max-w-xl rounded-2xl border px-4 py-3 text-sm shadow-xl sm:left-auto sm:right-6 ${
            deploymentNotice.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : deploymentNotice.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-stone-200 bg-white text-stone-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`size-2 shrink-0 rounded-full ${
                deploymentNotice.kind === 'error'
                  ? 'bg-red-500'
                  : deploymentNotice.kind === 'success'
                    ? 'bg-emerald-500'
                    : 'animate-pulse bg-amber-500'
              }`}
            />
            <span className="flex-1">{deploymentNotice.text}</span>
            {deploymentNotice.kind !== 'loading' && (
              <button
                onClick={() => setDeploymentNotice(null)}
                aria-label="Fermer"
                className="rounded-lg p-1 opacity-60 hover:bg-black/5 hover:opacity-100"
              >
                <Icon name="close" className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}
      <aside className="hidden min-h-screen border-r border-stone-200 bg-white px-4 py-6 lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-stone-950 font-semibold text-white">P</span>
          <div>
            <p className="font-semibold leading-tight">Portfolio</p>
            <p className="text-xs text-stone-400">Administration</p>
          </div>
        </div>
        <nav className="mt-10">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              categoryFilter === 'all'
                ? 'bg-stone-950 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
            }`}
          >
            <Icon name="grid" className="size-4" /> Projets
          </button>

          <div className="mt-7 flex items-center justify-between px-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Catégories</p>
            <button
              onClick={() => setShowCategories(true)}
              aria-label="Gérer les catégories"
              title="Gérer les catégories"
              className="grid size-7 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-950"
            >
              <Icon name="plus" className="size-4" />
            </button>
          </div>

          <div className="mt-2 space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  categoryFilter === category.id
                    ? 'bg-amber-50 text-amber-900'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
                }`}
              >
                <Icon name="folder" className="size-4 shrink-0" />
                <span className="truncate">{category.name}</span>
                <span className="ml-auto text-xs font-normal text-stone-400">
                  {projects.filter((project) => project.category_ids.includes(category.id)).length}
                </span>
              </button>
            ))}
            {!categories.length && (
              <button
                onClick={() => setShowCategories(true)}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-stone-400 hover:bg-stone-100"
              >
                Ajouter une catégorie
              </button>
            )}
          </div>
        </nav>
        <div className="mt-auto border-t border-stone-100 pt-4">
          <p className="truncate px-3 text-xs text-stone-400">{user.email}</p>
          <button onClick={() => supabase!.auth.signOut()} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-950">
            <Icon name="logout" className="size-4" /> Se déconnecter
          </button>
        </div>
      </aside>

      <main className="lg:col-start-2">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f6f5f2]/90 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="lg:hidden">
              <p className="font-semibold">Portfolio Admin</p>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-stone-500">Gestion du contenu</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCategories(true)} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 lg:hidden">Catégories</button>
              <button
                onClick={() => void queueDeployment()}
                disabled={deploymentNotice?.kind === 'loading'}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-wait disabled:opacity-50"
              >
                <Icon name="upload" className="size-4" />
                <span className="hidden sm:inline">Publier le site</span>
                <span className="sm:hidden">Publier</span>
              </button>
              <button onClick={() => setEditedProjectId('new')} className="flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800">
                <Icon name="plus" className="size-4" /> <span className="hidden sm:inline">Nouveau projet</span><span className="sm:hidden">Nouveau</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-amber-700">Vue d’ensemble</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-stone-950">Projets</h1>
              <p className="mt-2 text-stone-500">{projects.length} projet{projects.length > 1 ? 's' : ''}, dont {projects.filter(({ is_published }) => is_published).length} publié{projects.filter(({ is_published }) => is_published).length > 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-stone-100 px-3">
              <Icon name="search" className="size-4 text-stone-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un projet…" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" />
            </label>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none">
              <option value="all">Toutes les catégories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none">
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>

          {error && <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {loading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => <div key={item} className="aspect-[4/3] animate-pulse rounded-2xl bg-stone-200" />)}
            </div>
          ) : filteredProjects.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  categories={categories}
                  onEdit={() => setEditedProjectId(project.id)}
                  onToggle={() => void togglePublish(project)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8"><EmptyState onCreate={() => setEditedProjectId('new')} /></div>
          )}
        </div>
      </main>

      {editedProjectId && (
        <ProjectEditor
          key={editedProjectId}
          project={editedProject}
          categories={categories}
          onClose={() => setEditedProjectId(null)}
          onSaved={refresh}
          onDeploy={queueDeployment}
        />
      )}
      {showCategories && (
        <CategoriesDialog
          categories={categories}
          onClose={() => setShowCategories(false)}
          onChanged={refresh}
          onDeploy={queueDeployment}
        />
      )}
    </div>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(hasSupabaseConfig)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  if (!hasSupabaseConfig) return <ConfigurationScreen />
  if (loading) return <main className="grid min-h-screen place-items-center bg-stone-100 text-sm text-stone-500">Chargement…</main>
  if (!user) return <LoginScreen />
  return <Admin user={user} />
}

export default App
