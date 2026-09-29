import { makeEdits } from "../../edit"
import { getRootLayout } from "../../edit/find-files"
// import { updateMetadata } from "../../edit/update-layout"

const run = async () => makeEdits()

run().then(console.log)