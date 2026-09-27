/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The terminal topic page lost "with undo" from its address; old links land on the new one.
  async redirects() {
    return [
      { source: "/terminal-file-manager-with-undo", destination: "/terminal-file-manager", permanent: true },
      { source: "/es/gestor-de-ficheros-de-terminal-con-deshacer", destination: "/es/gestor-de-ficheros-de-terminal", permanent: true },
    ];
  },
};

export default nextConfig;
