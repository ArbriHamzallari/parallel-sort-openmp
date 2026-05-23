"""LSD radix sort, base 10."""

def radix_sort(data: list[int]) -> list[int]:
    n = len(data)
    if n < 2:
        return data[:]
    a = data[:]
    b = [0] * n
    max_v = max(a)
    passes = max(1, len(str(max_v)))
    for p in range(passes):
        count = [0] * 10
        for v in a:
            count[_digit(v, p)] += 1
        off = [0] * 10
        s = 0
        for d in range(10):
            off[d] = s
            s += count[d]
        run = off[:]
        for v in a:
            d = _digit(v, p)
            b[run[d]] = v
            run[d] += 1
        a, b = b, [0] * n
    return a


def _digit(v: int, p: int) -> int:
    return (v // (10**p)) % 10
