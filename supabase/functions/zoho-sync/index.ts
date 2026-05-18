import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { organization_id } = await req.json()

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: 'organization_id required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Starting Zoho sync for org:', organization_id)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('provider', 'zoho_books')
      .single()

    if (integrationError || !integration) {
      throw new Error('Zoho Books not connected. Please connect first.')
    }

    let accessToken: string = integration.access_token

    if (integration.expires_at && new Date(integration.expires_at) < new Date()) {
      console.log('Access token expired, refreshing...')

      const refreshResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: Deno.env.get('ZOHO_CLIENT_ID')!,
          client_secret: Deno.env.get('ZOHO_CLIENT_SECRET')!,
          refresh_token: integration.refresh_token,
        }),
      })

      const newTokens = await refreshResponse.json()
      if (newTokens.error) throw new Error(`Token refresh failed: ${newTokens.error}`)

      accessToken = newTokens.access_token

      await supabase
        .from('integrations')
        .update({
          access_token: newTokens.access_token,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', organization_id)
        .eq('provider', 'zoho_books')

      console.log('✅ Token refreshed')
    }

    const apiDomain = integration.metadata?.api_domain || 'https://books.zoho.com'

    const orgsResponse = await fetch(`${apiDomain}/api/v3/organizations`, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    })
    const orgsData = await orgsResponse.json()

    if (!orgsData.organizations || orgsData.organizations.length === 0) {
      throw new Error('No Zoho Books organizations found')
    }

    const zohoOrgId = orgsData.organizations[0].organization_id
    console.log('Using Zoho org:', zohoOrgId)

    const invoicesResponse = await fetch(
      `${apiDomain}/api/v3/invoices?organization_id=${zohoOrgId}`,
      { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
    )
    const invoicesData = await invoicesResponse.json()
    const invoices = invoicesData.invoices || []
    console.log(`Found ${invoices.length} invoices`)

    const expensesResponse = await fetch(
      `${apiDomain}/api/v3/expenses?organization_id=${zohoOrgId}`,
      { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
    )
    const expensesData = await expensesResponse.json()
    const expenses = expensesData.expenses || []
    console.log(`Found ${expenses.length} expenses`)

    const transactions: any[] = []

    for (const inv of invoices) {
      transactions.push({
        organization_id,
        date: inv.date,
        description: `Invoice ${inv.invoice_number} - ${inv.customer_name}`,
        amount: Math.round(inv.total * 100),
        type: 'inflow',
        category: 'Revenue',
        customer: inv.customer_name,
        invoice_number: inv.invoice_number,
        gst_amount: Math.round((inv.tax_total || 0) * 100),
        metadata: {
          zoho_invoice_id: inv.invoice_id,
          status: inv.status,
          source: 'zoho_books',
        },
      })
    }

    for (const exp of expenses) {
      transactions.push({
        organization_id,
        date: exp.date,
        description: exp.description || exp.account_name,
        amount: Math.round(exp.total * 100),
        type: 'outflow',
        category: exp.account_name,
        vendor: exp.vendor_name,
        gst_amount: Math.round((exp.tax_amount || 0) * 100),
        metadata: {
          zoho_expense_id: exp.expense_id,
          source: 'zoho_books',
        },
      })
    }

    console.log(`Inserting ${transactions.length} transactions...`)

    if (transactions.length > 0) {
      const { error: insertError } = await supabase
        .from('demo_transactions')
        .insert(transactions)

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }
    }

    console.log('✅ Transactions inserted, triggering insights...')

    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({ organization_id }),
    })

    console.log('✅ Zoho sync complete')

    return new Response(
      JSON.stringify({
        success: true,
        synced: transactions.length,
        invoices: invoices.length,
        expenses: expenses.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Zoho sync error:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
