import * as Notifications from 'expo-notifications';

export async function scheduleDailyWordNotification(word) {
    await Notifications.cancelAllScheduledNotificationsAsync(); // remove previous

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "🧠 Word of the Day!",
            body: `${word.word} — ${word.meaning}`,
        },
        trigger: {
            hour: 9,
            minute: 0,
            repeats: true, // repeats daily
        },
    });
}
