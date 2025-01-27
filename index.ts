// run a prompt on the container

const Pages = {
  HOME: Bun.file("./src/client/index.html"),
};

class FileResponse extends Response {
  static isStaticAsset(url: URL): boolean {
    return url.pathname.endsWith(".js") || url.pathname.endsWith(".css");
  }

  static assetAt(path: string): FileResponse {
    const assetFilePath = `./src/client${path}`;
    console.log("[FileResponse] serving asset: ", assetFilePath);
    return new FileResponse(assetFilePath);
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
