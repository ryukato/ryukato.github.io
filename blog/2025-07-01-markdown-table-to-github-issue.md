---
slug: markdown-table-to-github-issue 
title: Simple github issue register from markdown table 
authors: ryukato
date: 2025-07-01 18:43:00
tags: [co-work, collaboration, feature-centric]
---

<!-- truncate -->

# 📝 Markdown 테이블 → GitHub Issues 자동 등록 가이드

이 가이드는 Markdown 파일에 정의된 테이블을 읽어,  
각 행을 GitHub Issue로 자동 등록하는 방법을 설명합니다.

---

## 📁 프로젝트 구성

```
project/
├─ .env                            # GitHub Access Token 저장
├─ example.md                      # 이슈로 등록할 Markdown 테이블
├─ markdown-table-parser.js        # 테이블 파서 클래스
├─ markdown-issue-mapper.js         # row → GitHub 이슈 변환기
├─ github-issue-client.js          # GitHub 이슈 클라이언트
├─ dry-run-issue-preview.js         # dry-run to create github issue items
├─ mark-down-github-issue-register.js # 통합 등록 클래스
├─ run-markdown-to-issues.js        # 실행 진입점
```

---
## 📁 프로젝트 files
```text title=".env"
GITHUB_TOKEN=[token]
GITHUB_USER_NAME=[owner name]
GITHUB_REPO_NAME=[repository name]
``` 

```text title="markdown-table-parser.js"
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

export class MarkdownTableParser {
  constructor(filePath, sectionName) {
    this.filePath = this.resolvePath(filePath);
    this.sectionName = sectionName;
    this.sectionContent = this.extractSectionContent();
  }

  resolvePath(filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    // 현재 실행 중인 파일 기준으로 상대 경로 처리
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.resolve(__dirname, filePath);
  }

  extractSectionContent() {
    const content = fs.readFileSync(this.filePath, "utf-8");

    const lines = content.split("\n");
    const sectionStart = lines.findIndex((line) =>
      line.trim().startsWith(this.sectionName)
    );

    if (sectionStart === -1) {
      throw new Error(`Section "${this.sectionName}" not found`);
    }

    const sectionLines = [];
    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^#{1,6}\s/.test(line)) break;
      sectionLines.push(line);
    }

    return sectionLines.join("\n");
  }

  _getTableLines() {
    const lines = this.sectionContent
      .split("\n")
      .filter((line) => line.trim().startsWith("|"));

    if (lines.length < 2) {
      throw new Error("No valid markdown table found in the section");
    }

    return lines;
  }

  parseHeader() {
    const lines = this._getTableLines();
    const headerLine = lines[0];

    const headers = headerLine
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    return headers;
  }

  parseBodyRows() {
    const lines = this._getTableLines();
    const headers = this.parseHeader();
    const bodyLines = lines.slice(2); // skip header + separator

    return bodyLines.map((line, rowIndex) => {
      const cells = line
        .split("|")
        .slice(1, -1) // 좌우 경계 파이프 제거
        .map((cell) => cell.trim());

      if (cells.length !== headers.length) {
        throw new Error(
          `Row ${rowIndex + 1} has ${cells.length} cells, expected ${
            headers.length
          }`
        );
      }

      const rowObj = {};
      headers.forEach((header, i) => {
        // <br> → \n 로 처리 (원하면 공백으로 대체도 가능)
        rowObj[header] = cells[i].replace(/<br\s*\/?>/gi, "\n");
      });

      return rowObj;
    });
  }

  getTableObjects() {
    return this.parseBodyRows(); // 이미 객체로 반환됨
  }
}

``` 

```text title="markdown-issue-mapper.js"
export class MarkdownIssueMapper {
  constructor({ defaultLabels = [] } = {}) {
    this.defaultLabels = defaultLabels;
  }

  toGitHubIssueObject(item) {
    const title = `[${item.Category} - ${item.Type}] : ${item.Summary}`.trim();

    const body = [
      `### Description`,
      (item.Description || 'N/A').replace(/<br\s*\/?>/gi, '\n'),
      '',
      `### Comments`,
      (item.Comments || 'N/A').replace(/<br\s*\/?>/gi, '\n'),
    ].join('\n');

    const labels = [...this.defaultLabels, item.Category, item.Type]
      .filter(Boolean)
      .map(str => str.trim());

    return {
      title,
      body,
      labels,
      assignees: [] // 필요 시 확장 가능
    };
  }
}
``` 

```text title="dry-run-issue-preview.js"
import { MarkdownTableParser } from './markdown-table-parser.js';
import { MarkdownIssueMapper } from './markdown-issue-mapper.js';

// 파싱 대상 파일과 섹션명
const filePath = '/Users/yoonyoulyoo/DEV/projects/minuca/docs/tasks/research-tasks.md';
const sectionName = '# Research';

const parser = new MarkdownTableParser(filePath, sectionName);
const rows = parser.getTableObjects();

const mapper = new MarkdownIssueMapper();

console.log(`📦 총 ${rows.length}개의 이슈 후보 항목을 발견했습니다.\n`);

rows.forEach((row, index) => {
  const issue = mapper.toGitHubIssueObject(row);

  console.log(`🧾 [${index + 1}] ${issue.title}`);
  console.log(issue.body);
  console.log('🔖 Labels:', issue.labels.join(', '));
  console.log('='.repeat(60));
});
``` 

```text title="github-issue-client.js"
import fetch from 'node-fetch';

export class GitHubIssueClient {
  constructor({ owner, repo, token }) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
    this.apiBase = `https://api.github.com/repos/${owner}/${repo}`;
  }

  async createIssue({ title, body, labels = [], assignees = [] }) {
    const url = `${this.apiBase}/issues`;
    const payload = { title, body, labels, assignees };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API Error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  async fetchIssues({ state = 'open', perPage = 30, page = 1 } = {}) {
    const url = `${this.apiBase}/issues?state=${state}&per_page=${perPage}&page=${page}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API Error: ${response.status} - ${error}`);
    }

    return await response.json();
  }
}
``` 

```text title="mark-down-github-issue-register.js"
import { MarkdownTableParser } from './markdown-table-parser.js';
import { MarkdownIssueMapper } from './markdown-issue-mapper.js';
import { GitHubIssueClient } from './github-issue-client.js';

export class MarkdownGithubIssueRegister {
  constructor({ filePath, sectionName, github }) {
    this.filePath = filePath;
    this.sectionName = sectionName;
    this.githubClient = new GitHubIssueClient(github);
    this.parser = new MarkdownTableParser(filePath, sectionName);
  }

  async registerAll({ dryRun = false, checkDuplicates = true } = {}) {
    const tableObjects = this.parser.getTableObjects();
    let existingTitles = [];

    if (checkDuplicates) {
      const existingIssues = await this.githubClient.fetchIssues({ state: 'all' });
      existingTitles = existingIssues.map(issue => issue.title.trim().toLowerCase());
    }

    for (const item of tableObjects) {
      const title = `[${item.Category}] ${item.Type}`;
      if (checkDuplicates && existingTitles.includes(title.toLowerCase())) {
        console.log(`⚠️  Duplicate skipped: ${title}`);
        continue;
      }

      const body = this.formatBody(item);

      if (dryRun) {
        console.log(`📝 [Dry Run] Would create issue: ${title}`);
        console.log(body);
        continue;
      }

      try {
        const issue = await this.githubClient.createIssue({
          title,
          body,
          labels: [item.Category, item.Type].filter(Boolean),
          assignees: []
        });
        console.log(`✅ Created issue: ${issue.html_url}`);
      } catch (err) {
        console.error(`❌ Failed to create issue: ${title}`, err.message);
      }
    }
  }

  formatBody(item) {
    return [
      `### Description`,
      item.Description?.replace(/<br\s*\/?>/gi, '\n') || 'N/A',
      '',
      `### Comments`,
      item.Comments?.replace(/<br\s*\/?>/gi, '\n') || 'N/A',
      '',
      `---\n_Auto-generated from markdown table section: ${this.sectionName}_`
    ].join('\n');
  }
}
``` 

```text title="run-markdown-to-issues.js"
import dotenv from 'dotenv';
dotenv.config();

import { MarkdownGithubIssueRegister } from './mark-down-github-issue-register.js';

// --- 🔹 명령줄 인자 처리
const args = process.argv.slice(2);

const getArg = (name, defaultValue) => {
  const index = args.findIndex(arg => arg === `--${name}`);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return defaultValue;
};

const filePath = getArg('file', '/Users/yoonyoulyoo/DEV/projects/minuca/docs/tasks/research-tasks.md');
const sectionName = getArg('section', '# Research');
const dryRun = args.includes('--dry-run');

// --- 🔸 등록 실행
const register = new MarkdownGithubIssueRegister({
  filePath,
  sectionName,
  github: {
    owner: process.env.GITHUB_USER_NAME,
    repo: process.env.GITHUB_REPO_NAME,
    token: process.env.GITHUB_TOKEN
  }
});

await register.registerAll({
  dryRun,
  checkDuplicates: true
});
``` 

---

## 1️⃣ 사전 준비

### 🔐 1. GitHub Access Token 발급

1. [https://github.com/settings/tokens](https://github.com/settings/tokens) 접속
2. `Generate new token (classic)` 선택
3. 아래 권한 체크:
   - `repo` (이슈 작성용)
4. 발급 후 `.env` 파일에 추가:

```env
GITHUB_TOKEN=ghp_...
```

> ⚠️ `.gitignore`에 `.env`를 반드시 추가하세요

---

## 2️⃣ Markdown 파일 구조

### 예시: `example.md`

```markdown
## Research

| Category | Type    |Sumamry                       | Description                  | Priority | Status | Comments |
|----------|---------|------------------------------|------------------------------|----------|--------|----------|
| AI       | Prompting | 연구 및 템플릿 작성            | test description              | High     | Open   | 중요 항목 |
| API      | Weather API | 날씨 API 검토 및 연결       | test description| Medium       | Todo    |        |         |
```

---

## 3️⃣ 실행 방법

### ✅ 기본 실행

```bash
node run-markdown-to-issues.js
```

### ✅ 파일/섹션 지정

```bash
node run-markdown-to-issues.js --file ./example.md --section "## Research"
```

### ✅ Dry-run 모드 (등록 없이 확인만)

```bash
node run-markdown-to-issues.js --file ./example.md --section "## Research" --dry-run
```

---

## 4️⃣ 실행 결과

- 지정된 섹션 내 테이블을 파싱
- 각 row → GitHub Issue 객체로 변환
- GitHub에 이슈 등록 (중복 title 자동 생략)

---

## 🔧 커스터마이징 가능 항목

| 항목             | 설명                                    |
|------------------|-----------------------------------------|
| 이슈 제목         | `[Category] Type` 형식 (변경 가능)       |
| 본문 포맷         | `Description`, `Comments` 포함 (줄바꿈 `<br>` → `
`) |
| 라벨             | `Category`, `Type` + 기본 라벨 조합 가능 |
| Assignee         | 향후 확장 가능                           |
| 중복 제거 방식    | title 기준 중복 제거                     |

---

## 🧪 테스트 및 디버깅 팁

- `dry-run` 옵션을 활용해 GitHub에 등록하지 않고 출력만 확인 가능
- `fetchIssues()`를 활용해 기존 이슈 목록 확인 가능
- `MarkdownIssueMapper`만 수정하면 이슈 포맷을 전체 변경 가능

---

## ✅ 주요 클래스 요약

| 클래스명                   | 역할                                 |
|----------------------------|--------------------------------------|
| `MarkdownTableParser`      | Markdown 섹션 내 테이블 파싱         |
| `GitHubIssueClient`        | 이슈 생성 / 조회 API 호출            |
| `MarkdownIssueMapper`      | 테이블 row → GitHub 이슈 객체 변환   |
| `MarkdownGithubIssueRegister` | 전체 통합 컨트롤러                  |

---

## 🧩 추천 확장 기능

- GitHub Action을 통한 자동화
- `Assignee`, `Milestone` 필드 매핑
- CLI에서 `--owner`, `--repo` 등도 동적 설정
- `.json` or `.csv` 내보내기 옵션

---

Happy Automating! 🚀
