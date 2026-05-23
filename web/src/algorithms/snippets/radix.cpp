// LSD radix sort — 8-bit digits, 4 passes (32-bit keys)
#include <vector>
#include <cstdint>
#include <algorithm>

void radix_sort(std::vector<int>& data, int threads = 1) {
    size_t n = data.size();
    if (n < 2) return;
    const int RADIX = 256, PASSES = 4, MASK = 0xFF;

    std::vector<uint32_t> a(n), b(n);
    for (size_t i = 0; i < n; ++i)
        a[i] = (uint32_t)data[i] ^ 0x80000000u;

    for (int pass = 0; pass < PASSES; ++pass) {
        int shift = pass * 8;
        std::vector<size_t> count(RADIX, 0);
        for (size_t i = 0; i < n; ++i)
            count[(a[i] >> shift) & MASK]++;

        std::vector<size_t> offset(RADIX, 0);
        size_t sum = 0;
        for (int d = 0; d < RADIX; ++d) {
            offset[d] = sum;
            sum += count[d];
        }

        for (size_t i = 0; i < n; ++i) {
            uint32_t d = (a[i] >> shift) & MASK;
            b[offset[d]++] = a[i];
        }
        a.swap(b);
    }

    for (size_t i = 0; i < n; ++i)
        data[i] = (int)(a[i] ^ 0x80000000u);
}
