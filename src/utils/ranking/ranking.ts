export let nextRankPoints = 0;

export default function getRanking(points: number) {
  if (points < 100) {
    nextRankPoints = 100;
    return (`Beginner: ${nextRankPoints - points} points to next level`);
  } else if (points < 200) {
    nextRankPoints = 200;
    return (`Intermediate: ${nextRankPoints - points} points to next level`);
  } else if (points < 300) {
    nextRankPoints = 300;
    return (`Advanced: ${nextRankPoints - points} points to next level`);
  } else {
    nextRankPoints = 400;
    return (`Expert: ${nextRankPoints - points} points to next level`);
  }

};