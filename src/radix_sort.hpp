// radix_sort.hpp -- parallel LSD radix sort (OpenMP)
//
// Radix sort is NOT comparison-based: it sorts by looking at the digits of
// the keys, one group of bits at a time, from least- to most-significant
// (LSD). Each pass is a stable counting sort over an 8-bit digit, so a 32-bit
// integer takes 4 passes. Total work is O(d * n) with d passes -- effectively
// linear in n.
//
// Parallelisation strategy per pass (the classic "parallel counting sort"):
//   1. Split the array into p chunks. Each thread builds a PRIVATE 256-bucket
//      histogram of its chunk (no contention).
//   2. Combine the histograms into global offsets such that thread t's
//      elements of digit d land in a contiguous, non-overlapping region.
//      Iterating digit-major then thread-minor keeps the pass STABLE, which
//      LSD radix sort relies on for correctness.
//   3. Each thread scatters its chunk into the output using its own running
//      offsets -- again fully independent writes.
//
// Signed ints are mapped to an order-preserving unsigned key by flipping the
// sign bit (x ^ 0x80000000), then mapped back at the end.
#pragma once
#include <vector>
#include <cstdint>
#include <algorithm>
#include <omp.h>

namespace parallelsort {

inline void radix_sort(std::vector<int>& data, int p) {
    size_t n = data.size();
    if (n < 2) return;
    if (p < 1) p = 1;

    const int RADIX = 256, PASSES = 4, MASK = 0xFF;

    std::vector<uint32_t> a(n), b(n);
    #pragma omp parallel for num_threads(p) schedule(static)
    for (long long i = 0; i < (long long)n; ++i)
        a[i] = (uint32_t)data[i] ^ 0x80000000u;       // signed -> sortable key

    // Fixed chunk boundaries: independent of how many threads OpenMP actually
    // hands us, so the histogram pass and the scatter pass always agree.
    const int T = (int)std::min<size_t>(p, n);
    std::vector<size_t> cstart(T + 1);
    for (int t = 0; t <= T; ++t) cstart[t] = n * (size_t)t / T;

    for (int pass = 0; pass < PASSES; ++pass) {
        int shift = pass * 8;
        std::vector<std::vector<size_t>> hist(T, std::vector<size_t>(RADIX, 0));

        // 1. private histograms
        #pragma omp parallel for num_threads(T) schedule(static)
        for (int t = 0; t < T; ++t) {
            auto& h = hist[t];
            for (size_t i = cstart[t]; i < cstart[t + 1]; ++i)
                h[(a[i] >> shift) & MASK]++;
        }

        // 2. global offsets: digit-major, thread-minor -> stable & disjoint
        std::vector<std::vector<size_t>> offset(T, std::vector<size_t>(RADIX, 0));
        size_t sum = 0;
        for (int d = 0; d < RADIX; ++d)
            for (int t = 0; t < T; ++t) {
                offset[t][d] = sum;
                sum += hist[t][d];
            }

        // 3. scatter using each thread's private running offsets
        #pragma omp parallel for num_threads(T) schedule(static)
        for (int t = 0; t < T; ++t) {
            size_t off[RADIX];
            for (int d = 0; d < RADIX; ++d) off[d] = offset[t][d];
            for (size_t i = cstart[t]; i < cstart[t + 1]; ++i) {
                uint32_t d = (a[i] >> shift) & MASK;
                b[off[d]++] = a[i];
            }
        }
        a.swap(b);
    }

    #pragma omp parallel for num_threads(p) schedule(static)
    for (long long i = 0; i < (long long)n; ++i)
        data[i] = (int)(a[i] ^ 0x80000000u);           // map back to signed
}

} // namespace psort
