# 文件：backend/main.py
# 这是课堂演示代码。真正启动服务时，请把它保存到 main.py，
# 然后在 Terminal 中运行：fastapi dev main.py

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

app = FastAPI(
    title="Title",
    description="Unimplemented",
    version="1.0.0",
)


# React 和 FastAPI 端口不同，浏览器会把它们视为不同 Origin。
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/")
def home():
    return {"message": "学习任务 API 正在运行"}