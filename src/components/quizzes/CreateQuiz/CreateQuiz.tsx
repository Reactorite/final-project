import React from "react";
import { useContext, useState, ChangeEvent, MouseEvent } from "react";
import QuizDataType from "../../../types/QuizDataType";

export default function CreateQuiz () {
    const [quiz, setQuiz] = useState<QuizDataType>({
        title: '',
        category: '',
        isOpen: true,
        isPublic: true,
        isOngoing: true,
        questions: {},
        scores: {},
        creator: '',
        duration: 0,
        totalPoints: 0,
        groups: {}
    });

    const [isOpen, setIsOpen] = useState('true');
    const [isPublic, setIsPublic] = useState('true');
    const [isOngoing, setIsOngoing] = useState('true');

    const updateQuiz = (prop: keyof QuizDataType) => (e: ChangeEvent<HTMLInputElement>) => {
        setQuiz(prev => ({
          ...prev,
          [prop]: e.target.value,
        }));
      };
    
    return (
        <>
        <h1>Create iQuiz</h1>
        <br /><br />
        <label htmlFor="titel">Title: </label>
        <input value={quiz.title} onChange={updateQuiz('title')} type="text" name="title" id="title" />
        <br /><br />
        <label htmlFor="category">Category: </label>
        <input value={quiz.category} onChange={updateQuiz('category')} type="text" name="category" id="category" />
        <br /><br />
        <label htmlFor="isOpen">Is the iQuiz open?: </label>
        <select value={isOpen} onChange={(e) => setIsOpen(e.target.value)}>
        <option value="true">Yes</option>
        <option value="false">No</option>
        </select>
        <br /><br />
        <label htmlFor="isPublic">Is the iQuiz public?: </label>
        <select value={isPublic} onChange={(e) => setIsPublic(e.target.value)}>
        <option value="true">Yes</option>
        <option value="false">No</option>
        </select>
        <br /><br />
        <label htmlFor="isOngoing">Is the iQuiz ongoing?: </label>
        <select value={isOngoing} onChange={(e) => setIsOngoing(e.target.value)}>
        <option value="true">Yes</option>
        <option value="false">No</option>
        </select>
        {/* questions here:
        // */}
        <br /><br />
        <label htmlFor="duration">Duration of quiz in minutes: </label>
        <input value={quiz.duration} onChange={updateQuiz('duration')} type="number" name="duration" id="duration" />
        <br /><br />
        </>
    );
};