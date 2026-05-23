# Makefile -- parallel sorting mini-project (Linux + macOS)
#
#   make            build the ./psort benchmark binary
#   make test       build + verify all algorithms are correct
#   make bench      run the full sweep and regenerate charts (needs python3)
#   make clean      remove build artifacts
#
# macOS needs Homebrew libomp once:  brew install libomp

UNAME := $(shell uname)

ifeq ($(UNAME),Darwin)
  # ---- macOS: Apple clang + Homebrew libomp ----
  OMP := $(shell brew --prefix libomp 2>/dev/null)
  CXX      ?= clang++
  CXXFLAGS ?= -O3 -std=c++17 -Wall -Xpreprocessor -fopenmp -I$(OMP)/include
  LDFLAGS  ?= -L$(OMP)/lib -lomp
else
  # ---- Linux: GCC with built-in OpenMP ----
  CXX      ?= g++
  CXXFLAGS ?= -O3 -std=c++17 -Wall -fopenmp -march=native
  LDFLAGS  ?=
endif

BIN = psort
SRC = src/main.cpp

$(BIN): $(SRC) src/*.hpp
	$(CXX) $(CXXFLAGS) $(SRC) -o $(BIN) $(LDFLAGS)

.PHONY: test bench clean
test: $(BIN)
	@echo "Verifying correctness (random + edge sizes)..."
	@for a in bitonic sample radix; do \
	  for n in 1 2 7 1000 65536 100000; do \
	    ./$(BIN) --algo $$a --n $$n --threads 4 --reps 1 --verify --csv | \
	      awk -F, '{printf "  %-8s n=%-7s -> %s\n", $$1, $$2, ($$6==1?"OK":"FAIL")}'; \
	  done; \
	done

bench: $(BIN)
	bash bench/run_benchmarks.sh
	python3 bench/plot.py

clean:
	rm -f $(BIN)
