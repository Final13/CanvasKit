export const CANVAS_WIDTH = 1748;
export const CANVAS_HEIGHT = 2480;

function loadImage(
  fabric: any,
  src: string,
  options: Record<string, unknown>
): Promise<any> {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(
      src,
      (img: any) => {
        if (!img) {
          reject(new Error(`Failed to load image ${src}`));
          return;
        }
        img.set(options);
        resolve(img);
      },
    );
  });
}

export async function loadTemplate(canvas: any, fabric: any) {
  canvas.clear();
  canvas.backgroundColor = "#0e0e0e";

  const centerX = CANVAS_WIDTH / 2;

  // Background
  const bg = await loadImage(fabric, "/assets/birthday-bg.jpg", {
    originX: "center",
    originY: "center",
    left: centerX,
    top: CANVAS_HEIGHT / 2,
    selectable: false,
    evented: false,
  });
  if (bg.width && bg.height) {
    bg.scaleToWidth(CANVAS_WIDTH);
  }
  canvas.add(bg);
  canvas.sendToBack(bg);

  // Digits "30"
  const digitScale = 0.75;
  const digit3 = await loadImage(fabric, "/assets/number-3-gold.png", {
    originX: "center",
    originY: "center",
    left: centerX - 260,
    top: 750,
    scaleX: digitScale,
    scaleY: digitScale,
  });
  const digit0 = await loadImage(fabric, "/assets/number-0-gold.png", {
    originX: "center",
    originY: "center",
    left: centerX + 260,
    top: 750,
    scaleX: digitScale,
    scaleY: digitScale,
  });
  canvas.add(digit3, digit0);

  // Texts
  const script = "Marck Script, cursive";
  const sans = "Montserrat, sans-serif";

  const texts = [
    {
      text: "Приглашаю на",
      top: 1180,
      fontFamily: script,
      fontSize: 110,
      fill: "#ffffff",
    },
    {
      text: "ДЕНЬ РОЖДЕНИЯ",
      top: 1320,
      fontFamily: sans,
      fontSize: 150,
      fill: "#d4af37",
      fontWeight: "bold",
    },
    {
      text: "20 НОЯБРЯ",
      top: 1540,
      fontFamily: sans,
      fontSize: 80,
      fill: "#ffffff",
      fontWeight: "bold",
    },
    {
      text: "Собираемся в 20:00",
      top: 1680,
      fontFamily: script,
      fontSize: 100,
      fill: "#ffffff",
    },
    {
      text: "РЕСТОРАН «ПАРАДАЙЗ»",
      top: 1870,
      fontFamily: sans,
      fontSize: 70,
      fill: "#d4af37",
      fontWeight: "bold",
    },
    {
      text: "Г. МОСКВА, УЛ. ПРАЗДНИКА, 7",
      top: 1970,
      fontFamily: sans,
      fontSize: 52,
      fill: "#ffffff",
      fontWeight: "bold",
    },
    {
      text: "Ваша, Ксюша",
      top: 2150,
      fontFamily: script,
      fontSize: 90,
      fill: "#ffffff",
    },
  ];

  texts.forEach((t) => {
    const textObj = new fabric.IText(t.text, {
      left: centerX,
      top: t.top,
      originX: "center",
      originY: "top",
      fontFamily: t.fontFamily,
      fontSize: t.fontSize,
      fill: t.fill,
      fontWeight: (t.fontWeight as any) || "normal",
      textAlign: "center",
      selectable: true,
      editable: true,
    });
    canvas.add(textObj);
  });

  canvas.renderAll();
}
