import Hero from '@/components/01_Hero';
import TitleReveal from '@/components/02_TitleReveal';
import PromoVideo from '@/components/02_PromoVideo';
import TimelineTitle from "@/components/03_TimelineTitle";
import ProgressTimeline from '@/components/03_ProgressTimeline';
import ProjectTitle from "@/components/04_ProjectTitle";
import Projects from '@/components/04_Projects';
import CollaborationTitle from "@/components/05_CollaborationTitle";
import Collaborations from '@/components/05_Collaborations';
import PressRecognitionTitle from "@/components/08_PressRecognitionTitle";
import Recognition from '@/components/Recognition';

import { LineAnchor } from '@/components/00_LineAnchor';

export default function Home() {
    return (
        <main>
            <Hero />
            <TitleReveal />
            <PromoVideo />
            <TimelineTitle />
            <ProgressTimeline />
            <ProjectTitle />
            <Projects />
            <CollaborationTitle />
            <Collaborations />

            <PressRecognitionTitle />
            <Recognition />
        </main>
    );
}
