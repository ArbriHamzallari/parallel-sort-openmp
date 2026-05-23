import java.util.Arrays;

/** Bitonic sort — pads to the next power of two. */
public final class BitonicSort {
    public static void sort(int[] data) {
        int n = data.length;
        if (n < 2) return;
        int m = 1;
        while (m < n) m <<= 1;
        if (m == n) {
            bitonicPow2(data, n);
            return;
        }
        int[] buf = new int[m];
        Arrays.fill(buf, Integer.MAX_VALUE);
        System.arraycopy(data, 0, buf, 0, n);
        bitonicPow2(buf, m);
        System.arraycopy(buf, 0, data, 0, n);
    }

    private static void bitonicPow2(int[] a, int n) {
        for (int k = 2; k <= n; k <<= 1) {
            for (int j = k >> 1; j > 0; j >>= 1) {
                for (int i = 0; i < n; i++) {
                    int l = i ^ j;
                    if (l <= i) continue;
                    boolean asc = (i & k) == 0;
                    if ((asc && a[i] > a[l]) || (!asc && a[i] < a[l])) {
                        int t = a[i];
                        a[i] = a[l];
                        a[l] = t;
                    }
                }
            }
        }
    }
}
