export interface WeddingPhoto {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "wide";
}

export interface WeddingConfig {
  couple: {
    groom: {
      name: string;
      fullName: string;
      father: string;
      mother: string;
      brother: string;
      sister: string;
    };
    bride: {
      name: string;
      fullName: string;
      father: string;
      mother: string;
      brother: string;
      sister: string;
    };
    combinedName: string; // "AL-SHAKHOF & FATHIMA AFNAAN"
    tagline: string; // "We Choose Forever"
    homeSubtitle: string; // "Two Souls · One Journey · Infinite Love"
  };
  event: {
    dateDots: string; // "5-01-2027"
    dateBullets: string; // "5-01-2027"
    dateFormatted: string; // "5 January 2027"
    targetIsoDate: string; // "2027-01-05T10:30:00+05:30"
    time: string; // "10:30 AM Onwards"
    venueName: string; // "Bava Kasim Waliyullah Community Hall"
    address: string;
    googleMapsUrl: string;
    nikkah: {
      title: string;
      date: string;
      time: string;
      venueName: string;
      address: string;
      googleMapsUrl: string;
    };
    reception: {
      title: string;
      date: string;
      time: string;
      venueName: string;
      address: string;
      googleMapsUrl: string;
    };
  };
  islamicText: {
    bismillahArabic: string;
    bismillahEnglish: string;
    invitationHeading: string;
    invitationMessage: string;
    blessingQuote: {
      arabic: string;
      translation: string;
      reference: string;
    };
  };
  rsvp: {
    title: string;
    subtitle: string;
    acceptText: string;
    declineText: string;
    submitText: string;
  };
  footer: {
    heading: string;
    coupleText: string;
    subheading: string;
    closingBlessing: string;
  };
  photos: {
    heroPortrait: string;
    gallery: WeddingPhoto[];
  };
}

export const WEDDING_CONFIG: WeddingConfig = {
  couple: {
    groom: {
      name: "AL-SHAKHOF",
      fullName: "AL-SHAKHOF",
      father: "Not Updated",
      mother: "Not Updated",
      brother: "Not Updated",
      sister: "Not Updated",
    },
    bride: {
      name: "FATHIMA AFNAAN",
      fullName: "FATHIMA AFNAAN",
      father: "Not Updated",
      mother: "Not Updated",
      brother: "Not Updated",
      sister: "Not Updated",
    },
    combinedName: "AL-SHAKHOF & FATHIMA AFNAAN",
    tagline: "We Choose Forever",
    homeSubtitle: "Two Souls · One Journey · Infinite Love",
  },
  event: {
    dateDots: "5-01-2027",
    dateBullets: "5-01-2027",
    dateFormatted: "5 January 2027",
    targetIsoDate: "2027-01-05T10:30:00+05:30",
    time: "10:30 AM Onwards",
    venueName: "Bava Kasim Waliyullah Community Hall",
    address: "Edalakudy (Elankadai), Nagercoil, Kanyakumari District, Tamil Nadu - 629002",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Bava+Kasim+Community+Hall+Edalakudy+Nagercoil",
    nikkah: {
      title: "Nikkah",
      date: "5-01-2027",
      time: "10:30 AM Onwards",
      venueName: "Bava Kasim Waliyullah Community Hall",
      address: "Edalakudy (Elankadai), Nagercoil, Kanyakumari District, Tamil Nadu - 629002",
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Bava+Kasim+Community+Hall+Edalakudy+Nagercoil",
    },
    reception: {
      title: "Reception & Feast",
      date: "5-01-2027",
      time: "12:30 PM Onwards",
      venueName: "Bava Kasim Waliyullah Community Hall",
      address: "Edalakudy (Elankadai), Nagercoil, Kanyakumari District, Tamil Nadu - 629002",
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Bava+Kasim+Community+Hall+Edalakudy+Nagercoil",
    },
  },
  islamicText: {
    bismillahArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    bismillahEnglish: "In the name of Allah, the Most Gracious, the Most Merciful",
    invitationHeading: "We warmly invite you",
    invitationMessage:
      "to join us as we celebrate the sacred union of our lives in the holy bond of Nikāh. Your gracious presence, cherished love, and heartfelt duas will bring immense joy and barakah to our new beginning.",
    blessingQuote: {
      arabic:
        "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
      translation:
        "And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts.",
      reference: "Surah Ar-Rum [30:21]",
    },
  },
  rsvp: {
    title: "Will You Join Us?",
    subtitle: "Kindly grace us with your response to help us prepare for your presence",
    acceptText: "Joyfully Accepts",
    declineText: "Regretfully Declines",
    submitText: "Send Response",
  },
  footer: {
    heading: "See You On 5-01-2027",
    coupleText: "AL-SHAKHOF ♥ FATHIMA AFNAAN",
    subheading: "5-01-2027 · The Beginning of Forever",
    closingBlessing: "With love & infinite blessings",
  },
  photos: {
    heroPortrait:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      {
        id: "moment-1",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80",
        title: "The Sacred Promise",
        subtitle: "A covenant made in faith and devotion",
        aspectRatio: "portrait",
      },
      {
        id: "moment-2",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
        title: "Elegance & Grace",
        subtitle: "Adorned with blessings and beauty",
        aspectRatio: "portrait",
      },
      {
        id: "moment-3",
        url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=80",
        title: "Together in Prayer",
        subtitle: "Seeking barakah for a lifetime",
        aspectRatio: "portrait",
      },
      {
        id: "moment-4",
        url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80",
        title: "Infinite Harmony",
        subtitle: "Two souls united in love and tranquility",
        aspectRatio: "portrait",
      },
    ],
  },
};
