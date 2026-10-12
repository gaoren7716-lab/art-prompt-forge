# -*- coding: utf-8 -*-
"""
detect_latin.py —— 检测「中文字段里混入拉丁字母」的污染
背景：历史教训是中文描述字段被注入了外来词。-*- coding: utf-8 -*-
旧脚本只查非 ASCII 非 CJK 字符，英文单词属于 ASCII 因此漏网。

规则：
  - 需检查字段：zh / desc / note / tip / use / c（中文串）
  - 豁免：字段值整体为纯 ASCII（<｜hy_place▁holder▁no▁813｜>英文 field，合法）
  - 豁免：成对出现的反引号 `xxx`、书名号包裹中的技术名词
  - 其余出现拉丁字母连续 >=2 的行，报出来
"""
import re, sys, io, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

CJK = re.compile(r"[\u4e00-\u9fff\u3040-\u30ff\u3400-\u4dbf]")
LATIN = re.compile(r"[A-Za-z]{2,}")
BACKTICK = re.compile(r"`[^`]*`")

FIELDS = ["zh", "desc", "note", "tip", "use", "c"]


def scan_line(s):
    """返回该字段值里可疑的拉丁词列表"""
    if not CJK.search(s):        # 纯英文/符号，合法
        return []
    t = BACKTICK.sub(" ", s)     # 去掉反引号内容
    return LATIN.findall(t)


def main(paths):
    total = 0
    for p in paths:
        lines = open(p, encoding="utf-8").read().split("\n")
        hits = []
        for i, ln in enumerate(lines, 1):
            for f in FIELDS:
                m = re.search(r'\b%s\s*:\s*"((?:[^"\\]|\\.)*)"' % f, ln)
                if not m:
                    continue
                val = m.group(1)
                words = scan_line(val)
                if words:
                    hits.append((i, f, words, val[:70]))
        if hits:
            print("==== %s : %d 行可疑 ====" % (os.path.basename(p), len(hits)))
            for i, f, w, v in hits:
                print("  L%-5d %-5s %-28s | %s" % (i, f, ",".join(sorted(set(w)))[:28], v))
            total += len(hits)
        else:
            print("==== %s : 0 行可疑 ====" % os.path.basename(p))
    print("\n合计可疑行数：%d" % total)
    return total


if __name__ == "__main__":
    args = sys.argv[1:] or ["assets"]
    files = []
    for a in args:
        if os.path.isdir(a):
            files += [os.path.join(a, f) for f in sorted(os.listdir(a))
                      if f.endswith(".js") and os.path.isfile(os.path.join(a, f))]
        else:
            files.append(a)
    sys.exit(0 if main(files) == 0 else 1)
