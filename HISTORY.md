# History

## 2026-03-13

- 원인: 학생 인증 가드가 서버 컴포넌트 렌더 중 `clearSession()`을 호출해 `Cookies can only be modified in a Server Action or Route Handler` 오류를 일으켰다.
- 조치: 렌더 경로에서 쿠키 삭제를 제거하고, 세션 조회가 유효한 현재 시즌 학생만 반환하도록 정리했다.
- 원인: LAN의 다른 컴퓨터가 `http://`로 접속할 때도 production 환경에서는 세션 쿠키가 `Secure`로 발급되어 로그인 이후 요청에 쿠키가 다시 전달되지 않았다.
- 조치: 세션 쿠키의 `secure` 플래그를 `NODE_ENV` 고정값이 아니라 실제 요청 프로토콜(`x-forwarded-proto`, `origin`) 기준으로 결정하도록 변경했다.
- 조치: 동일 요청 안에서 학생 인증과 워크스페이스 판정이 흔들리지 않도록 인증 조회를 요청 단위로 캐시했다.
- 조치: 로그인 화면의 고정 기본 PIN 안내를 제거해 운영 중 일괄 PIN 변경과 충돌하지 않게 했다.
