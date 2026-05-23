# Parallel Sorting Algorithms — OpenMP Mini-Project

A hands-on extension for our **Parallel Programming** presentation on parallel
sorting. Three classic parallel sorts implemented in C++ with OpenMP, a
benchmark harness that measures real speedup on multi-core hardware, and an
interactive visualizer for the live demo.

| Algorithm | Type | Work | Parallel idea |
|-----------|------|------|---------------|
| **Bitonic sort** | comparison network | `O(n log²n)` | every comparator in a stage is independent |
| **Sample sort (PSRS)** | partition-based | `O(n log n)` | data split by global splitters, buckets sorted independently |
| **Radix sort (LSD)** | non-comparison | `O(d·n)` | private per-thread histograms, parallel scatter |

---

## Quick start

```bash
make            # build the ./psort benchmark binary
make test       # verify all three algorithms are correct (random + edge sizes)
make bench      # run the full sweep on YOUR machine and regenerate the charts
```

Open the **web visualizer** (see [`web/README.md`](web/README.md)) — run locally
with `cd web && python3 -m http.server 8000`, or deploy the `web/` folder to
Vercel or GitHub Pages. Then run a single benchmark by hand if you like:

```bash
./psort --algo radix --n 4194304 --threads 8 --reps 5 --verify
# algo=radix  n=4194304  threads=8  median=0.0123s  [OK]
```

CLI flags: `--algo bitonic|sample|radix|std`, `--n <count>`, `--threads <p>`,
`--reps <r>`, `--verify`, `--csv`.

---

## Important: where the speedup numbers come from

Correctness is hardware-independent, but **speedup must be measured on your own
multi-core laptop**. Run `make bench` there and the charts regenerate from your
real data:

- `results/speedup_vs_threads.png` — speedup vs thread count, against the ideal linear line
- `results/efficiency_vs_threads.png` — parallel efficiency (speedup ÷ threads)
- `results/time_vs_size.png` — runtime vs input size for all three + `std::sort`

The included `results/time_vs_size.png` is a **single-thread** sample (the build
machine had one core). It is still informative: it shows radix sort's linear,
non-comparison advantage and bitonic's heavier comparison workload before any
parallelism is added.

---

## The three algorithms

**Bitonic sort** (`src/bitonic_sort.hpp`). A *sorting network*: the sequence of
compare-exchange operations is fixed and data-independent. The outer `k` loop
builds ever-larger bitonic sequences; the inner `j` loop merges them. Within one
`(k, j)` stage the compared pairs `(i, i^j)` are disjoint, so the inner loop is a
single `#pragma omp parallel for`. Arbitrary input sizes are padded up to the
next power of two with `INT_MAX` sentinels and trimmed afterwards.

**Sample sort / PSRS** (`src/sample_sort.hpp`). *Parallel Sorting by Regular
Sampling.* Each thread sorts a chunk locally, contributes regularly-spaced
samples, and a shared set of `p−1` pivots is chosen from the sorted samples.
Regular sampling bounds every bucket to at most ~`2n/p` elements, so the load
stays balanced for any input distribution. Each thread then owns one bucket and
sorts it; concatenation gives the final order.

**Radix sort / LSD** (`src/radix_sort.hpp`). Non-comparison: sorts by 8-bit
digits, least-significant first (4 passes for 32-bit ints). Each pass is a
parallel counting sort — threads build private 256-bucket histograms, the
histograms are combined digit-major/thread-minor into disjoint output offsets
(which also keeps the pass *stable*), and each thread scatters its chunk
independently. Signed integers are mapped to an order-preserving unsigned key by
flipping the sign bit.

---

## The web visualizer (`web/`)

Interactive demo for presentations: **Bitonic**, **Sample (PSRS)**, and **Radix**
sorts (plus classic comparison sorts). Animated bars, procedural sound, complexity
tables, and copy-pasteable implementations in C/C++/Java/JS/Python. For bitonic
sort, phase banners show `(k, j)` stages that map directly to the loops in
`bitonic_sort.hpp`.

---

## Demo talking points

1. **Open the web app → Bitonic Sort, shuffle, then Step or Play.** Point out that
   comparators in each stage have *no data dependency on each other* — that is why
   the stage parallelizes.
2. **Tie it to the code.** The `(k, j)` banner is literally the two outer loops
   in `bitonic_sort.hpp`; the parallel `for` is over the comparators shown.
3. **Show `time_vs_size.png`.** Radix is fastest even on one thread (linear, no
   comparisons); bitonic is slowest (it does `O(n log²n)` work). Different
   algorithms win for different reasons.
4. **Show your `speedup_vs_threads.png`** (from `make bench` on your laptop) to
   demonstrate the actual parallel speedup and discuss why no line reaches the
   ideal — Amdahl's law, memory bandwidth, and OpenMP overhead.

---

## Layout & requirements

```
parallel-sort/
├── Makefile
├── README.md
├── web/                           # interactive visualizer (deploy this)
├── src/
│   ├── common.hpp                 # data generation, verification, timing
│   ├── bitonic_sort.hpp
│   ├── sample_sort.hpp
│   ├── radix_sort.hpp
│   └── main.cpp                   # benchmark driver / CLI
├── bench/
│   ├── run_benchmarks.sh          # sweeps threads × size, writes results/*.csv
│   └── plot.py                    # CSV → presentation-ready PNG charts
└── results/                       # CSVs + charts (regenerated by `make bench`)
```

Requires a C++17 compiler with OpenMP and, for the charts, Python 3 with
matplotlib (`pip install matplotlib`).

**Linux:** GCC has OpenMP built in — just `make`.

**macOS:** the default `g++` is Apple clang and needs the OpenMP runtime once:

```bash
brew install libomp     # one-time
make                    # the Makefile auto-detects macOS and links libomp
```

The Makefile uses `-march=native` on Linux only (omitted on macOS for
portability); drop it if you hit issues on an older or shared machine.
