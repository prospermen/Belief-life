from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, EmotionLog, CBTThought, ACTValue, ACTAction, SOSSession, ExerciseSession
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
from collections import Counter
import calendar

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('', methods=['GET'])
@jwt_required()
def get_insights():
    """获取智能洞察"""
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
    
    insights = {
        'emotion_patterns': _analyze_emotion_patterns(current_user_id, start_date, now),
        'cbt_progress': _analyze_cbt_progress(current_user_id, start_date, now),
        'act_alignment': _analyze_act_alignment(current_user_id),
        'exercise_habits': _analyze_exercise_habits(current_user_id, start_date, now),
        'sos_usage': _analyze_sos_usage(current_user_id, start_date, now),
        'recommendations': _generate_recommendations(current_user_id, start_date, now),
        'period': period,
        'start_date': start_date.isoformat(),
        'end_date': now.isoformat()
    }
    
    return jsonify({
        'success': True,
        'insights': insights
    }), 200

def _analyze_emotion_patterns(user_id, start_date, end_date):
    """分析情绪模式"""
    emotions = EmotionLog.query.filter(
        and_(
            EmotionLog.user_id == user_id,
            EmotionLog.created_at >= start_date,
            EmotionLog.created_at <= end_date
        )
    ).all()
    
    if not emotions:
        return {
            'weekly_trend': '暂无足够数据进行分析',
            'peak_days': [],
            'low_days': [],
            'dominant_emotion': None,
            'intensity_trend': 'stable'
        }
    
    # 按星期几分组分析
    weekday_emotions = {}
    weekday_intensities = {}
    
    for emotion in emotions:
        weekday = emotion.created_at.weekday()  # 0=Monday, 6=Sunday
        weekday_name = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][weekday]
        
        if weekday_name not in weekday_emotions:
            weekday_emotions[weekday_name] = []
            weekday_intensities[weekday_name] = []
        
        weekday_emotions[weekday_name].append(emotion.emotion_type)
        weekday_intensities[weekday_name].append(emotion.intensity)
    
    # 计算每天的平均强度
    avg_intensities = {}
    for day, intensities in weekday_intensities.items():
        avg_intensities[day] = sum(intensities) / len(intensities)
    
    # 找出情绪最好和最差的日子
    if avg_intensities:
        peak_days = [day for day, intensity in avg_intensities.items() 
                    if intensity == max(avg_intensities.values())]
        low_days = [day for day, intensity in avg_intensities.items() 
                   if intensity == min(avg_intensities.values())]
    else:
        peak_days = []
        low_days = []
    
    # 分析主导情绪
    all_emotions = [e.emotion_type for e in emotions]
    emotion_counter = Counter(all_emotions)
    dominant_emotion = emotion_counter.most_common(1)[0][0] if emotion_counter else None
    
    # 分析强度趋势
    if len(emotions) >= 3:
        recent_emotions = sorted(emotions, key=lambda x: x.created_at)
        first_third = recent_emotions[:len(recent_emotions)//3]
        last_third = recent_emotions[-len(recent_emotions)//3:]
        
        avg_first = sum(e.intensity for e in first_third) / len(first_third)
        avg_last = sum(e.intensity for e in last_third) / len(last_third)
        
        if avg_last > avg_first + 0.5:
            intensity_trend = 'improving'
        elif avg_last < avg_first - 0.5:
            intensity_trend = 'declining'
        else:
            intensity_trend = 'stable'
    else:
        intensity_trend = 'stable'
    
    # 生成趋势描述
    if intensity_trend == 'improving':
        trend_desc = '情绪整体呈上升趋势'
    elif intensity_trend == 'declining':
        trend_desc = '情绪有所下降，建议关注'
    else:
        trend_desc = '情绪保持相对稳定'
    
    return {
        'weekly_trend': trend_desc,
        'peak_days': peak_days,
        'low_days': low_days,
        'dominant_emotion': dominant_emotion,
        'intensity_trend': intensity_trend,
        'average_intensity': round(sum(e.intensity for e in emotions) / len(emotions), 1)
    }

def _analyze_cbt_progress(user_id, start_date, end_date):
    """分析CBT进展"""
    thoughts = CBTThought.query.filter(
        and_(
            CBTThought.user_id == user_id,
            CBTThought.created_at >= start_date,
            CBTThought.created_at <= end_date
        )
    ).all()
    
    if not thoughts:
        return {
            'thought_challenging_improvement': 0,
            'most_common_distortion': None,
            'average_improvement': 0,
            'progress_trend': 'no_data'
        }
    
    # 计算思维挑战改善程度
    thoughts_with_improvement = [t for t in thoughts if t.new_emotion_intensity is not None]
    
    if thoughts_with_improvement:
        total_improvement = sum(
            t.emotion_intensity - t.new_emotion_intensity 
            for t in thoughts_with_improvement
        )
        avg_improvement = total_improvement / len(thoughts_with_improvement)
        improvement_percentage = min(100, max(0, (avg_improvement / 10) * 100))
    else:
        avg_improvement = 0
        improvement_percentage = 0
    
    # 最常见的认知扭曲
    distortions = [t.cognitive_distortion for t in thoughts if t.cognitive_distortion]
    distortion_counter = Counter(distortions)
    most_common_distortion = distortion_counter.most_common(1)[0][0] if distortion_counter else None
    
    # 进展趋势分析
    if len(thoughts_with_improvement) >= 3:
        recent_thoughts = sorted(thoughts_with_improvement, key=lambda x: x.created_at)
        first_half = recent_thoughts[:len(recent_thoughts)//2]
        second_half = recent_thoughts[len(recent_thoughts)//2:]
        
        avg_improvement_first = sum(
            t.emotion_intensity - t.new_emotion_intensity for t in first_half
        ) / len(first_half)
        
        avg_improvement_second = sum(
            t.emotion_intensity - t.new_emotion_intensity for t in second_half
        ) / len(second_half)
        
        if avg_improvement_second > avg_improvement_first + 0.5:
            progress_trend = 'improving'
        elif avg_improvement_second < avg_improvement_first - 0.5:
            progress_trend = 'declining'
        else:
            progress_trend = 'stable'
    else:
        progress_trend = 'stable'
    
    return {
        'thought_challenging_improvement': round(improvement_percentage, 1),
        'most_common_distortion': most_common_distortion,
        'average_improvement': round(avg_improvement, 1),
        'progress_trend': progress_trend,
        'total_records': len(thoughts)
    }

def _analyze_act_alignment(user_id):
    """分析ACT价值观对齐"""
    values = ACTValue.query.filter_by(user_id=user_id).all()
    
    if not values:
        return {
            'overall_score': 0,
            'most_aligned_value': None,
            'least_aligned_value': None,
            'biggest_gap_value': None,
            'total_values': 0
        }
    
    # 计算整体对齐分数
    total_importance = sum(v.importance_rating for v in values)
    weighted_alignment = sum(v.current_alignment * v.importance_rating for v in values)
    overall_score = weighted_alignment / total_importance if total_importance > 0 else 0
    
    # 找出最对齐和最不对齐的价值观
    most_aligned = max(values, key=lambda v: v.current_alignment)
    least_aligned = min(values, key=lambda v: v.current_alignment)
    
    # 找出差距最大的价值观
    biggest_gap = max(values, key=lambda v: v.importance_rating - v.current_alignment)
    
    return {
        'overall_score': round(overall_score, 1),
        'most_aligned_value': most_aligned.value_category,
        'least_aligned_value': least_aligned.value_category,
        'biggest_gap_value': biggest_gap.value_category,
        'total_values': len(values)
    }

def _analyze_exercise_habits(user_id, start_date, end_date):
    """分析练习习惯"""
    sessions = ExerciseSession.query.filter(
        and_(
            ExerciseSession.user_id == user_id,
            ExerciseSession.created_at >= start_date,
            ExerciseSession.created_at <= end_date
        )
    ).all()
    
    if not sessions:
        return {
            'consistency_score': 0,
            'preferred_time': None,
            'completion_rate': 0,
            'total_sessions': 0
        }
    
    # 计算完成率
    completed_sessions = [s for s in sessions if s.completed]
    completion_rate = len(completed_sessions) / len(sessions) * 100 if sessions else 0
    
    # 分析偏好时间
    session_hours = [s.created_at.hour for s in sessions]
    hour_counter = Counter(session_hours)
    most_common_hour = hour_counter.most_common(1)[0][0] if hour_counter else None
    
    if most_common_hour is not None:
        if 6 <= most_common_hour < 12:
            preferred_time = '早晨'
        elif 12 <= most_common_hour < 18:
            preferred_time = '下午'
        else:
            preferred_time = '晚上'
    else:
        preferred_time = None
    
    # 计算一致性分数（基于练习频率）
    days_in_period = (end_date - start_date).days
    if days_in_period > 0:
        sessions_per_day = len(sessions) / days_in_period
        consistency_score = min(100, sessions_per_day * 100)  # 每天一次练习为100分
    else:
        consistency_score = 0
    
    return {
        'consistency_score': round(consistency_score, 1),
        'preferred_time': preferred_time,
        'completion_rate': round(completion_rate, 1),
        'total_sessions': len(sessions)
    }

def _analyze_sos_usage(user_id, start_date, end_date):
    """分析SOS使用情况"""
    sessions = SOSSession.query.filter(
        and_(
            SOSSession.user_id == user_id,
            SOSSession.created_at >= start_date,
            SOSSession.created_at <= end_date
        )
    ).all()
    
    if not sessions:
        return {
            'usage_frequency': 0,
            'most_effective_technique': None,
            'preferred_type': None,
            'average_effectiveness': 0
        }
    
    # 使用频率
    days_in_period = (end_date - start_date).days
    usage_frequency = len(sessions) / max(1, days_in_period)
    
    # 最有效的技巧
    technique_effectiveness = {}
    for session in sessions:
        if session.effectiveness_rating:
            technique = session.technique_used
            if technique not in technique_effectiveness:
                technique_effectiveness[technique] = []
            technique_effectiveness[technique].append(session.effectiveness_rating)
    
    avg_effectiveness_by_technique = {}
    for technique, ratings in technique_effectiveness.items():
        avg_effectiveness_by_technique[technique] = sum(ratings) / len(ratings)
    
    most_effective_technique = max(
        avg_effectiveness_by_technique.items(),
        key=lambda x: x[1]
    )[0] if avg_effectiveness_by_technique else None
    
    # 偏好类型
    type_counter = Counter([s.session_type for s in sessions])
    preferred_type = type_counter.most_common(1)[0][0] if type_counter else None
    
    # 平均有效性
    ratings = [s.effectiveness_rating for s in sessions if s.effectiveness_rating]
    average_effectiveness = sum(ratings) / len(ratings) if ratings else 0
    
    return {
        'usage_frequency': round(usage_frequency, 2),
        'most_effective_technique': most_effective_technique,
        'preferred_type': preferred_type,
        'average_effectiveness': round(average_effectiveness, 1)
    }

def _generate_recommendations(user_id, start_date, end_date):
    """生成个性化推荐"""
    recommendations = []
    
    # 基于情绪模式的推荐
    emotion_patterns = _analyze_emotion_patterns(user_id, start_date, end_date)
    if emotion_patterns['low_days']:
        recommendations.append(
            f"建议在{', '.join(emotion_patterns['low_days'])}增加正念练习或SOS技巧使用"
        )
    
    if emotion_patterns['intensity_trend'] == 'declining':
        recommendations.append("最近情绪有所下降，建议增加CBT思维记录练习")
    
    # 基于CBT进展的推荐
    cbt_progress = _analyze_cbt_progress(user_id, start_date, end_date)
    if cbt_progress['most_common_distortion']:
        recommendations.append(
            f"继续练习挑战'{cbt_progress['most_common_distortion']}'类型的思维模式"
        )
    
    if cbt_progress['thought_challenging_improvement'] < 30:
        recommendations.append("建议更多地练习寻找反驳证据和平衡思维")
    
    # 基于ACT对齐的推荐
    act_alignment = _analyze_act_alignment(user_id)
    if act_alignment['biggest_gap_value']:
        recommendations.append(
            f"考虑为'{act_alignment['biggest_gap_value']}'价值观制定更多具体行动计划"
        )
    
    # 基于练习习惯的推荐
    exercise_habits = _analyze_exercise_habits(user_id, start_date, end_date)
    if exercise_habits['completion_rate'] < 70:
        recommendations.append("建议选择更短时长的练习来提高完成率")
    
    if exercise_habits['consistency_score'] < 50:
        recommendations.append("建议建立固定的练习时间来提高一致性")
    
    # 基于SOS使用的推荐
    sos_usage = _analyze_sos_usage(user_id, start_date, end_date)
    if sos_usage['most_effective_technique']:
        recommendations.append(
            f"'{sos_usage['most_effective_technique']}'对您很有效，可以多加练习"
        )
    
    # 如果没有生成任何推荐，提供通用建议
    if not recommendations:
        recommendations = [
            "保持当前的良好状态，继续记录情绪和练习",
            "尝试探索新的正念练习技巧",
            "定期回顾和更新您的价值观和行动计划"
        ]
    
    return recommendations[:5]  # 最多返回5条推荐

