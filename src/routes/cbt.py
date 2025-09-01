from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, CBTThought, User
from marshmallow import Schema, fields, ValidationError
from datetime import datetime, timedelta
from sqlalchemy import func, and_

cbt_bp = Blueprint('cbt', __name__)

class CBTThoughtSchema(Schema):
    situation = fields.Str(required=True)
    automatic_thought = fields.Str(required=True)
    emotion = fields.Str(required=True)
    emotion_intensity = fields.Int(required=True, validate=lambda x: 1 <= x <= 10)
    cognitive_distortion = fields.Str(allow_none=True)
    evidence_for = fields.Str(allow_none=True)
    evidence_against = fields.Str(allow_none=True)
    balanced_thought = fields.Str(allow_none=True)
    new_emotion_intensity = fields.Int(allow_none=True, validate=lambda x: x is None or (1 <= x <= 10))

@cbt_bp.route('/thoughts', methods=['POST'])
@jwt_required()
def create_cbt_thought():
    """创建CBT思维记录"""
    current_user_id = get_jwt_identity()
    
    try:
        schema = CBTThoughtSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    thought = CBTThought(
        user_id=current_user_id,
        situation=data['situation'],
        automatic_thought=data['automatic_thought'],
        emotion=data['emotion'],
        emotion_intensity=data['emotion_intensity'],
        cognitive_distortion=data.get('cognitive_distortion'),
        evidence_for=data.get('evidence_for'),
        evidence_against=data.get('evidence_against'),
        balanced_thought=data.get('balanced_thought'),
        new_emotion_intensity=data.get('new_emotion_intensity')
    )
    
    try:
        db.session.add(thought)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'thought_record': thought.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '创建失败，请稍后重试'}), 500

@cbt_bp.route('/thoughts', methods=['GET'])
@jwt_required()
def get_cbt_thoughts():
    """获取CBT思维记录列表"""
    current_user_id = get_jwt_identity()
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    emotion = request.args.get('emotion')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = CBTThought.query.filter_by(user_id=current_user_id)
    
    if emotion:
        query = query.filter(CBTThought.emotion == emotion)
    
    if start_date:
        try:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(CBTThought.created_at >= start_date)
        except ValueError:
            return jsonify({'success': False, 'message': '开始日期格式错误'}), 400
    
    if end_date:
        try:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(CBTThought.created_at <= end_date)
        except ValueError:
            return jsonify({'success': False, 'message': '结束日期格式错误'}), 400
    
    query = query.order_by(CBTThought.created_at.desc())
    total = query.count()
    thoughts = query.offset((page - 1) * limit).limit(limit).all()
    
    return jsonify({
        'success': True,
        'thoughts': [thought.to_dict() for thought in thoughts],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    }), 200

@cbt_bp.route('/thoughts/<int:thought_id>', methods=['GET'])
@jwt_required()
def get_cbt_thought(thought_id):
    """获取单个CBT思维记录"""
    current_user_id = get_jwt_identity()
    
    thought = CBTThought.query.filter_by(
        id=thought_id,
        user_id=current_user_id
    ).first()
    
    if not thought:
        return jsonify({'success': False, 'message': '思维记录不存在'}), 404
    
    return jsonify({
        'success': True,
        'thought_record': thought.to_dict()
    }), 200

@cbt_bp.route('/thoughts/<int:thought_id>', methods=['PUT'])
@jwt_required()
def update_cbt_thought(thought_id):
    """更新CBT思维记录"""
    current_user_id = get_jwt_identity()
    
    thought = CBTThought.query.filter_by(
        id=thought_id,
        user_id=current_user_id
    ).first()
    
    if not thought:
        return jsonify({'success': False, 'message': '思维记录不存在'}), 404
    
    try:
        schema = CBTThoughtSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    # 更新字段
    thought.situation = data['situation']
    thought.automatic_thought = data['automatic_thought']
    thought.emotion = data['emotion']
    thought.emotion_intensity = data['emotion_intensity']
    thought.cognitive_distortion = data.get('cognitive_distortion')
    thought.evidence_for = data.get('evidence_for')
    thought.evidence_against = data.get('evidence_against')
    thought.balanced_thought = data.get('balanced_thought')
    thought.new_emotion_intensity = data.get('new_emotion_intensity')
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'thought_record': thought.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '更新失败，请稍后重试'}), 500

@cbt_bp.route('/thoughts/<int:thought_id>', methods=['DELETE'])
@jwt_required()
def delete_cbt_thought(thought_id):
    """删除CBT思维记录"""
    current_user_id = get_jwt_identity()
    
    thought = CBTThought.query.filter_by(
        id=thought_id,
        user_id=current_user_id
    ).first()
    
    if not thought:
        return jsonify({'success': False, 'message': '思维记录不存在'}), 404
    
    try:
        db.session.delete(thought)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': '思维记录已删除'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '删除失败，请稍后重试'}), 500

@cbt_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_cbt_stats():
    """获取CBT统计数据"""
    current_user_id = get_jwt_identity()
    period = request.args.get('period', 'month')  # week, month, year
    
    # 计算时间范围
    now = datetime.utcnow()
    if period == 'week':
        start_date = now - timedelta(days=7)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)
    
    # 总记录数
    total_records = CBTThought.query.filter(
        and_(
            CBTThought.user_id == current_user_id,
            CBTThought.created_at >= start_date
        )
    ).count()
    
    # 平均情绪强度改善
    thoughts_with_improvement = CBTThought.query.filter(
        and_(
            CBTThought.user_id == current_user_id,
            CBTThought.created_at >= start_date,
            CBTThought.new_emotion_intensity.isnot(None)
        )
    ).all()
    
    if thoughts_with_improvement:
        total_improvement = sum(
            thought.emotion_intensity - thought.new_emotion_intensity
            for thought in thoughts_with_improvement
        )
        avg_improvement = total_improvement / len(thoughts_with_improvement)
        improvement_percentage = (avg_improvement / 10) * 100  # 转换为百分比
    else:
        avg_improvement = 0
        improvement_percentage = 0
    
    # 最常见的认知扭曲
    distortion_counts = db.session.query(
        CBTThought.cognitive_distortion,
        func.count(CBTThought.id).label('count')
    ).filter(
        and_(
            CBTThought.user_id == current_user_id,
            CBTThought.created_at >= start_date,
            CBTThought.cognitive_distortion.isnot(None)
        )
    ).group_by(CBTThought.cognitive_distortion).order_by(
        func.count(CBTThought.id).desc()
    ).all()
    
    most_common_distortion = distortion_counts[0][0] if distortion_counts else None
    
    # 最常见的情绪
    emotion_counts = db.session.query(
        CBTThought.emotion,
        func.count(CBTThought.id).label('count')
    ).filter(
        and_(
            CBTThought.user_id == current_user_id,
            CBTThought.created_at >= start_date
        )
    ).group_by(CBTThought.emotion).order_by(
        func.count(CBTThought.id).desc()
    ).all()
    
    emotion_distribution = {emotion: count for emotion, count in emotion_counts}
    
    return jsonify({
        'success': True,
        'stats': {
            'total_records': total_records,
            'average_improvement': round(avg_improvement, 1),
            'improvement_percentage': round(improvement_percentage, 1),
            'most_common_distortion': most_common_distortion,
            'emotion_distribution': emotion_distribution,
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat()
        }
    }), 200

@cbt_bp.route('/distortions', methods=['GET'])
@jwt_required()
def get_cognitive_distortions():
    """获取认知扭曲类型列表"""
    distortions = [
        '全或无思维',
        '过度概括',
        '心理过滤',
        '否定正面',
        '妄下结论',
        '读心术',
        '算命师错误',
        '放大和缩小',
        '情绪化推理',
        '应该陈述',
        '贴标签',
        '个人化'
    ]
    
    return jsonify({
        'success': True,
        'distortions': distortions
    }), 200

