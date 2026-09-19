# Deadliest Animals

An interactive scrollytelling data story about the animals associated with the most human deaths — and why the animals that feel most frightening are not always the ones associated with the most deaths.

**Live site:** [https://jessi88.github.io/deadliest-animals/](https://jessi88.github.io/deadliest-animals/)

## About the project

The story starts with familiar animals such as wolves, sharks, bears, and crocodiles, then gradually changes the scale as larger estimates enter the picture. The polar chart grows with the narrative until snakes, humans, and mosquitoes reveal how dramatically the ranking changes.

The final chart becomes interactive, allowing readers to filter animals and explore how the radial scale changes with the selection.

The project focuses not only on the ranking itself, but also on the mechanisms behind the numbers: direct attacks, venom, human violence and conflict, and diseases transmitted through animals such as mosquitoes, dogs, tsetse flies, freshwater snails, and kissing bugs.

## Important note about the data

The visualization is based on Our World in Data's **Deadliest Animals** analysis. OWID presents its main comparison as a **2023** chart, but the values should not all be interpreted as directly observed deaths in 2023.

They are **rounded annual estimates** assembled from the best available evidence. Many disease estimates use 2023 data, while several animal-attack categories rely on multi-year averages, national records, or other recent studies. OWID's article estimates around 920,000 annual deaths from non-human animals and about 600,000 from direct violence and conflict among humans. The broad differences in magnitude are therefore more meaningful than the exact individual values.

Sources:

- [Our World in Data — What are the world's deadliest animals?](https://ourworldindata.org/deadliest-animals)
- [Our World in Data — Technical methodology](https://docs.owid.io/projects/etl/analyses/deadliest_animals/)

## Features

- Scroll-driven data storytelling
- Animated polar-area charts with changing scales
- Sequential animal-by-animal transitions
- Tooltips with contextual information and methodology notes
- Interactive final chart with animal filters
- Dynamic radial scaling based on the current selection
- Responsive layout for desktop and smaller screens
- Source and licensing credits included in the story

## Built with

- [Vite](https://vite.dev/)
- [React](https://react.dev/)
- JavaScript
- SVG
- CSS
- Tailwind CSS

The current polar-chart rendering, interaction, and animation logic is written in vanilla JavaScript/SVG and initialized from the React app.

## Project structure

```text
deadliest-animals/
├── index.html
├── public/
├── src/
│   ├── assets/
│   ├── data/
│   │   ├── animals.js
│   │   └── worlds_deadliest_animals.csv
│   ├── story/
│   │   ├── buildPolarChart.js
│   │   ├── chartUtils.js
│   │   ├── initStory.js
│   │   └── story.html
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

## Run locally

Clone the repository and install the dependencies:

```bash
git clone https://github.com/jessi88/deadliest-animals.git
cd deadliest-animals
npm install
npm run dev
```

Then open the local URL shown by Vite in your browser.

To create a production build:

```bash
npm run build
```

## Data and methodology

The animal estimates and supporting context are adapted from Hannah Ritchie and Fiona Spooner's Our World in Data analysis and its accompanying technical methodology.

The dataset used by this project is stored in:

```text
src/data/worlds_deadliest_animals.csv
```

Additional metadata used by the visualization, including labels, tooltip copy, icon references, and story groupings, is stored in:

```text
src/data/animals.js
```

## AI assistance

AI was used substantially during development, especially for code generation, debugging, responsive refinement, copy refinement, and source research/cross-checking. The story concept, data selection, narrative direction, visual and editorial decisions, source review, testing, and final approval remained human-directed.

The live site includes a more detailed **AI Assistance Facts** table. Its labels are qualitative role descriptions, not measured percentages. The disclosure format was inspired by Hiroshi Sato's “AI Assistance Facts” in [*How – and why – to say no when a friend asks for a discount*](https://uxdesign.cc/how-to-say-no-when-a-friend-asks-for-a-discount-d0e48087eb1d) (UX Collective, 2026).

## Image and icon credits

The opening photograph is **“A child sleeping under a mosquito net to prevent mosquito bite” by HarunaSylvester**, sourced via Wikimedia Commons and used under **CC BY-SA 4.0**. It is displayed with cropping, darkening, and blending for the hero layout.

Animal icons from [Game-icons.net](https://game-icons.net/) are used under **CC BY 3.0**, with attribution to Lorc, Delapouite, Carl Olsen, Skoll, and Cathelineau as listed in the site's source credits.

The hippo, dog, and mosquito silhouettes use **Font Awesome Free** SVG icons, delivered through Iconify, under **CC BY 4.0**.

Full attribution and source details are included on the live site.
