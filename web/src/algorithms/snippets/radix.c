/* LSD radix sort — base 256, 4 passes (32-bit keys) */
#include <stdint.h>
#include <string.h>

void radix_sort(int *data, size_t n) {
    if (n < 2) return;
    uint32_t *a = malloc(n * sizeof(uint32_t));
    uint32_t *b = malloc(n * sizeof(uint32_t));
    for (size_t i = 0; i < n; ++i)
        a[i] = (uint32_t)data[i] ^ 0x80000000u;
    for (int pass = 0; pass < 4; ++pass) {
        int shift = pass * 8;
        size_t count[256] = {0};
        for (size_t i = 0; i < n; ++i)
            count[(a[i] >> shift) & 0xFF]++;
        size_t off[256], sum = 0;
        for (int d = 0; d < 256; ++d) {
            off[d] = sum;
            sum += count[d];
        }
        for (size_t i = 0; i < n; ++i) {
            uint32_t d = (a[i] >> shift) & 0xFF;
            b[off[d]++] = a[i];
        }
        uint32_t *t = a;
        a = b;
        b = t;
    }
    for (size_t i = 0; i < n; ++i)
        data[i] = (int)(a[i] ^ 0x80000000u);
    free(a);
    free(b);
}
