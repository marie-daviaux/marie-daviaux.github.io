import { withSupabase } from 'npm:@supabase/server@1'

function requiredSecret(name: string) {
  const value = Deno.env.get(name)?.trim()

  if (!value) {
    throw new Error(`Le secret ${name} est absent.`)
  }

  return value
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Méthode non autorisée.' }, { status: 405 })
    }

    try {
      const token = requiredSecret('GITHUB_DEPLOY_TOKEN')
      const owner = requiredSecret('GITHUB_OWNER')
      const repository = requiredSecret('GITHUB_REPOSITORY')
      const workflow = requiredSecret('GITHUB_WORKFLOW')
      const ref = Deno.env.get('GITHUB_REF')?.trim() || 'main'
      const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'portfolio-admin',
          'X-GitHub-Api-Version': '2026-03-10',
        },
        body: JSON.stringify({ ref }),
      })

      if (!response.ok) {
        const details = (await response.text()).slice(0, 500)
        console.error('GitHub workflow dispatch failed', response.status, details)
        return Response.json(
          { error: `GitHub a refusé la publication (${response.status}).` },
          { status: 502 },
        )
      }

      const payload = response.status === 204 ? null : await response.json().catch(() => null)
      console.info('Portfolio deployment queued', {
        email: context.userClaims?.email,
        repository: `${owner}/${repository}`,
        workflow,
        ref,
      })

      return Response.json({
        queued: true,
        run_url: payload?.html_url,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inattendue.'
      console.error('Portfolio deployment configuration error', message)
      return Response.json({ error: message }, { status: 500 })
    }
  }),
}
