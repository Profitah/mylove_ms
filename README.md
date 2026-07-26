<img width="817" height="92" alt="스크린샷 2026-07-24 오후 11 11 07" src="https://github.com/user-attachments/assets/4fb3b1a4-9da3-42d4-bf7f-1a03094db41e" />

2번 문제 해결을 위해 민성언니 팬사이트를 만들었습니다,,,

---

<div align="center">

# 💙 민성언니 팬사이트

**0804 민성님의 생일을 축하합니다**

덕질을 위해 태어난, 실시간 채팅과 미니 게임이 있는 팬 커뮤니티 웹앱

[![Deploy Status](https://img.shields.io/badge/frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Server](https://img.shields.io/badge/backend-Render-46E3B7?logo=render)](https://render.com)
[![License](https://img.shields.io/badge/license-Private-lightgrey)]()

</div>

---

## 📌 프로그램 기획 의도

### 1) 입덕 계기

> 내가 생각하는 성공한 인생 = **미녀와 돈이 있는 삶**<br>
> 언니 = **짱 예쁨**<br>
> 언니와 함께하는 나 = **성공한 인생!**

사람은 자신이 가지지 못한 것을 동경함.
언니는 **예쁨, 지혜로움, 상냥함, 강함, 단단함**을 모두 갖춘 존재.

### 2) 향후 목표

- 모두가 언니를 좋아하게 만들기 + 함께 덕질하기
- = 많은 사람들에게 **성공한 삶을 사는 기분**을 알리기

### 3) 오늘의 목표

- [x] 스터디장을 언니 팬사이트에 접속시키기
- [x] 함께 덕질 가능한 채팅 공간 구축

---

## ✨ 주요 기능

| 기능 | 설명 |
|---|---|
| 🌱 **제초하기** | 버튼을 눌러 포인트(재화)를 모으기 |
| 🍜 **언니에게 선물하기** | 모은 포인트로 매운맛 3단계(기본/로제/치즈) 라면 선물하기 (에어결제) |
| 💬 **같이 채팅** | 로그인 없이 참여하는 실시간 채팅 |

---

## 📱 스크린샷

<div align="center">
<img width="360" alt="채팅 화면" src="https://github.com/user-attachments/assets/5c9bd015-bed5-47ab-a163-db9435e085c3" />
<img width="360" alt="제초/선물 화면" src="https://github.com/user-attachments/assets/8155cbc4-c8dc-437a-abb2-2d5963e0228d" />
</div>

---

## 🛠 기술 스택

- **Frontend**: React (Vite)
- **Backend**: Node.js + WebSocket (`ws`)
- **배포**
  - Frontend → [Vercel](https://vercel.com)
  - Backend(실시간 채팅 서버) → [Render](https://render.com)
- **디자인**: Claude Design (프로토타입) → Claude Code (구현)

---

## 🌐 배포 구조

```
사용자 브라우저
     │
     ▼
[Vercel] 프론트엔드 (React/Vite 정적 빌드)
     │  WebSocket (wss://)
     ▼
[Render] 채팅 서버 (Node.js + ws)
```

### 환경변수

| 변수명 | 위치 | 설명 |
|---|---|---|
| `VITE_WS_URL` | Vercel | 채팅 서버 WebSocket 주소 |
| `PORT` | Render | 자동 주입되므로 별도 설정 불필요 |
