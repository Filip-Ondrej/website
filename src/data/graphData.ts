export type ProgressEvent = {
    year: number;
    month: number;
    level: number;
    impactType: 'None' | 'Lesson' | 'Regional' | 'National' | 'International' | 'World-Class' | 'Exceptional';
    category: string;
    dotSize?: number;
    article?: string;
    significant?: boolean; // NEW: Mark truly important milestones
};

export type ChapterLine = {
    year: number;
    month: number;
    label: string;
    caption: string;
};

export const filipRealEvents: ProgressEvent[] = [
    // Start of the Graph
    { year: 2016, month: 1, level: 0, impactType: 'None', category: '', dotSize: 1 },

    // 2016 - Taking Charge (Age 12, 6th grade)
    { year: 2016, month: 3, level: 0.6, impactType: 'National', category: 'First RoboCup Win', significant: true },
    { year: 2016, month: 6.5, level: 0.8, impactType: 'Regional', category: 'LegoBot Miracle' },
    { year: 2016, month: 12, level: 1.2, impactType: 'Regional', category: 'FLL Decisive Triumph' },
    { year: 2016, month: 12.5, level: 0.6, impactType: 'Lesson', category: 'Leadership Lesson' },

    // 2017 - Hard Lessons
    { year: 2017, month: 4, level: 1.0, impactType: 'National', category: 'RoboCup Concert' },
    { year: 2017, month: 4.5, level: 0.7, impactType: 'Lesson', category: 'Magic Show Disaster', significant: true},
    { year: 2017, month: 6.2, level: 0.8, impactType: 'Regional', category: 'RBA CNC/Race'},
    { year: 2017, month: 6.5, level: 0.9, impactType: 'Regional', category: 'LegoBot Improv'},
    { year: 2017, month: 12.5, level: 1.1, impactType: 'Regional', category: 'FLL Goliath' },
    { year: 2017, month: 12.8, level: 0.7, impactType: 'Lesson', category: 'Time is Money' },

    // 2018 - Going International (Age 14, 8th grade)
    { year: 2018, month: 3, level: 0.9, impactType: 'National', category: 'OnStage Showmanship' },
    { year: 2018, month: 4, level: 1.2, impactType: 'International', category: 'Expo Singapore', significant: true },
    { year: 2018, month: 6, level: 1.9, impactType: 'Lesson', category: 'Qualified for Canada?' },
    { year: 2018, month: 7.2, level: 1.6, impactType: 'International', category: 'RoboCup Montreal', significant: true },

    // 2019 - Breakthrough Year (Age 15, 9th grade)
    { year: 2019, month: 1.3, level: 1.7, impactType: 'Regional', category: 'FLL' },
    { year: 2019, month: 4, level: 2.1, impactType: 'National', category: 'Persistence to Win' },
    { year: 2019, month: 6, level: 2.2, impactType: 'Regional', category: 'RBA KE' },
    { year: 2019, month: 6.7, level: 2.5, impactType: 'Exceptional', category: 'Mayor Award', significant: true },
    { year: 2019, month: 7.2, level: 2.9, impactType: 'World-Class', category: 'RoboCup Sydney 4th', article: '2019-06-sydney', significant: true },
    { year: 2019, month: 7.5, level: 2.3, impactType: 'Lesson', category: '10 Seconds' },
    { year: 2019, month: 9.5, level: 1.7, impactType: 'Lesson', category: 'Moving On' },
    { year: 2019, month: 11, level: 1.9, impactType: 'Lesson', category: 'We Are So BACK' },

    // 2020 - High School King (Age 16-17, 1st-2nd year)
    { year: 2020, month: 1.3, level: 2.1, impactType: 'Regional', category: 'FLL New Crew' },
    { year: 2020, month: 2.5, level: 2.2, impactType: 'National', category: 'Robotiada' },
    { year: 2020, month: 5.0, level: 2.6, impactType: 'Lesson', category: 'Going Electric' },
    { year: 2020, month: 6.5, level: 2.7, impactType: 'None', category: 'Getting Better' },
    { year: 2020, month: 9, level: 3.0, impactType: 'Lesson', category: 'First Proper Project' },

    // 2021 - Recognition Wave
    { year: 2021, month: 1.2, level: 3.3, impactType: 'Regional', category: 'Uniting Power' },
    { year: 2021, month: 2.2, level: 3.1, impactType: 'National', category: 'Robotiada' },
    { year: 2021, month: 3.2, level: 3.3, impactType: 'Exceptional', category: 'Just for Fun', significant: true }, //SOC
    { year: 2021, month: 4.9, level: 3.5, impactType: 'National', category: '3D Printing Master' },
    { year: 2021, month: 5.1, level: 3.6, impactType: 'National', category: 'Robocup Is Back' }, // Robocup
    { year: 2021, month: 6.2, level: 3.5, impactType: 'Lesson', category: 'Istrobot' },
    { year: 2021, month: 6.8, level: 3.6, impactType: 'International', category: 'FLL WorldCup' },
    { year: 2021, month: 7.1, level: 4.0, impactType: 'Exceptional', category: 'World Champions', dotSize: 8,significant: true },//Robocup
    { year: 2021, month: 9.3, level: 3.1, impactType: 'Regional', category: 'ZENIT' },
    { year: 2021, month: 9.6, level: 3.3, impactType: 'Regional', category: '30m Tall Statue', significant: true},
    { year: 2021, month: 10.2, level: 3.6, impactType: 'Exceptional', category: 'Whos to Blame?', significant: true },

    // 2022 - Dominance (Age 18, 3rd year)
    { year: 2022, month: 4, level: 3.7, impactType: 'International', category: 'Erasmus Italy Internship' },
    { year: 2022, month: 4.7, level: 3.7, impactType: 'Regional', category: 'Becoming FLL Judge'},
    { year: 2022, month: 4.9, level: 3.9, impactType: 'National', category: 'Full Electro Mode', significant: true },
    { year: 2022, month: 6, level: 4.2, impactType: 'International', category: 'Europe 4th + Hardware Award', significant: true },
    { year: 2022, month: 6.5, level: 4.4, impactType: 'Exceptional', category: 'Regional Chairman Award', significant: true },
    { year: 2022, month: 7, level: 4.6, impactType: 'World-Class', category: 'Worlds Best Hardware', significant: true },
    //SOC skolske kolo

    // 2023 - Final Victory Lap (Age 19, 4th year)
    { year: 2023, month: 4.9, level: 4.0, impactType: 'Exceptional', category: '6 Categories 5 Wins', significant: true },
    { year: 2023, month: 5, level: 4.0, impactType: 'Exceptional', category: 'Young Creator 2023', significant: true },
    { year: 2023, month: 6, level: 4.0, impactType: 'World-Class', category: 'Valedictorian', significant: true },
    { year: 2023, month: 6.5, level: 4.0, impactType: 'Exceptional', category: 'Bordeaux PCB Legend', significant: true },
    { year: 2023, month: 7, level: 4.0, impactType: 'Exceptional', category: 'Saint Gorazd Award', article: '2023-07-saint-gorazd', significant: true },

    // 2024 - University & Transition (Age 20)
    { year: 2024, month: 10, level: 4.0, impactType: 'International', category: 'Hamburg TU Start' },

    // 2025 - Current Focus (Age 21)
    { year: 2025, month: 2, level: 4.0, impactType: 'World-Class', category: 'Startup Deep Dive', significant: true },
];

export const chapterLines: ChapterLine[] = [
    { year: 2016, month: 3, label: 'Chapter 1', caption: 'Learning & Building' },
    { year: 2019, month: 9, label: 'Chapter 2', caption: 'Breaking Through' },
    { year: 2023, month: 10, label: 'Chapter 3', caption: 'Leading & Dominating' },
];

export const impactConfig = {
    types: ['Lesson', 'Regional', 'National', 'International', 'World-Class', 'Exceptional'] as const,
    colors: {
        'None': '#FFFFFF',
        'Lesson': 'url(#metallic-purple)',
        'Regional': 'url(#metallic-blue)',
        'National': 'url(#metallic-teal)',
        'International': 'url(#metallic-amber)',
        'World-Class': 'url(#metallic-red)',
        'Exceptional': 'url(#metallic-gold)'
    },
    legendColors: {
        'None': '#FFFFFF',
        'Lesson': '#9333EA',
        'Regional': '#3B82F6',
        'National': '#14B8A6',
        'International': '#FBBF24',
        'World-Class': '#EF4444',
        'Exceptional': '#FFD60A'
    },
    defaultDotSize: 6  // ADD THIS - single default size for all dots in px
};