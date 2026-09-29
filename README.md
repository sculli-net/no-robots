## No Robots

A quick script to add a templated metadata flag to your site for preview builds to stop web-crawlers until you are ready to publish.

Run in your nextjs app to quickly create a robots.txt that disables all crawlers.
When your site is ready for production, change the flag to "production" to enable robots again.

---

> [!WARNING]
> This package is just a rough implementation, with the goal to expand functionality later.
> As it sits, 'no-robots' is ideally used straight after project initialization. It may not fit your project setup and could overwrite your robots or metadata setup.
> Please read below for conditions that this rough version targets.

*node*
``` bash
npx no-robots-next
```

*pnpm*
``` bash
pnx no-robots-next
```


### Conditions
As this is an initial implementation - current functionality targets a specific setup. Deviation from this may lead to errors. Use with caution.
- Next.js, app router, ^15.* - bootstrapped with create-next-app
- Root layout.tsx file in src/app/ or app/
- No conditional metadata attributes (i.e. the package expects an object literal to be returned from any existing metadata declarations)
- Typescript - using .tsx and not .ts or .jsx for route files.


Functionality will be expanded gradually but for now this tool will stop web crawlers instantly seeing a next.js deployment before you are ready.