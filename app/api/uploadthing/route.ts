import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Ruta para Upload Thing
export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
});