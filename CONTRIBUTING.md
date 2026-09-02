# Developing guide

## Running locally

```sh
npm i
npm run dev
```

## Testing

```sh
npm run clean
npm run build
npm run typecheck
npm run lint
npm run test
```

## Deploying

This repository is a security-maintained in-org fork. The package name remains
`@convex-dev/workflow` for compatibility with existing consumers, but npm
publication is owned by `get-convex/workflow`, as recorded in `package.json`.
Do not publish this fork. The release guard requires the package owner's GitHub
Actions repository, explicit opt-in, and npm provenance. It also prevents
release scripts from pushing tags; tags must be created by the protected owner
workflow.

### Building a one-off package

```sh
npm run clean
npm ci
npm pack
```

### Deploying a new version

```sh
npm run release
```

or for alpha release:

```sh
npm run alpha
```

`npm run audit:prod` checks the installable package without development tools.
As of 2026-09-01 it reports zero production advisories. The full development
graph still reports transitive advisories in `@actions/http-client`, `@babel/core`,
`ajv`, `brace-expansion`, `browserslist`, `decode-uri-component`, `flatted`,
`js-yaml`, `minimatch`, `nanoid`, `picomatch`, `postcss`, `query-string`,
`rollup`, `undici`, and `vite`. These packages are not runtime dependencies,
but maintainers must review the full `npm audit` output before any release.
