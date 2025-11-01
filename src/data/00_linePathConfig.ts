// data/linePathConfig.ts

export type PathSegment = {
    from: string;
    to: string;
    type: 'vertical' | 'horizontal';
    sectionNumber: number;
    scrollMultiplier?: number;
};

export const linePathConfig: PathSegment[] = [

    // ============================================
    // SECTION 1: HERO
    // Simple vertical line down the left side
    // ============================================
    {
        from: 'her-top',
        to: 'her-bottom',
        type: 'vertical',
        sectionNumber: 1,
    },

    // Transition between sections (vertical)
    {
        from: 'her-bottom',
        to: 'hero-top',
        type: 'vertical',
        sectionNumber: 1,
    },

    // ============================================
    // SECTION 1: HERO
    // Simple vertical line down the left side
    // ============================================
    {
        from: 'hero-top',
        to: 'hero-bottom',
        type: 'vertical',
        sectionNumber: 2,
    },

    // Transition between sections (vertical)
    {
        from: 'hero-bottom',
        to: 'titlereveal-top',
        type: 'vertical',
        sectionNumber: 2,
    },

    // ============================================
    // SECTION 2: TITLE REVEAL PROMO VIDEO
    // Simple vertical line down the left side
    // ============================================
    {
        from: 'titlereveal-top',
        to: 'titlereveal-left',
        type: 'vertical',
        sectionNumber: 3,
    },

    {
        from: 'titlereveal-left',
        to: 'titlereveal-right',
        type: 'horizontal',
        sectionNumber: 3,
        scrollMultiplier: 10, // 10x slower = 10% speed
    },

    {
        from: 'titlereveal-right',
        to: 'titlereveal-below',
        type: 'vertical',
        sectionNumber: 3,

    },
    {
        from: 'titlereveal-below',
        to: 'titlereveal-bottom',
        type: 'vertical',
        sectionNumber: 3,

    },

    // Transition to projects section
    {
        from: 'titlereveal-bottom',
        to: 'promovideo-top',
        type: 'vertical',
        sectionNumber: 3,
    },
    // ============================================
    // SECTION 3: PROMO VIDEO
    // Simple vertical line down the left side
    // ============================================
    {
        from: 'promovideo-top',
        to: 'promovideo-bottom',
        type: 'vertical',
        sectionNumber: 4,
    },

    // Transition between sections (vertical)
    {
        from: 'promovideo-bottom',
        to: 'tt-start-right-top',
        type: 'vertical',
        sectionNumber: 4,
    },


    // ============================================
    // SECTION 4: TIMELINE TITLE
    // This creates the horizontal crossings
    // ============================================
    //tt-start-right-top → tt-middle-right → tt-middle-left → tt-under-left → tt-bottom-left
    // 1. Enter and go down on LEFT side
    {
        from: 'tt-start-right-top',
        to: 'tt-middle-right',
        type: 'vertical',
        sectionNumber: 5,
    },

    // 2. CROSS HORIZONTALLY from LEFT to RIGHT (SLOW SCROLL)
    {
        from: 'tt-middle-right',
        to: 'tt-middle-left',
        type: 'horizontal',
        sectionNumber: 5,
        scrollMultiplier: 10, // 10x slower = 10% speed
    },

    // 3. Go down on RIGHT side
    {
        from: 'tt-middle-left',
        to: 'tt-under-left',
        type: 'vertical',
        sectionNumber: 5,
    },

    // 4. CROSS HORIZONTALLY from RIGHT to LEFT (SLOW SCROLL)
    {
        from: 'tt-under-left',
        to: 'tt-bottom-left',
        type: 'vertical',
        sectionNumber: 5,
    },

    // 5. Go down on LEFT side
    {
        from: 'tt-bottom-left',
        to: 'graphTimeline-top',
        type: 'vertical',
        sectionNumber: 5,
    },


    // // ============================================
    // // SECTION 4: CONTACT
    // // Simple vertical line down the left side
    // // ============================================
    // {
    //     from: 'contact-top',
    //     to: 'contact-bottom',
    //     type: 'vertical',
    //     sectionNumber: 4,
    // },

];