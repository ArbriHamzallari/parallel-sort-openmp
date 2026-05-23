/* Sample sort (PSRS) — reference without OpenMP */
#include <stdlib.h>
#include <string.h>

static int cmp_int(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

void sample_sort(int *data, size_t n, int p) {
    if (n < 2 || p < 2) {
        qsort(data, n, sizeof(int), cmp_int);
        return;
    }
    if ((size_t)p > n) p = (int)n;

    size_t *start = malloc((size_t)(p + 1) * sizeof(size_t));
    for (int i = 0; i <= p; ++i) start[i] = n * (size_t)i / (size_t)p;

    for (int i = 0; i < p; ++i)
        qsort(data + start[i], start[i + 1] - start[i], sizeof(int), cmp_int);

    int *samples = malloc((size_t)p * (size_t)p * sizeof(int));
    size_t sc = 0;
    for (int i = 0; i < p; ++i) {
        size_t len = start[i + 1] - start[i];
        for (int s = 0; s < p; ++s) {
            size_t idx = start[i] + (len * (size_t)s) / (size_t)p;
            if (idx < start[i + 1]) samples[sc++] = data[idx];
        }
    }
    qsort(samples, sc, sizeof(int), cmp_int);

    int *pivots = malloc((size_t)(p - 1) * sizeof(int));
    for (int i = 1; i < p; ++i)
        pivots[i - 1] = samples[(sc * (size_t)i) / (size_t)p];

    int *out = malloc(n * sizeof(int));
    size_t write = 0;
    for (int c = 0; c < p; ++c) {
        int *bucket = malloc(n * sizeof(int));
        size_t bc = 0;
        for (size_t i = 0; i < n; ++i) {
            int b = 0;
            while (b < p - 1 && data[i] > pivots[b]) ++b;
            if (b == c) bucket[bc++] = data[i];
        }
        qsort(bucket, bc, sizeof(int), cmp_int);
        memcpy(out + write, bucket, bc * sizeof(int));
        write += bc;
        free(bucket);
    }
    memcpy(data, out, n * sizeof(int));

    free(start);
    free(samples);
    free(pivots);
    free(out);
}
