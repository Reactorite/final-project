import React from 'react';
import { Button } from 'react-bootstrap';
import './BattleArenaResume.css';

interface BattleArenaResumeProps {
  onStartRankedBattle: () => void;
  onPlayBlitzQuiz: () => void;
  onTrySampleQuiz: () => void;
}

const BattleArenaResume: React.FC<BattleArenaResumeProps> = ({
  onStartRankedBattle,
  onPlayBlitzQuiz,
  onTrySampleQuiz,
}) => {
  return (
    <div className="battle-arena-resume">
      <div className="resume-title">
        Welcome to the Battle Arena
      </div>
      <div className="resume-content">
        <div className="resume-section ranked">
          <h2>Ranked</h2>
          <div className="ranked-info">
            <h3>1vs1 Battle</h3>
            <p>
              Test your skills in head-to-head battles! Compete against players of similar skill levels in 
              intense 1vs1 matches. Rise through the ranks, earn rewards, and prove you’re the best!
            </p>
            <Button variant="custom-primary" className="arena-button" onClick={onStartRankedBattle}>
              Start Ranked Battle
            </Button>
          </div>
        </div>
        <div className="resume-section unranked">
          <h2>Unranked</h2>
          <div className="unranked-options">
            <div className="unranked-option blitz">
              <h3>Blitz Quiz</h3>
              <p>
                Quick, fast-paced quizzes that test your speed and knowledge. Great for casual play and
                improving your reaction time.
              </p>
              <Button variant="custom-success" className="arena-button" onClick={onPlayBlitzQuiz}>
                Play Blitz Quiz
              </Button>
            </div>
            <div className="unranked-option sample">
              <h3>Sample Quiz</h3>
              <p>
                Try out sample quizzes to get a taste of different categories and difficulty levels. Perfect
                for practice and exploring new topics.
              </p>
              <Button variant="custom-info" className="arena-button" onClick={onTrySampleQuiz}>
                Try Sample Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleArenaResume;
