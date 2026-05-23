#!/usr/bin/env bash
# run_benchmarks.sh -- sweep thread count and input size, write CSVs.
#
# Run from the project root (the Makefile target `make bench` does this):
#   bash bench/run_benchmarks.sh
#
# Override any default from the environment, e.g.:
#   REPS=7 SCALE_N=$((1<<23)) bash bench/run_benchmarks.sh
set -euo pipefail
cd "$(dirname "$0")/.."

BIN=./psort
[ -x "$BIN" ] || { echo "Build first: run 'make'"; exit 1; }

# core count: Linux has nproc, macOS uses sysctl
detect_cores(){
  if command -v nproc >/dev/null 2>&1;   then nproc
  elif command -v sysctl >/dev/null 2>&1; then sysctl -n hw.logicalcpu
  else echo 4; fi
}
CORES=${CORES:-$(detect_cores)}
REPS=${REPS:-5}
SCALE_N=${SCALE_N:-$((1 << 22))}                 # 4,194,304 for the scaling study
SIZES=${SIZES:-"$((1<<16)) $((1<<18)) $((1<<20)) $((1<<22))"}
ALGOS="bitonic sample radix"

# Thread counts: powers of two up to the core count, plus the exact core count.
# Override with e.g. THREADS="1 2 4 8" if you want a specific list.
if [ -z "${THREADS:-}" ]; then
  THREADS=""
  t=1; while [ "$t" -le "$CORES" ]; do THREADS="$THREADS $t"; t=$((t*2)); done
  case " $THREADS " in *" $CORES "*) : ;; *) THREADS="$THREADS $CORES";; esac
fi

echo "Detected $CORES cores. threads=[$THREADS] reps=$REPS"
mkdir -p results

# ---- Study 1: speedup vs thread count (fixed large n) -------------------
echo "algo,n,threads,reps,seconds,correct" > results/scaling.csv
echo ">> Scaling study (n=$SCALE_N)"
for a in $ALGOS; do
  for p in $THREADS; do
    echo "   $a  threads=$p"
    $BIN --algo "$a" --n "$SCALE_N" --threads "$p" --reps "$REPS" --verify --csv \
      >> results/scaling.csv
  done
done

# ---- Study 2: runtime vs input size (max threads + std baseline) --------
echo "algo,n,threads,reps,seconds,correct" > results/sizes.csv
echo ">> Size study (threads=$CORES)"
for a in $ALGOS std; do
  for n in $SIZES; do
    echo "   $a  n=$n"
    $BIN --algo "$a" --n "$n" --threads "$CORES" --reps "$REPS" --verify --csv \
      >> results/sizes.csv
  done
done

echo "Done. CSVs written to results/. Now run: python3 bench/plot.py"
