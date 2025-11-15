// Generate Instagram story image (1080x1920)
async function generateInstagramImage(categoryId: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Instagram STORY dimensions (9:16 ratio)
  canvas.width = 1080;
  canvas.height = 1920;

  // --- BACKGROUND ---

  // Smooth vertical gradient
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#050814");
  bg.addColorStop(0.5, "#0a1030");
  bg.addColorStop(1, "#14071c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // subtle radial glow in the center
  const glowCenter = ctx.createRadialGradient(
    canvas.width / 2,
    420,
    0,
    canvas.width / 2,
    420,
    520
  );
  glowCenter.addColorStop(0, "rgba(0, 255, 204, 0.35)");
  glowCenter.addColorStop(0.5, "rgba(0, 255, 204, 0.07)");
  glowCenter.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowCenter;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // bottom glow
  const glowBottom = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height,
    0,
    canvas.width / 2,
    canvas.height,
    500
  );
  glowBottom.addColorStop(0, "rgba(255, 0, 153, 0.35)");
  glowBottom.addColorStop(0.5, "rgba(255, 0, 153, 0.1)");
  glowBottom.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowBottom;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- LOGO ---

  try {
    const logo = await loadImage("/images/logo.png");
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 120, 70, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, 470, 50, 140, 140);
    ctx.restore();

    // logo ring
    ctx.save();
    ctx.shadowColor = "rgba(0, 255, 200, 0.6)";
    ctx.shadowBlur = 24;
    ctx.strokeStyle = "rgba(0, 255, 200, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(540, 120, 74, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } catch {
    // ignore logo load errors
  }

  // --- HEADER TEXT ---

  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";

  // subtitle
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "28px Arial";
  ctx.fillText("נבחרי השנה בטראנס • 2025", 540, 230);

  // category title
  const titleGradient = ctx.createLinearGradient(340, 260, 740, 340);
  titleGradient.addColorStop(0, "#00ffcc");
  titleGradient.addColorStop(0.5, "#00aaff");
  titleGradient.addColorStop(1, "#ff00ff");
  ctx.fillStyle = titleGradient;
  ctx.font = "bold 64px Arial";
  ctx.fillText(getCategoryTitle(categoryId), 540, 310);

  // "mid-results" pill
  const pillWidth = 640;
  const pillHeight = 72;
  const pillX = (canvas.width - pillWidth) / 2;
  const pillY = 350;
  const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillWidth, pillY);
  pillGrad.addColorStop(0, "rgba(0,255,204,0.25)");
  pillGrad.addColorStop(1, "rgba(255,0,170,0.25)");
  ctx.fillStyle = pillGrad;
  roundRect(ctx, pillX, pillY, pillWidth, pillHeight, 36);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, pillX, pillY, pillWidth, pillHeight, 36);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px Arial";
  ctx.fillText("תוצאות ביניים · ההצבעה בעיצומה", 540, pillY + 48);

  ctx.restore();

  // --- TOP 7 LIST ---

  const top7 = getTop7(categoryId);
  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];

  // layout: top 3 big cards, 4-7 compact
  const bigCardX = 70;
  const bigCardWidth = canvas.width - bigCardX * 2; // 940
  const bigCardHeight = 150;
  let currentY = 460;

  // draw top 3
  for (let i = 0; i < Math.min(3, top7.length); i++) {
    const item = top7[i];
    const nomineeData = getNomineeData(categoryId, item.nomineeId);

    // card background
    ctx.save();
    const cardGrad = ctx.createLinearGradient(
      bigCardX,
      currentY,
      bigCardX + bigCardWidth,
      currentY
    );
    if (i === 0) {
      cardGrad.addColorStop(0, "rgba(255, 216, 0, 0.2)");
      cardGrad.addColorStop(1, "rgba(255, 147, 0, 0.15)");
    } else {
      cardGrad.addColorStop(0, "rgba(255,255,255,0.08)");
      cardGrad.addColorStop(1, "rgba(255,255,255,0.03)");
    }
    ctx.fillStyle = cardGrad;
    roundRect(ctx, bigCardX, currentY, bigCardWidth, bigCardHeight, 26);
    ctx.fill();

    ctx.strokeStyle =
      i === 0 ? "rgba(255, 216, 0, 0.8)" : "rgba(255,255,255,0.25)";
    ctx.lineWidth = i === 0 ? 3 : 1.5;
    roundRect(ctx, bigCardX, currentY, bigCardWidth, bigCardHeight, 26);
    ctx.stroke();

    // medal
    ctx.textAlign = "center";
    ctx.font = "80px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(medals[i], bigCardX + 70, currentY + 100);

    // artwork
    try {
      const img = await loadImage(nomineeData.artwork);
      const centerX = bigCardX + 180;
      const centerY = currentY + bigCardHeight / 2;
      const radius = 55;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      const scale = Math.max(
        (radius * 2) / img.width,
        (radius * 2) / img.height
      );
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, centerX - w / 2, centerY - h / 2, w, h);

      ctx.restore();

      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    } catch {
      // ignore image failures
    }

    // name (LTR)
    ctx.save();
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    let fontSize = 46;
    const nameX = bigCardX + 260;
    const nameY = currentY + 100;
    const maxWidth = bigCardWidth - 280;
    ctx.font = `bold ${fontSize}px Arial`;
    while (ctx.measureText(nomineeData.name).width > maxWidth && fontSize > 26) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    ctx.fillText(nomineeData.name, nameX, nameY);
    ctx.restore();

    ctx.restore();

    currentY += bigCardHeight + 18;
  }

  // compact list for places 4-7
  const smallCardX = 90;
  const smallCardWidth = canvas.width - smallCardX * 2; // 900
  const smallCardHeight = 108;

  for (let i = 3; i < top7.length; i++) {
    const item = top7[i];
    const nomineeData = getNomineeData(categoryId, item.nomineeId);

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, smallCardX, currentY, smallCardWidth, smallCardHeight, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.2;
    roundRect(ctx, smallCardX, currentY, smallCardWidth, smallCardHeight, 22);
    ctx.stroke();

    // medal small
    ctx.textAlign = "center";
    ctx.font = "50px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(medals[i], smallCardX + 55, currentY + 72);

    // artwork small
    try {
      const img = await loadImage(nomineeData.artwork);
      const centerX = smallCardX + 155;
      const centerY = currentY + smallCardHeight / 2;
      const radius = 38;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      const scale = Math.max(
        (radius * 2) / img.width,
        (radius * 2) / img.height
      );
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, centerX - w / 2, centerY - h / 2, w, h);

      ctx.restore();

      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    } catch {}

    // name
    ctx.save();
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    let fontSize = 34;
    const nameX = smallCardX + 220;
    const nameY = currentY + 70;
    const maxWidth = smallCardWidth - 240;
    ctx.font = `bold ${fontSize}px Arial`;
    while (ctx.measureText(nomineeData.name).width > maxWidth && fontSize > 22) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    ctx.fillText(nomineeData.name, nameX, nameY);
    ctx.restore();

    ctx.restore();
    currentY += smallCardHeight + 14;
  }

  // --- CTA BOX (BOTTOM) ---

  const ctaWidth = canvas.width - 120;
  const ctaHeight = 210;
  const ctaX = 60;
  const ctaY = canvas.height - ctaHeight - 120;

  const ctaGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaWidth, ctaY);
  ctaGrad.addColorStop(0, "rgba(0,255,204,0.25)");
  ctaGrad.addColorStop(1, "rgba(255,0,170,0.35)");

  ctx.save();
  ctx.direction = "rtl";
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  roundRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, 28);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  ctx.strokeStyle = ctaGrad;
  roundRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, 28);
  ctx.stroke();

  ctx.textAlign = "center";

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px Arial";
  ctx.fillText("אלה רק תוצאות ביניים", canvas.width / 2, ctaY + 60);

  ctx.font = "32px Arial";
  ctx.fillText(
    "ההצבעה עדיין פתוחה – כנסו לאתר והצביעו עכשיו",
    canvas.width / 2,
    ctaY + 110
  );

  ctx.font = "26px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(
    "לינק להצבעה בביו של ״יוצאים לטראק״",
    canvas.width / 2,
    ctaY + 152
  );

  ctx.restore();

  // tiny footer
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "22px Arial";
  ctx.fillText(
    "שתפו בסטורי ותייגו אותנו",
    canvas.width / 2,
    canvas.height - 40
  );
  ctx.restore();

  return canvas.toDataURL("image/png");
}
