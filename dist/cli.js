#!/usr/bin/env node

// edit/index.ts
import pc from "picocolors";
import prompts from "prompts";

// edit/update-metadata.ts
import {
  IndentationText,
  Node,
  Project,
  QuoteKind,
  SyntaxKind
} from "ts-morph";

// edit/find-files.ts
import { access, readdir } from "fs/promises";
import { join } from "path";
async function findFile(dir, filePath, pattern) {
  const candidate = join(dir, filePath);
  try {
    await access(candidate);
    return candidate;
  } catch {
  }
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  if (pattern) entries = entries.sort((a, b) => Number(pattern.test(b.name)) - Number(pattern.test(a.name)));
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const result = await findFile(
      join(dir, entry.name),
      filePath
    );
    if (result) return result;
  }
  return null;
}
var getRootLayout = async () => {
  const srcLayoutPath = await findFile("src/app", "layout.tsx", /\([^)]*\)/);
  const layoutPath = srcLayoutPath || await findFile("app", "layout.tsx", /\([^)]*\)/);
  return { rootLayoutFilePath: layoutPath, inSrc: Boolean(srcLayoutPath) };
};

// edit/add-robots.ts
import { writeFile } from "fs/promises";
var robotsTxt = `import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}`;
var addRobots = async (inSrc = true) => {
  const filePath = `${inSrc ? "src/" : ""}app/robots.ts`;
  const write = await writeFile(filePath, robotsTxt);
  return write;
};

// edit/update-metadata.ts
var robotsValue = `{
    index: false,
    follow: false,
    noimageindex: true,
    googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
    },
}`;
async function createSourceFiles() {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.FourSpaces,
      quoteKind: QuoteKind.Double,
      useTrailingCommas: true
    }
  });
  const { rootLayoutFilePath, inSrc } = await getRootLayout();
  if (!rootLayoutFilePath) {
    throw new Error("Root Layout not found");
  }
  return { layoutSourceFile: project.addSourceFileAtPath(rootLayoutFilePath), inSrc };
}
function addRobots2(object) {
  const existing = object.getProperty("robots");
  if (existing) {
    existing.replaceWithText(`robots: ${robotsValue}`);
    return;
  }
  object.addPropertyAssignment({
    name: "robots",
    initializer: robotsValue
  });
}
function updateFunctionReturn(fn) {
  if (Node.isArrowFunction(fn)) {
    const body = fn.getBody();
    if (Node.isObjectLiteralExpression(body)) {
      addRobots2(body);
      return true;
    }
  }
  const returns = fn.getDescendantsOfKind(
    SyntaxKind.ReturnStatement
  );
  const metadataReturn = returns.find((returnStatement) => {
    const expression2 = returnStatement.getExpression();
    return Node.isObjectLiteralExpression(expression2) || Node.isIdentifier(expression2);
  });
  if (!metadataReturn) {
    return false;
  }
  const expression = metadataReturn.getExpression();
  if (!expression) {
    return false;
  }
  if (Node.isObjectLiteralExpression(expression)) {
    addRobots2(expression);
    return true;
  }
  if (Node.isIdentifier(expression)) {
    expression.replaceWithText(`{
            ...${expression.getText()},
            robots: ${robotsValue}
        }`);
    return true;
  }
  return false;
}
var updateLayouts = async (layoutFile) => {
  const metadata = layoutFile.getVariableDeclaration("metadata");
  if (metadata) {
    const initializer = metadata.getInitializer();
    if (Node.isObjectLiteralExpression(initializer)) {
      addRobots2(initializer);
      await layoutFile.save();
      return;
    }
  }
  const functionDeclaration = layoutFile.getFunction("generateMetadata");
  if (functionDeclaration) {
    if (updateFunctionReturn(functionDeclaration)) {
      await layoutFile.save();
      return;
    }
  }
  const generateMetadataVariable = layoutFile.getVariableDeclaration("generateMetadata");
  if (generateMetadataVariable) {
    const initializer = generateMetadataVariable.getInitializer();
    if (initializer && Node.isArrowFunction(initializer)) {
      if (updateFunctionReturn(initializer)) {
        await layoutFile.save();
        return;
      }
    }
  }
  throw new Error(
    "Could not find a supported metadata declaration."
  );
};
var updateMetadata = async () => {
  const { layoutSourceFile, inSrc } = await createSourceFiles();
  await updateLayouts(layoutSourceFile);
  await addRobots(inSrc);
  console.log("Updated 2 files.");
};

// edit/index.ts
var makeEdits = async () => {
  const { proceed } = await prompts({
    type: "confirm",
    name: "proceed",
    message: `The '${pc.bold(pc.blue(`no-robots`))}' library is currently incomplete and only really helpful immediately after initializing a project.\r
It only works for the next.js app router & will replace your robots.tsx file if you have one.\r
Are you sure you want to continue?`
  });
  if (!proceed) {
    console.log("No files changed.");
    process.exit(1);
  }
  await updateMetadata().then(() => console.log("Written 2 files!"));
};

// edit/cli.ts
makeEdits().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
