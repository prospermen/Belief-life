from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, GuidedExercise, ExerciseSession, User
from marshmallow import Schema, fields, ValidationError
from datetime import datetime

exercises_bp = Blueprint('exercises', __name__)

class ExerciseSessionSchema(Schema):
    exercise_id = fields.Int(required=True)
    duration_completed = fields.Int(allow_none=True)
    completed = fields.Bool(load_default=False)
    notes = fields.Str(allow_none=True)

@exercises_bp.route('', methods=['GET'])
@jwt_required()
def get_exercises():
    """获取引导练习列表"""
    category = request.args.get('category')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    
    query = GuidedExercise.query
    
    if category:
        query = query.filter(GuidedExercise.category == category)
    
    total = query.count()
    exercises = query.offset((page - 1) * limit).limit(limit).all()
    
    return jsonify({
        'success': True,
        'exercises': [exercise.to_dict() for exercise in exercises],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    }), 200

@exercises_bp.route('/<int:exercise_id>', methods=['GET'])
@jwt_required()
def get_exercise(exercise_id):
    """获取单个引导练习详情"""
    exercise = GuidedExercise.query.get(exercise_id)
    
    if not exercise:
        return jsonify({'success': False, 'message': '练习不存在'}), 404
    
    return jsonify({
        'success': True,
        'exercise': exercise.to_dict()
    }), 200

@exercises_bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_exercise_session():
    """记录练习会话"""
    current_user_id = get_jwt_identity()
    
    try:
        schema = ExerciseSessionSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'success': False, 'errors': err.messages}), 400
    
    # 验证练习是否存在
    exercise = GuidedExercise.query.get(data['exercise_id'])
    if not exercise:
        return jsonify({'success': False, 'message': '练习不存在'}), 404
    
    session = ExerciseSession(
        user_id=current_user_id,
        exercise_id=data['exercise_id'],
        duration_completed=data.get('duration_completed'),
        completed=data['completed'],
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

@exercises_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_exercise_sessions():
    """获取用户的练习会话记录"""
    current_user_id = get_jwt_identity()
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    exercise_id = request.args.get('exercise_id', type=int)
    
    query = ExerciseSession.query.filter_by(user_id=current_user_id)
    
    if exercise_id:
        query = query.filter(ExerciseSession.exercise_id == exercise_id)
    
    query = query.order_by(ExerciseSession.created_at.desc())
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

@exercises_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_exercise_categories():
    """获取练习分类"""
    categories = db.session.query(GuidedExercise.category).distinct().all()
    category_list = [category[0] for category in categories]
    
    return jsonify({
        'success': True,
        'categories': category_list
    }), 200

@exercises_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_exercise_stats():
    """获取练习统计"""
    current_user_id = get_jwt_identity()
    
    # 总练习次数
    total_sessions = ExerciseSession.query.filter_by(user_id=current_user_id).count()
    
    # 完成的练习次数
    completed_sessions = ExerciseSession.query.filter_by(
        user_id=current_user_id,
        completed=True
    ).count()
    
    # 总练习时长（分钟）
    total_duration = db.session.query(
        db.func.sum(ExerciseSession.duration_completed)
    ).filter_by(user_id=current_user_id).scalar() or 0
    
    # 最喜欢的练习类型
    favorite_category = db.session.query(
        GuidedExercise.category,
        db.func.count(ExerciseSession.id).label('count')
    ).join(ExerciseSession).filter(
        ExerciseSession.user_id == current_user_id
    ).group_by(GuidedExercise.category).order_by(
        db.func.count(ExerciseSession.id).desc()
    ).first()
    
    return jsonify({
        'success': True,
        'stats': {
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'completion_rate': round(completed_sessions / total_sessions * 100, 1) if total_sessions > 0 else 0,
            'total_duration_minutes': round(total_duration / 60, 1) if total_duration else 0,
            'favorite_category': favorite_category[0] if favorite_category else None
        }
    }), 200

# 初始化一些示例练习数据
def init_sample_exercises():
    """初始化示例练习数据"""
    sample_exercises = [
        {
            'title': '深度呼吸练习',
            'category': 'breathing',
            'duration': 300,
            'description': '通过深度呼吸来放松身心，缓解压力和焦虑',
            'audio_url': '/audio/breathing_exercise_1.mp3',
            'instructions': {
                'steps': [
                    '找到一个舒适的坐姿或躺姿',
                    '闭上眼睛，将注意力集中在呼吸上',
                    '慢慢深吸气，感受腹部的起伏',
                    '缓慢呼气，释放所有的紧张感',
                    '重复这个过程，保持专注'
                ]
            }
        },
        {
            'title': '身体扫描冥想',
            'category': 'meditation',
            'duration': 600,
            'description': '通过身体扫描来增强身体意识，促进深度放松',
            'audio_url': '/audio/body_scan_meditation.mp3',
            'instructions': {
                'steps': [
                    '躺下或坐在舒适的位置',
                    '从头顶开始，逐渐将注意力移向身体各部位',
                    '注意每个部位的感觉，不做判断',
                    '如果发现紧张的地方，轻柔地放松',
                    '最后回到整体的身体感受'
                ]
            }
        },
        {
            'title': '渐进式肌肉放松',
            'category': 'relaxation',
            'duration': 900,
            'description': '通过逐步紧张和放松肌肉群来达到深度放松',
            'audio_url': '/audio/progressive_muscle_relaxation.mp3',
            'instructions': {
                'steps': [
                    '找到安静舒适的环境',
                    '从脚趾开始，逐渐紧张肌肉5秒',
                    '然后突然放松，感受放松的感觉',
                    '依次对身体各部位重复这个过程',
                    '最后享受全身放松的状态'
                ]
            }
        },
        {
            'title': '睡前冥想',
            'category': 'sleep',
            'duration': 1200,
            'description': '帮助你放松身心，准备进入深度睡眠',
            'audio_url': '/audio/bedtime_meditation.mp3',
            'instructions': {
                'steps': [
                    '躺在床上，调整到最舒适的姿势',
                    '深呼吸几次，释放一天的压力',
                    '想象一个宁静美好的场景',
                    '让思绪慢慢平静下来',
                    '随着引导进入深度放松状态'
                ]
            }
        }
    ]
    
    for exercise_data in sample_exercises:
        existing = GuidedExercise.query.filter_by(title=exercise_data['title']).first()
        if not existing:
            exercise = GuidedExercise(
                title=exercise_data['title'],
                category=exercise_data['category'],
                duration=exercise_data['duration'],
                description=exercise_data['description'],
                audio_url=exercise_data['audio_url']
            )
            exercise.set_instructions(exercise_data['instructions'])
            db.session.add(exercise)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing sample exercises: {e}")

# 在应用启动时调用
def initialize_exercises():
    init_sample_exercises()

