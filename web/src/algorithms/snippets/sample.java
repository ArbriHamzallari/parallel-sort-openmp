import java.util.ArrayList;
import java.util.Arrays;

/** Sample sort (PSRS). */
public final class SampleSort {
    public static void sort(int[] data, int p) {
        int n = data.length;
        if (n < 2 || p < 2) {
            Arrays.sort(data);
            return;
        }
        if (p > n) p = n;
        int[] start = new int[p + 1];
        for (int i = 0; i <= p; i++) start[i] = n * i / p;
        for (int i = 0; i < p; i++)
            Arrays.sort(data, start[i], start[i + 1]);
        ArrayList<Integer> samples = new ArrayList<>();
        for (int i = 0; i < p; i++) {
            int len = start[i + 1] - start[i];
            for (int s = 0; s < p; s++) {
                int idx = start[i] + (len * s) / p;
                if (idx < start[i + 1]) samples.add(data[idx]);
            }
        }
        int[] sv = samples.stream().mapToInt(Integer::intValue).sorted().toArray();
        int[] pivots = new int[p - 1];
        for (int i = 1; i < p; i++) pivots[i - 1] = sv[(sv.length * i) / p];
        int[][] bnd = new int[p][p + 1];
        for (int i = 0; i < p; i++) {
            bnd[i][0] = start[i];
            for (int c = 0; c < p - 1; c++) {
                int k = start[i];
                while (k < start[i + 1] && data[k] <= pivots[c]) k++;
                bnd[i][c + 1] = k;
            }
            bnd[i][p] = start[i + 1];
        }
        int[] classStart = new int[p + 1];
        for (int c = 0; c < p; c++) {
            int sz = 0;
            for (int i = 0; i < p; i++) sz += bnd[i][c + 1] - bnd[i][c];
            classStart[c + 1] = classStart[c] + sz;
        }
        int[] out = new int[n];
        for (int c = 0; c < p; c++) {
            ArrayList<Integer> bucket = new ArrayList<>();
            for (int i = 0; i < p; i++)
                for (int k = bnd[i][c]; k < bnd[i][c + 1]; k++) bucket.add(data[k]);
            bucket.sort(Integer::compareTo);
            int pos = classStart[c];
            for (int v : bucket) out[pos++] = v;
        }
        System.arraycopy(out, 0, data, 0, n);
    }
}
