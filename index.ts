// run a prompt on the container

const Pages = {
  HOME: Bun.file("./src/client/index.html"),
};

class FileResponse extends Response {
  static isStaticAsset(url: URL): boolean {
    return [".js", ".css"].some((ext) => url.pathname.endsWith(ext));
  }

  static assetAt(path: string): FileResponse {
    return new FileResponse(`./src/client${path}`);
  }

  constructor(path: string) {
    const file = Bun.file(path);
    const info = file.type;
    console.log("[FileResponse] info:", info);
    super(file, {
      headers: {},
    });
  }
}

const app = Bun.serve({
  port: 3000,
  async fetch(request, server) {
    console.log("[app] server:", request.url);
    const url = new URL(request.url);
    const pathName = url.pathname;

    if (FileResponse.isStaticAsset(url)) {
      return FileResponse.assetAt(pathName);
    }

    return new Response(Pages.HOME);
  },
});

console.log("[app] now listening on", `http://${app.hostname}:${app.port}`);
