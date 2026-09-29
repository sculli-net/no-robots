import pc from "picocolors"
import { siteMode, siteUrl } from "@/lib/config"

if (siteMode === "preview") {
    console.warn(pc.bgYellow("[WARN]:") + " This is a preview deployment.")
    console.log("Building for " + pc.blue(`${siteUrl}`))
} else if (siteMode === "production") {
    
    console.log(pc.green("Production build"));
    console.log("Building for " + pc.blue(`${siteUrl}`))
}