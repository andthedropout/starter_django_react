// The Vite build generates this module before Bun bundles the runtime adapter.
declare module '*dist/server/server.js' {
  const entry: {
    fetch(request: Request): Response | Promise<Response>
  }
  export default entry
}
