import math

print("hello world!")
print(math.sqrt(9))

# 数据类型
# 整型、浮点型、字符串型、布尔型、List、Turple、Dict、Set

a: int = 3
b: float = 3.2
c: str = "hello world"
d: bool = True
e: list = [1, 2, 3]
f: tuple = (1, 2, 3)
g: dict = {"a": 1, "b": 2, "c": 3}
h: set = {1, 2, 3}

print(a)
print(b)
print(c)
print(d)
print(e)
print(f)
print(g)
print(h)

# if else 分支
if a > 0:
    print("a is positive")
elif a > -5:
    print("a is more than -5")
else:
    print("a is less than -5")

# 循环 for while
for i in range(3):
    print(i)

while a < 5:
    print(a)
    a += 1

# 函数 define
def adda(a: int, b: int) -> int:
    return a + b

print(adda(3, 4))
print(adda("sa", "ba"))
print(adda(3.2, 4.8))

# List
e = [1, 2, 3]
print(e)
print(e[0])
e[1] = 8
print(e[1])
print(e[2])

# Set, Dict