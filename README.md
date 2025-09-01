# 心理健康助手 - 后端服务

一个功能完整的心理健康管理后端API服务，支持情绪日志记录、引导练习、CBT思维训练、ACT价值观管理、SOS急救包和智能洞察等核心功能。

## 🌟 核心功能

### 用户认证系统
- JWT令牌认证
- 用户注册和登录
- 令牌刷新机制
- 用户资料管理

### 情绪日志管理
- 6种核心情绪类型记录
- 1-10级情绪强度评分
- 自定义标签系统
- 情绪统计和趋势分析

### 引导练习系统
- 4种练习分类（呼吸、冥想、放松、睡眠）
- 练习会话记录
- 完成率统计
- 个性化练习推荐

### CBT思维记录
- 自动化思维识别
- 认知扭曲分类
- 证据收集和平衡思维
- 情绪强度改善追踪

### ACT价值观管理
- 价值观重要性评分
- 当前对齐度评估
- 行动计划制定
- 价值观对齐分析

### SOS急救包
- 即时情绪干预技巧
- 个性化技巧推荐
- 使用效果追踪
- 技巧有效性分析

### 智能洞察
- 情绪模式识别
- CBT进展分析
- ACT对齐评估
- 个性化建议生成

## 🛠️ 技术栈

- **框架**: Flask 3.1.1
- **数据库**: SQLite (开发) / PostgreSQL (生产推荐)
- **认证**: Flask-JWT-Extended
- **ORM**: SQLAlchemy
- **数据验证**: Marshmallow
- **跨域支持**: Flask-CORS
- **密码加密**: Werkzeug Security

## 📊 API 概览

### 认证端点
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/profile` - 获取用户资料
- `PUT /api/auth/profile` - 更新用户资料

### 情绪日志端点
- `POST /api/emotions` - 创建情绪日志
- `GET /api/emotions` - 获取情绪日志列表
- `GET /api/emotions/{id}` - 获取单个情绪日志
- `PUT /api/emotions/{id}` - 更新情绪日志
- `DELETE /api/emotions/{id}` - 删除情绪日志
- `GET /api/emotions/stats` - 获取情绪统计

### 引导练习端点
- `GET /api/exercises` - 获取练习列表
- `GET /api/exercises/{id}` - 获取练习详情
- `POST /api/exercises/sessions` - 记录练习会话
- `GET /api/exercises/sessions` - 获取练习记录
- `GET /api/exercises/stats` - 获取练习统计

### CBT思维记录端点
- `POST /api/cbt/thoughts` - 创建思维记录
- `GET /api/cbt/thoughts` - 获取思维记录列表
- `GET /api/cbt/thoughts/{id}` - 获取单个思维记录
- `PUT /api/cbt/thoughts/{id}` - 更新思维记录
- `DELETE /api/cbt/thoughts/{id}` - 删除思维记录
- `GET /api/cbt/stats` - 获取CBT统计
- `GET /api/cbt/distortions` - 获取认知扭曲类型

### ACT价值观端点
- `POST /api/act/values` - 创建/更新价值观
- `GET /api/act/values` - 获取价值观列表
- `GET /api/act/values/{id}` - 获取价值观详情
- `PUT /api/act/values/{id}` - 更新价值观
- `DELETE /api/act/values/{id}` - 删除价值观
- `POST /api/act/actions` - 创建行动计划
- `GET /api/act/actions` - 获取行动计划列表
- `PUT /api/act/actions/{id}` - 更新行动计划
- `DELETE /api/act/actions/{id}` - 删除行动计划
- `GET /api/act/stats` - 获取ACT统计
- `GET /api/act/value-categories` - 获取价值观分类

### SOS急救包端点
- `POST /api/sos/sessions` - 记录SOS使用
- `GET /api/sos/sessions` - 获取SOS记录
- `GET /api/sos/recommendations` - 获取技巧推荐
- `GET /api/sos/techniques` - 获取所有技巧
- `GET /api/sos/stats` - 获取SOS统计

### 智能洞察端点
- `GET /api/insights` - 获取智能洞察

### 系统端点
- `GET /api/health` - 健康检查

## 🚀 快速开始

### 环境要求
- Python 3.11+
- pip 包管理器

### 安装和运行

1. **克隆仓库**
```bash
git clone https://github.com/prospermen/Belief-life.git
cd Belief-life/mental-health-backend
```

2. **创建虚拟环境**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **启动开发服务器**
```bash
python src/main.py
```

服务将在 `http://localhost:5000` 启动

### 验证安装

```bash
curl -X GET http://localhost:5000/api/health
```

预期响应：
```json
{
    "status": "healthy",
    "message": "心理健康助手后端服务运行正常",
    "version": "1.0.0"
}
```

## 📖 API 文档

详细的API文档请参考 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### 快速示例

1. **用户注册**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

2. **用户登录**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

3. **创建情绪日志**
```bash
curl -X POST http://localhost:5000/api/emotions \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"emotion_type": "happy", "intensity": 8, "content": "今天心情很好"}'
```

## 🗄️ 数据库设计

### 核心表结构

- **users** - 用户信息
- **emotion_logs** - 情绪日志
- **guided_exercises** - 引导练习
- **exercise_sessions** - 练习会话记录
- **cbt_thoughts** - CBT思维记录
- **act_values** - ACT价值观
- **act_actions** - ACT行动计划
- **sos_sessions** - SOS使用记录

### 关系设计

- 用户与所有功能模块都是一对多关系
- ACT价值观与行动计划是一对多关系
- 引导练习与练习会话是一对多关系

## 🔧 配置

### 环境变量

可以通过环境变量配置以下参数：

- `SECRET_KEY` - Flask应用密钥
- `JWT_SECRET_KEY` - JWT令牌密钥
- `DATABASE_URL` - 数据库连接URL

### 生产环境配置

生产环境建议修改以下配置：

```python
# 设置JWT令牌过期时间
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# 使用PostgreSQL数据库
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/dbname'

# 禁用调试模式
app.run(debug=False)
```

## 🧪 测试

### 运行测试

```bash
# 安装测试依赖
pip install pytest pytest-flask

# 运行测试
pytest tests/
```

### 手动测试

使用提供的测试脚本：

```bash
# 测试所有API端点
python tests/test_api.py
```

## 📦 部署

### Docker 部署

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
EXPOSE 5000

CMD ["python", "src/main.py"]
```

### 使用 Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

## 🔒 安全性

### 已实现的安全措施

- JWT令牌认证
- 密码bcrypt哈希
- SQL注入防护（SQLAlchemy ORM）
- 输入数据验证（Marshmallow）
- CORS跨域配置

### 安全建议

- 生产环境使用HTTPS
- 设置合理的JWT过期时间
- 定期更新依赖包
- 实施API速率限制
- 添加日志监控

## 📊 性能

### 优化措施

- 数据库索引优化
- 分页查询支持
- 懒加载关系数据
- JSON数据压缩存储

### 监控指标

- API响应时间
- 数据库查询性能
- 内存使用情况
- 并发连接数

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

### 开发流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循PEP 8代码风格
- 添加适当的注释和文档字符串
- 编写单元测试
- 更新相关文档

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

- GitHub Issues: https://github.com/prospermen/Belief-life/issues
- 项目文档: https://github.com/prospermen/Belief-life
- API文档: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔄 版本历史

### v1.0.0 (2025-01-09)
- ✅ 初始版本发布
- ✅ 用户认证系统
- ✅ 情绪日志功能
- ✅ 引导练习功能
- ✅ CBT思维记录功能
- ✅ ACT价值观管理功能
- ✅ SOS急救包功能
- ✅ 智能洞察功能
- ✅ 完整的RESTful API
- ✅ 数据库设计和实现
- ✅ API文档

## 🎯 未来规划

- [ ] 添加数据导出功能
- [ ] 实现推送通知
- [ ] 添加数据可视化图表
- [ ] 支持多语言
- [ ] 添加管理员面板
- [ ] 实现数据备份和恢复
- [ ] 添加API版本控制
- [ ] 实现缓存机制
- [ ] 添加日志系统
- [ ] 性能监控和告警

---

**心理健康助手后端** - 为心理健康应用提供强大的API支持 💚

