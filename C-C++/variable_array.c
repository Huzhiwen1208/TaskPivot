/** 第一种：把 e 放到更大的空间 e' 去，然后将 e 的内容复制到 e' ，最后 e = e' */

#include <stdio.h>
#include <stdlib.h>

struct VariableArray {
    int *e;  // 真实数据存放地
    int capacity; // 最大容量
    int currentLength; // 当前使用的格子数
};

/* 初始化一个空的可变数组 */
struct VariableArray *InitializeVariableArray(int capacity) {
    struct VariableArray *va = (struct VariableArray *)malloc(sizeof(struct VariableArray));

    va->capacity = capacity;
    va->currentLength = 0;
    va->e = (int *)malloc(sizeof(int) * capacity);

    return va;
}

/* 访问对应的数据, eg: va[0], va[1], va[2], va[3] */
int AccessAt(struct VariableArray *va, int index) {
    if (index >= va->currentLength) {
        printf("IndexError: list index out of range\n");
        exit(-1);
    }

    return va->e[index];
}

int Length(struct VariableArray *va) {
    return va->currentLength;
}

int Append(struct VariableArray *va, int item) {
    if (va->capacity == va->currentLength) {
        // 满了，扩容
        /** 第一种：把 e 放到更大的空间 e' 去，然后将 e 的内容复制到 e' ，最后 e = e' */
        int *e_ = (int *)malloc(sizeof(int) * va->capacity * 2);
        for (int i = 0; i < va->capacity; i++) {
            e_[i] = va->e[i];
        }
        free(va->e);
        va->e = e_;
        va->capacity = va->capacity * 2;
    }

    va->e[va->currentLength] = item;
    va->currentLength++;
    return 0;
}

int Index(struct VariableArray *va, int found) {
    for (int i = 0; i < va->currentLength; i++) {
        if (va->e[i] == found) {
            return i;
        }
    }

    printf("ValueError: %d is not in list\n", found);
    exit(-1);
}

int Printf(struct VariableArray *va) {
    printf("e = [");

    for (int i = 0; i < va->currentLength; i++) {
        printf("%d, ", va->e[i]);
    }

    printf("]\n");
    return 0;
}

int cmpfunc(const void *a, const void *b) {
    return (*(int *)a - *(int *)b);
}

void Sort(struct VariableArray *va) {
    qsort(va->e, va->currentLength, sizeof(int), cmpfunc);
}

void Reverse(struct VariableArray *va) {
    for (int i = 0, j = va->currentLength - 1; i <= j; i++, j--) {
        int t = va->e[i];
        va->e[i] = va->e[j];
        va->e[j] = t;
    }
}

int Count(struct VariableArray *va, int found) {
    int cnt = 0;

    for (int i = 0; i < va->currentLength; i++) {
        if (va->e[i] == found) {
            cnt ++;
        }
    }

    return cnt;
}

int Pop(struct VariableArray *va) {
    printf("Pop Unimplemented!\n");
    exit(-1);
}

int Clear(struct VariableArray *va) {
    printf("Clear Unimplemented!\n");
    exit(-1);
}

int main() {
    struct VariableArray *va = InitializeVariableArray(6);  // va = []
    printf("va len = %d\n", Length(va)); // len(va)
    Append(va, 1); // va.append(1)
    printf("va[0] = %d\n", AccessAt(va, 0));  // va[0]
    printf("va len = %d\n", Length(va)); // len(va)

    Append(va, 2); // va.append(2)
    Append(va, 3); // va.append(3)
    Append(va, 4); // va.append(4)
    Append(va, 5); // va.append(5)
    Append(va, 6); // va.append(6)
    Append(va, 7); // va.append(7)

    printf("va len = %d\n", Length(va)); // len(va)

    printf("%d\n", Index(va, 6)); //e.index(6)
    
    Append(va, 3); // va.append(3)
    Append(va, 10); // va.append(10)
    Append(va, 8); // va.append(8)
    Append(va, 9); // va.append(9)

    Printf(va);  // print(e)
    Sort(va);   // e.sort()
    Printf(va);  // print(e)

    Reverse(va);
    Printf(va);  // print(e)

    printf("%d\n", Count(va, 3)); // va.count(3)

    // TODO: WTK
    printf("Before pop, ");
    Printf(va);
    Pop(va); // TODO
    printf("After pop, ");
    Printf(va);

    printf("Before clear, ");
    Printf(va);
    Clear(va); // TODO
    printf("After clear, ");
    Printf(va);

    return 0;
}