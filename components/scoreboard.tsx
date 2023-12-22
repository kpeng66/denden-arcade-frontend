"use client"

import React from 'react';
import { ScoreboardProps } from '@/types/types';
import styles from '../styles/scoreboard.module.css';

const Scoreboard: React.FC<ScoreboardProps> = ({ players }) => {
    return (
        <div className={styles.scoreboardContainer}>
            <div className={styles.title}>Scoreboard</div>
            <div className={styles.scoreList}>
                {players.map((player, index) => (
                    <div key={index} className={styles.playerScore}>
                        <div className={styles.playerName}>{player.name}</div>
                        <div className={styles.playerScoreValue}>{player.score}</div>
                    </div>
                ))}
            </div>
        </div>
    )
    };

export default Scoreboard;