/** 第四种：把 e 切分，不同的部分放到不同的内存区域，使用穿针引线连接起来 */
/** 链表方法： 不需要连续的空间 */

#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node, Head;

Head *InitialzeLinkList() {
    Head *head = (Node *)malloc(sizeof(Node));  // 申请一个没有用的头结点
    return head;
}

void PrintLinkList(Head *head) {
    Node *p = head->next;

    while (p) {
        printf("%d ", p->value);
        p = p->next;
    }

    puts("");
}

void Append(Head *head, int element) {
    // 跑到链表的尾部
    Node *p = head;
    while (p->next) {
        p = p->next;
    }

    // 把新元素构造成结点
    Node *s = (Node *)malloc(sizeof(Node));
    s->value = element;
    s->next = NULL;

    // 放到尾部
    p->next = s;
}

int Length(Head *head) {
    Node *p = head->next;
    int cnt = 0;

    while (p) {
        cnt += 1;
        p = p->next;
    }

    return cnt;
}

int AccessAt(Head *head, int position) {
    Node *p = head->next;
    int cnt = 0;

    while (p) {
        cnt += 1;
        if (cnt == position + 1) {
            break;
        }
        p = p->next;
    }

    return p->value;
}

int main() {
    Head *head = InitialzeLinkList();
    PrintLinkList(head);

    Append(head, 1);
    Append(head, 2);
    Append(head, 3);

    PrintLinkList(head);
    printf("len(head) = %d\n", Length(head));

    printf("0 of Head = %d\n", AccessAt(head, 0));
    printf("1 of Head = %d\n", AccessAt(head, 1));
    printf("2 of Head = %d\n", AccessAt(head, 2));

    return 0;
}