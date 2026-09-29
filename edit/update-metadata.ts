import {
    IndentationText,
    Node,
    Project,
    QuoteKind,
    SourceFile,
    SyntaxKind,
    type ArrowFunction,
    type FunctionDeclaration,
    type ObjectLiteralExpression,
} from "ts-morph"

import { getRootLayout } from "./find-files"
import { addRobots as addRobotsTxt } from './add-robots'
const robotsValue = `{
    index: false,
    follow: false,
    noimageindex: true,
    googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
    },
}`

async function createSourceFiles() {
    const project = new Project({
        manipulationSettings: {
            indentationText: IndentationText.FourSpaces,
            quoteKind: QuoteKind.Double,
            useTrailingCommas: true,
        },
    })

    const { rootLayoutFilePath, inSrc } = await getRootLayout()

    if (!rootLayoutFilePath) {
        throw new Error("Root Layout not found")
    }

    return { layoutSourceFile: project.addSourceFileAtPath(rootLayoutFilePath), inSrc }
}

function addRobots(object: ObjectLiteralExpression) {
    const existing = object.getProperty("robots")

    if (existing) {
        existing.replaceWithText(`robots: ${robotsValue}`)
        return
    }

    object.addPropertyAssignment({
        name: "robots",
        initializer: robotsValue,
    })
}

function updateFunctionReturn(
    fn: FunctionDeclaration | ArrowFunction,
) {
    // Handles:
    //
    // const generateMetadata = () => ({
    //     title: "..."
    // })
    //
    // i.e. an expression-bodied arrow function.
    if (Node.isArrowFunction(fn)) {
        const body = fn.getBody()

        if (Node.isObjectLiteralExpression(body)) {
            addRobots(body)
            return true
        }
    }

    const returns = fn.getDescendantsOfKind(
        SyntaxKind.ReturnStatement,
    )

    const metadataReturn = returns.find(returnStatement => {
        const expression = returnStatement.getExpression()

        return (
            Node.isObjectLiteralExpression(expression) ||
            Node.isIdentifier(expression)
        )
    })

    if (!metadataReturn) {
        return false
    }

    const expression = metadataReturn.getExpression()

    if (!expression) {
        return false
    }

    // return {
    //     title: "..."
    // }
    if (Node.isObjectLiteralExpression(expression)) {
        addRobots(expression)
        return true
    }

    // return metadata
    //
    // becomes:
    //
    // return {
    //     ...metadata,
    //     robots: {...}
    // }
    if (Node.isIdentifier(expression)) {
        expression.replaceWithText(`{
            ...${expression.getText()},
            robots: ${robotsValue}
        }`)

        return true
    }

    return false
}

const updateLayouts = async (layoutFile: SourceFile) => {

    // ─────────────────────────────────────────────
    // 1. export const metadata = { ... }
    // ─────────────────────────────────────────────

    const metadata = layoutFile.getVariableDeclaration("metadata")

    if (metadata) {
        const initializer = metadata.getInitializer()

        if (Node.isObjectLiteralExpression(initializer)) {
            addRobots(initializer)

            await layoutFile.save()
            return
        }
    }

    // ─────────────────────────────────────────────
    // 2. function generateMetadata() { ... }
    // ─────────────────────────────────────────────

    const functionDeclaration =
        layoutFile.getFunction("generateMetadata")

    if (functionDeclaration) {
        if (updateFunctionReturn(functionDeclaration)) {
            await layoutFile.save()
            return
        }
    }

    // ─────────────────────────────────────────────
    // 3. const generateMetadata = () => { ... }
    // ─────────────────────────────────────────────

    const generateMetadataVariable =
        layoutFile.getVariableDeclaration("generateMetadata")

    if (generateMetadataVariable) {
        const initializer =
            generateMetadataVariable.getInitializer()

        if (
            initializer &&
            Node.isArrowFunction(initializer)
        ) {
            if (updateFunctionReturn(initializer)) {
                await layoutFile.save()
                return
            }
        }
    }

    throw new Error(
        "Could not find a supported metadata declaration.",
    )
    
}

export const updateMetadata = async () => {

    const { layoutSourceFile, inSrc } = await createSourceFiles();

    await updateLayouts(layoutSourceFile);

    await addRobotsTxt(inSrc);

    console.log('Updated 2 files.')

    
}