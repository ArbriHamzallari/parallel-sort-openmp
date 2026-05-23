/** LSD radix sort — base 10 for clarity. */
public final class RadixSort {
    public static void sort(int[] data) {
        int n = data.length;
        if (n < 2) return;
        int[] a = data.clone();
        int[] b = new int[n];
        int max = 0;
        for (int v : a) if (v > max) max = v;
        int passes = Math.max(1, String.valueOf(max).length());
        for (int pass = 0; pass < passes; pass++) {
            int[] count = new int[10];
            for (int v : a) count[digit(v, pass)]++;
            int[] off = new int[10];
            int sum = 0;
            for (int d = 0; d < 10; d++) {
                off[d] = sum;
                sum += count[d];
            }
            int[] run = off.clone();
            for (int v : a) {
                int d = digit(v, pass);
                b[run[d]++] = v;
            }
            int[] t = a;
            a = b;
            b = t;
        }
        System.arraycopy(a, 0, data, 0, n);
    }

    private static int digit(int v, int pass) {
        return (v / (int) Math.pow(10, pass)) % 10;
    }
}
