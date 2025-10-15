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

    // 2015 - The Spark
    { year: 2016, month: 1, level: 0.8, impactType: 'Regional', category: 'First Competition' },

    // 2016 - Taking Charge (Age 12, 7th grade)
    { year: 2016, month: 3, level: 1.5, impactType: 'National', category: 'Robocup Win' },
    { year: 2016, month: 9, level: 1.2, impactType: 'Lesson', category: 'Lab Access Key' },
    { year: 2016, month: 11, level: 2.8, impactType: 'National', category: 'FLL Semifinals' },
    { year: 2016, month: 12, level: 1.8, impactType: 'Lesson', category: 'Leadership Lesson' },

    // 2017 - Hard Lessons
    { year: 2017, month: 4, level: 0.5, impactType: 'Lesson', category: 'Magic Show Disaster', dotSize: 13 },
    { year: 2017, month: 11, level: 2.2, impactType: 'Regional', category: 'Rescue Line' },

    // 2018 - Going International (Age 14, 8th grade)
    { year: 2018, month: 3, level: 3.2, impactType: 'International', category: 'Qualified for Canada' },
    { year: 2018, month: 6, level: 3.8, impactType: 'International', category: 'RoboCup Montreal' },
    { year: 2018, month: 8, level: 3.5, impactType: 'National', category: 'Educational Robot' },
    { year: 2018, month: 9, level: 2.0, impactType: 'Lesson', category: 'Teacher Drowning' },

    // 2019 - Breakthrough Year (Age 15, 9th grade)
    { year: 2019, month: 3, level: 4.2, impactType: 'National', category: 'Robocup National Win' },
    { year: 2019, month: 6, level: 4.8, impactType: 'World-Class', category: 'RoboCup Sydney 4th', article: '2019-06-sydney' },
    { year: 2019, month: 7, level: 4.5, impactType: 'Exceptional', category: 'Mayor Award' },
    { year: 2019, month: 9, level: 3.5, impactType: 'National', category: 'Perfect Exam Scores' },

    // 2020 - High School King (Age 16-17, 1st-2nd year)
    { year: 2020, month: 2, level: 3.2, impactType: 'National', category: 'Heat Pump Solution' },
    { year: 2020, month: 5, level: 3.8, impactType: 'International', category: 'VALT Erasmus Lead' },
    { year: 2020, month: 11, level: 4.9, impactType: 'World-Class', category: 'World Champion' },

    // 2021 - Recognition Wave
    { year: 2021, month: 1, level: 4.3, impactType: 'Exceptional', category: '3D Print National Win' },
    { year: 2021, month: 4, level: 5.2, impactType: 'Exceptional', category: 'Young Creator 2021' },
    { year: 2021, month: 9, level: 3.8, impactType: 'National', category: 'National TV Coverage' },

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
    { year: 2016, month: 1, label: 'Chapter 1', caption: 'Learning & Building' },
    { year: 2019, month: 5, label: 'Chapter 2', caption: 'Breaking Through' },
    { year: 2023, month: 2, label: 'Chapter 3', caption: 'Leading & Dominating' },
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