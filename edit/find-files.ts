import { access, readdir } from "fs/promises";
import { join } from "path"

async function findFile(
  dir: string,
  filePath: string,
  pattern?: RegExp // set a pattern to prioritise
): Promise<string | null> {
  const candidate = join(dir, filePath);

  // Check `dir/filePath`
  try {
    await access(candidate);
    return candidate;
  } catch {}

  // Otherwise recurse through child directories
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }

  if (pattern) entries = entries.sort((a, b)=> Number(pattern.test(b.name)) - Number(pattern.test(a.name)))

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const result = await findFile(
      join(dir, entry.name),
      filePath,
    );

    if (result) return result;
  }

  return null;
}

export const getRootLayout = async () => {
    // look for the most likely root layout
    // logic needs to be improved for alternative route structures
    const srcLayoutPath = await findFile("src/app", "layout.tsx", /\([^)]*\)/);

    const layoutPath = srcLayoutPath || await findFile("app", "layout.tsx", /\([^)]*\)/);


    return { rootLayoutFilePath: layoutPath, inSrc: Boolean(srcLayoutPath) }

}