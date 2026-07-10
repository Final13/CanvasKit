export const CANVAS_WIDTH = 1748;
export const CANVAS_HEIGHT = 2480;

const DIGIT_TOP = 750;
const DIGIT_SCALE = 0.75;
const DIGIT_OFFSET = 260;

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

async function loadDigitImage(fabric: any, value: string, name: string, left: number) {
  const img = await loadImage(fabric, `/assets/number-${value}-gold.png`, {
    originX: "center",
    originY: "center",
    left,
    top: DIGIT_TOP,
    scaleX: DIGIT_SCALE,
    scaleY: DIGIT_SCALE,
    name,
  });
  return img;
}

export async function updateDigits(
  canvas: any,
  fabric: any,
  tens: string,
  units: string
) {
  const centerX = CANVAS_WIDTH / 2;

  // remove existing digits
  const existing = canvas
    .getObjects()
    .filter((obj: any) => obj.name === "digit-tens" || obj.name === "digit-units");
  existing.forEach((obj: any) => canvas.remove(obj));

  const digits: any[] = [];
  if (tens && tens !== "") {
    digits.push(
      await loadDigitImage(fabric, tens, "digit-tens", centerX - DIGIT_OFFSET)
    );
  }
  if (units && units !== "") {
    digits.push(
      await loadDigitImage(fabric, units, "digit-units", centerX + DIGIT_OFFSET)
    );
  }

  if (digits.length) {
    canvas.add(...digits);
    // keep digits just above the background (index 0)
    digits.forEach((img, i) => canvas.moveTo(img, i + 1));
    canvas.renderAll();
  }
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
  await updateDigits(canvas, fabric, "3", "0");

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
