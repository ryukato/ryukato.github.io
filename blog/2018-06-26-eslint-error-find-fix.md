---
slug: ESLint 오류 찾기 그리고 수정
title: ESLint 오류 찾기 그리고 수정
authors: ryukato
date: 2018-06-26 09:36:55
tags: [JavaScript, ESLint, RegEx]
---

# ESLint

# Regex for eslant
## Unexpected space before function parentheses
### find error
`function (\w+)\s+?\(`
### fix error
`function $1(`

## no-space-before-func-curly
### find error
`function\s(\w+)\((\w+)\)\{`
### fix Error
`function $1($2) {}`


## comma-spacing
### find
`,(\w+)`
### Fix
`, $1`

## newline after var
### Find
`(const|var|let)\s+?(\w+)(\s+?=\s+?(.*;))??$(\n|\r)+?((?!const|var|let)(?!(\n|\r)+?))`
### Fix
`$1 $2 $3\n\n`

## space-before-blocks
### Find
`\((.*)\)\{`
### Fix
`($1) {`
