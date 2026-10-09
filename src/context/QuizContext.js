import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { quizAPI } from '../services/api';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('quiz_history');
      if (storedHistory) {
        setQuizHistory(JSON.parse(storedHistory));
      }

      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        try {
          const res = await quizAPI.getHistory(storedUserId);
          if (res && res.quizHistory) {
            setQuizHistory(res.quizHistory.map(q => ({
              id: q._id || q.id || String(Date.now()),
              score: q.score,
              total: q.total,
              date: q.date,
              topic: q.topic,
            })));
            if (res.achievements) setAchievements(res.achievements);
            if (res.summary) setSummary(res.summary);
          }
        } catch (apiErr) {
          console.log('Quiz history online sync notice:', apiErr.message);
        }
      }
    } catch (error) {
      console.error('Failed to load quiz history', error);
    }
  };

  const addQuizResult = async (score, total, date, topic = 'Practical Quiz') => {
    const newResult = {
      id: Date.now().toString(),
      score,
      total,
      date: date || new Date().toISOString(),
      topic,
    };

    const updatedHistory = [newResult, ...quizHistory];
    setQuizHistory(updatedHistory);

    try {
      await AsyncStorage.setItem('quiz_history', JSON.stringify(updatedHistory));
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        await quizAPI.submitResult({
          userId: storedUserId,
          score,
          total,
          topic,
        });
        // Reload fresh server history & achievements
        loadHistory();
      }
    } catch (error) {
      console.log('Failed to sync quiz result to backend:', error.message);
    }
  };

  const getLastQuizScore = () => {
    if (quizHistory.length === 0) return null;
    return quizHistory[0];
  };

  return (
    <QuizContext.Provider
      value={{
        quizHistory,
        achievements,
        summary,
        addQuizResult,
        getLastQuizScore,
        refreshHistory: loadHistory,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => useContext(QuizContext);
