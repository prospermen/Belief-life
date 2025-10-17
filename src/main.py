import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.emotions import emotions_bp
from src.routes.exercises import exercises_bp
from src.routes.cbt import cbt_bp
from src.routes.act import act_bp
from src.routes.sos import sos_bp
from src.routes.insights import insights_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# 配置
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # 在生产环境中应该设置过期时间
app.config['JWT_IDENTITY_CLAIM'] = 'sub'

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化扩展
db.init_app(app)
jwt = JWTManager(app)
CORS(app, origins="*")  # 允许所有来源的跨域请求

# 注册蓝图
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(emotions_bp, url_prefix='/api/emotions')
app.register_blueprint(exercises_bp, url_prefix='/api/exercises')
app.register_blueprint(cbt_bp, url_prefix='/api/cbt')
app.register_blueprint(act_bp, url_prefix='/api/act')
app.register_blueprint(sos_bp, url_prefix='/api/sos')
app.register_blueprint(insights_bp, url_prefix='/api/insights')

# 创建数据库表
with app.app_context():
    db.create_all()
    
    # 初始化示例练习数据
    from src.routes.exercises import init_sample_exercises
    init_sample_exercises()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return {
        'status': 'healthy',
        'message': '心理健康助手后端服务运行正常',
        'version': '1.0.0'
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
