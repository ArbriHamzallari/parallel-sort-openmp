// sample_sort.hpp -- parallel sample sort via Regular Sampling (PSRS)
//
// PSRS = "Parallel Sorting by Regular Sampling" (Shi & Schaeffer, 1992).
// The idea: instead of a fixed network, pick good SPLITTERS from the data so
// each thread ends up with a contiguous, roughly equal value-range to sort.
// Because splitters are chosen from regularly-spaced samples, every bucket is
// guaranteed to hold at most ~2n/p elements -- that bound is what keeps the
// load balanced regardless of the input distribution.
//
// Five phases:
//   1. Split into p chunks; each thread sorts its chunk locally.
//   2. Each chunk contributes p regularly-spaced samples.
//   3. Sort the p*p samples; pick p-1 global pivots.
//   4. Each (sorted) chunk is partitioned into p classes by the pivots.
//   5. Thread c gathers class c from every chunk and sorts it. The
//      concatenation of the classes is the fully sorted array.
#pragma once
#include <vector>
#include <algorithm>
#include <omp.h>

namespace parallelsort {

inline void sample_sort(std::vector<int>& data, int p) {
    size_t n = data.size();
    if (p < 1) p = 1;
    if (n < 2 || p == 1) { std::sort(data.begin(), data.end()); return; }
    if ((size_t)p > n) p = (int)n;               // never more chunks than elems

    // chunk boundaries [start[i], start[i+1])
    std::vector<size_t> start(p + 1);
    for (int i = 0; i <= p; ++i) start[i] = n * (size_t)i / p;

    // --- Phase 1: local sort of each chunk -------------------------------
    #pragma omp parallel for num_threads(p) schedule(static)
    for (int i = 0; i < p; ++i)
        std::sort(data.begin() + start[i], data.begin() + start[i + 1]);

    // --- Phase 2: regular sampling ---------------------------------------
    std::vector<int> samples;
    samples.reserve((size_t)p * p);
    for (int i = 0; i < p; ++i) {
        size_t len = start[i + 1] - start[i];
        for (int s = 0; s < p; ++s) {
            size_t idx = start[i] + (len * (size_t)s) / p;
            if (idx < start[i + 1]) samples.push_back(data[idx]);
        }
    }

    // --- Phase 3: sort samples, choose p-1 pivots ------------------------
    std::sort(samples.begin(), samples.end());
    std::vector<int> pivots(p - 1);
    for (int i = 1; i < p; ++i)
        pivots[i - 1] = samples[(samples.size() * (size_t)i) / p];

    // --- Phase 4: partition each chunk into p classes by pivots ----------
    // bnd[i][c] .. bnd[i][c+1] is the absolute index range of class c in chunk i
    std::vector<std::vector<size_t>> bnd(p, std::vector<size_t>(p + 1));
    #pragma omp parallel for num_threads(p) schedule(static)
    for (int i = 0; i < p; ++i) {
        bnd[i][0] = start[i];
        for (int c = 0; c < p - 1; ++c) {
            auto it = std::upper_bound(data.begin() + start[i],
                                       data.begin() + start[i + 1], pivots[c]);
            bnd[i][c + 1] = (size_t)(it - data.begin());
        }
        bnd[i][p] = start[i + 1];
    }

    // class sizes -> output offsets
    std::vector<size_t> classStart(p + 1, 0);
    for (int c = 0; c < p; ++c) {
        size_t sz = 0;
        for (int i = 0; i < p; ++i) sz += bnd[i][c + 1] - bnd[i][c];
        classStart[c + 1] = classStart[c] + sz;
    }

    // --- Phase 5: each thread gathers + sorts its class ------------------
    std::vector<int> out(n);
    #pragma omp parallel for num_threads(p) schedule(static)
    for (int c = 0; c < p; ++c) {
        size_t pos = classStart[c];
        size_t begin = pos;
        for (int i = 0; i < p; ++i)
            for (size_t k = bnd[i][c]; k < bnd[i][c + 1]; ++k)
                out[pos++] = data[k];
        std::sort(out.begin() + begin, out.begin() + pos);
    }
    data.swap(out);
}

} // namespace psort
