import { useEffect, useRef, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric";
import {
  loadTemplate,
  updateDigits,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "@/lib/template";
import { useHistory } from "./useHistory";

export type FabricCanvas = any;

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useFabric(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [ready, setReady] = useState(false);
  const fabricRef = useRef<any>(null);
  const canvasRefState = useRef<FabricCanvas | null>(null);
  const skipHistory = useRef(false);
  const [activeObject, setActiveObject] = useState<any>(null);
  const {
    push,
    undo,
    redo,
    reset: resetHistory,
    canUndo,
    canRedo,
  } = useHistory<string>(null, 30);

  const capture = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas || skipHistory.current) return;
    const json = JSON.stringify(canvas.toJSON());
    push(json);
  }, [push]);

  const withoutHistory = useCallback(
    (action: () => void, andCapture = true) => {
      skipHistory.current = true;
      try {
        action();
      } finally {
        skipHistory.current = false;
      }
      if (andCapture) capture();
    },
    [capture]
  );

  useEffect(() => {
    let disposed = false;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    (async () => {
      await document.fonts.ready;
      const fabric = await getFabric();
      if (disposed) return;

      // Make resize/rotate controls larger and visible on dark backgrounds
      fabric.Object.prototype.set({
        cornerSize: 24,
        touchCornerSize: 36,
        cornerColor: "#ffffff",
        cornerStrokeColor: "#000000",
        cornerStyle: "circle",
        transparentCorners: false,
        borderColor: "#ffffff",
        borderScaleFactor: 2,
        rotatingPointOffset: 50,
        hasRotatingPoint: true,
      });

      const canvas = new fabric.Canvas(canvasEl, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        preserveObjectStacking: true,
        enableRetinaScaling: false,
        selection: true,
        backgroundColor: "#0e0e0e",
      });

      canvasRefState.current = canvas;
      fabricRef.current = fabric;

      const updateSelection = () => setActiveObject(canvas.getActiveObject() || null);

      canvas.on("object:modified", capture);
      canvas.on("object:added", () => {
        if (!skipHistory.current) capture();
      });
      canvas.on("object:removed", () => {
        if (!skipHistory.current) capture();
      });
      canvas.on("text:editing:exited", capture);
      canvas.on("selection:created", updateSelection);
      canvas.on("selection:updated", updateSelection);
      canvas.on("selection:cleared", updateSelection);

      await loadTemplate(canvas, fabric);
      if (!disposed) {
        resetHistory(JSON.stringify(canvas.toJSON()));
        setReady(true);
      }
    })();

    return () => {
      disposed = true;
      if (canvasRefState.current) {
        canvasRefState.current.dispose();
        canvasRefState.current = null;
      }
    };
  }, [canvasRef, capture, resetHistory]);

  const addText = useCallback(
    (text = "Новый текст") => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;

      withoutHistory(() => {
        const t = new fabric.IText(text, {
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          originX: "center",
          originY: "center",
          fontFamily: "Montserrat, sans-serif",
          fontSize: 80,
          fill: "#ffffff",
          textAlign: "center",
          editable: true,
        });
        canvas.add(t);
        canvas.setActiveObject(t);
        canvas.renderAll();
      });
    },
    [withoutHistory]
  );

  const addImageFromFile = useCallback(
    (file: File) => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        withoutHistory(() => {
          fabric.Image.fromURL(
            dataUrl,
            (img: any) => {
              img.set({
                left: CANVAS_WIDTH / 2,
                top: CANVAS_HEIGHT / 2,
                originX: "center",
                originY: "center",
              });
              const maxW = CANVAS_WIDTH * 0.7;
              if (img.width * (img.scaleX || 1) > maxW) {
                img.scaleToWidth(maxW);
              }
              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();
            });
        });
      };
      reader.readAsDataURL(file);
    },
    [withoutHistory]
  );

  const addImageFromSrc = useCallback(
    (src: string) => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;

      withoutHistory(() => {
        fabric.Image.fromURL(src, (img: any) => {
          img.set({
            left: CANVAS_WIDTH / 2,
            top: CANVAS_HEIGHT / 2,
            originX: "center",
            originY: "center",
          });
          const maxW = CANVAS_WIDTH * 0.7;
          if (img.width * (img.scaleX || 1) > maxW) {
            img.scaleToWidth(maxW);
          }
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      });
    },
    [withoutHistory]
  );

  const addQR = useCallback(
    (dataUrl: string) => {
      addImageFromSrc(dataUrl);
    },
    [addImageFromSrc]
  );

  const deleteSelected = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    withoutHistory(() => {
      if (active.type === "activeSelection") {
        active.getObjects().forEach((obj: any) => canvas.remove(obj));
      } else {
        canvas.remove(active);
      }
      canvas.discardActiveObject();
      canvas.renderAll();
    });
  }, [withoutHistory]);

  const handleUndo = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const state = undo();
    if (state) {
      skipHistory.current = true;
      canvas.loadFromJSON(state, () => {
        canvas.renderAll();
        skipHistory.current = false;
      });
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const state = redo();
    if (state) {
      skipHistory.current = true;
      canvas.loadFromJSON(state, () => {
        canvas.renderAll();
        skipHistory.current = false;
      });
    }
  }, [redo]);

  const handleReset = useCallback(() => {
    const canvas = canvasRefState.current;
    const fabric = fabricRef.current;
    if (!canvas || !fabric) return;

    skipHistory.current = true;
    loadTemplate(canvas, fabric).then(() => {
      resetHistory(JSON.stringify(canvas.toJSON()));
      skipHistory.current = false;
      canvas.renderAll();
    });
  }, [resetHistory]);

  const setDigits = useCallback(
    async (tens: string, units: string) => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;

      skipHistory.current = true;
      await updateDigits(canvas, fabric, tens, units);
      skipHistory.current = false;
      capture();
    },
    [capture]
  );

  const downloadPNG = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
    downloadDataUrl(dataUrl, "priglashenie.png");
  }, []);

  return {
    ready,
    activeObject,
    canUndo,
    canRedo,
    addText,
    addImageFromFile,
    addQR,
    deleteSelected,
    undo: handleUndo,
    redo: handleRedo,
    reset: handleReset,
    setDigits,
    downloadPNG,
  };
}
