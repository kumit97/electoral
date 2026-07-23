import { createFileRoute } from "@tanstack/react-router";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Toaster } from "@/components/ui/sonner";
import { Spreadsheet } from "@/components/election/Spreadsheet";
import { A4Preview } from "@/components/election/A4Preview";
import { PropertiesPanel } from "@/components/election/PropertiesPanel";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Election Form Designer & Word Generator" },
      {
        name: "description",
        content:
          "Import Excel voter data, design INEC-style election forms on a fixed A4 canvas, and export editable Word documents.",
      },
      { property: "og:title", content: "Election Form Designer & Word Generator" },
      {
        property: "og:description",
        content:
          "Fixed A4 document editor for INEC election forms with Excel import and Word export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-100">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b bg-background px-4">
        <FileText className="h-4 w-4 text-primary" />
        <h1 className="text-sm font-semibold">
          Election Form Designer &amp; Word Generator
        </h1>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          Form EC8A • A4 Landscape
        </span>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={22} minSize={15}>
            <Spreadsheet />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={56} minSize={30}>
            <A4Preview />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={22} minSize={15}>
            <PropertiesPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
