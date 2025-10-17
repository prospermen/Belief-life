from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, EmotionLog, User
from marshmallow import Schema, fields, ValidationError
from datetime import datetime, timedelta
from sqlalchemy import func, and_

emotions_bp = Blueprint('emotions', __name__)

class EmotionLogSchema(Schema):
    emotion_type = fields.Str(required=True, validate=lambda x: x in ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited'])
    intensity = fields.Int(required=True, validate=lambda x: 1 <= x <= 10)
    content = fields.Str(allow_none=True)
    tags = fields.List(fields.Str(), allow_none=True)

@emotions_bp.route('', methods=['POST'])
@jwt_required()
def create_emotion_log():
    """创建情绪日志"""
    current_user_id = get_jwt_identity()
    
    try:
        schema = EmotionLogSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    emotion_log = EmotionLog(
        user_id=current_user_id,
        emotion_type=data['emotion_type'],
        intensity=data['intensity'],
        content=data.get('content', ''),
    )
    
    if data.get('tags'):
        emotion_log.set_tags(data['tags'])
    
    try:
        db.session.add(emotion_log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'emotion_log': emotion_log.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '创建失败，请稍后重试'}), 500

@emotions_bp.route('', methods=['GET'])
@jwt_required()
def get_emotion_logs():
    """获取情绪日志列表"""
    current_user_id = get_jwt_identity()
    
    # 获取查询参数
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    emotion_type = request.args.get('emotion_type')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # 构建查询
    query = EmotionLog.query.filter_by(user_id=current_user_id)
    
    if emotion_type:
        query = query.filter(EmotionLog.emotion_type == emotion_type)
    
    if start_date:
        try:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(EmotionLog.created_at >= start_date)
        except ValueError:
            return jsonify({'success': False, 'message': '开始日期格式错误'}), 400
    
    if end_date:
        try:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(EmotionLog.created_at <= end_date)
        except ValueError:
            return jsonify({'success': False, 'message': '结束日期格式错误'}), 400
    
    # 分页查询
    query = query.order_by(EmotionLog.created_at.desc())
    total = query.count()
    emotions = query.offset((page - 1) * limit).limit(limit).all()
    
    return jsonify({
        'success': True,
        'emotions': [emotion.to_dict() for emotion in emotions],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    }), 200

@emotions_bp.route('/<int:emotion_id>', methods=['GET'])
@jwt_required()
def get_emotion_log(emotion_id):
    """获取单个情绪日志"""
    current_user_id = get_jwt_identity()
    
    emotion_log = EmotionLog.query.filter_by(
        id=emotion_id,
        user_id=current_user_id
    ).first()
    
    if not emotion_log:
        return jsonify({'success': False, 'message': '情绪日志不存在'}), 404
    
    return jsonify({
        'success': True,
        'emotion_log': emotion_log.to_dict()
    }), 200

@emotions_bp.route('/<int:emotion_id>', methods=['PUT'])
@jwt_required()
def update_emotion_log(emotion_id):
    """更新情绪日志"""
    current_user_id = get_jwt_identity()
    
    emotion_log = EmotionLog.query.filter_by(
        id=emotion_id,
        user_id=current_user_id
    ).first()
    
    if not emotion_log:
        return jsonify({'success': False, 'message': '情绪日志不存在'}), 404
    
    try:
        schema = EmotionLogSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    # 更新字段
    emotion_log.emotion_type = data['emotion_type']
    emotion_log.intensity = data['intensity']
    emotion_log.content = data.get('content', '')
    
    if data.get('tags'):
        emotion_log.set_tags(data['tags'])
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'emotion_log': emotion_log.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '更新失败，请稍后重试'}), 500

@emotions_bp.route('/<int:emotion_id>', methods=['DELETE'])
@jwt_required()
def delete_emotion_log(emotion_id):
    """删除情绪日志"""
    current_user_id = get_jwt_identity()
    
    emotion_log = EmotionLog.query.filter_by(
        id=emotion_id,
        user_id=current_user_id
    ).first()
    
    if not emotion_log:
        return jsonify({'success': False, 'message': '情绪日志不存在'}), 404
    
    try:
        db.session.delete(emotion_log)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': '情绪日志已删除'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '删除失败，请稍后重试'}), 500

@emotions_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_emotion_stats():
    """获取情绪统计"""
    current_user_id = get_jwt_identity()
    period = request.args.get('period', 'week')  # week, month, year
    
    # 计算时间范围
    now = datetime.utcnow()
    if period == 'week':
        start_date = now - timedelta(days=7)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=7)
    
    # 情绪分布统计
    emotion_distribution = db.session.query(
        EmotionLog.emotion_type,
        func.count(EmotionLog.id).label('count')
    ).filter(
        and_(
            EmotionLog.user_id == current_user_id,
            EmotionLog.created_at >= start_date
        )
    ).group_by(EmotionLog.emotion_type).all()
    
    emotion_dist_dict = {emotion: count for emotion, count in emotion_distribution}
    
    # 平均强度
    avg_intensity = db.session.query(
        func.avg(EmotionLog.intensity)
    ).filter(
        and_(
            EmotionLog.user_id == current_user_id,
            EmotionLog.created_at >= start_date
        )
    ).scalar()
    
    # 总条目数
    total_entries = db.session.query(
        func.count(EmotionLog.id)
    ).filter(
        and_(
            EmotionLog.user_id == current_user_id,
            EmotionLog.created_at >= start_date
        )
    ).scalar()
    
    # 最常用标签（简化实现）
    logs_with_tags = EmotionLog.query.filter(
        and_(
            EmotionLog.user_id == current_user_id,
            EmotionLog.created_at >= start_date,
            EmotionLog.tags.isnot(None)
        )
    ).all()
    
    all_tags = []
    for log in logs_with_tags:
        all_tags.extend(log.get_tags())
    
    # 统计标签频率
    tag_counts = {}
    for tag in all_tags:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    most_common_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    most_common_tags = [tag for tag, count in most_common_tags]
    
    return jsonify({
        'success': True,
        'stats': {
            'emotion_distribution': emotion_dist_dict,
            'average_intensity': round(avg_intensity, 1) if avg_intensity else 0,
            'total_entries': total_entries or 0,
            'most_common_tags': most_common_tags,
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat()
        }
    }), 200

