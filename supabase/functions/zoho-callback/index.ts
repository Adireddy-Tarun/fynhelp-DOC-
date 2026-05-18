import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const APP_URL = 'https://fynhelp.lovable.app/demo/dashboard'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      console.error('Zoho OAuth error:', error)
      return Response.redirect(`${APP_URL}?zoho=error&message=${encodeURIComponent(error)}`, 302)
    }

    if (!code || !state) {
      throw new Error('Missing code or state')
    }

    console.log('Zoho callback received')

    const [orgId] = state.split(':')
    if (!orgId) throw new Error('Invalid state')

    const clientId = Deno.env.get('ZOHO_CLIENT_ID')!
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET')!
    const redirectUri = Deno.env.get('ZOHO_REDIRECT_URI')!

    const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    })

    const tokens = await tokenResponse.json()
    console.log('Token exchange:', { success: !!tokens.access_token, has_refresh: !!tokens.refresh_token })

    if (tokens.error) throw new Error(tokens.error)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        organization_id: orgId,
        provider: 'zoho_books',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        metadata: {
          api_domain: tokens.api_domain || 'https://books.zoho.com',
          connected_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'organization_id,provider' })

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    console.log('✅ Zoho connected for org:', orgId)
    return Response.redirect(`${APP_URL}?zoho=connected`, 302)
  } catch (err) {
    console.error('OAuth callback error:', err)
    return Response.redirect(
      `${APP_URL}?zoho=error&message=${encodeURIComponent((err as Error).message)}`,
      302
    )
  }
})
