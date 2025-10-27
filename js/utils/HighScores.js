import { room } from './Database.js';

const COLLECTION = 'highscore_v1';
const MAX_SCORES = 100;
let highScores = [];
let subscribers = [];

// Initial fetch
room.collection(COLLECTION).subscribe(data => {
    highScores = data.sort((a, b) => b.score - a.score);
    notifySubscribers();
});

function notifySubscribers() {
    subscribers.forEach(callback => callback(highScores));
}

export const HighScores = {
    getList: () => highScores,

    subscribe: (callback) => {
        subscribers.push(callback);
        callback(highScores); // immediate call
        return () => {
            subscribers = subscribers.filter(cb => cb !== callback);
        };
    },

    submitScore: async (score) => {
        const currentUser = await window.websim.getCurrentUser();
        const username = currentUser.username;

        const lowestScoreRecord = highScores.length > 0 ? highScores[highScores.length - 1] : null;

        if (highScores.length < MAX_SCORES) {
            await room.collection(COLLECTION).create({ score, username });
        } else if (score > lowestScoreRecord.score) {
            // Replace the lowest score
            await room.collection(COLLECTION).delete(lowestScoreRecord.id);
            await room.collection(COLLECTION).create({ score, username });
        }
    }
};