#include <stdio.h>
#include <math.h>

int add(int a, int b) {
    return a+b;
}

int main() {
    printf("hello world!\n");
    printf("sqrt(9) = %f\n", sqrt(9));

    int a = 3;
    float b = 3.2;
    char c[] = "hello world";
    int e[] = {1, 2, 3};

    // 可读性太差, 板书写法
    if (a > 0) {
        printf("a is positive\n");
    } else if (a > -5) {
        printf("a is more than -5\n");
    } else {
        printf("a is less than -5\n");
    }

    for (int i = 0; i < 3; i++) {
        printf("%d\n", e[i]);
    }

    while (a < 5) {
        printf("%d\n", a);
        a++;
    }

    do {
        printf("%d\n", a);
        a++;
    } while( a < 5);

    printf("%d\n", add(3, 4));
    printf("%f\n", add(3.2, 4.8));
    printf("%s\n", add("sa", "sb"));

    // 数组
    int e[] = {1, 2, 3};
    printf("%d\n", e[0]);
    e[1] = 8;
    printf("%d\n", e[1]);
    printf("%d\n", e[2]);

    return 0;
}