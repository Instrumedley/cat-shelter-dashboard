#!/bin/bash
echo "🔍 Running linter on Frontend..."
cd frontend
npm run lint
FRONTEND_EXIT=$?

echo ""
echo "🔍 Running linter on Backend..."
cd ../backend
npm run lint
BACKEND_EXIT=$?

echo ""
if [ $FRONTEND_EXIT -eq 0 ] && [ $BACKEND_EXIT -eq 0 ]; then
  echo "✅ All linting passed!"
  exit 0
else
  echo "❌ Linting failed in one or more projects"
  exit 1
fi
