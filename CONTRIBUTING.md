# Contributing

Thanks for helping! Two ways to contribute matter most:

1. **Sign accuracy.** If you are a Bangla Sign Language user or educator and a sign here is wrong or regional, please open an issue. Your correction outranks everything else in this repo.
2. **Code.** Keep decisions in `Assets/Scripts/core/` (pure TypeScript with tests) and presentation in `Assets/Scripts/lens/`.

## Adding a sign
Append an entry to `Assets/Scripts/core/SignLibrary.ts` (id, Bangla, romanisation, English, target curls, hints in both languages). `npm test` checks that every sign has both hints and is distinguishable from every other sign.

## Adding a UI string
Add it to both `EN` and `BN` in `core/Strings.ts` — a test fails if a key or a `{placeholder}` is missing from either language.

## Before opening a PR
```bash
npm install
npm run check
```

Please be kind and assume good intent — this project exists to make a language more welcoming.
