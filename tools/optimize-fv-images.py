import os
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

SRC = r"c:\Users\nichibiWin01\Desktop\リョーキ_リクルート\html\assets\images"
OUT = os.path.join(SRC, "fv")
os.makedirs(OUT, exist_ok=True)

# source, slug, max_width, quality
jobs = [
    ("Gemini_Generated_Image_7yx17g7yx17g7yx1.jpeg", "recycle",          950, 80),
    ("Clip path group.jpg",                          "crowd",            950, 82),
    ("Group.jpg",                                    "site",             900, 82),
    ("bis_bu_exp3.jpg",                              "const-truck",      900, 82),
    ("Gemini_Generated_Image_zfhfqmzfhfqmzfhf 4.jpg","family",           850, 82),
    ("IMG_2816.jpg",                                 "welfare-showroom", 700, 80),
    ("image 153.jpg",                                "welfare-maint",    700, 82),
    ("35260848_s.jpg",                               "const-steel",      750, 82),
    ("23231348_s.jpg",                               "const-excavator",  750, 82),
    ("35180466_s.jpg",                               "const-cranes",     650, 82),
    ("image 148.jpg",                                "const-training",   750, 82),
    ("image 144.jpg",                                "hq",               750, 82),
    ("image 145.jpg",                                "yard",             800, 82),
    ("bis_ev_exp3.jpg",                              "env-screen",       750, 82),
    ("image 147.jpg",                                "env-warrior",      750, 82),
    ("image 151.jpg",                                "env-chieftain",    700, 82),
    ("bis_ev_exp1.jpg",                              "env-shredder",     650, 82),
    ("image 146.jpg",                                "env-attach",       650, 82),
    ("image 152.jpg",                                "env-trommel",      700, 82),
    ("image 141.jpg",                                "people-inspect",   650, 82),
    ("image 142.jpg",                                "people-office",    650, 82),
    ("image 143.jpg",                                "people-team",      700, 82),
    ("image 149.jpg",                                "people-phone",     650, 82),
    ("bis_mt_exp1.jpg",                              "people-talk",      700, 82),
    ("IMG_E1379.JPG",                                "people-test",      700, 82),
    ("image 154.jpg",                                "welfare-warehouse",700, 82),
    ("image 127.jpg",                                "env-crusher",      750, 82),
]

total = 0
for src, slug, mw, q in jobs:
    p = os.path.join(SRC, src)
    im = Image.open(p).convert("RGB")
    w, h = im.size
    if w > mw:
        im = im.resize((mw, round(h * mw / w)), Image.LANCZOS)
    op = os.path.join(OUT, slug + ".jpg")
    im.save(op, "JPEG", quality=q, optimize=True, progressive=True)
    kb = os.path.getsize(op) // 1024
    total += kb
    print(f"{slug:20} {kb:4} KB  {im.size}")
print("TOTAL", total, "KB")

# remove old unused slugs
for old in ["cranes.jpg", "welfare.jpg"]:
    fp = os.path.join(OUT, old)
    if os.path.exists(fp):
        os.remove(fp); print("removed", old)
