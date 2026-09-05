students = [] # 模拟数据库

student = {
    "name": "wtk",
    "age": 18,
    "gender": "male",
    "class": "math",
    "score": 90,
    "address": "beijing",
    "phone": "13800000000",
    "email": "wtk@example.com",
    "id": 1001,
    "created_at": "2023-01-01",
    "updated_at": "2023-01-01",
}

students.append(student)

class Student:
    def __init__(self, name, age, gender, class_name, score, address, phone, email, id, created_at, updated_at):
        self.name = name
        self.age = age
        self.gender = gender
        self.class_name = class_name
        self.score = score
        self.address = address
        self.phone = phone
        self.email = email
        self.id = id
        self.created_at = created_at
        self.updated_at = updated_at

    def __str__(self):
        return f"{self.name}, {self.age}, {self.gender}, {self.class_name}, {self.score}, {self.address}, {self.phone}, {self.email}, {self.id}, {self.created_at}, {self.updated_at}"



def from_student_to_class_student(student: dict) -> Student:
    return Student(
        name=student["name"],
        age=student["age"],
        gender=student["gender"],
        class_name=student["class"],
        score=student["score"],
        address=student["address"],
        phone=student["phone"],
        email=student["email"],
        id=student["id"],
        created_at=student["created_at"],
        updated_at=student["updated_at"],
    )


import matplotlib.pyplot as plt

# 1. 准备坐标数据 (X, Y, Z)
x = [4]
y = [7]
z = []

# 2. 创建三维画布
fig = plt.figure(figsize=(8, 6))
ax = fig.add_subplot(projection='3d')

# 3. 绘制三维散点图
ax.scatter(x, y, z, c='r', marker='o', s=50)

# 4. 设置坐标轴标签
ax.set_xlabel('X Axis')
ax.set_ylabel('Y Axis')
ax.set_zlabel('Z Axis')

# 5. 显示图形
plt.show()