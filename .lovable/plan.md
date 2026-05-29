## Goal
Point the waitlist form submission at the external Supabase project (`wiknwxniwqvsxgyzqqxu`) instead of Lovable Cloud, so signups use the updated email design.

## Change (single file: `src/components/WaitlistForm.tsx`)

Replace the `supabase.functions.invoke("waitlist-signup", ...)` call inside `handleSubmit` with a direct `fetch` to the external project's edge function. Keep every other line — validation, loading state, error handling, success state, branded confirmation — exactly as it is.

```ts
const response = await fetch(
  "https://wiknwxniwqvsxgyzqqxu.supabase.co/functions/v1/waitlist-signup",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${EXTERNAL_ANON_KEY}`,
    },
    body: JSON.stringify({
      email,
      name: formData.name,
      company_name: formData.company_name,
      phone: formData.phone,
      company_type: formData.company_type,
      company_size: formData.company_size,
      location: formData.location,
    }),
  },
);
const body = await response.json().catch(() => ({}));

if (response.ok && (body?.success ?? true)) {
  setSubmitted(true);
  setFormData(initial);
  onSuccess?.();
} else {
  setMessage({
    type: "error",
    text: body?.error || "Something went wrong. Please try again.",
  });
}
```

Remove the now-unused `import { supabase } from "@/integrations/supabase/client"` from this file.

## Anon key handling — needs your decision

You asked to add `VITE_SUPABASE_ANON_KEY_EXTERNAL` to `.env`. Two constraints:

1. The Lovable `.env` is auto-generated and must not be hand-edited — adding a `VITE_*` var there isn't supported.
2. Anon keys are publishable by design (the existing Lovable Cloud anon key is already inlined in `src/integrations/supabase/client.ts`, and the external anon key is already inlined in `src/integrations/supabase/external.ts`).

So instead of an env var, I'll import the external anon key from the file where it already lives:

```ts
import { supabaseExternal } from "@/integrations/supabase/external";
// reuse the key already configured there — no new env var needed
```

Or, equivalently, define a local `const EXTERNAL_ANON_KEY = "..."` at the top of `WaitlistForm.tsx` using the same key from `external.ts`. Same security posture either way — the anon key is meant to ship to the browser.

## Out of scope
- No changes to `WaitlistPopup.tsx`, `external.ts`, `client.ts`, `.env`, the edge function, or any UI/styling.

## Question before I implement
Do you want me to (a) reuse the external anon key already in `src/integrations/supabase/external.ts`, or (b) you'll add `VITE_SUPABASE_ANON_KEY_EXTERNAL` manually in Project Settings → Secrets and I'll read it via `import.meta.env`? Option (a) is simpler and works immediately; option (b) only matters if you want the key out of source — but since it's an anon key, it gets shipped to the browser regardless.