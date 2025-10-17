export type ProgressEvent = {
    year: number;
    month: number;
    level: number;
    impactType: 'None' | 'Lesson' | 'Regional' | 'National' | 'International' | 'World-Class' | 'Exceptional';
    category: string;
    dotSize?: number; // Optional: custom size in px (overrides default)
    article?: string;
};

export type ChapterLine = {
    year: number;
    month: number;
    label: string;
    caption: string;
};

export const filipRealEvents: ProgressEvent[] = [

    // Start of the Graph
    { year: 2016, month: 1, level: 0, impactType: 'None', category: '', dotSize: 2 },

    // 2016 - Taking Charge (Age 12, 6th grade)
    { year: 2016, month: 3, level: 0.6, impactType: 'National', category: 'First RoboCup Win' },
    { year: 2016, month: 6.5, level: 0.8, impactType: 'Regional', category: 'LegoBot Miracle' },
    { year: 2016, month: 12, level: 1.2, impactType: 'Regional', category: 'FLL Decisive Triumph' },
    { year: 2016, month: 12.5, level: 0.6, impactType: 'Lesson', category: 'Leadership Lesson' },

    // 2017 - Hard Lessons
    { year: 2017, month: 4, level: 1.0, impactType: 'National', category: 'RoboCup Concert' },
    { year: 2017, month: 4.5, level: 0.7, impactType: 'Lesson', category: 'Magic Show Disaster' },
    { year: 2017, month: 6.2, level: 0.8, impactType: 'Regional', category: 'RBA CNC/Race'},
    { year: 2017, month: 6.5, level: 0.9, impactType: 'Regional', category: 'LegoBot Improv'},
    { year: 2017, month: 12.5, level: 1.1, impactType: 'Regional', category: 'FLL Goliath' },
    { year: 2017, month: 12.8, level: 0.7, impactType: 'Lesson', category: 'Time is Money' },
    //robolab key + lesson when they took it?

    // 2018 - Going International (Age 14, 8th grade)
    { year: 2018, month: 3, level: 0.9, impactType: 'National', category: 'OnStage Showmanship' },
    { year: 2018, month: 4, level: 1.2, impactType: 'International', category: 'Expo Singapore' },
    { year: 2018, month: 6, level: 1.9, impactType: 'Lesson', category: 'Qualified for Canada?' },
    { year: 2018, month: 7.2, level: 1.6, impactType: 'International', category: 'RoboCup Montreal' },

    // 2019 - Breakthrough Year (Age 15, 9th grade)
    { year: 2019, month: 1.3, level: 1.7, impactType: 'Regional', category: 'FLL' },
    { year: 2019, month: 4, level: 2.1, impactType: 'National', category: 'Persistence to Win' },
    { year: 2019, month: 6, level: 2.2, impactType: 'Regional', category: 'RBA KE' },
    { year: 2019, month: 6.7, level: 2.5, impactType: 'Exceptional', category: 'Mayor Award' },
    { year: 2019, month: 7.2, level: 2.9, impactType: 'World-Class', category: 'RoboCup Sydney 4th', article: '2019-06-sydney' },
    { year: 2019, month: 7.5, level: 2.3, impactType: 'Lesson', category: '10 Seconds' },
    { year: 2019, month: 9.5, level: 1.7, impactType: 'Lesson', category: 'Moving On' },
    { year: 2019, month: 11, level: 1.9, impactType: 'Lesson', category: 'We Are So BACK' }, //key

    // 2020 - High School King (Age 16-17, 1st-2nd year)
    { year: 2020, month: 1.3, level: 2.1, impactType: 'Regional', category: 'FLL New Crew' }, //TODO: what happened here?
    { year: 2020, month: 2.5, level: 2.2, impactType: 'National', category: 'Robotiada' },
    { year: 2020, month: 5.0, level: 2.6, impactType: 'Lesson', category: 'Going Electric' },//3x3x3 ledcube
    { year: 2020, month: 6.5, level: 2.7, impactType: 'None', category: 'Getting Better' },//naklonena rovina
    { year: 2020, month: 9, level: 3.0, impactType: 'Lesson', category: 'First Proper Project' },//tictactoe
    //{ year: 2020, month: 11.3, level: 2.2, impactType: 'Regional', category: 'Heat Pump Solution' },

    // 2021 - Recognition Wave
    { year: 2021, month: 1.2, level: 3.3, impactType: 'Regional', category: 'Uniting Power' }, //TODO: when was FLL
    { year: 2021, month: 2.2, level: 3.1, impactType: 'National', category: 'Robotiada' },
    { year: 2021, month: 3.2, level: 3.3, impactType: 'Exceptional', category: 'Just for Fun' },//SOC
    { year: 2021, month: 4.9, level: 3.7, impactType: 'National', category: '3D Printing Master' },
    { year: 2021, month: 5.1, level: 3.9, impactType: 'National', category: 'No Stopping Now' },//Robocup
    { year: 2021, month: 6.2, level: 3.0, impactType: 'Lesson', category: 'Istrobot' },
    { year: 2021, month: 6.8, level: 3.0, impactType: 'International', category: 'FLL WorldCup' },
    //{ year: 2021, month: 4, level: 3.0, impactType: 'National', category: 'Young Creator 2021' },
    //{ year: 2021, month: 9, level: 3.0, impactType: 'National', category: 'National TV Coverage' },

    // 2022 - Dominance (Age 18, 3rd year)
    { year: 2022, month: 2, level: 4.5, impactType: 'International', category: 'Europe 4th + Hardware Award' },
    { year: 2022, month: 5, level: 5.0, impactType: 'Exceptional', category: 'Regional Chairman Award' },
    { year: 2022, month: 7, level: 5.3, impactType: 'World-Class', category: 'Best Hardware Thailand' },
    { year: 2022, month: 10, level: 4.2, impactType: 'International', category: 'Erasmus Italy Internship' },

    // 2023 - Final Victory Lap (Age 19, 4th year)
    { year: 2023, month: 3, level: 5.5, impactType: 'Exceptional', category: '6 Categories 5 Wins' },
    { year: 2023, month: 5, level: 5.4, impactType: 'Exceptional', category: 'Young Creator 2023' },
    { year: 2023, month: 6, level: 4.8, impactType: 'World-Class', category: 'Valedictorian' },
    { year: 2023, month: 6.5, level: 5.6, impactType: 'Exceptional', category: 'Bordeaux PCB Legend' },
    { year: 2023, month: 7, level: 5.8, impactType: 'Exceptional', category: 'Saint Gorazd Award', article: '2023-07-saint-gorazd'},

    // 2024 - University & Transition (Age 20)
    { year: 2024, month: 10, level: 3.5, impactType: 'International', category: 'Hamburg TU Start' },

    // 2025 - Current Focus (Age 21)
    { year: 2025, month: 2, level: 4.2, impactType: 'World-Class', category: 'Startup Deep Dive' },
];
   /* { year: 2016, month: 6.0, level: 0, impactType: 'Exceptional', category: 'Start' },
    { year: 2016, month: 9.5, level: 2, impactType: 'Regional', category: 'Experiment' },
    { year: 2016, month: 11.0, level: 3, impactType: 'National', category: 'Prototype' },
    { year: 2017, month: 3.0, level: 2, impactType: 'Lesson', category: 'Training' },
    { year: 2017, month: 7.5, level: 4, impactType: 'National', category: 'Competition' },
    { year: 2018, month: 2.0, level: 1, impactType: 'Regional', category: 'Planning' },
    { year: 2018, month: 8.5, level: 3, impactType: 'International', category: 'Funding' },
    { year: 2019, month: 4.0, level: 2, impactType: 'National', category: 'Workshop' },
    { year: 2019, month: 10.0, level: 4, impactType: 'World-Class', category: 'Project' },
    { year: 2020, month: 1.5, level: 1, impactType: 'Lesson', category: 'Research' },
    { year: 2020, month: 6.0, level: 3, impactType: 'International', category: 'Collaboration' },
    { year: 2021, month: 3.5, level: 2, impactType: 'National', category: 'Design' },
    { year: 2021, month: 9.0, level: 4, impactType: 'World-Class', category: 'Launch' },
    { year: 2022, month: 2.0, level: 3, impactType: 'International', category: 'Test' },
    { year: 2022, month: 7.5, level: 5, impactType: 'Exceptional', category: 'Award' },
    { year: 2023, month: 4.0, level: 2, impactType: 'National', category: 'Presentation' },
    { year: 2023, month: 10.5, level: 4, impactType: 'World-Class', category: 'Talk' },
    { year: 2024, month: 1.0, level: 3, impactType: 'International', category: 'Development' },
    { year: 2024, month: 6.5, level: 5, impactType: 'Exceptional', category: 'Release' },
    { year: 2025, month: 3.0, level: 2, impactType: 'National', category: 'Strategy' },
    { year: 2025, month: 8.0, level: 4, impactType: 'World-Class', category: 'Growth' },
    { year: 2025, month: 11.2, level: 5, impactType: 'Exceptional', category: 'Vision' },
];*/

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
    defaultDotSize: 8  // ADD THIS - single default size for all dots in px
};