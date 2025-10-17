from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, SOSSession, User
from marshmallow import Schema, fields, ValidationError
from datetime import datetime, timedelta
from sqlalchemy import func, and_

sos_bp = Blueprint('sos', __name__)

class SOSSessionSchema(Schema):
    session_type = fields.Str(required=True, validate=lambda x: x in ['处理感受', '处理想法'])
    technique_used = fields.Str(required=True)
    duration = fields.Int(allow_none=True)
    effectiveness_rating = fields.Int(allow_none=True, validate=lambda x: x is None or (1 <= x <= 5))
    notes = fields.Str(allow_none=True)

@sos_bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_sos_session():
    """记录SOS使用会话"""
    current_user_id = get_jwt_identity()
    
    try:
        schema = SOSSessionSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    session = SOSSession(
        user_id=current_user_id,
        session_type=data['session_type'],
        technique_used=data['technique_used'],
        duration=data.get('duration'),
        effectiveness_rating=data.get('effectiveness_rating'),
        notes=data.get('notes', '')
    )
    
    try:
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'session': session.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '记录失败，请稍后重试'}), 500

@sos_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sos_sessions():
    """获取SOS使用记录"""
    current_user_id = get_jwt_identity()
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    session_type = request.args.get('session_type')
    
    query = SOSSession.query.filter_by(user_id=current_user_id)
    
    if session_type:
        query = query.filter(SOSSession.session_type == session_type)
    
    query = query.order_by(SOSSession.created_at.desc())
    total = query.count()
    sessions = query.offset((page - 1) * limit).limit(limit).all()
    
    return jsonify({
        'success': True,
        'sessions': [session.to_dict() for session in sessions],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    }), 200

@sos_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_sos_recommendations():
    """获取SOS技巧推荐"""
    current_user_id = get_jwt_identity()
    
    # 基于用户历史使用情况推荐技巧
    user_sessions = SOSSession.query.filter_by(user_id=current_user_id).all()
    
    # 计算各技巧的平均有效性评分
    technique_effectiveness = {}
    technique_usage = {}
    
    for session in user_sessions:
        technique = session.technique_used
        if technique not in technique_effectiveness:
            technique_effectiveness[technique] = []
            technique_usage[technique] = 0
        
        if session.effectiveness_rating:
            technique_effectiveness[technique].append(session.effectiveness_rating)
        technique_usage[technique] += 1
    
    # 计算平均评分
    avg_effectiveness = {}
    for technique, ratings in technique_effectiveness.items():
        if ratings:
            avg_effectiveness[technique] = sum(ratings) / len(ratings)
        else:
            avg_effectiveness[technique] = 3.0  # 默认评分
    
    # 预定义的SOS技巧库
    all_techniques = {
        '处理感受': [
            {
                'technique': '方框呼吸',
                'description': '吸气4秒，屏息4秒，呼气4秒，屏息4秒',
                'estimated_duration': 120,
                'instructions': [
                    '找到舒适的坐姿',
                    '吸气4秒钟',
                    '屏住呼吸4秒钟',
                    '呼气4秒钟',
                    '再次屏住呼吸4秒钟',
                    '重复这个循环'
                ]
            },
            {
                'technique': '4-7-8呼吸',
                'description': '吸气4秒，屏息7秒，呼气8秒',
                'estimated_duration': 180,
                'instructions': [
                    '用鼻子吸气4秒',
                    '屏住呼吸7秒',
                    '用嘴呼气8秒',
                    '重复3-4次循环'
                ]
            },
            {
                'technique': '感受的浪潮',
                'description': '观察和接纳强烈情绪的正念练习',
                'estimated_duration': 300,
                'instructions': [
                    '注意身体中情绪的感觉',
                    '想象情绪像海浪一样',
                    '观察它的起伏变化',
                    '不要试图控制或改变',
                    '让情绪自然流过'
                ]
            },
            {
                'technique': '5-4-3-2-1接地技巧',
                'description': '通过感官觉察回到当下',
                'estimated_duration': 180,
                'instructions': [
                    '说出5样你能看到的东西',
                    '说出4样你能触摸到的东西',
                    '说出3样你能听到的声音',
                    '说出2样你能闻到的气味',
                    '说出1样你能尝到的味道'
                ]
            }
        ],
        '处理想法': [
            {
                'technique': '思维降温三步法',
                'description': '识别、动摇、重构负面想法的简化流程',
                'estimated_duration': 240,
                'instructions': [
                    '第一步：识别自动化负面想法',
                    '第二步：质疑这个想法的真实性',
                    '第三步：寻找更平衡的替代想法'
                ]
            },
            {
                'technique': '思维泡泡',
                'description': '将想法放入泡泡中，观察其飘走',
                'estimated_duration': 180,
                'instructions': [
                    '想象你的想法被装在一个泡泡里',
                    '看着这个泡泡慢慢飘向天空',
                    '不要抓住或追逐这个泡泡',
                    '让它自然地飘走'
                ]
            },
            {
                'technique': '思维列车',
                'description': '作为月台观察者，观察思维列车驶过',
                'estimated_duration': 200,
                'instructions': [
                    '想象自己站在火车站月台上',
                    '看到一列装载着你想法的火车',
                    '观察火车慢慢驶过',
                    '不要跳上火车',
                    '只是静静地观察'
                ]
            },
            {
                'technique': '感谢你的大脑',
                'description': '对大脑的保护性想法表示感谢',
                'estimated_duration': 120,
                'instructions': [
                    '识别出负面想法',
                    '对大脑说："谢谢你想保护我"',
                    '承认想法的存在但不被它控制',
                    '选择更有帮助的行动'
                ]
            }
        ]
    }
    
    # 为每个技巧添加有效性评分
    recommendations = []
    for session_type, techniques in all_techniques.items():
        for technique_info in techniques:
            technique_name = technique_info['technique']
            effectiveness_score = avg_effectiveness.get(technique_name, 3.0)
            usage_count = technique_usage.get(technique_name, 0)
            
            # 如果用户很少使用某个技巧，给它更高的推荐优先级
            novelty_bonus = max(0, 3 - usage_count) * 0.2
            final_score = min(5.0, effectiveness_score + novelty_bonus)
            
            recommendations.append({
                'type': session_type,
                'technique': technique_name,
                'description': technique_info['description'],
                'estimated_duration': technique_info['estimated_duration'],
                'instructions': technique_info['instructions'],
                'effectiveness_score': round(final_score, 1),
                'usage_count': usage_count
            })
    
    # 按有效性评分排序
    recommendations.sort(key=lambda x: x['effectiveness_score'], reverse=True)
    
    return jsonify({
        'success': True,
        'recommendations': recommendations[:8]  # 返回前8个推荐
    }), 200

@sos_bp.route('/techniques', methods=['GET'])
@jwt_required()
def get_sos_techniques():
    """获取所有SOS技巧"""
    session_type = request.args.get('type')  # '处理感受' 或 '处理想法'
    
    techniques = {
        '处理感受': [
            '方框呼吸',
            '4-7-8呼吸',
            '感受的浪潮',
            '5-4-3-2-1接地技巧',
            '渐进式肌肉放松',
            '冷水洗脸',
            '握冰块',
            '深度呼吸'
        ],
        '处理想法': [
            '思维降温三步法',
            '思维泡泡',
            '思维列车',
            '感谢你的大脑',
            '滑稽声音',
            '溪流上的叶子',
            '想法标签',
            '认知重构'
        ]
    }
    
    if session_type and session_type in techniques:
        result = {session_type: techniques[session_type]}
    else:
        result = techniques
    
    return jsonify({
        'success': True,
        'techniques': result
    }), 200

@sos_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_sos_stats():
    """获取SOS使用统计"""
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
    
    # 总使用次数
    total_sessions = SOSSession.query.filter(
        and_(
            SOSSession.user_id == current_user_id,
            SOSSession.created_at >= start_date
        )
    ).count()
    
    # 按类型分组统计
    type_distribution = db.session.query(
        SOSSession.session_type,
        func.count(SOSSession.id).label('count')
    ).filter(
        and_(
            SOSSession.user_id == current_user_id,
            SOSSession.created_at >= start_date
        )
    ).group_by(SOSSession.session_type).all()
    
    type_dist_dict = {session_type: count for session_type, count in type_distribution}
    
    # 最常用技巧
    technique_distribution = db.session.query(
        SOSSession.technique_used,
        func.count(SOSSession.id).label('count')
    ).filter(
        and_(
            SOSSession.user_id == current_user_id,
            SOSSession.created_at >= start_date
        )
    ).group_by(SOSSession.technique_used).order_by(
        func.count(SOSSession.id).desc()
    ).limit(5).all()
    
    most_used_techniques = [
        {'technique': technique, 'count': count}
        for technique, count in technique_distribution
    ]
    
    # 平均有效性评分
    avg_effectiveness = db.session.query(
        func.avg(SOSSession.effectiveness_rating)
    ).filter(
        and_(
            SOSSession.user_id == current_user_id,
            SOSSession.created_at >= start_date,
            SOSSession.effectiveness_rating.isnot(None)
        )
    ).scalar()
    
    # 总使用时长
    total_duration = db.session.query(
        func.sum(SOSSession.duration)
    ).filter(
        and_(
            SOSSession.user_id == current_user_id,
            SOSSession.created_at >= start_date,
            SOSSession.duration.isnot(None)
        )
    ).scalar() or 0
    
    return jsonify({
        'success': True,
        'stats': {
            'total_sessions': total_sessions,
            'type_distribution': type_dist_dict,
            'most_used_techniques': most_used_techniques,
            'average_effectiveness': round(avg_effectiveness, 1) if avg_effectiveness else 0,
            'total_duration_minutes': round(total_duration / 60, 1) if total_duration else 0,
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat()
        }
    }), 200

