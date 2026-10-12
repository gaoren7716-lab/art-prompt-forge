# -*- coding: utf-8 -*-
"""
repair_text.py —— 按显式映射修复被污染的词条
背景：一次性大批量写入时，中文描述里会混进外来词，英文词面也会被磨坏。
     正则改数据容易把字符串结构改崩，所以一律用「旧串 -> 新串」的显式替换。

用法：
  python tools/repair_text.py            # 修复 assets/ 下全部文件
  python tools/repair_text.py assets/x.js
"""
import sys, os, io, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP_FILE = os.path.join(BASE, "tools", "_fixmap.json")


def load_map():
    if not os.path.exists(MAP_FILE):
        return {}
    with open(MAP_FILE, encoding="utf-8") as f:
        return json.load(f)


def target_files(args):
    if args:
        return args
    d = os.path.join(BASE, "assets")
    return [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith(".js")]


def main(files):
    pairs = load_map()
    if not pairs:
        print("修复映射为空，跳过")
        return 0
    total = 0
    for path in files:
        src = open(path, encoding="utf-8").read()
        out = src
        hit = []
        for old, new in pairs.items():
            if old in out:
                n = out.count(old)
                out = out.replace(old, new)
                hit.append((old, new, n))
                total += n
        if hit:
            open(path, "w", encoding="utf-8").write(out)
            print("==== %s 修复 %d 处 ====" % (os.path.basename(path), len(hit)))
            for old, new, n in hit:
                print("  x%-2d %s\n      -> %s" % (n, old if len(old) < 46 else old[:46] + "...",
                                                   new if len(new) < 46 else new[:46] + "..."))
        else:
            print("==== %s : 0 处 ====" % os.path.basename(path))
    print("\n合计修复：%d 处" % total)
    return 0


if __name__ == "__main__":
    sys.exit(main(target_files(sys.argv[1:])))
