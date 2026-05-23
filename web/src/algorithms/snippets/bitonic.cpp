// Bitonic sort — requires n = 2^k (pad with sentinels for arbitrary sizes)
#include <vector>
#include <algorithm>
#include <cstdint>

void bitonic_pow2(int* a, size_t n) {
    for (size_t k = 2; k <= n; k <<= 1) {
        for (size_t j = k >> 1; j > 0; j >>= 1) {
            for (size_t i = 0; i < n; ++i) {
                size_t l = i ^ j;
                if (l > i) {
                    bool asc = (i & k) == 0;
                    if ((asc && a[i] > a[l]) || (!asc && a[i] < a[l]))
                        std::swap(a[i], a[l]);
                }
            }
        }
    }
}

void bitonic_sort(std::vector<int>& data) {
    size_t n = data.size();
    if (n < 2) return;
    size_t m = 1;
    while (m < n) m <<= 1;
    if (m == n) {
        bitonic_pow2(data.data(), n);
    } else {
        std::vector<int> buf(m, INT32_MAX);
        std::copy(data.begin(), data.end(), buf.begin());
        bitonic_pow2(buf.data(), m);
        std::copy(buf.begin(), buf.begin() + n, data.begin());
    }
}
