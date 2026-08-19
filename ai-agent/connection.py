from email import message

from openai import OpenAI
import os

client = OpenAI(
    api_key="sk-ef3170fc87c941e7ac3387b375a2dfbc",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

messages = [
    {
        "role": "user",
        "content": '''
我去市场买了10个苹果。我给了邻居2个苹果和修理工2个苹果。然后我去买了5个苹果并吃了1个。
我还剩下多少苹果？让我们逐步思考。
        '''
    },
]

completion = client.chat.completions.create(
    model="qwen3.7-flash-2026-07-15",
    messages=messages,
    temperature=0.1,
    stream=True
)

is_answering = False

for chunk in completion:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    if delta is None:
        continue
    
    if hasattr(delta, "reasoning_content") and delta.reasoning_content is not None:
        if not is_answering:
            print(delta.reasoning_content, end="")
    if hasattr(delta, "content") and delta.content is not None:
        if not is_answering:
            is_answering = True
        print(delta.content, end="")