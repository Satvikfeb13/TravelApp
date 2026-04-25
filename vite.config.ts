import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(config => {
  return {
    plugins: [tailwindcss(), reactRouter()],
    ssr: {
      noExternal: [/@syncfusion/]
    },
    resolve: {
      tsconfigPaths: true,
    }
  }
});


