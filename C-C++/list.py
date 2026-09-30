e = [1, 2, 3]
print(id(e[0]))  # 4343709632

for _ in range(1199999):
    e.append(9)

print(id(e[0]))  # 4343709632