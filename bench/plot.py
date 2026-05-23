#!/usr/bin/env python3
"""plot.py -- turn results/*.csv into presentation-ready charts.

Run after the benchmark sweep:
    python3 bench/plot.py

Reads  results/scaling.csv  and  results/sizes.csv
Writes results/speedup_vs_threads.png
       results/efficiency_vs_threads.png
       results/time_vs_size.png
"""
import csv, os, sys
from collections import defaultdict
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(HERE, "results")

# Consistent colors/labels so every chart matches the slides.
STYLE = {
    "bitonic": ("#e4572e", "Bitonic sort"),
    "sample":  ("#2e86ab", "Sample sort (PSRS)"),
    "radix":   ("#3aae3f", "Radix sort (LSD)"),
    "std":     ("#888888", "std::sort (1 core)"),
}
plt.rcParams.update({"figure.dpi": 120, "font.size": 11, "axes.grid": True,
                     "grid.alpha": 0.3, "axes.axisbelow": True})


def read_csv(name):
    path = os.path.join(RES, name)
    if not os.path.exists(path):
        sys.exit(f"Missing {path} -- run bench/run_benchmarks.sh first.")
    with open(path) as f:
        return list(csv.DictReader(f))


def speedup_and_efficiency():
    rows = read_csv("scaling.csv")
    # data[algo][threads] = seconds
    data = defaultdict(dict)
    for r in rows:
        data[r["algo"]][int(r["threads"])] = float(r["seconds"])

    n = rows[0]["n"]
    threadlist = sorted({int(r["threads"]) for r in rows})

    # ---- speedup ----
    plt.figure(figsize=(7, 4.5))
    for algo, series in data.items():
        base = series[min(series)]                       # time at fewest threads
        xs = sorted(series)
        ys = [base / series[p] for p in xs]
        c, lbl = STYLE.get(algo, ("k", algo))
        plt.plot(xs, ys, "o-", color=c, label=lbl, linewidth=2, markersize=5)
    plt.plot(threadlist, threadlist, "k--", alpha=0.5, label="ideal (linear)")
    plt.xlabel("threads"); plt.ylabel("speedup  (T$_1$ / T$_p$)")
    plt.title(f"Parallel speedup vs thread count  (n = {int(n):,})")
    plt.legend(); plt.tight_layout()
    out = os.path.join(RES, "speedup_vs_threads.png")
    plt.savefig(out); plt.close(); print("wrote", out)

    # ---- efficiency ----
    plt.figure(figsize=(7, 4.5))
    for algo, series in data.items():
        base = series[min(series)]
        xs = sorted(series)
        ys = [(base / series[p]) / p * 100 for p in xs]
        c, lbl = STYLE.get(algo, ("k", algo))
        plt.plot(xs, ys, "o-", color=c, label=lbl, linewidth=2, markersize=5)
    plt.axhline(100, color="k", ls="--", alpha=0.5, label="ideal (100%)")
    plt.xlabel("threads"); plt.ylabel("parallel efficiency  (%)")
    plt.title(f"Parallel efficiency vs thread count  (n = {int(n):,})")
    plt.legend(); plt.tight_layout()
    out = os.path.join(RES, "efficiency_vs_threads.png")
    plt.savefig(out); plt.close(); print("wrote", out)


def time_vs_size():
    rows = read_csv("sizes.csv")
    data = defaultdict(dict)
    for r in rows:
        data[r["algo"]][int(r["n"])] = float(r["seconds"])

    plt.figure(figsize=(7, 4.5))
    for algo, series in data.items():
        xs = sorted(series)
        ys = [series[n] for n in xs]
        c, lbl = STYLE.get(algo, ("k", algo))
        ls = "--" if algo == "std" else "-"
        plt.plot(xs, ys, "o" + ls, color=c, label=lbl, linewidth=2, markersize=5)
    threads_used = rows[0]["threads"]
    plt.xscale("log", base=2); plt.yscale("log")
    plt.xlabel("input size  (elements, log$_2$ scale)")
    plt.ylabel("median time  (seconds, log scale)")
    plt.title(f"Runtime vs input size  ({threads_used} thread"
              + ("s" if threads_used != "1" else "") + ")")
    plt.legend(); plt.tight_layout()
    out = os.path.join(RES, "time_vs_size.png")
    plt.savefig(out); plt.close(); print("wrote", out)


if __name__ == "__main__":
    speedup_and_efficiency()
    time_vs_size()
    print("All charts written to results/")
