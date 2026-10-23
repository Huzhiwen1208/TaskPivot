#include <bits/stdc++.h> // 万能头文件，所有的头文件都在这里面
using namespace std;     // std： standard，标准库的命名空间，才可以使用 cin cout 这种输入输出

class Animal {
private:
    string aff;    // 科属，代表这个动物所屬的科。比如：猫科动物、爬行动物、两栖动物
public:
    string name;
    string color;
    int    age;
    int    gender; // 0 代表母的，1代表公的

    void Bark() {
        cout << "我是一只动物，我在叫，xxxxxx" << endl;
    }
};

class Cat: public Animal {
public:
    Cat() {}

    // 重写，override
    void Bark() {
        cout << "我是一只猫，我的名字叫：" << this->name << "，我在叫，喵喵喵" << endl;
    }
};

int main() {
    Cat cat = Cat();

    printf("cat age: %d\n", cat.age);
    cat.age = 3;
    printf("cat age: %d\n", cat.age);
    cat.name = "Lulu";
    cat.gender = 0;
    cat.color = "red";

    // cat.aff = "cats";

    cat.Bark();

    return 0;
}