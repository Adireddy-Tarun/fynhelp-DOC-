import { useSearchParams } from "@/lib/router-compat";

/** Reads ?client={business_id} so pages can preselect a client after posting. */
export function useClientParam(): string {
  const [params] = useSearchParams();
  return params.get("client") ?? "";
}
