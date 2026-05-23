"""Bitonic sort — pad to next power of two with a large sentinel."""

def bitonic_sort(data: list[int]) -> list[int]:
    n = len(data)
    if n < 2:
        return data[:]
    m = 1
    while m < n:
        m <<= 1
    a = data[:] + [2**31 - 1] * (m - n)
    _bitonic_pow2(a, m)
    return a[:n]


def _bitonic_pow2(a: list[int], n: int) -> None:
    k = 2
    while k <= n:
        j = k >> 1
        while j > 0:
            for i in range(n):
                l = i ^ j
                if l <= i:
                    continue
                asc = (i & k) == 0
                if (asc and a[i] > a[l]) or (not asc and a[i] < a[l]):
                    a[i], a[l] = a[l], a[i]
            j >>= 1
        k <<= 1
