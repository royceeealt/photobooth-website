const polaroidTemplates = {
  1: {
    layout: 1,

    canvas: {
      width: 1080,
      height: 1350,
    },

        baseImage:
      "/assets/polaroid designs/1-photo/strip 1 base.png",

    designs: [
      {
        id: "1-design-1",
        name: "Design 1",
        image: "/assets/polaroid designs/1-photo/1 strip design-1.png",
      },
      {
        id: "1-design-2",
        name: "Design 2",
        image: "/assets/polaroid designs/1-photo/1 strip design-2.png",
      },
      {
        id: "1-design-3",
        name: "Design 3",
        image: "/assets/polaroid designs/1-photo/1 strip design-3.png",
      },
      {
        id: "1-design-4",
        name: "Design 4",
        image: "/assets/polaroid designs/1-photo/1 strip design-4.png",
      },
      {
        id: "1-design-5",
        name: "Design 5",
        image: "/assets/polaroid designs/1-photo/1 strip design-5.png",
      },
      {
        id: "1-design-6",
        name: "Design 6",
        image: "/assets/polaroid designs/1-photo/1 strip design-6.png",
      },
    ],

    photoSlots: [
      {
        x: 60,
        y: 120,
        width: 960,
        height: 960,
      },
    ],
  },

  2: {
    layout: 2,

    canvas: {
      width: 1080,
      height: 1890,
    },

    baseImage:
      "/assets/polaroid designs/2-photo/strip 2 base.png",

    designs: [
      {
        id: "2-design-1",
        name: "Design 1",
        image:
          "/assets/polaroid designs/2-photo/strip 2 design-1.png",
      },
      {
        id: "2-design-2",
        name: "Design 2",
        image:
          "/assets/polaroid designs/2-photo/strip 2 design-2.png",
      },
      {
        id: "2-design-3",
        name: "Design 3",
        image:
          "/assets/polaroid designs/2-photo/strip 2 design-3.png",
      },
      {
        id: "2-design-4",
        name: "Design 4",
        image:
          "/assets/polaroid designs/2-photo/strip 2 design-4.png",
      },
      {
        id: "2-design-5",
        name: "Design 5",
        image:
          "/assets/polaroid designs/2-photo/strip 2 design-5.png",
      },
      {
        id: "2-design-6",
        name: "Design 6",
        image:
          "/assets/polaroid designs/2-photo/strip 2 design-6.png",
      },
    ],

    photoSlots: [
      {
        x: 60,
        y: 30,
        width: 960,
        height: 720,
      },
      {
        x: 60,
        y: 780,
        width: 960,
        height: 720,
      },
    ],
  },

  3: {
    layout: 3,

    canvas: {
      width: 1080,
      height: 2250,
    },

    baseImage:
      "/assets/polaroid designs/3-photo/3 strip base.png",

    designs: [
      {
        id: "3-design-1",
        name: "Design 1",
        image:
          "/assets/polaroid designs/3-photo/3 strip design-1.png",
      },
      {
        id: "3-design-2",
        name: "Design 2",
        image:
          "/assets/polaroid designs/3-photo/3 strip design-2.png",
      },
      {
        id: "3-design-3",
        name: "Design 3",
        image:
          "/assets/polaroid designs/3-photo/3 strip design-3.png",
      },
      {
        id: "3-design-4",
        name: "Design 4",
        image:
          "/assets/polaroid designs/3-photo/3 strip design-4.png",
      },
      {
        id: "3-design-5",
        name: "Design 5",
        image:
          "/assets/polaroid designs/3-photo/3 strip design-5.png",
      },
      {
        id: "3-design-6",
        name: "Design 6",
        image:
          "/assets/polaroid designs/3-photo/3 strip design-6.png",
      },
    ],

    photoSlots: [
      {
        x: 60,
        y: 30,
        width: 960,
        height: 600,
      },
      {
        x: 60,
        y: 660,
        width: 960,
        height: 600,
      },
      {
        x: 60,
        y: 1290,
        width: 960,
        height: 600,
      },
    ],
  },

  4: {
    layout: 4,

    canvas: {
      width: 1080,
      height: 2610,
    },

    baseImage:
      "/assets/polaroid designs/4-photo/4 strip base.png",

    designs: [
      {
        id: "4-design-1",
        name: "Design 1",
        image:
          "/assets/polaroid designs/4-photo/4 strip design-1.png",
      },
      {
        id: "4-design-2",
        name: "Design 2",
        image:
          "/assets/polaroid designs/4-photo/4 strip design-2.png",
      },
      {
        id: "4-design-3",
        name: "Design 3",
        image:
          "/assets/polaroid designs/4-photo/4 strip design-3.png",
      },
      {
        id: "4-design-4",
        name: "Design 4",
        image:
          "/assets/polaroid designs/4-photo/4 strip design-4.png",
      },
      {
        id: "4-design-5",
        name: "Design 5",
        image:
          "/assets/polaroid designs/4-photo/4 strip design-5.png",
      },
      {
        id: "4-design-6",
        name: "Design 6",
        image:
          "/assets/polaroid designs/4-photo/4 strip design-6.png",
      },
    ],

    photoSlots: [
      {
        x: 60,
        y: 30,
        width: 960,
        height: 540,
      },
      {
        x: 60,
        y: 600,
        width: 960,
        height: 540,
      },
      {
        x: 60,
        y: 1170,
        width: 960,
        height: 540,
      },
      {
        x: 60,
        y: 1740,
        width: 960,
        height: 540,
      },
    ],
  },
};

export function getPolaroidTemplate(layout) {
  return polaroidTemplates[Number(layout)] || null;
}

export default polaroidTemplates;