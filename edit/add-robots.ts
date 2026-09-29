
import { access, readdir, writeFile, readFile } from "fs/promises";
import { join } from "path"

const robotsTxt = `import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}`



export const addRobots = async (inSrc: boolean = true) => {
    
    const filePath = `${inSrc ? 'src/': ''}app/robots.ts`
    // const robotsExists = await readdir(`${inSrc ? 'src/': ''}app/robots.ts`, { withFileTypes: true });
    const write = await writeFile(filePath, robotsTxt)
    return write

}