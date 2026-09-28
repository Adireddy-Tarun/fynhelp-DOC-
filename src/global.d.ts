export {};

declare global {
  interface FacebookLoginResponse {
    authResponse?: { code?: string } | null;
    status?: string;
  }
  interface FacebookSDK {
    init: (opts: { appId: string; autoLogAppEvents?: boolean; xfbml?: boolean; version: string }) => void;
    login: (cb: (response: FacebookLoginResponse) => void, opts?: Record<string, unknown>) => void;
  }
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}
