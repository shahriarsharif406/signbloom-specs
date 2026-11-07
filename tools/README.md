# tools/

## derive_curls.py — real BdSL signs from open data

Turns the **BdSL47** dataset into a Bangla Sign Language pack, using the same curl math as `core/HandPose.ts`.

```bash
python3 tools/derive_curls.py --selftest              # checks the math against known hands
python3 tools/derive_curls.py /path/to/BdSL47/digits  # prints medians, confusable pairs, SignLibrary entries
```

1. Download BdSL47 from <https://data.mendeley.com/datasets/pbb3w3f92y> (the digits folder is enough).
2. Run the script on that folder.
3. Paste the printed entries into `BANGLA_STARTER_SIGNS` in `Assets/Scripts/core/SignLibrary.ts`, add hints, run `npm test` (it re-checks that all signs are mutually distinct).

The script also warns when two digits cannot be told apart by finger curl alone — keep one of the pair or extend the features.

**Data credit (if you use it):** Rayeed, S. M. et al., *BdSL47: A Complete Depth-based Bangla Sign Alphabet and Digit Dataset*, Mendeley Data, V3, doi:10.17632/pbb3w3f92y.3 — CC BY 4.0. Cite it in the README and submission if the library is built from it.

**Caveat:** the dataset normalises x and y per axis and standardises z, which slightly distorts angles. Confirm results with a Bangla Sign Language educator.
