# Deployment

Target: GitHub Pages, existing `main` / `docs` configuration in `Duc-Nguyen98/ScannerHNApp`.

Final deployment commit: `74336a0807ee94cf5f4900911254eb4e34e26bfa`.

Initial preview deployment: `8f62ce13525fecf799b1d265c2fe52d1a88714ce`. Final follow-up changes only the review Home-module wait ceiling and catalog build ID.

Base commit / previous public version: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`.

Build: `final-2e8357d7f52d`. Packaged paths are restricted to `docs/review/` (247 files). No original gallery, existing application path, workflow, secret, repository setting, or branch protection was changed. Remote main was updated fast-forward with `force=false` after the API reported no branch protection or rulesets. The authorized connector belongs to the repository owner; the separate CLI account is read-only and was used only for status reads.

App: https://duc-nguyen98.github.io/ScannerHNApp/review/?view=app

Review: https://duc-nguyen98.github.io/ScannerHNApp/review/?view=review&panel=P01.S01&motion=auto

Pages completed the initial build at `2026-10-01T00:38:02Z` and final build at `2026-10-01T00:51:44Z`. Anonymous-browser verification times/results are recorded in `PUBLIC_VERIFICATION.json`. One initial cold-load timeout was fixed and rechecked rather than hidden.

## Reproduce and Verify

```powershell
node scripts/build_final_preview.cjs
node scripts/check_final_preview.cjs
node scripts/check_final_controls.cjs
node scripts/check_final_journeys.cjs auto
node --test tests/*.mjs tests/*.cjs
```

For public checks set `FINAL_URL=https://duc-nguyen98.github.io/ScannerHNApp/review/` and distinct `FINAL_RUN` / `FINAL_PHASE` evidence destinations. Browser contexts are fresh and have no GitHub sign-in. The app itself uses published demo credentials.

Only runtime sources/assets and library licenses are deployed. Local evidence, browser traces, tests, reports, publish payloads, node_modules and machine paths are not included. Binary blobs were hash-verified before tree creation. `BUILD_MANIFEST.json` contains source and transform provenance; public tree metadata is recorded separately.

## Rollback

Do not force-reset main. Revert `74336a0807ee94cf5f4900911254eb4e34e26bfa` with a new commit to restore the first preview build. To remove this preview entirely, also revert the initial deployment `8f62ce13525fecf799b1d265c2fe52d1a88714ce` (normal protected-branch PR if rules change), then let Pages rebuild. Only review paths are affected; the original gallery is retained. Future preview releases should likewise preserve gallery paths and verify the published catalog build ID.

Local source remains the preserved working copy based on the M24 commit plus uncommitted P01-P24 implementation. Publication was committed through the authorized GitHub connector; no local reset/checkout or unrelated-file staging was performed.
