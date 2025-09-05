import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
<<<<<<< HEAD
  ...compat.extends("next/core-web-vitals"),
=======
  ...compat.extends("next/core-web-vitals", "next/typescript"),
>>>>>>> 7b549a7c02875b8c09f0b8b8ceaea02e4470cf77
];

export default eslintConfig;
