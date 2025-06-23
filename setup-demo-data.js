// Demo data setup for testing the admin inbox
function setupDemoData() {
    // Create demo users
    const users = {
        'admin': { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
        'yaakov': { username: 'yaakov', password: 'test123', name: 'Yaakov Cohen', role: 'student' },
        'moshe': { username: 'moshe', password: 'test123', name: 'Moshe Levy', role: 'student' },
        'david': { username: 'david', password: 'test123', name: 'David Roth', role: 'student' }
    };

    // Create demo students
    const students = {
        'yaakov': { name: 'Yaakov Cohen', submissions: {}, totalPoints: 850 },
        'moshe': { name: 'Moshe Levy', submissions: {}, totalPoints: 720 },
        'david': { name: 'David Roth', submissions: {}, totalPoints: 690 }
    };

    // Create demo messages
    const messages = [
        {
            id: 'msg1',
            from: 'yaakov',
            to: 'admin',
            subject: 'Question about Chassidus test',
            message: 'I have a question about the upcoming Chassidus test. What chapters should we focus on for the test next week?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            threadId: 'thread1',
            read: false
        },
        {
            id: 'msg2',
            from: 'moshe',
            to: 'admin',
            subject: 'Submission problem',
            message: 'I am having trouble submitting my Halacha learning for today. The form keeps giving me an error message. Can you help?',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            threadId: 'thread2',
            read: false
        },
        {
            id: 'msg3',
            from: 'david',
            to: 'admin',
            subject: 'Points question',
            message: 'I noticed my points total seems lower than expected. Can you check if all my submissions were recorded correctly?',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            threadId: 'thread3',
            read: false
        },
        {
            id: 'msg4',
            from: 'admin',
            to: 'yaakov',
            subject: 'Re: Question about Chassidus test',
            message: 'Focus on chapters 1-5 of Tanya. The test will cover the basic concepts we discussed in class.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            threadId: 'thread1',
            read: true
        }
    ];

    // Store in localStorage
    localStorage.setItem('mivtzah_users', JSON.stringify(users));
    localStorage.setItem('mivtzah_students', JSON.stringify(students));
    localStorage.setItem('mivtzah_messages', JSON.stringify(messages));
    
    console.log('Demo data setup complete!');
    return { users, students, messages };
}

// Call this function to set up demo data
if (typeof window !== 'undefined') {
    window.setupDemoData = setupDemoData;
}
