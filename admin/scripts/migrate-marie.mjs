import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const adminRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const portfolioRoot = resolve(adminRoot, '..')

async function readEnvironment(path) {
  const content = await readFile(path, 'utf8')
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=')
        return [line.slice(0, separator), line.slice(separator + 1)]
      }),
  )
}

const publicEnvironment = await readEnvironment(resolve(adminRoot, '.env.local'))
const migrationEnvironment = await readEnvironment(resolve(adminRoot, '.env.migration.local'))
const supabaseUrl = publicEnvironment.VITE_SUPABASE_URL
const secretKey = migrationEnvironment.SUPABASE_SECRET_KEY

if (!supabaseUrl || !secretKey?.startsWith('sb_secret_')) {
  throw new Error('Configuration de migration absente ou incorrecte.')
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const messages = JSON.parse(await readFile(resolve(portfolioRoot, 'translations/fr.json'), 'utf8'))

const groups = [
  {
    category: { name: 'Design graphique', slug: 'design-graphique', sort_order: 0 },
    directory: 'design-graphique',
    messages: messages.graphicDesign.projects,
    projects: [
      {
        slug: 'huret-colas',
        columns: [
          ['bouteille-etiquette.png', 'bouteille-bleue.png', 'millesime-2012.png'],
          ['carte-logo.png', 'bouteille-portrait.png', 'monogramme.png'],
        ],
      },
      {
        slug: 'menetrier',
        columns: [
          ['etui.png', 'aquarelle.png', 'etui-suite.png'],
          ['detail-aquarelle.png', 'gamme-etuis.png', 'site-web.png'],
        ],
      },
      {
        slug: 'take-happiness',
        columns: [
          ['illustration-blanche.png', 'sac-bouteille.png', 'croquis.png'],
          ['sous-verre.png', 'sac-fleurs.png', 'tshirt.png'],
        ],
      },
      {
        slug: 'vadin-plateau',
        columns: [
          ['tablette-dessin.png', 'bouteille.png', 'detail-illustration.png'],
          ['coiffe.png', 'etiquette-a-plat.png', 'detail-bouteille.png'],
        ],
      },
      {
        slug: 'adam-mereaux',
        columns: [
          ['bouteille-face.png', 'bouteille-angle.png', 'rouleaux-etiquettes.png'],
          ['detail-etiquette.png', 'lifestyle.png', 'dorure.png'],
        ],
      },
      {
        slug: 'illustrations',
        columns: [
          ['faites-petiller-la-vie.png', 'verre-plein.png', 'champagne.png'],
          ['plus-de-bulles.png', 'toujours-a-flot.png', 'verres.png'],
        ],
      },
    ],
  },
  {
    category: { name: 'Communication', slug: 'communication', sort_order: 1 },
    directory: 'communication',
    messages: messages.communication.projects,
    projects: [
      {
        slug: 'vendanges-2025',
        columns: [
          ['tote-bag.png', 'gourdes.png', 'flasques.png'],
          ['bougie.png', 'cles-usb.png', 'sac-vendanges.png'],
        ],
      },
      {
        slug: 'noel-2025',
        columns: [
          ['portrait-femme.png', 'bougies.png', 'flasque.png'],
          ['coffret.png', 'portrait-homme.png', 'bougie-cloche.png'],
        ],
      },
      {
        slug: 'reseaux-sociaux',
        columns: [
          ['goutte-simonnet.png', 'vadin-plateau.png', 'coffret-cp.png'],
          ['moineaux.png', 'pots.png', 'coeur-doger.png'],
        ],
      },
    ],
  },
]

const contentTypes = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function interleave(columns) {
  const rows = Math.max(...columns.map((column) => column.length))
  const images = []
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns.length; column += 1) {
      if (columns[column][row]) images.push({ filename: columns[column][row], column, row })
    }
  }
  return images
}

let migratedProjects = 0
let migratedImages = 0

for (const group of groups) {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .upsert(group.category, { onConflict: 'slug' })
    .select()
    .single()
  if (categoryError) throw categoryError

  for (const [projectIndex, sourceProject] of group.projects.entries()) {
    const content = group.messages[projectIndex]
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .upsert(
        {
          title: content.subtitle,
          slug: sourceProject.slug,
          content: content.paragraphs.join('\n\n'),
          is_published: true,
          sort_order: projectIndex,
        },
        { onConflict: 'slug' },
      )
      .select()
      .single()
    if (projectError) throw projectError

    const { error: linkError } = await supabase
      .from('project_categories')
      .upsert(
        { project_id: project.id, category_id: category.id },
        { onConflict: 'project_id,category_id' },
      )
    if (linkError) throw linkError

    const images = interleave(sourceProject.columns)
    for (const [sortOrder, image] of images.entries()) {
      const sourcePath = resolve(
        portfolioRoot,
        'public',
        group.directory,
        sourceProject.slug,
        image.filename,
      )
      const storagePath = `${project.id}/${image.filename}`
      const file = await readFile(sourcePath)
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(storagePath, file, {
          cacheControl: '31536000',
          contentType: contentTypes[extname(image.filename).toLowerCase()] ?? 'application/octet-stream',
          upsert: true,
        })
      if (uploadError) throw uploadError

      const altText = content.imageAlts[image.column][image.row]
      const { error: imageError } = await supabase
        .from('project_images')
        .upsert(
          {
            project_id: project.id,
            storage_path: storagePath,
            alt_text: `${content.subtitle} — ${altText}`,
            sort_order: sortOrder,
          },
          { onConflict: 'storage_path' },
        )
      if (imageError) throw imageError
      migratedImages += 1
    }

    migratedProjects += 1
    console.log(`✓ ${content.subtitle} (${images.length} images)`)
  }
}

console.log(`\nMigration terminée : ${migratedProjects} projets et ${migratedImages} images.`)
