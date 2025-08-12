# React Native 移植指南

本文档提供了将当前 React Web 应用移植到 React Native 的详细指南。

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装 React Native CLI
npm install -g @react-native-community/cli

# 创建新的 React Native 项目
npx react-native init MentalHealthApp

# 进入项目目录
cd MentalHealthApp
```

### 2. 依赖安装

```bash
# 导航相关
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# iOS 依赖
cd ios && pod install && cd ..

# 状态管理和工具
npm install react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install react-native-linear-gradient
npm install react-native-gesture-handler
npm install react-native-reanimated
```

## 📱 组件映射

### Web 到 React Native 组件映射

| Web 组件 | React Native 组件 | 说明 |
|---------|------------------|------|
| `<div>` | `<View>` | 容器组件 |
| `<span>`, `<p>` | `<Text>` | 文本组件 |
| `<button>` | `<TouchableOpacity>` | 按钮组件 |
| `<input>` | `<TextInput>` | 输入框组件 |
| `<textarea>` | `<TextInput multiline>` | 多行输入框 |
| `<img>` | `<Image>` | 图片组件 |
| CSS Flexbox | `style={{flex: 1}}` | 布局系统 |

### 样式转换

```javascript
// Web CSS
.container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
}

// React Native StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
  }
});
```

## 🎨 核心页面移植

### 1. 底部导航栏

```javascript
// BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomePage from './screens/HomePage';
import JournalPage from './screens/JournalPage';
import ExercisePage from './screens/ExercisePage';
import HistoryPage from './screens/HistoryPage';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Journal') {
              iconName = 'edit';
            } else if (route.name === 'Exercise') {
              iconName = 'self-improvement';
            } else if (route.name === 'History') {
              iconName = 'history';
            }
            
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6F61',
          tabBarInactiveTintColor: '#4A4A4A',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomePage} options={{ title: '首页' }} />
        <Tab.Screen name="Journal" component={JournalPage} options={{ title: '日志' }} />
        <Tab.Screen name="Exercise" component={ExercisePage} options={{ title: '练习' }} />
        <Tab.Screen name="History" component={HistoryPage} options={{ title: '历史' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### 2. 情绪选择器组件

```javascript
// components/MoodSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MoodSelector = ({ selectedMood, onMoodSelect }) => {
  const moods = [
    { id: 'happy', label: '开心', emoji: '😊', color: '#FFE066' },
    { id: 'sad', label: '难过', emoji: '😢', color: '#87CEEB' },
    { id: 'angry', label: '愤怒', emoji: '😠', color: '#FF6B6B' },
    { id: 'anxious', label: '焦虑', emoji: '😰', color: '#DDA0DD' },
    { id: 'calm', label: '平静', emoji: '😌', color: '#98FB98' },
    { id: 'excited', label: '兴奋', emoji: '🤩', color: '#FFB347' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>今天的心情如何？</Text>
      <View style={styles.moodGrid}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodCard,
              { backgroundColor: mood.color },
              selectedMood === mood.id && styles.selectedMood
            ]}
            onPress={() => onMoodSelect(mood.id)}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text style={styles.label}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedMood: {
    borderWidth: 3,
    borderColor: '#FF6F61',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A4A4A',
  },
});

export default MoodSelector;
```

### 3. 呼吸动画组件

```javascript
// components/BreathingAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const BreathingAnimation = ({ isActive }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (isActive) {
      const breathingCycle = () => {
        // 吸气动画 (4秒)
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // 呼气动画 (4秒)
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (isActive) {
              breathingCycle();
            }
          });
        });
      };

      breathingCycle();
    }
  }, [isActive, scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Text style={styles.text}>呼吸</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(174, 198, 207, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default BreathingAnimation;
```

## 📊 数据存储

### AsyncStorage 使用

```javascript
// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  MOOD_ENTRIES: 'mood_entries',
  USER_PREFERENCES: 'user_preferences',
  EXERCISE_HISTORY: 'exercise_history',
};

export const saveData = async (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const loadData = async (key) => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
  }
};
```

## 🎯 关键差异和注意事项

### 1. 样式系统
- React Native 使用 StyleSheet.create()
- 不支持 CSS 选择器，只能使用内联样式
- 单位不需要 px，直接使用数字
- 部分 CSS 属性名称不同（如 backgroundColor 而不是 background-color）

### 2. 事件处理
```javascript
// Web
<button onClick={handleClick}>点击</button>

// React Native
<TouchableOpacity onPress={handleClick}>
  <Text>点击</Text>
</TouchableOpacity>
```

### 3. 导航系统
- 使用 React Navigation 替代 React Router
- 需要配置原生依赖
- 支持手势导航和原生转场动画

### 4. 图标和字体
```javascript
// 安装图标库
npm install react-native-vector-icons

// 使用图标
import Icon from 'react-native-vector-icons/MaterialIcons';
<Icon name="home" size={24} color="#4A4A4A" />
```

## 🔧 开发工具

### 1. 调试工具
- React Native Debugger
- Flipper
- Chrome DevTools

### 2. 性能优化
- 使用 FlatList 替代 ScrollView 处理长列表
- 图片优化和懒加载
- 内存管理和组件优化

### 3. 测试
```bash
# 运行 iOS 模拟器
npx react-native run-ios

# 运行 Android 模拟器
npx react-native run-android
```

## 📦 构建和发布

### iOS 构建
```bash
cd ios
xcodebuild -workspace MentalHealthApp.xcworkspace -scheme MentalHealthApp archive
```

### Android 构建
```bash
cd android
./gradlew assembleRelease
```

## 🚀 部署建议

1. **应用商店准备**
   - 准备应用图标和启动屏幕
   - 编写应用描述和关键词
   - 准备截图和预览视频

2. **性能优化**
   - 启用 Hermes JavaScript 引擎
   - 代码分割和懒加载
   - 图片压缩和优化

3. **安全考虑**
   - 数据加密存储
   - API 密钥保护
   - 用户隐私保护

---

这个指南提供了将 Web 应用移植到 React Native 的基础框架。根据具体需求，可能需要进一步调整和优化。

