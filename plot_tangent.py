import numpy as np
import matplotlib.pyplot as plt
import matplotlib

# M4 Mac：使用非交互后端，直接保存图片
matplotlib.use("Agg")


def f(x):
    return 2 * x**2 + 3 * x + 6


def df(x):
    return 4 * x + 3


# 切点：x = 1，对应曲线上的点 (1, 11)
x0 = 1
y0 = f(x0)
k = df(x0)            # 斜率 f'(1) = 7
b = y0 - k * x0       # 切线截距 b = 4


def tangent(x):
    return k * x + b


x = np.linspace(-4, 3, 400)

plt.figure(figsize=(8, 6))
plt.plot(x, f(x), label=r"$y=2x^2+3x+6$", linewidth=2)
plt.plot(x, tangent(x), label=rf"tangent: $y={k}x+{b}$",
         linestyle="--", linewidth=2, color="orange")

# 标注切点 (1, 11)
plt.scatter([x0], [y0], color="red", zorder=5)
plt.annotate(f"({x0}, {y0})", (x0, y0),
             textcoords="offset points", xytext=(10, -15), color="red")

# 标注外部点 (1, 0)
plt.scatter([1], [0], color="green", zorder=5)
plt.annotate("(1, 0)", (1, 0),
             textcoords="offset points", xytext=(10, 8), color="green")

plt.axhline(0, color="black", linewidth=0.8)
plt.axvline(0, color="black", linewidth=0.8)
plt.xlim(-4, 3)
plt.ylim(-5, 30)
plt.grid(alpha=0.3)
plt.legend()
plt.title("Tangent to $y=2x^2+3x+6$ at $x=1$  (point (1, 11))")
plt.xlabel("x")
plt.ylabel("y")
plt.tight_layout()

out = "/Users/jackhu/src_code/task-pivot/tangent_plot.png"
plt.savefig(out, dpi=150)
print(f"图片已保存：{out}")
print(f"切点 (1, 11)，切线斜率 k = f'(1) = {k}，切线方程 y = {k}x + {b}")
