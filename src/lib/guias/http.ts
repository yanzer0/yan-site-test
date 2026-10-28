/** Next standalone can expose localhost in request.url behind the reverse proxy. */
export function origemPublicaGuias(request: { url: string; headers: Headers }): string {
  const host = request.headers.get("host") ?? new URL(request.url).host;
  if (host === "useinfuser.com" || host === "www.useinfuser.com") return `https://${host}`;
  if (/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host)) return `http://${host}`;
  return "https://useinfuser.com";
}
