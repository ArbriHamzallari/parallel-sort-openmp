/* Bitonic sort — pad to power of two with INT32_MAX sentinels */
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

static void bitonic_pow2(int *a, size_t n) {
    for (size_t k = 2; k <= n; k <<= 1) {
        for (size_t j = k >> 1; j > 0; j >>= 1) {
            for (size_t i = 0; i < n; ++i) {
                size_t l = i ^ j;
                if (l > i) {
                    int asc = ((i & k) == 0);
                    if ((asc && a[i] > a[l]) || (!asc && a[i] < a[l])) {
                        int t = a[i];
                        a[i] = a[l];
                        a[l] = t;
                    }
                }
            }
        }
    }
}

void bitonic_sort(int *data, size_t n) {
    if (n < 2) return;
    size_t m = 1;
    while (m < n) m <<= 1;
    if (m == n) {
        bitonic_pow2(data, n);
        return;
    }
    int *buf = malloc(m * sizeof(int));
    for (size_t i = 0; i < m; ++i) buf[i] = (i < n) ? data[i] : 2147483647;
    bitonic_pow2(buf, m);
    memcpy(data, buf, n * sizeof(int));
    free(buf);
}
