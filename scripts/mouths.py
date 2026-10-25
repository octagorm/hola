# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "opencv-python-headless>=4.10,<5", "pillow"]
# ///
"""Make a painted speaker's talking face: their waiting face, with only
the mouth taken from an edit of it with the mouth open.

    uv run scripts/mouths.py <waiting.webp> <edit.png> <talking.webp>

The edit is the waiting face put in the middle of a square canvas and
painted again with the mouth open (scripts/pictures.mjs --mouths). It is
brought back to the waiting face's size and laid on it (a generator
nudges, turns or scales the figure a little), the two are compared, and
the one area that clearly changed, the mouth, is cut from the edit with a
soft edge and laid over the waiting face. Everything else stays exactly
the waiting face, so when the two are shown in turn only the mouth moves:
the way Puppet Theater makes its puppets' mouths (src/imaging/mouth.ts).
"""

import sys

import cv2
import numpy as np
from PIL import Image

# Size of the cells the two faces are compared in, in pixels
CELL = 6
# A change bigger than this share of the figure is a face painted anew
MAX_MOUTH_SHARE = 0.12


def load(path: str) -> np.ndarray:
    return np.array(Image.open(path).convert("RGBA")).astype(np.float32)


def grey(im: np.ndarray) -> np.ndarray:
    a = im[..., 3:] / 255
    return cv2.cvtColor(
        (im[..., :3] * a + 255 * (1 - a)).astype(np.uint8), cv2.COLOR_RGB2GRAY
    )


def unpad(edit: np.ndarray, w: int, h: int) -> np.ndarray:
    """The edit at the waiting face's size: the square canvas scaled to
    the face's longer side, and the face's box cut from its middle."""
    side = max(w, h)
    edit = cv2.resize(edit, (side, side), interpolation=cv2.INTER_AREA)
    x, y = (side - w) // 2, (side - h) // 2
    return edit[y : y + h, x : x + w]


def align(closed: np.ndarray, opened: np.ndarray) -> np.ndarray:
    """The edit moved, turned and scaled to lie on the waiting face: the
    same points found on both (SIFT) and matched, the mouth's few among
    many."""
    h, w = closed.shape[:2]
    sift = cv2.SIFT_create()
    kc, dc = sift.detectAndCompute(grey(closed), None)
    ko, do = sift.detectAndCompute(grey(opened), None)
    warp = None
    if dc is not None and do is not None and len(ko) >= 2:
        pairs = [
            (kc[m[0].queryIdx].pt, ko[m[0].trainIdx].pt)
            for m in cv2.BFMatcher().knnMatch(dc, do, k=2)
            if len(m) == 2 and m[0].distance < 0.75 * m[1].distance
        ]
        if len(pairs) >= 8:
            warp, _ = cv2.estimateAffinePartial2D(
                np.float32([o for _, o in pairs]),
                np.float32([c for c, _ in pairs]),
                method=cv2.RANSAC,
                ransacReprojThreshold=2,
            )
    if warp is None:
        print("  too few points matched; laid over as it is")
        return opened
    return cv2.warpAffine(
        opened, warp, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE
    )


def changed(closed: np.ndarray, opened: np.ndarray):
    """The one clearly changed area, as x, y, w, h, with a margin: the two
    compared blurred, cell by cell, inside the figure (an edit likes to
    redraw an outline, and a mouth is never on one), against the faint
    change that painting again makes everywhere, and the cells that
    changed most, side by side, kept."""
    h, w = closed.shape[:2]
    blur = lambda im: cv2.GaussianBlur(im[..., :3], (0, 0), 2)
    diff = np.abs(blur(closed) - blur(opened)).max(axis=2)
    inside = cv2.erode(
        (closed[..., 3] > 250).astype(np.uint8), np.ones((11, 11), np.uint8)
    ).astype(bool)
    rows, cols = h // CELL, w // CELL
    score = np.zeros((rows, cols), np.float32)
    scores = []
    for r in range(rows):
        for c in range(cols):
            cell = np.s_[r * CELL : (r + 1) * CELL, c * CELL : (c + 1) * CELL]
            if inside[cell].mean() > 0.3:
                score[r, c] = diff[cell][inside[cell]].mean()
                scores.append(score[r, c])
    if not scores:
        return None
    threshold = max(28, float(np.median(scores)) * 4)
    n, labels = cv2.connectedComponents((score >= threshold).astype(np.uint8), 8)
    if n < 2:
        return None
    best = max(range(1, n), key=lambda i: score[labels == i].sum())
    rs, cs = np.where(labels == best)
    x0, x1 = cs.min() * CELL, (cs.max() + 1) * CELL
    y0, y1 = rs.min() * CELL, (rs.max() + 1) * CELL
    if (x1 - x0) * (y1 - y0) > (closed[..., 3] > 128).sum() * MAX_MOUTH_SHARE:
        return None
    # a margin, so that the soft edge falls on what did not change
    pad = max(2 * CELL, round(max(x1 - x0, y1 - y0) * 0.35))
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(w, x1 + pad), min(h, y1 + pad)
    return x0, y0, x1 - x0, y1 - y0


def main() -> None:
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    closed_path, edit_path, out_path = sys.argv[1:]
    closed = load(closed_path)
    h, w = closed.shape[:2]
    opened = align(closed, unpad(load(edit_path), w, h))
    box = changed(closed, opened)
    if not box:
        sys.exit(f"{edit_path}: no mouth found (the edit changed nothing, or too much)")
    x, y, bw, bh = box
    # the patch fades into the face towards its edges
    fade = max(2, min(bw, bh) * 0.28)
    yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32) + 0.5
    t = np.clip(np.minimum.reduce([xx, bw - xx, yy, bh - yy]) / fade, 0, 1)
    m = (t * t * (3 - 2 * t))[..., None]
    out = closed.copy()
    part = out[y : y + bh, x : x + bw]
    part[..., :3] = part[..., :3] * (1 - m) + opened[y : y + bh, x : x + bw, :3] * m
    Image.fromarray(out.round().clip(0, 255).astype(np.uint8)).save(
        out_path, quality=80, method=6
    )
    print(f"{out_path}: mouth at {x},{y}, {bw}×{bh}")


if __name__ == "__main__":
    main()
