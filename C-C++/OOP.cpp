/**
 * 类的三大特性：封装、继承、多态
 */


#include <bits/stdc++.h> // 万能头文件，所有的头文件都在这里面
using namespace std;     // std： standard，标准库的命名空间，才可以使用 cin cout 这种输入输出

struct dict_student {
    string name;
    int age;
} student;


// 类, 相比于 python， self 会被隐含，使用 this-> 可以访问变量和行为
class Student {
// 私有变量
private:
    string name;
    float grade;
// 公有变量
public:
    int age;

// 行为
    // 构造函数
    Student(string name, int age, float grade) {
        this->name = name;
        this->age = age;
        this->grade = grade;
    }

    void change_name(string new_name) {
        this->name = new_name;
    }

    string get_name() {
        return this->name;
    }

    float get_grade() {
        return this->grade;
    }
};

int main() {

    student.name = "wtk";
    student.age = 10;

    printf("student{name: %s, age: %d}\n", student.name.c_str(), student.age);

    student.name = "new wtk";

    printf("student{name: %s, age: %d}\n", student.name.c_str(), student.age);

    printf("---------------------------------------------------------\n");

    Student stu = Student("wtk", 10, 90.9);
    printf("Student{name: %s, age: %d, grade: %.2f}\n", stu.get_name().c_str(), stu.age, stu.get_grade());

    return 0;
}