#!/usr/bin/env bash
# 奶蛙之塔 · 自动测试
# 用法：
#   bash tools/tests/run_tests.sh              # 测仓库根目录里的游戏（就是线上那一份）
#   bash tools/tests/run_tests.sh 某个目录      # 测别的构建，比如 naiwa-tower/dist
#   ONLY="t22 cardchk" bash tools/tests/run_tests.sh   # 只跑其中几个
# 需要：Node.js 18+，以及 playwright（npm i -D playwright && npx playwright install chromium）
# 截图和日志放在 $NWT_OUT（默认 /tmp/nwt-test）
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../.." && pwd)
REAL=$(cd "${1:-$ROOT}" && pwd)
OUT=${NWT_OUT:-/tmp/nwt-test}
FAST=$OUT/fast
mkdir -p "$OUT"/shots "$OUT"/ss "$OUT"/atk "$OUT"/ui "$OUT"/logs
# 「快速版」：把游戏里所有等待时间缩短到 1/10，测试跑得快。其余和线上一模一样
rm -rf "$FAST"; mkdir -p "$FAST"
for f in "$REAL"/*; do case "$(basename "$f")" in _src|_story|tools|download) ;; *) cp -r "$f" "$FAST"/ ;; esac; done
sed -i 's#ms\*\.72/SPEED#ms/10#' "$FAST/game.js"
export NWT_REAL="$REAL" NWT_FAST="$FAST" NWT_OUT="$OUT"
cd "$OUT"
# 按「越基础越先跑」排序；性能测试放最后，默认不跑（太慢），用 PERF=1 打开
LIST=${ONLY:-"t22 fight2 cardchk bossim ss55t sec t51 truend junc5 tavlock coll feat56 lb lbc fitt c57t"}
[ "${PERF:-0}" = "1" ] && LIST="$LIST mh4 tit"
pass=0; fail=0; failed=""
for t in $LIST; do
  printf '%-10s ' "$t"
  ARG=""; [ "$t" = "ss55t" ] && ARG="ss"
  if timeout 600 node "$HERE/$t.js" $ARG > "logs/$t.log" 2>&1; then rc=0; else rc=$?; fi
  # 判定失败：进程报错退出，或者输出里有非空的错误列表
  if [ $rc -ne 0 ] || grep -Eq "ERR \[[^]]|ERR [1-9]|errors \[[^]]|^\[ *'|Error:|TypeError|ReferenceError" "logs/$t.log"; then
    echo "失败（看 $OUT/logs/$t.log）"; fail=$((fail+1)); failed="$failed $t"
  else
    echo "通过"; pass=$((pass+1))
  fi
done
echo "----"
echo "通过 $pass 个，失败 $fail 个${failed:+：$failed}"
[ $fail -eq 0 ]
