#include <stdio.h>

int main() {
    int e[] = {1, 2, 3};
    printf("%llu\n", e); // 6124102456  6135751480  6127461176

    printf("e = [%d, %d, %d]\n", e[0], e[1], e[2]);
    printf("e[3] = %d\n", e[3]);
    int k = 5;
    for (int i = 0; i < k; i++) e[0]++;

    /** 第一种：把 e 放到更大的空间 e' 去，然后将 e 的内容复制到 e' ，最后 e = e' */
    /** 第四种：把 e 切分，不同的部分放到不同的内存区域，使用穿针引线连接起来 */
    return 0;
}