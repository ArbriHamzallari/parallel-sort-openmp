"""Sample sort (PSRS)."""

def sample_sort(data: list[int], p: int = 4) -> list[int]:
    n = len(data)
    if n < 2 or p == 1:
        return sorted(data)
    if p > n:
        p = n
    a = data[:]
    start = [n * i // p for i in range(p + 1)]
    for i in range(p):
        seg = sorted(a[start[i] : start[i + 1]])
        a[start[i] : start[i + 1]] = seg
    samples = []
    for i in range(p):
        length = start[i + 1] - start[i]
        for s in range(p):
            idx = start[i] + (length * s) // p
            if idx < start[i + 1]:
                samples.append(a[idx])
    samples.sort()
    pivots = [samples[(len(samples) * i) // p] for i in range(1, p)]
    bnd = [[0] * (p + 1) for _ in range(p)]
    for i in range(p):
        bnd[i][0] = start[i]
        for c in range(p - 1):
            k = start[i]
            while k < start[i + 1] and a[k] <= pivots[c]:
                k += 1
            bnd[i][c + 1] = k
        bnd[i][p] = start[i + 1]
    class_start = [0]
    for c in range(p):
        sz = sum(bnd[i][c + 1] - bnd[i][c] for i in range(p))
        class_start.append(class_start[-1] + sz)
    out = [0] * n
    for c in range(p):
        bucket = []
        for i in range(p):
            for k in range(bnd[i][c], bnd[i][c + 1]):
                bucket.append(a[k])
        bucket.sort()
        pos = class_start[c]
        for v in bucket:
            out[pos] = v
            pos += 1
    return out
