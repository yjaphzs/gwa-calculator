import type { MoodId } from "@/features/share/lib/moods";
import type { CaptionLanguage } from "@/features/share/lib/share-options";

type CaptionSet = { honor: string[]; progress: string[] };

/**
 * Lines printed on the image (and offered as the post caption). "honor" when
 * the result earns an honor, "progress" otherwise. English and Taglish; no em
 * dashes (copy rule). Keep them short: they're set large.
 */
export const CAPTIONS: Record<MoodId, Record<CaptionLanguage, CaptionSet>> = {
  proud: {
    en: {
      honor: ["All that hard work paid off.", "Sleepless nights, worth it.", "Proud of this one."],
      progress: ["Progress is still progress.", "One semester closer.", "Proud of how far I've come."],
    },
    tl: {
      honor: ["Puyat pero worth it.", "Laban lang, at nagbunga!", "Para sa pamilya 'to."],
      progress: ["Kaya pa, tuloy lang.", "Hindi perfect, pero lumalaban.", "Isang sem na lang ulit."],
    },
  },
  fun: {
    en: {
      honor: ["Plot twist: I actually studied.", "Brain cells: still working.", "Main character energy."],
      progress: ["Survived. That's the flex.", "Powered by coffee and vibes.", "Still standing, still snacking."],
    },
    tl: {
      honor: ["Sino'ng nag-aral? Ako pala!", "Utak ko, may pa-bonus.", "Charot lang, pero totoo 'to."],
      progress: ["Pasado ang vibes, 'yun ang mahalaga.", "Kape pa more, sem pa more.", "Buhay pa naman, 'di ba?"],
    },
  },
  chill: {
    en: {
      honor: ["Calm mind, good grades.", "Did my best. It showed.", "Quietly winning."],
      progress: ["Breathe. One sem at a time.", "Doing my best, and that's enough.", "Slow progress is still progress."],
    },
    tl: {
      honor: ["Chill lang, pero pasok sa honors.", "Ginawa ko ang best ko.", "Tahimik pero panalo."],
      progress: ["Chill lang, kaya natin 'to.", "Hinga muna, tapos laban ulit.", "Isang sem at a time."],
    },
  },
  sad: {
    en: {
      honor: ["Cried a lot. Still made it.", "From tears to honors.", "It hurt, but look."],
      progress: ["Not the grade I wanted. Still here.", "It hurt. I'm still going.", "Tired, not done."],
    },
    tl: {
      honor: ["Iniyakan ko 'to, pero worth it.", "Mula iyak hanggang honor.", "Masakit pero sulit."],
      progress: ["Masakit, pero tuloy pa rin.", "Iyak lang, tapos aral ulit.", "Pagod, pero 'di pa tapos."],
    },
  },
  rock: {
    en: {
      honor: ["Crushed it. Loud.", "Grades turned up to eleven.", "Encore earned."],
      progress: ["Not done yet. Encore.", "Still standing. Still loud.", "Turn it up next sem."],
    },
    tl: {
      honor: ["Basag ang sem na 'to!", "Rakrakan sa honors!", "Lakas ng tugtog ng grades."],
      progress: ["Rakrakan pa rin next sem!", "Hindi pa tapos ang tugtugan.", "Laban, lakasan pa!"],
    },
  },
  cute: {
    en: {
      honor: ["Soft heart, strong grades.", "Proud of my little self.", "Tiny steps, big wins."],
      progress: ["Tiny steps, big dreams.", "Baby steps still count.", "Be gentle, keep going."],
    },
    tl: {
      honor: ["Cute na, matalino pa. Charot!", "Proud ako sa sarili ko.", "Baby steps, big win!"],
      progress: ["Baby steps lang, pero tuloy.", "Dahan-dahan lang, aabot din.", "Kaya mo 'yan, bes."],
    },
  },
  retro: {
    en: {
      honor: ["High score saved.", "Level up unlocked.", "Rewind: a classic sem."],
      progress: ["Press start for next sem.", "Continue? Yes.", "Loading next level."],
    },
    tl: {
      honor: ["High score, saved na!", "Level up ang sem na 'to.", "Classic na sem 'to."],
      progress: ["Press start, next sem na.", "Continue? Oo naman.", "Loading ang next level."],
    },
  },
  minimal: {
    en: {
      honor: ["Done.", "Earned.", "This semester."],
      progress: ["In progress.", "Still going.", "This semester."],
    },
    tl: {
      honor: ["Tapos na.", "Nakuha.", "Ngayong sem."],
      progress: ["Tuloy lang.", "'Di pa tapos.", "Ngayong sem."],
    },
  },
};

/** The caption for a mood, language and result; `index` wraps around (Shuffle). */
export function captionFor(mood: MoodId, language: CaptionLanguage, result: keyof CaptionSet, index: number): string {
  const lines = CAPTIONS[mood][language][result];
  return lines[((index % lines.length) + lines.length) % lines.length];
}
