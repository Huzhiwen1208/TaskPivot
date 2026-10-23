dict_student = {
    "name": "wtk",
    "age": 10
}

dict_student["name"] = "new wtk"




# 类
class Student:
    # 构造函数
    def __init__(self, name: str, age: int, grade: float = 60):
        # name、age 是属性（数据）
        self.__name = name
        self.age  = age
        self.__grade = grade
    
    # 方法（行为）
    def change_name(self, new_name: str):
        self.__name = new_name
    
    def get_name(self) -> str:
        return self.__name
    
    def get_grade(self) -> float:
        return self.__grade
    
    def set_grade(self, new_grade):
        self.__grade = new_grade


# 实例化：对象
stu: Student = Student("wtk", 10)

print(stu.get_name())
# print(stu.__name)
stu.change_name("new wtk")

print(stu.get_name())
#print(stu.__name)

print(stu.age)

stu.set_grade(90.9)
print(stu.get_grade())
