import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { organization_id } = await req.json()

    const clientId = Deno.env.get('ZOHO_CLIENT_ID')
    const redirectUri = Deno.env.get('ZOHO_REDIRECT_URI')

    if (!clientId || !redirectUri) {
      throw new Error('Zoho credentials not configured')
    }

    const state = `${organization_id}:${crypto.randomUUID()}`

    const authUrl = new URL('https://accounts.zoho.com/oauth/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'ZohoBooks.fullaccess.all')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    return new Response(
      JSON.stringify({ authorization_url: authUrl.toString(), state }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Zoho auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
