from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    profile_data = db.Column(db.Text)  # JSON string
    preferences = db.Column(db.Text)   # JSON string
    
    # 关系
    emotion_logs = db.relationship('EmotionLog', backref='user', lazy=True, cascade='all, delete-orphan')
    exercise_sessions = db.relationship('ExerciseSession', backref='user', lazy=True, cascade='all, delete-orphan')
    cbt_thoughts = db.relationship('CBTThought', backref='user', lazy=True, cascade='all, delete-orphan')
    act_values = db.relationship('ACTValue', backref='user', lazy=True, cascade='all, delete-orphan')
    act_actions = db.relationship('ACTAction', backref='user', lazy=True, cascade='all, delete-orphan')
    sos_sessions = db.relationship('SOSSession', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """设置密码哈希"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)

    def set_profile_data(self, data):
        """设置用户资料数据"""
        self.profile_data = json.dumps(data) if data else None

    def get_profile_data(self):
        """获取用户资料数据"""
        return json.loads(self.profile_data) if self.profile_data else {}

    def set_preferences(self, data):
        """设置用户偏好设置"""
        self.preferences = json.dumps(data) if data else None

    def get_preferences(self):
        """获取用户偏好设置"""
        return json.loads(self.preferences) if self.preferences else {}

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'profile_data': self.get_profile_data(),
            'preferences': self.get_preferences()
        }


class EmotionLog(db.Model):
    __tablename__ = 'emotion_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    emotion_type = db.Column(db.String(20), nullable=False)
    intensity = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text)
    tags = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_tags(self, tags_list):
        """设置标签列表"""
        self.tags = json.dumps(tags_list) if tags_list else None

    def get_tags(self):
        """获取标签列表"""
        return json.loads(self.tags) if self.tags else []

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'emotion_type': self.emotion_type,
            'intensity': self.intensity,
            'content': self.content,
            'tags': self.get_tags(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class GuidedExercise(db.Model):
    __tablename__ = 'guided_exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # 秒
    description = db.Column(db.Text)
    audio_url = db.Column(db.String(255))
    instructions = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    sessions = db.relationship('ExerciseSession', backref='exercise', lazy=True)

    def set_instructions(self, instructions_data):
        """设置练习指导"""
        self.instructions = json.dumps(instructions_data) if instructions_data else None

    def get_instructions(self):
        """获取练习指导"""
        return json.loads(self.instructions) if self.instructions else {}

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'duration': self.duration,
            'description': self.description,
            'audio_url': self.audio_url,
            'instructions': self.get_instructions(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ExerciseSession(db.Model):
    __tablename__ = 'exercise_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('guided_exercises.id'), nullable=False)
    duration_completed = db.Column(db.Integer)  # 秒
    completed = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exercise_id': self.exercise_id,
            'duration_completed': self.duration_completed,
            'completed': self.completed,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'exercise': self.exercise.to_dict() if self.exercise else None
        }


class CBTThought(db.Model):
    __tablename__ = 'cbt_thoughts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    situation = db.Column(db.Text, nullable=False)
    automatic_thought = db.Column(db.Text, nullable=False)
    emotion = db.Column(db.String(50), nullable=False)
    emotion_intensity = db.Column(db.Integer, nullable=False)
    cognitive_distortion = db.Column(db.String(100))
    evidence_for = db.Column(db.Text)
    evidence_against = db.Column(db.Text)
    balanced_thought = db.Column(db.Text)
    new_emotion_intensity = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'situation': self.situation,
            'automatic_thought': self.automatic_thought,
            'emotion': self.emotion,
            'emotion_intensity': self.emotion_intensity,
            'cognitive_distortion': self.cognitive_distortion,
            'evidence_for': self.evidence_for,
            'evidence_against': self.evidence_against,
            'balanced_thought': self.balanced_thought,
            'new_emotion_intensity': self.new_emotion_intensity,
            'emotion_intensity_change': (self.emotion_intensity - self.new_emotion_intensity) if self.new_emotion_intensity else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ACTValue(db.Model):
    __tablename__ = 'act_values'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    value_category = db.Column(db.String(50), nullable=False)
    value_description = db.Column(db.Text, nullable=False)
    importance_rating = db.Column(db.Integer, nullable=False)
    current_alignment = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    actions = db.relationship('ACTAction', backref='value', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'value_category': self.value_category,
            'value_description': self.value_description,
            'importance_rating': self.importance_rating,
            'current_alignment': self.current_alignment,
            'alignment_gap': self.importance_rating - self.current_alignment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ACTAction(db.Model):
    __tablename__ = 'act_actions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    value_id = db.Column(db.Integer, db.ForeignKey('act_values.id'), nullable=False)
    action_description = db.Column(db.Text, nullable=False)
    target_date = db.Column(db.Date)
    completed = db.Column(db.Boolean, default=False)
    completion_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'value_id': self.value_id,
            'action_description': self.action_description,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'completed': self.completed,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'value': self.value.to_dict() if self.value else None
        }


class SOSSession(db.Model):
    __tablename__ = 'sos_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_type = db.Column(db.String(50), nullable=False)
    technique_used = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.Integer)  # 秒
    effectiveness_rating = db.Column(db.Integer)  # 1-5
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_type': self.session_type,
            'technique_used': self.technique_used,
            'duration': self.duration,
            'effectiveness_rating': self.effectiveness_rating,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
