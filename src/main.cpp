// main.cpp -- benchmark driver for the parallel sorting mini-project
//
// Usage:
//   ./psort --algo <bitonic|sample|radix|std> --n <N> --threads <P>
//           [--reps R] [--verify] [--csv]
//
// Prints a human-readable line, or a CSV row with --csv:
//   algo,n,threads,reps,median_seconds,correct
#include "common.hpp"
#include "bitonic_sort.hpp"
#include "sample_sort.hpp"
#include "radix_sort.hpp"

#include <iostream>
#include <string>
#include <functional>
#include <omp.h>

int main(int argc, char** argv) {
    std::string algo = "std";
    size_t n = 1u << 20;          // 1,048,576
    int threads = omp_get_max_threads();
    int reps = 5;
    bool verify = false, csv = false;

    for (int i = 1; i < argc; ++i) {
        std::string s = argv[i];
        auto next = [&]() { return std::string(argv[++i]); };
        if      (s == "--algo")    algo = next();
        else if (s == "--n")       n = std::stoull(next());
        else if (s == "--threads") threads = std::stoi(next());
        else if (s == "--reps")    reps = std::stoi(next());
        else if (s == "--verify")  verify = true;
        else if (s == "--csv")     csv = true;
        else { std::cerr << "unknown arg: " << s << "\n"; return 1; }
    }
    if (threads < 1) threads = 1;

    // pick the sorting routine
    std::function<void(std::vector<int>&)> sorter;
    if      (algo == "bitonic") sorter = [&](std::vector<int>& v){ parallelsort::bitonic_sort(v, threads); };
    else if (algo == "sample")  sorter = [&](std::vector<int>& v){ parallelsort::sample_sort(v, threads);  };
    else if (algo == "radix")   sorter = [&](std::vector<int>& v){ parallelsort::radix_sort(v, threads);   };
    else if (algo == "std")     sorter = [&](std::vector<int>& v){ std::sort(v.begin(), v.end());   };
    else { std::cerr << "unknown algo: " << algo << "\n"; return 1; }

    const std::vector<int> input = make_random(n);

    // warm-up run (also used for correctness check)
    bool correct = true;
    {
        std::vector<int> v = input;
        sorter(v);
        if (verify) correct = verify_sorted(v, input);
    }

    // timed repetitions -> median
    std::vector<double> times;
    times.reserve(reps);
    for (int r = 0; r < reps; ++r) {
        std::vector<int> v = input;     // fresh copy each rep (not timed below)
        auto t0 = Clock::now();
        sorter(v);
        times.push_back(seconds_since(t0));
    }
    std::sort(times.begin(), times.end());
    double median = times[times.size() / 2];

    if (csv) {
        std::cout << algo << "," << n << "," << threads << "," << reps << ","
                  << median << "," << (correct ? 1 : 0) << "\n";
    } else {
        std::cout << "algo=" << algo << "  n=" << n << "  threads=" << threads
                  << "  median=" << median << "s"
                  << (verify ? (correct ? "  [OK]" : "  [WRONG!]") : "") << "\n";
    }
    return 0;
}
