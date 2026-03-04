"use client";

import { useEffect } from "react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import Titlebar from "./titlebar";
import Sidebar from "./sidebar";
import WelcomeView from "@/components/views/welcome-view";
import EditorView from "@/components/views/editor-view";
import ChaptersView from "@/components/views/chapters-view";
import EntitiesView from "@/components/views/entities-view";
import EntityDetailView from "@/components/views/entity-detail-view";
import StoryMapView from "@/components/views/story-map-view";
import TimelineView from "@/components/views/timeline-view";
import ConflictsView from "@/components/views/conflicts-view";
import SearchView from "@/components/views/search-view";
import StatsView from "@/components/views/stats-view";
import SettingsView from "@/components/views/settings-view";

export default function MainLayout() {
  const currentView = useNovelTeaStore((s) => s.currentView);
  const project = useNovelTeaStore((s) => s.project);
  const init = useNovelTeaStore((s) => s.init);
  const settings = useNovelTeaStore((s) => s.settings);

  useEffect(() => {
    init();
  }, [init]);

  // Apply theme class
  useEffect(() => {
    document.body.className = settings.theme === "grey" ? "theme-grey"
      : settings.theme === "light" ? "theme-light" : "";
  }, [settings.theme]);

  const isWelcome = !project;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Titlebar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {!isWelcome && <Sidebar />}
        <main style={{ flex: 1, overflow: "auto", background: "var(--bg-primary)" }}>
          {isWelcome && <WelcomeView />}
          {!isWelcome && currentView === "editor" && <EditorView />}
          {!isWelcome && currentView === "chapters" && <ChaptersView />}
          {!isWelcome && currentView === "entities" && <EntitiesView />}
          {!isWelcome && currentView === "entity-detail" && <EntityDetailView />}
          {!isWelcome && currentView === "story-map" && <StoryMapView />}
          {!isWelcome && currentView === "timeline" && <TimelineView />}
          {!isWelcome && currentView === "conflicts" && <ConflictsView />}
          {!isWelcome && currentView === "search" && <SearchView />}
          {!isWelcome && currentView === "stats" && <StatsView />}
          {!isWelcome && currentView === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
