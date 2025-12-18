# 🎫 Ticketing: High-Performance Concurrency Control System

> **"10만 명의 동시 접속, 단 100개의 재고. 서버는 무너지지 않고 데이터는 정확해야 합니다."**

**Ticketing**은 대규모 트래픽이 몰리는 선착순 이벤트를 가정한 고성능 백엔드 시스템입니다.  
단순한 CRUD를 넘어, **Redis Lua Script를 활용한 원자적(Atomic) 제어**와 **대기열 시스템**을 통해 Race Condition(경쟁 상태)과 Over-selling(재고 초과 판매) 문제를 원천 차단하는 데 초점을 맞췄습니다.

---

## 🏗 Architecture & Tech Stack

### 🛠 Tech Stack Strategy

이 프로젝트는 **안정성(Stability)**과 **데이터 무결성(Integrity)**을 최우선으로 하여 기술 스택을 선정했습니다.

| Category         | Technology | Version     | Key Decision Factor                                                           |
| :--------------- | :--------- | :---------- | :---------------------------------------------------------------------------- |
| **Framework**    | NestJS     | 10.x        | 모듈형 아키텍처 및 DI를 통한 관심사 분리(SoC) 및 유지보수성 확보              |
| **Language**     | TypeScript | 5.x         | 정적 타입 시스템을 통한 런타임 에러 방지 및 생산성 향상                       |
| **Database**     | MySQL      | **8.4 LTS** | InnoDB의 Locking 메커니즘(Gap Lock, Record Lock) 심층 활용 및 최신 LTS 안정성 |
| **Cache & Lock** | Redis      | **7.4**     | Lua Script를 통한 원자적 연산 수행                                            |
| **Infra**        | Docker     | Compose     | 개발 환경의 완벽한 격리 및 IaC(Infrastructure as Code) 실현                   |

### 📊 System Architecture (Layered View)

1.  **Presentation Layer:** NestJS Controller (Input Validation)
2.  **Application Layer:** \* **Gatekeeper:** 대기열 토큰 검증 및 유량 제어
    - **Concurrency Facade:** Redis Lua Script 실행 및 결과 처리
3.  **Domain Layer:** 비즈니스 로직 및 상태 관리
4.  **Infrastructure Layer:**
    - **MySQL:** 최종 주문 데이터의 영속성 보장 (Disk)
    - **Redis:** 실시간 재고 차감 및 대기열 관리 (Memory)

---

## 🚀 Getting Started

이 프로젝트는 `Docker Compose`를 통해 로컬 환경에서 프로덕션과 동일한 인프라를 구성합니다.

### 1. Prerequisites

- Node.js (v18+)
- Docker & Docker Compose

### 2. Installation

```bash
# Clone the repository
git clone [https://github.com/your-username/ticketing.git](https://github.com/your-username/ticketing.git)
cd ticketing

# Install dependencies
npm install
```

### 3. Environment Setup

프로젝트 루트에 `.env` 파일을 생성합니다. (`Joi Validation`을 통해 실행 시 검증)

```Ini, TOML
# Application
NODE_ENV=development
PORT=3000

# Database (MySQL 8.4 LTS)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=root
DB_DATABASE=traffic_buster
DB_SYNC=true

# Redis (v7.2)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Run the Application

DB와 Redis 컨테이너를 실행합니다. (초기 실행 시 MySQL 초기화로 약 10~20초 소요될 수 있습니다.)

```bash
docker-compose up -d
```

### 5. Run Server

```bash
npm run start:dev
```

### 6. Verification (Health Check)

서버와 인프라의 연결 상태를 확인합니다.

- URL: GET http://localhost:3000/health

- Response:

```bash
{
  "mysql": "connected",
  "redis": "connected",
  "timestamp": "2025-12-18T..."
}
```

## 📂 Project Structure

관심사의 분리(Separation of Concerns) 원칙에 따라, 설정과 핵심 모듈을 분리하여 설계했습니다.

```Plaintext
src/
├── config/                  # 환경 변수 검증 및 전역 설정
│   ├── env-validation.config.ts
│   └── typeorm.config.ts
├── redis/                   # Redis 클라이언트 모듈 (ioredis Wrapper)
│   ├── redis.module.ts      # Global Module
│   └── lua/                 # Atomic 연산을 위한 Lua Scripts
├── ticketing/               # 핵심 비즈니스 로직 (Domain)
├── app.module.ts            # Root Module (Async Configuration)
└── main.ts                  # Entry Point
```
