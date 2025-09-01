from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from src.models.user import db, User
from marshmallow import Schema, fields, ValidationError
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

class UserRegistrationSchema(Schema):
    username = fields.Str(required=True, validate=lambda x: len(x) >= 3)
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 6)

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        schema = UserRegistrationSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    # 检查用户名是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': '用户名已存在'}), 400
    
    # 检查邮箱是否已存在
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': '邮箱已被注册'}), 400
    
    # 创建新用户
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '用户注册成功',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '注册失败，请稍后重试'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        schema = UserLoginSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    # 查找用户
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'message': '邮箱或密码错误'}), 401
    
    if not user.is_active:
        return jsonify({'success': False, 'message': '账户已被禁用'}), 401
    
    # 创建JWT令牌
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(hours=24)
    )
    refresh_token = create_refresh_token(
        identity=user.id,
        expires_delta=timedelta(days=30)
    )
    
    return jsonify({
        'success': True,
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """刷新访问令牌"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_active:
        return jsonify({'success': False, 'message': '用户不存在或已被禁用'}), 401
    
    new_access_token = create_access_token(
        identity=current_user_id,
        expires_delta=timedelta(hours=24)
    )
    
    return jsonify({
        'success': True,
        'access_token': new_access_token
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """获取用户资料"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
    
    return jsonify({
        'success': True,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """更新用户资料"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
    
    data = request.json
    
    # 更新用户资料数据
    if 'profile_data' in data:
        user.set_profile_data(data['profile_data'])
    
    # 更新用户偏好设置
    if 'preferences' in data:
        user.set_preferences(data['preferences'])
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': '资料更新成功',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '更新失败，请稍后重试'}), 500

