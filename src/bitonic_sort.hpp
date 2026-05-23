// bitonic_sort.hpp -- parallel bitonic sort (OpenMP)
//
// Bitonic sort is a SORTING NETWORK: a fixed sequence of compare-exchange
// operations whose pattern does not depend on the data. That property is
// exactly what makes it attractive for parallel hardware -- every compare
// inside one phase is independent, so a whole phase runs in parallel.
//
// Complexity: O(n log^2 n) comparisons (more work than an optimal O(n log n)
// sort), but the work is embarrassingly parallel and branch-free, which is
// why it shines on GPUs/SIMD and as a teaching example of a network sort.
//
// This implementation requires n to be a power of two. The wrapper below
// pads arbitrary input up to the next power of two with INT32_MAX sentinels
// (which sink to the top under ascending order) and trims them afterwards.
#pragma once
#include <vector>
#include <algorithm>
#include <cstdint>
#include <omp.h>

namespace parallelsort {

// In-place bitonic sort, ascending. Requires n == 2^k.
inline void bitonic_pow2(int* a, size_t n, int threads) {
    // k = size of the bitonic sequences being merged, doubles each outer step
    for (size_t k = 2; k <= n; k <<= 1) {
        // j = distance between the two elements compared, halves each step
        for (size_t j = k >> 1; j > 0; j >>= 1) {
            // Within a (k, j) phase the compared pairs (i, i^j) are disjoint,
            // so this loop is safe to run fully in parallel.
            #pragma omp parallel for num_threads(threads) schedule(static)
            for (long long i = 0; i < (long long)n; ++i) {
                size_t l = (size_t)i ^ j;
                if (l > (size_t)i) {
                    // ascending block when the k-bit of i is 0, else descending
                    bool ascending = ((size_t)i & k) == 0;
                    if ((ascending  && a[i] > a[l]) ||
                        (!ascending && a[i] < a[l])) {
                        std::swap(a[i], a[l]);
                    }
                }
            }
        }
    }
}

inline size_t next_pow2(size_t n) {
    size_t p = 1;
    while (p < n) p <<= 1;
    return p;
}

// Public entry point: handles arbitrary sizes via padding.
inline void bitonic_sort(std::vector<int>& data, int threads) {
    size_t n = data.size();
    if (n < 2) return;
    size_t m = next_pow2(n);
    if (m == n) {
        bitonic_pow2(data.data(), n, threads);
    } else {
        std::vector<int> buf(m, INT32_MAX);            // pad with sentinels
        std::copy(data.begin(), data.end(), buf.begin());
        bitonic_pow2(buf.data(), m, threads);
        std::copy(buf.begin(), buf.begin() + n, data.begin()); // trim padding
    }
}

} // namespace psort
