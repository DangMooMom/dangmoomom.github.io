#!/bin/bash
# html 파일을 고친 뒤 금지 표현이 있으면 Claude에게 알려서 고치게 하기
input=$(cat)
file=$(echo "$input" | grep -o '"file_path" *: *"[^"]*"' | head -1 | sed 's/.*: *"//; s/"$//')
case "$file" in
  *.html) ;;
  *) exit 0 ;;
esac
hits=$(grep -n -i -E 'module|company ontology|1,310' "$file")
# 문장 첫머리 접속어 (Yet, So, As a result, That way, On top of that)
starts=$(grep -n -E '(<p[^>]*>|[.?!] )(Yet|So|As a result|That way|On top of that)[ ,]' "$file")
[ -n "$starts" ] && hits="$hits"$'\n'"문장이 접속어로 시작해요:"$'\n'"$starts"
hits=$(echo "$hits" | sed '/^$/d')
if [ -n "$hits" ]; then
  echo "금지 표현이 들어 있어요. 글쓰기 원칙에 맞게 고쳐주세요:" >&2
  echo "$hits" >&2
  exit 2
fi
exit 0