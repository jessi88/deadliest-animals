import { useEffect } from "react";
import "./App.css";
import storyMarkup from "./story/story.html?raw";
import { initDeadliestAnimalsStory } from "./story/initStory.js";

export default function App() {
  useEffect(() => {
    initDeadliestAnimalsStory();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: storyMarkup }} />;
}
