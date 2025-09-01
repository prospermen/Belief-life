from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, ACTValue, ACTAction, User
from marshmallow import Schema, fields, ValidationError
from datetime import datetime, date
from sqlalchemy import func, and_

act_bp = Blueprint('act', __name__)

class ACTValueSchema(Schema):
    value_category = fields.Str(required=True)
    value_description = fields.Str(required=True)
    importance_rating = fields.Int(required=True, validate=lambda x: 1 <= x <= 10)
    current_alignment = fields.Int(required=True, validate=lambda x: 1 <= x <= 10)

class ACTActionSchema(Schema):
    value_id = fields.Int(required=True)
    action_description = fields.Str(required=True)
    target_date = fields.Date(allow_none=True)

@act_bp.route('/values', methods=['POST'])
@jwt_required()
def create_act_value():
    """创建/更新ACT价值观"""
    current_user_id = get_jwt_identity()
    
    try:
        schema = ACTValueSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    # 检查是否已存在相同类别的价值观
    existing_value = ACTValue.query.filter_by(
        user_id=current_user_id,
        value_category=data['value_category']
    ).first()
    
    if existing_value:
        # 更新现有价值观
        existing_value.value_description = data['value_description']
        existing_value.importance_rating = data['importance_rating']
        existing_value.current_alignment = data['current_alignment']
        value = existing_value
    else:
        # 创建新价值观
        value = ACTValue(
            user_id=current_user_id,
            value_category=data['value_category'],
            value_description=data['value_description'],
            importance_rating=data['importance_rating'],
            current_alignment=data['current_alignment']
        )
        db.session.add(value)
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'value': value.to_dict()
        }), 201 if not existing_value else 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '保存失败，请稍后重试'}), 500

@act_bp.route('/values', methods=['GET'])
@jwt_required()
def get_act_values():
    """获取用户的价值观列表"""
    current_user_id = get_jwt_identity()
    
    values = ACTValue.query.filter_by(user_id=current_user_id).order_by(
        ACTValue.importance_rating.desc()
    ).all()
    
    return jsonify({
        'success': True,
        'values': [value.to_dict() for value in values]
    }), 200

@act_bp.route('/values/<int:value_id>', methods=['GET'])
@jwt_required()
def get_act_value(value_id):
    """获取单个价值观详情"""
    current_user_id = get_jwt_identity()
    
    value = ACTValue.query.filter_by(
        id=value_id,
        user_id=current_user_id
    ).first()
    
    if not value:
        return jsonify({'success': False, 'message': '价值观不存在'}), 404
    
    return jsonify({
        'success': True,
        'value': value.to_dict()
    }), 200

@act_bp.route('/values/<int:value_id>', methods=['PUT'])
@jwt_required()
def update_act_value(value_id):
    """更新价值观"""
    current_user_id = get_jwt_identity()
    
    value = ACTValue.query.filter_by(
        id=value_id,
        user_id=current_user_id
    ).first()
    
    if not value:
        return jsonify({'success': False, 'message': '价值观不存在'}), 404
    
    try:
        schema = ACTValueSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    value.value_category = data['value_category']
    value.value_description = data['value_description']
    value.importance_rating = data['importance_rating']
    value.current_alignment = data['current_alignment']
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'value': value.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '更新失败，请稍后重试'}), 500

@act_bp.route('/values/<int:value_id>', methods=['DELETE'])
@jwt_required()
def delete_act_value(value_id):
    """删除价值观"""
    current_user_id = get_jwt_identity()
    
    value = ACTValue.query.filter_by(
        id=value_id,
        user_id=current_user_id
    ).first()
    
    if not value:
        return jsonify({'success': False, 'message': '价值观不存在'}), 404
    
    try:
        db.session.delete(value)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': '价值观已删除'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '删除失败，请稍后重试'}), 500

@act_bp.route('/actions', methods=['POST'])
@jwt_required()
def create_act_action():
    """创建行动计划"""
    current_user_id = get_jwt_identity()
    
    try:
        schema = ACTActionSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    # 验证价值观是否存在且属于当前用户
    value = ACTValue.query.filter_by(
        id=data['value_id'],
        user_id=current_user_id
    ).first()
    
    if not value:
        return jsonify({'success': False, 'message': '价值观不存在'}), 404
    
    action = ACTAction(
        user_id=current_user_id,
        value_id=data['value_id'],
        action_description=data['action_description'],
        target_date=data.get('target_date')
    )
    
    try:
        db.session.add(action)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'action': action.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '创建失败，请稍后重试'}), 500

@act_bp.route('/actions', methods=['GET'])
@jwt_required()
def get_act_actions():
    """获取行动计划列表"""
    current_user_id = get_jwt_identity()
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    value_id = request.args.get('value_id', type=int)
    completed = request.args.get('completed', type=bool)
    
    query = ACTAction.query.filter_by(user_id=current_user_id)
    
    if value_id:
        query = query.filter(ACTAction.value_id == value_id)
    
    if completed is not None:
        query = query.filter(ACTAction.completed == completed)
    
    query = query.order_by(ACTAction.target_date.asc().nullslast(), ACTAction.created_at.desc())
    total = query.count()
    actions = query.offset((page - 1) * limit).limit(limit).all()
    
    return jsonify({
        'success': True,
        'actions': [action.to_dict() for action in actions],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    }), 200

@act_bp.route('/actions/<int:action_id>', methods=['PUT'])
@jwt_required()
def update_act_action(action_id):
    """更新行动计划"""
    current_user_id = get_jwt_identity()
    
    action = ACTAction.query.filter_by(
        id=action_id,
        user_id=current_user_id
    ).first()
    
    if not action:
        return jsonify({'success': False, 'message': '行动计划不存在'}), 404
    
    data = request.json
    
    if 'action_description' in data:
        action.action_description = data['action_description']
    
    if 'target_date' in data:
        if data['target_date']:
            try:
                action.target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'success': False, 'message': '日期格式错误'}), 400
        else:
            action.target_date = None
    
    if 'completed' in data:
        action.completed = data['completed']
        if data['completed']:
            action.completion_date = date.today()
        else:
            action.completion_date = None
    
    if 'notes' in data:
        action.notes = data['notes']
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'action': action.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '更新失败，请稍后重试'}), 500

@act_bp.route('/actions/<int:action_id>', methods=['DELETE'])
@jwt_required()
def delete_act_action(action_id):
    """删除行动计划"""
    current_user_id = get_jwt_identity()
    
    action = ACTAction.query.filter_by(
        id=action_id,
        user_id=current_user_id
    ).first()
    
    if not action:
        return jsonify({'success': False, 'message': '行动计划不存在'}), 404
    
    try:
        db.session.delete(action)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': '行动计划已删除'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '删除失败，请稍后重试'}), 500

@act_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_act_stats():
    """获取ACT统计数据"""
    current_user_id = get_jwt_identity()
    
    # 价值观统计
    values = ACTValue.query.filter_by(user_id=current_user_id).all()
    
    if values:
        # 整体对齐分数
        total_importance = sum(value.importance_rating for value in values)
        weighted_alignment = sum(
            value.current_alignment * value.importance_rating for value in values
        )
        overall_alignment_score = weighted_alignment / total_importance if total_importance > 0 else 0
        
        # 最对齐和最不对齐的价值观
        most_aligned = max(values, key=lambda v: v.current_alignment)
        least_aligned = min(values, key=lambda v: v.current_alignment)
        
        # 最大差距的价值观
        biggest_gap_value = max(values, key=lambda v: v.importance_rating - v.current_alignment)
    else:
        overall_alignment_score = 0
        most_aligned = None
        least_aligned = None
        biggest_gap_value = None
    
    # 行动计划统计
    total_actions = ACTAction.query.filter_by(user_id=current_user_id).count()
    completed_actions = ACTAction.query.filter_by(
        user_id=current_user_id,
        completed=True
    ).count()
    
    # 即将到期的行动计划
    today = date.today()
    upcoming_actions = ACTAction.query.filter(
        and_(
            ACTAction.user_id == current_user_id,
            ACTAction.completed == False,
            ACTAction.target_date >= today,
            ACTAction.target_date <= today + timedelta(days=7)
        )
    ).count()
    
    # 过期的行动计划
    overdue_actions = ACTAction.query.filter(
        and_(
            ACTAction.user_id == current_user_id,
            ACTAction.completed == False,
            ACTAction.target_date < today
        )
    ).count()
    
    return jsonify({
        'success': True,
        'stats': {
            'overall_alignment_score': round(overall_alignment_score, 1),
            'total_values': len(values),
            'most_aligned_value': most_aligned.value_category if most_aligned else None,
            'least_aligned_value': least_aligned.value_category if least_aligned else None,
            'biggest_gap_value': biggest_gap_value.value_category if biggest_gap_value else None,
            'total_actions': total_actions,
            'completed_actions': completed_actions,
            'completion_rate': round(completed_actions / total_actions * 100, 1) if total_actions > 0 else 0,
            'upcoming_actions': upcoming_actions,
            'overdue_actions': overdue_actions
        }
    }), 200

@act_bp.route('/value-categories', methods=['GET'])
@jwt_required()
def get_value_categories():
    """获取价值观分类建议"""
    categories = [
        '家庭',
        '友谊',
        '亲密关系',
        '健康',
        '工作/职业',
        '学习/成长',
        '创造力',
        '娱乐/休闲',
        '精神/宗教',
        '社区/社会',
        '环境/自然',
        '财务安全'
    ]
    
    return jsonify({
        'success': True,
        'categories': categories
    }), 200

