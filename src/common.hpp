// common.hpp -- shared helpers for the parallel sorting mini-project
#pragma once
#include <vector>
#include <random>
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <string>

// ---- timing -------------------------------------------------------------
using Clock = std::chrono::high_resolution_clock;

inline double seconds_since(Clock::time_point t0) {
    return std::chrono::duration<double>(Clock::now() - t0).count();
}

// ---- data generation ----------------------------------------------------
// Reproducible random int data. seed fixed so every run sorts the same input.
inline std::vector<int> make_random(size_t n, unsigned seed = 12345) {
    std::vector<int> v(n);
    std::mt19937 gen(seed);
    std::uniform_int_distribution<int> dist(INT32_MIN, INT32_MAX);
    for (size_t i = 0; i < n; ++i) v[i] = dist(gen);
    return v;
}

// ---- verification -------------------------------------------------------
// Returns true if `v` is the correctly sorted permutation of `original`.
inline bool verify_sorted(const std::vector<int>& v,
                          const std::vector<int>& original) {
    if (v.size() != original.size()) return false;
    if (!std::is_sorted(v.begin(), v.end())) return false;
    // confirm it is a permutation of the input (same multiset)
    std::vector<int> a = v, b = original;
    std::sort(b.begin(), b.end());
    return a == b;
}
