#!/bin/bash
# git push 하려 하면 실행 전에 지현 님께 확인받기
input=$(cat)
if echo "$input" | grep -q 'git push'; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"push하면 draft 브랜치는 사이트에 바로 공개돼요. deploy할 때만 허용해주세요."}}'
fi
exit 0