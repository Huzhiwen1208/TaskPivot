# 使用 Python 开始机器学习

## 一、课程目标

完成本节课后，学生能够：

1. 解释样本、特征、标签、训练集和测试集。
2. 区分分类问题和回归问题。
3. 使用 Python 加载一个机器学习数据集。
4. 使用 `train_test_split` 划分训练集和测试集。
5. 使用 KNN 模型训练分类器并预测新样本。
6. 使用准确率和混淆矩阵评价分类结果。
7. 说出机器学习中“训练数据”和“测试数据”不能混用的原因。

## 二、课程案例

本节课使用 Iris 鸢尾花数据集。数据中每条记录描述一朵花，包含4个特征：

- 花萼长度 `sepal length`
- 花萼宽度 `sepal width`
- 花瓣长度 `petal length`
- 花瓣宽度 `petal width`

模型需要根据这4个特征，判断花属于哪一类：

- `setosa`
- `versicolor`
- `virginica`

这是一个**监督学习中的多分类问题**。

## 四、课程导入 00:00—05:00

### 4.1 从“写规则”到“让模型学习”

假设我们要判断一朵花属于哪一类。

传统编程的思路是：

```text
人工编写规则 + 输入数据 → 输出分类结果
```

例如，人工规定：

```text
如果花瓣长度小于某个数，就判断为 setosa
否则判断为其他类别
```

问题是，真实数据往往不容易写出完美规则。不同花朵的特征可能互相重叠，手工规则也可能在新数据上失效。

机器学习的思路是：

```text
训练数据 + 算法 → 模型
模型 + 新数据 → 预测结果
```

模型会从已有样本中寻找规律，然后对没有见过的新样本进行预测。

### 4.2 本节课的最终结果

课程结束时，我们将得到一个模型，并回答：

```text
给定一朵花的4个测量值，它属于哪一类？
```

课堂演示使用以下两个新样本：

```python
[5.1, 3.5, 1.4, 0.2]
[6.2, 2.8, 4.8, 1.8]
```

## 五、核心概念 05:00—12:00

### 5.1 样本、特征和标签

以一朵花为例：

| 概念            | 含义                   | 本案例                |
| --------------- | ---------------------- | --------------------- |
| 样本（sample）  | 一条完整数据记录       | 一朵鸢尾花            |
| 特征（feature） | 用来描述样本的输入变量 | 花萼和花瓣的4个测量值 |
| 标签（label）   | 希望模型预测的结果     | 花的类别              |
| 特征矩阵 `X`    | 所有样本的特征集合     | 150行、4列            |
| 标签向量 `y`    | 所有样本的正确类别     | 150个类别值           |

可以把一条数据写成：

```text
X = [花萼长度, 花萼宽度, 花瓣长度, 花瓣宽度]
y = 花的类别
```

### 5.2 分类和回归

| 任务                   | 预测结果 | 示例                               |
| ---------------------- | -------- | ---------------------------------- |
| 分类（classification） | 离散类别 | 判断花的种类、判断邮件是否垃圾邮件 |
| 回归（regression）     | 连续数值 | 预测房价、预测明天的温度           |

本节课预测的是三种花的类别，所以是分类问题。

### 5.3 训练集和测试集

不能把全部数据都用来训练，再用同一批数据评价模型。这样模型可能只是记住了训练样本，不能说明它对新数据的表现。

通常将数据划分为：

```text
训练集：用于学习规律
测试集：用于检查模型对未见数据的表现
```

本节课使用：

```text
训练集：80%
测试集：20%
```

### 5.4 KNN是什么

KNN（K-Nearest Neighbors，K近邻）是一种直观的分类方法：

1. 计算新样本与训练样本之间的距离。
2. 找出距离最近的K个样本。
3. 让这K个邻居进行投票。
4. 票数最多的类别作为预测结果。

例如，当`K=5`时，模型会查看距离最近的5朵花。如果其中3朵是`versicolor`，2朵是`virginica`，就预测为`versicolor`。

K值的影响：

- K太小：模型容易受到个别样本和噪声影响。
- K太大：模型可能过于平滑，忽略局部差异。
- 合适的K值需要通过验证或交叉验证选择。

### 5.5 为什么要标准化

KNN依赖距离。如果一个特征的数值范围特别大，它可能在距离计算中占据更大影响。

标准化通常将特征转换为：

```text
均值约为0，标准差约为1
```

本节课使用`StandardScaler`，并把标准化和KNN放进同一个`Pipeline`。这样可以避免错误地使用测试集信息。

## 六、Python环境与数据 12:00—18:00

### 6.1 macOS环境准备

在终端中执行：

```bash
mkdir python-ml-class
cd python-ml-class
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install numpy pandas scikit-learn matplotlib
```

以后再次进入该环境：

```bash
cd python-ml-class
source .venv/bin/activate
```

如果使用VS Code，可以选择`.venv/bin/python`作为Python解释器。

### 6.2 导入库

新建文件`iris_knn.py`，先写入：

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
```

各模块的作用：

| 模块                   | 作用                   |
| ---------------------- | ---------------------- |
| `load_iris`            | 加载示例数据集         |
| `train_test_split`     | 划分训练集和测试集     |
| `make_pipeline`        | 按顺序组合多个处理步骤 |
| `StandardScaler`       | 标准化特征             |
| `KNeighborsClassifier` | 创建KNN分类器          |
| `accuracy_score`       | 计算准确率             |
| `confusion_matrix`     | 生成混淆矩阵           |

### 6.3 加载并查看数据

继续写入：

```python
iris = load_iris(as_frame=True)

X = iris.data
y = iris.target

print("特征名称：", list(X.columns))
print("数据形状：", X.shape)
print("类别名称：", list(iris.target_names))
print(X.head())
print(y.head())
```

运行：

```bash
python iris_knn.py
```

重点观察：

- `X.shape`应为`(150, 4)`。
- `X`有150条样本、4个特征。
- `y`保存类别编号，通常为0、1、2。
- `iris.target_names`保存类别名称。

### 6.4 课堂提问

请学生回答：

1. 如果把花的类别也放进`X`，会有什么问题？
2. 为什么`y`不能在训练模型时被当作普通特征？
3. 一张表中的一行数据代表什么？

参考答案：

- 类别是我们希望预测的目标，不能提前作为输入提供给模型。
- 如果把答案放进输入，模型会得到不应该拥有的信息，评价结果会失真。
- 每一行代表一条样本，即一朵花。

## 七、实操一：划分数据并训练模型 18:00—30:00

### 7.1 划分训练集和测试集

在代码中加入：

```python
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

print("训练集大小：", X_train.shape)
print("测试集大小：", X_test.shape)
```

参数说明：

- `test_size=0.2`：20%的数据用于测试。
- `random_state=42`：固定随机划分，便于课堂复现。
- `stratify=y`：让训练集和测试集尽量保持相似的类别比例。

固定随机种子不是为了让结果“更高”，而是为了让不同同学在相同代码下得到可比较的结果。

### 7.2 创建KNN模型

```python
model = make_pipeline(
    StandardScaler(),
    KNeighborsClassifier(n_neighbors=5),
)
```

这段代码表示：

```text
原始特征
  ↓
StandardScaler标准化
  ↓
KNN分类器，K=5
```

### 7.3 训练模型

```python
model.fit(X_train, y_train)
```

`fit`的含义是使用训练集让模型学习。对于KNN来说，训练阶段主要是保存训练样本及其类别信息；预测阶段再计算距离并进行投票。

### 7.4 预测测试集

```python
y_pred = model.predict(X_test)

print("预测结果：", y_pred)
print("真实结果：", y_test.to_numpy())
```

`y_pred`是模型预测的类别，`y_test`是测试集中的正确类别。

### 7.5 预测两个新样本

```python
new_flowers = [
    [5.1, 3.5, 1.4, 0.2],
    [6.2, 2.8, 4.8, 1.8],
]

new_predictions = model.predict(new_flowers)

for values, class_id in zip(new_flowers, new_predictions):
    print(values, "=>", iris.target_names[class_id])
```

注意：新样本的特征顺序必须与训练数据一致：

```text
花萼长度、花萼宽度、花瓣长度、花瓣宽度
```

如果顺序错误，程序可能仍然运行，但预测结果没有可靠意义。

## 八、实操二：评价模型 30:00—37:00

### 8.1 准确率

```python
accuracy = accuracy_score(y_test, y_pred)
print(f"测试集准确率：{accuracy:.3f}")
```

准确率的计算方式：

```text
准确率 = 预测正确的样本数 / 测试样本总数
```

在当前固定划分和K值下，课堂运行结果应接近：

```text
测试集准确率：0.933
```

准确率会受到数据划分、随机种子和软件版本等因素影响。如果学生改变这些条件，结果略有不同是正常的。

### 8.2 混淆矩阵

```python
matrix = confusion_matrix(y_test, y_pred)
print("混淆矩阵：")
print(matrix)
```

混淆矩阵的行表示真实类别，列表示预测类别：

```text
              预测 setosa  预测 versicolor  预测 virginica
真实 setosa
真实 versicolor
真实 virginica
```

对角线上的数字表示预测正确的数量。非对角线上的数字表示分类错误的数量。

本次示例的一种结果是：

```text
[[10  0  0]
 [ 0 10  0]
 [ 0  2  8]]
```

可以解释为：

- `setosa`的10个测试样本全部预测正确。
- `versicolor`的10个测试样本全部预测正确。
- `virginica`有2个被预测成`versicolor`。

### 8.3 分类报告

```python
print(
    classification_report(
        y_test,
        y_pred,
        target_names=iris.target_names,
    )
)
```

报告中常见的指标：

| 指标      | 含义                                         |
| --------- | -------------------------------------------- |
| precision | 被模型预测为某类的样本中，真正属于该类的比例 |
| recall    | 真正属于某类的样本中，被模型找出的比例       |
| f1-score  | precision和recall的综合指标                  |
| support   | 测试集中该类别的真实样本数                   |

入门阶段先记住：准确率描述整体正确比例，混淆矩阵帮助我们看清错误发生在哪些类别之间。

## 九、学生练习 37:00—44:00

### 9.1 练习一：修改K值

将模型中的：

```python
KNeighborsClassifier(n_neighbors=5)
```

依次改为：

```python
KNeighborsClassifier(n_neighbors=1)
KNeighborsClassifier(n_neighbors=3)
KNeighborsClassifier(n_neighbors=7)
KNeighborsClassifier(n_neighbors=15)
```

记录每个K值对应的测试集准确率：

|  K值 | 准确率 | 你的观察 |
| ---: | -----: | -------- |
|    1 |        |          |
|    3 |        |          |
|    5 |        |          |
|    7 |        |          |
|   15 |        |          |

问题：

1. 哪个K值在当前测试集上表现最好？
2. 是否能因此断言它在所有数据上都最好？
3. K变大后，模型为什么可能变得更平滑？

正确理解：一次测试集的结果只能说明当前划分下的表现。要更稳妥地选择参数，应使用验证集或交叉验证。

### 9.2 练习二：移除标准化

将模型暂时改成：

```python
model_without_scaling = KNeighborsClassifier(n_neighbors=5)
model_without_scaling.fit(X_train, y_train)
y_pred_without_scaling = model_without_scaling.predict(X_test)

print(
    "不标准化的准确率：",
    accuracy_score(y_test, y_pred_without_scaling),
)
```

比较标准化前后的结果，并思考：

- 结果一定会变好吗？
- 如果特征的单位和范围差异更大，距离模型可能受到什么影响？

本练习的目的不是追求某个固定答案，而是理解预处理步骤会影响模型。

### 9.3 练习三：解释一条预测

选择一个测试样本，回答：

```text
这个样本的4个特征是什么？
模型预测的类别是什么？
真实类别是什么？
预测正确还是错误？
```

## 十、问题答疑 44:00—48:00

### 10.1 常见运行错误

| 报错或现象                                       | 常见原因                             | 排查方法                                              |
| ------------------------------------------------ | ------------------------------------ | ----------------------------------------------------- |
| `ModuleNotFoundError: No module named 'sklearn'` | 没有安装或没有激活虚拟环境           | 激活`.venv`后执行`python -m pip install scikit-learn` |
| `NameError: name 'X' is not defined`             | 代码执行顺序错误或变量名不一致       | 从文件第一行重新运行，核对变量名                      |
| 维度不匹配                                       | 新样本的特征数量不对                 | 每条新样本必须有4个数值                               |
| 结果每次变化                                     | 未固定随机种子或改变了数据划分       | 设置`random_state=42`                                 |
| 准确率异常地高                                   | 训练集和测试集混用，或把标签放进特征 | 检查`X`和`y`的定义及划分代码                          |
| 代码可以运行但结果不合理                         | 特征顺序或单位错误                   | 核对数据说明和输入列顺序                              |

### 10.2 机器学习排错顺序

遇到问题时按下面顺序排查：

```text
1. 程序是否能运行？
2. X和y的形状是否正确？
3. 训练集和测试集是否分开？
4. 模型是否只在训练集上fit？
5. 预测结果的形状是否正确？
6. 指标是否在正确的数据集上计算？
7. 结果是否符合问题背景？
```

### 10.3 重要提醒

- 测试集不能参与模型训练。
- 测试集不能用来反复挑选最优参数后再当作“独立评价”。
- 准确率不是所有任务都适合的指标，类别不平衡时尤其要谨慎。
- AI或搜索引擎给出的代码也要运行和检查，不能只看代码表面。
- 一个模型得到较高准确率，不等于找到了因果关系。

## 十一、总结 48:00—50:00

### 11.1 本节课流程

```text
加载数据
  ↓
区分特征X和标签y
  ↓
划分训练集和测试集
  ↓
建立预处理和模型Pipeline
  ↓
使用训练集fit
  ↓
使用测试集predict
  ↓
计算准确率和查看混淆矩阵
  ↓
解释结果并继续改进
```

### 11.2 课末快速检查

请学生用一句话完成：

1. 特征是：________________。
2. 标签是：________________。
3. `fit`用于：________________。
4. `predict`用于：________________。
5. 测试集的作用是：________________。

参考答案：

- 特征是模型使用的输入变量。
- 标签是希望模型预测的正确结果。
- `fit`用于让模型从训练数据中学习。
- `predict`用于对新样本给出预测。
- 测试集用于评价模型对未参与训练的数据的表现。

## 十二、课后作业

### 必做任务

1. 完整运行本节课的Iris KNN代码。
2. 比较`K=1、3、5、7、15`的准确率。
3. 选择2个新样本，使用模型预测类别，并写出特征顺序。
4. 用100—150字解释“为什么不能只看训练集准确率”。

### 选做任务

将KNN替换为决策树：

```python
from sklearn.tree import DecisionTreeClassifier

tree_model = DecisionTreeClassifier(
    max_depth=3,
    random_state=42,
)

tree_model.fit(X_train, y_train)
tree_pred = tree_model.predict(X_test)

print("决策树准确率：", accuracy_score(y_test, tree_pred))
```

比较KNN和决策树：

| 模型   | 参数            | 测试准确率 | 混淆矩阵观察 |
| ------ | --------------- | ---------: | ------------ |
| KNN    | `n_neighbors=5` |            |              |
| 决策树 | `max_depth=3`   |            |              |

不要只写“谁的准确率高谁就更好”，还要说明模型复杂度、可解释性和参数设置。

## 十三、完整课堂代码

将下面内容保存为`iris_knn.py`即可运行：

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    classification_report,
)


# 1. 加载数据
iris = load_iris(as_frame=True)
X = iris.data
y = iris.target

print("特征名称：", list(X.columns))
print("数据形状：", X.shape)
print("类别名称：", list(iris.target_names))
print(X.head())

# 2. 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

print("训练集大小：", X_train.shape)
print("测试集大小：", X_test.shape)

# 3. 建立标准化 + KNN模型
model = make_pipeline(
    StandardScaler(),
    KNeighborsClassifier(n_neighbors=5),
)

# 4. 训练模型
model.fit(X_train, y_train)

# 5. 预测测试集
y_pred = model.predict(X_test)

# 6. 评价模型
accuracy = accuracy_score(y_test, y_pred)
matrix = confusion_matrix(y_test, y_pred)

print(f"测试集准确率：{accuracy:.3f}")
print("混淆矩阵：")
print(matrix)
print("分类报告：")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=iris.target_names,
    )
)

# 7. 预测新样本
new_flowers = [
    [5.1, 3.5, 1.4, 0.2],
    [6.2, 2.8, 4.8, 1.8],
]

new_predictions = model.predict(new_flowers)

for values, class_id in zip(new_flowers, new_predictions):
    print(values, "=>", iris.target_names[class_id])
```