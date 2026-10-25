"""Screenshot the six capability scenes from the redesign homepages (zh, en) at 2x, after they have settled."""
from playwright.sync_api import sync_playwright
STEPS = ["match", "sourcing", "identity", "bd", "network", "mapping"]
with sync_playwright() as p:
    b = p.chromium.launch()
    for lang, url in [("zh", "http://localhost:8765/landing-redesign/"), ("en", "http://localhost:8765/landing-redesign/en/")]:
        pg = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        pg.emulate_media(reduced_motion="reduce")
        pg.goto(url, wait_until="networkidle"); pg.wait_for_timeout(800)
        for s in STEPS:
            step = pg.locator(f"#n-step-{s}").locator("xpath=ancestor::*[contains(@class,'n-step')][1]")
            fig = step.locator(".n-figure")
            fig.scroll_into_view_if_needed(); pg.wait_for_timeout(1600)
            fig.screenshot(path=f"fig_{lang}_{s}.png")
            print(lang, s, fig.bounding_box())
        pg.close()
    b.close()
