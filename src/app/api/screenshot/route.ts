import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        try {
            await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        } catch {
            // Si networkidle2 falla, intentar con load
            await page.goto(url, { waitUntil: "load", timeout: 30000 });
            await new Promise((r) => setTimeout(r, 3000));
        }

        const screenshot = await page.screenshot({
            encoding: "base64",
            fullPage: false,
        });
        await browser.close();

        return NextResponse.json({
            image: screenshot,
            mediaType: "image/png",
        });
    } catch (error) {
        console.error("Screenshot error:", error);
        return NextResponse.json(
            { error: "Failed to capture screenshot" },
            { status: 500 }
        );
    }
}