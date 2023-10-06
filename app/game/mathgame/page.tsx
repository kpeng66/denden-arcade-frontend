"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

const MathGame: React.FC = () => {
    const [equation, setEquation] = useState('');
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [preGameCountdown, setPreGameCountdown] = useState<number | null>(3);
    const [score, setScore] = useState(0);
    const [ws, setWs] = useState<WebSocket | null>(null);

    const params = useParams();
    const room_code = params.room_code;

    useEffect(() => {
        const wsConnection = new WebSocket(`ws://127.0.0.1:8000/ws/mathgame/${room_code}`);
        setWs(wsConnection);

        wsConnection.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'game.countdown':
                    setPreGameCountdown(message.countdown_time);
                    break;
                case 'game.start':
                    setPreGameCountdown(null);
                    fetchNewEquation();
                    // ... (start game logic)
                    break;
                // ... (other cases)
            }
        };
        
        return () => wsConnection.close();
    }, []);

    useEffect(() => {
        if (preGameCountdown !== null && preGameCountdown > 0) {
            const timerId = setTimeout(() => {
                setPreGameCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
            }, 1000);
            return () => clearTimeout(timerId);
        }
        else if (preGameCountdown === 0) {
            // Move game start logic here
            fetchNewEquation();
            setPreGameCountdown(null); // Setting to null after the game has started
        }
    }, [preGameCountdown]);
    
    useEffect(() => {
        let gameTimerId: NodeJS.Timeout;
        if (preGameCountdown === null) { 
            gameTimerId = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(gameTimerId);  // Cleanup timer
    }, [preGameCountdown]);
    
    useEffect(() => {
        if (countdown === 0 && preGameCountdown === null) {
            alert(`Game over! Your score is ${score}`);
            // TODO: Handle what should happen when the game is over
        }
    }, [countdown, preGameCountdown, score]);    

    const fetchNewEquation = async () => {
        // Placeholder for fetching equation from backend
        const response = await axios.get('http://127.0.0.1:8000/api/get-new-equation');
        setEquation(response.data.equation);
    };

    const handleAnswer = async () => {
        // Placeholder for sending answer to backend for validation
        const response = await axios.post('http://127.0.0.1:8000/api/check-answer', { answer: userAnswer });
        if (response.data.correct) {
             setFeedback('Correct!');
             setScore(prevScore => prevScore + 1);
             fetchNewEquation();
         } else {
             setFeedback('Incorrect');
             setScore(prevScore => prevScore - 1);
             fetchNewEquation();
         }

        setUserAnswer(''); // Reset the answer field
    };

    return (
        <div>
            <h2>Solve the Math Problem</h2>
            <h4>Score: {score}</h4>
            
            {preGameCountdown !== null ? (
                <h4>Game Starts In: {preGameCountdown > 0 ? preGameCountdown : "Now"}s</h4>
                ) : (
                <h4>Time Left: {countdown}s</h4>
                )}

            {preGameCountdown === null && (
            <div>
            <span>{equation}</span>
            <input 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer"
            />
            <button onClick={handleAnswer}>Submit</button>
            {feedback && <div>{feedback}</div>}
            
            </div>
      )}
    </div>
    );
}

export default MathGame;
