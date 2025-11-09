Param(
  [string]$WorktreePath = "gh-pages",
  [string]$BuildDir = "dist"
)

# 1) build
npm run build

# 2) zorg dat worktree bestaat
if (-not (Test-Path $WorktreePath)) {
  git fetch origin
  try {
    git worktree add $WorktreePath -b gh-pages
  } catch {
    git worktree add $WorktreePath origin/gh-pages
  }
}

# 3) leeg en kopieer
Remove-Item -Recurse -Force "$WorktreePath\*" -ErrorAction SilentlyContinue
Copy-Item -Recurse "$BuildDir\*" "$WorktreePath\"

# 4) commit & push
Push-Location $WorktreePath
git add .
git commit -m "deploy" 2>$null
git push origin gh-pages
Pop-Location

Write-Host "✅ Deploy voltooid."
