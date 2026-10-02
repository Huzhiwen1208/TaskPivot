e = []
print(f'len e = {len(e)}')
e.append(1)
print(f'e[0] = {e[0]}')
print(f'len e = {len(e)}')

e.append(2)
e.append(3)
e.append(4)
e.append(5)
e.append(6)
e.append(7)

print(e.index(6))

e.append(3)
e.append(10)
e.append(8)
e.append(9)

print(f"e = {e}")
e.sort()
print(f"e = {e}")

e.reverse()
print(f"e = {e}")

a = 1
b = 2
b, a = a, b
print(a, b)

print(e.count(3))

print(f"Before pop, e = {e}")
e.pop()
print(f"After pop, e = {e}")

print(f"Before clear, e = {e}")
e.clear()
print(f"After clear, e = {e}")