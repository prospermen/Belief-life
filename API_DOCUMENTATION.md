# 心理健康助手 - API 文档

## 概述

心理健康助手后端API提供了完整的心理健康管理功能，包括用户认证、情绪日志记录、引导练习、CBT思维记录、ACT价值观管理、SOS急救包和智能洞察等功能。

**基础URL**: `https://5000-ienzphbursysxbob5yqtj-44c6ee3f.manusvm.computer`

**API版本**: v1.0.0

## 认证

API使用JWT（JSON Web Token）进行身份验证。大多数端点需要在请求头中包含有效的访问令牌：

```
Authorization: Bearer <access_token>
```

## 通用响应格式

### 成功响应
```json
{
    "success": true,
    "data": {...},
    "message": "操作成功"
}
```

### 错误响应
```json
{
    "success": false,
    "message": "错误描述",
    "errors": {...}
}
```

## API 端点

### 1. 健康检查

#### GET /api/health
检查API服务状态

**请求参数**: 无

**响应示例**:
```json
{
    "status": "healthy",
    "message": "心理健康助手后端服务运行正常",
    "version": "1.0.0"
}
```

### 2. 用户认证

#### POST /api/auth/register
用户注册

**请求体**:
```json
{
    "username": "string (3-50字符)",
    "email": "string (有效邮箱)",
    "password": "string (6位以上)"
}
```

**响应示例**:
```json
{
    "success": true,
    "message": "用户注册成功",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "created_at": "2025-01-09T10:30:00Z",
        "is_active": true,
        "profile_data": {},
        "preferences": {}
    }
}
```

#### POST /api/auth/login
用户登录

**请求体**:
```json
{
    "email": "string",
    "password": "string"
}
```

**响应示例**:
```json
{
    "success": true,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
    }
}
```

#### POST /api/auth/refresh
刷新访问令牌

**请求头**: `Authorization: Bearer <refresh_token>`

**响应示例**:
```json
{
    "success": true,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/auth/profile
获取用户资料

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "profile_data": {},
        "preferences": {}
    }
}
```

#### PUT /api/auth/profile
更新用户资料

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
    "profile_data": {
        "age": 25,
        "gender": "female"
    },
    "preferences": {
        "notification_enabled": true,
        "theme": "dark"
    }
}
```

### 3. 情绪日志

#### POST /api/emotions
创建情绪日志

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
    "emotion_type": "happy|sad|angry|anxious|calm|excited",
    "intensity": 1-10,
    "content": "string (可选)",
    "tags": ["string"] (可选)
}
```

**响应示例**:
```json
{
    "success": true,
    "emotion_log": {
        "id": 1,
        "emotion_type": "happy",
        "intensity": 8,
        "content": "今天工作很顺利",
        "tags": ["工作", "成就感"],
        "created_at": "2025-01-09T10:30:00Z"
    }
}
```

#### GET /api/emotions
获取情绪日志列表

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `emotion_type`: 情绪类型筛选
- `start_date`: 开始日期 (ISO格式)
- `end_date`: 结束日期 (ISO格式)

**响应示例**:
```json
{
    "success": true,
    "emotions": [
        {
            "id": 1,
            "emotion_type": "happy",
            "intensity": 8,
            "content": "今天工作很顺利",
            "tags": ["工作", "成就感"],
            "created_at": "2025-01-09T10:30:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 50,
        "pages": 3
    }
}
```

#### GET /api/emotions/stats
获取情绪统计

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `period`: 统计周期 (week|month|year, 默认: week)

**响应示例**:
```json
{
    "success": true,
    "stats": {
        "emotion_distribution": {
            "happy": 15,
            "sad": 5,
            "angry": 3,
            "anxious": 8,
            "calm": 12,
            "excited": 7
        },
        "average_intensity": 6.5,
        "total_entries": 50,
        "most_common_tags": ["工作", "家庭", "学习"]
    }
}
```

### 4. 引导练习

#### GET /api/exercises
获取练习列表

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `category`: 练习分类筛选
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)

**响应示例**:
```json
{
    "success": true,
    "exercises": [
        {
            "id": 1,
            "title": "深度呼吸练习",
            "category": "breathing",
            "duration": 300,
            "description": "通过深度呼吸来放松身心",
            "audio_url": "/audio/breathing_exercise_1.mp3",
            "instructions": {
                "steps": ["找到舒适的坐姿", "闭上眼睛", "深呼吸"]
            }
        }
    ]
}
```

#### POST /api/exercises/sessions
记录练习会话

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
    "exercise_id": 1,
    "duration_completed": 300,
    "completed": true,
    "notes": "感觉很放松"
}
```

#### GET /api/exercises/sessions
获取练习会话记录

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `exercise_id`: 练习ID筛选

#### GET /api/exercises/stats
获取练习统计

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "stats": {
        "total_sessions": 25,
        "completed_sessions": 20,
        "completion_rate": 80.0,
        "total_duration_minutes": 125.5,
        "favorite_category": "breathing"
    }
}
```

### 5. CBT思维记录

#### POST /api/cbt/thoughts
创建CBT思维记录

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
    "situation": "工作会议上被批评",
    "automatic_thought": "我总是做错事情",
    "emotion": "沮丧",
    "emotion_intensity": 8,
    "cognitive_distortion": "全或无思维",
    "evidence_for": "这次确实犯了错误",
    "evidence_against": "我之前也有很多成功的项目",
    "balanced_thought": "这次犯错不代表我总是做错事情",
    "new_emotion_intensity": 4
}
```

#### GET /api/cbt/thoughts
获取CBT思维记录列表

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `emotion`: 情绪筛选
- `start_date`: 开始日期
- `end_date`: 结束日期

#### GET /api/cbt/stats
获取CBT统计数据

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "stats": {
        "total_records": 15,
        "average_improvement": 3.2,
        "improvement_percentage": 32.0,
        "most_common_distortion": "灾难化思维",
        "emotion_distribution": {
            "沮丧": 8,
            "焦虑": 5,
            "愤怒": 2
        }
    }
}
```

#### GET /api/cbt/distortions
获取认知扭曲类型列表

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "distortions": [
        "全或无思维",
        "过度概括",
        "心理过滤",
        "否定正面",
        "妄下结论",
        "读心术",
        "算命师错误",
        "放大和缩小",
        "情绪化推理",
        "应该陈述",
        "贴标签",
        "个人化"
    ]
}
```

### 6. ACT价值观管理

#### POST /api/act/values
创建/更新价值观

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
    "value_category": "家庭",
    "value_description": "与家人保持亲密关系，支持彼此成长",
    "importance_rating": 9,
    "current_alignment": 6
}
```

#### GET /api/act/values
获取价值观列表

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "values": [
        {
            "id": 1,
            "value_category": "家庭",
            "value_description": "与家人保持亲密关系，支持彼此成长",
            "importance_rating": 9,
            "current_alignment": 6,
            "alignment_gap": 3
        }
    ]
}
```

#### POST /api/act/actions
创建行动计划

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
    "value_id": 1,
    "action_description": "每周至少与父母通话一次",
    "target_date": "2025-01-15"
}
```

#### GET /api/act/actions
获取行动计划列表

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `value_id`: 价值观ID筛选
- `completed`: 完成状态筛选

#### GET /api/act/stats
获取ACT统计数据

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "stats": {
        "overall_alignment_score": 7.2,
        "total_values": 5,
        "most_aligned_value": "健康",
        "least_aligned_value": "创造力",
        "total_actions": 12,
        "completed_actions": 8,
        "completion_rate": 66.7,
        "upcoming_actions": 2,
        "overdue_actions": 1
    }
}
```

#### GET /api/act/value-categories
获取价值观分类建议

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "categories": [
        "家庭", "友谊", "亲密关系", "健康", "工作/职业",
        "学习/成长", "创造力", "娱乐/休闲", "精神/宗教",
        "社区/社会", "环境/自然", "财务安全"
    ]
}
```

### 7. SOS急救包

#### POST /api/sos/sessions
记录SOS使用会话

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
    "session_type": "处理感受|处理想法",
    "technique_used": "方框呼吸",
    "duration": 180,
    "effectiveness_rating": 4,
    "notes": "呼吸练习帮助我冷静下来"
}
```

#### GET /api/sos/sessions
获取SOS使用记录

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `session_type`: 会话类型筛选

#### GET /api/sos/recommendations
获取SOS技巧推荐

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "recommendations": [
        {
            "type": "处理感受",
            "technique": "4-7-8呼吸",
            "description": "吸气4秒，屏息7秒，呼气8秒",
            "estimated_duration": 120,
            "instructions": ["用鼻子吸气4秒", "屏住呼吸7秒", "用嘴呼气8秒"],
            "effectiveness_score": 4.2,
            "usage_count": 3
        }
    ]
}
```

#### GET /api/sos/techniques
获取所有SOS技巧

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `type`: 技巧类型 (处理感受|处理想法)

#### GET /api/sos/stats
获取SOS使用统计

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
    "success": true,
    "stats": {
        "total_sessions": 25,
        "type_distribution": {
            "处理感受": 15,
            "处理想法": 10
        },
        "most_used_techniques": [
            {"technique": "方框呼吸", "count": 8},
            {"technique": "4-7-8呼吸", "count": 5}
        ],
        "average_effectiveness": 4.1,
        "total_duration_minutes": 45.5
    }
}
```

### 8. 智能洞察

#### GET /api/insights
获取智能洞察

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `period`: 分析周期 (week|month|year, 默认: month)

**响应示例**:
```json
{
    "success": true,
    "insights": {
        "emotion_patterns": {
            "weekly_trend": "情绪整体呈上升趋势",
            "peak_days": ["周五", "周六"],
            "low_days": ["周一"],
            "dominant_emotion": "happy",
            "intensity_trend": "improving"
        },
        "cbt_progress": {
            "thought_challenging_improvement": 65,
            "most_common_distortion": "灾难化思维",
            "average_improvement": 3.2,
            "progress_trend": "improving"
        },
        "act_alignment": {
            "overall_score": 7.2,
            "most_aligned_value": "健康",
            "least_aligned_value": "创造力",
            "biggest_gap_value": "工作/职业"
        },
        "exercise_habits": {
            "consistency_score": 75.5,
            "preferred_time": "早晨",
            "completion_rate": 85.0,
            "total_sessions": 20
        },
        "sos_usage": {
            "usage_frequency": 0.15,
            "most_effective_technique": "方框呼吸",
            "preferred_type": "处理感受",
            "average_effectiveness": 4.2
        },
        "recommendations": [
            "建议在周一增加正念练习",
            "继续练习挑战灾难化思维",
            "考虑为'工作/职业'价值观制定更多行动计划"
        ]
    }
}
```

## 错误代码

| 状态码 | 描述 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/令牌无效 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

## 数据模型

### 用户 (User)
```json
{
    "id": "integer",
    "username": "string",
    "email": "string",
    "created_at": "datetime",
    "is_active": "boolean",
    "profile_data": "object",
    "preferences": "object"
}
```

### 情绪日志 (EmotionLog)
```json
{
    "id": "integer",
    "user_id": "integer",
    "emotion_type": "string",
    "intensity": "integer (1-10)",
    "content": "string",
    "tags": "array",
    "created_at": "datetime"
}
```

### 引导练习 (GuidedExercise)
```json
{
    "id": "integer",
    "title": "string",
    "category": "string",
    "duration": "integer (秒)",
    "description": "string",
    "audio_url": "string",
    "instructions": "object"
}
```

### CBT思维记录 (CBTThought)
```json
{
    "id": "integer",
    "user_id": "integer",
    "situation": "string",
    "automatic_thought": "string",
    "emotion": "string",
    "emotion_intensity": "integer (1-10)",
    "cognitive_distortion": "string",
    "evidence_for": "string",
    "evidence_against": "string",
    "balanced_thought": "string",
    "new_emotion_intensity": "integer (1-10)",
    "created_at": "datetime"
}
```

### ACT价值观 (ACTValue)
```json
{
    "id": "integer",
    "user_id": "integer",
    "value_category": "string",
    "value_description": "string",
    "importance_rating": "integer (1-10)",
    "current_alignment": "integer (1-10)",
    "created_at": "datetime"
}
```

### SOS会话 (SOSSession)
```json
{
    "id": "integer",
    "user_id": "integer",
    "session_type": "string",
    "technique_used": "string",
    "duration": "integer (秒)",
    "effectiveness_rating": "integer (1-5)",
    "notes": "string",
    "created_at": "datetime"
}
```

## 使用示例

### 完整的用户流程示例

1. **用户注册**
```bash
curl -X POST https://5000-ienzphbursysxbob5yqtj-44c6ee3f.manusvm.computer/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com", "password": "password123"}'
```

2. **用户登录**
```bash
curl -X POST https://5000-ienzphbursysxbob5yqtj-44c6ee3f.manusvm.computer/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "password123"}'
```

3. **记录情绪日志**
```bash
curl -X POST https://5000-ienzphbursysxbob5yqtj-44c6ee3f.manusvm.computer/api/emotions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"emotion_type": "happy", "intensity": 8, "content": "今天心情很好", "tags": ["工作", "成就感"]}'
```

4. **获取智能洞察**
```bash
curl -X GET https://5000-ienzphbursysxbob5yqtj-44c6ee3f.manusvm.computer/api/insights \
  -H "Authorization: Bearer <access_token>"
```

## 开发和测试

### 本地开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/prospermen/Belief-life.git
cd Belief-life/mental-health-backend
```

2. 创建虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 启动开发服务器
```bash
python src/main.py
```

### 测试

API提供了健康检查端点用于监控服务状态：

```bash
curl -X GET https://5000-ienzphbursysxbob5yqtj-44c6ee3f.manusvm.computer/api/health
```

## 安全性

- 所有敏感端点都需要JWT认证
- 密码使用bcrypt进行哈希存储
- 支持CORS跨域请求
- 输入数据使用Marshmallow进行验证
- 数据库查询使用SQLAlchemy ORM防止SQL注入

## 限制和注意事项

- 当前版本使用SQLite数据库，适合开发和小规模部署
- JWT令牌当前设置为不过期，生产环境应设置合理的过期时间
- 文件上传功能尚未实现
- 推送通知功能尚未实现
- 数据备份和恢复功能需要手动操作

## 版本历史

### v1.0.0 (2025-01-09)
- 初始版本发布
- 实现用户认证系统
- 实现情绪日志功能
- 实现引导练习功能
- 实现CBT思维记录功能
- 实现ACT价值观管理功能
- 实现SOS急救包功能
- 实现智能洞察功能
- 提供完整的RESTful API

## 支持

如有问题或建议，请在GitHub仓库中提交Issue：
https://github.com/prospermen/Belief-life/issues

