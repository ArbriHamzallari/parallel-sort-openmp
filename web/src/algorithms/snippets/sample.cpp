// Sample sort (PSRS) — Parallel Sorting by Regular Sampling
#include <vector>
#include <algorithm>

void sample_sort(std::vector<int>& data, int p) {
    size_t n = data.size();
    if (p < 1) p = 1;
    if (n < 2 || p == 1) { std::sort(data.begin(), data.end()); return; }
    if ((size_t)p > n) p = (int)n;

    std::vector<size_t> start(p + 1);
    for (int i = 0; i <= p; ++i) start[i] = n * (size_t)i / p;

    for (int i = 0; i < p; ++i)
        std::sort(data.begin() + start[i], data.begin() + start[i + 1]);

    std::vector<int> samples;
    samples.reserve((size_t)p * p);
    for (int i = 0; i < p; ++i) {
        size_t len = start[i + 1] - start[i];
        for (int s = 0; s < p; ++s) {
            size_t idx = start[i] + (len * (size_t)s) / p;
            if (idx < start[i + 1]) samples.push_back(data[idx]);
        }
    }

    std::sort(samples.begin(), samples.end());
    std::vector<int> pivots(p - 1);
    for (int i = 1; i < p; ++i)
        pivots[i - 1] = samples[(samples.size() * (size_t)i) / p];

    std::vector<std::vector<size_t>> bnd(p, std::vector<size_t>(p + 1));
    for (int i = 0; i < p; ++i) {
        bnd[i][0] = start[i];
        for (int c = 0; c < p - 1; ++c) {
            auto it = std::upper_bound(data.begin() + start[i],
                                       data.begin() + start[i + 1], pivots[c]);
            bnd[i][c + 1] = (size_t)(it - data.begin());
        }
        bnd[i][p] = start[i + 1];
    }

    std::vector<size_t> classStart(p + 1, 0);
    for (int c = 0; c < p; ++c) {
        size_t sz = 0;
        for (int i = 0; i < p; ++i) sz += bnd[i][c + 1] - bnd[i][c];
        classStart[c + 1] = classStart[c] + sz;
    }

    std::vector<int> out(n);
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
