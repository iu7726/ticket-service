-- KEYS[1]: 상품 재고 Key (product:1:stock)
-- KEYS[2]: 예약 홀딩 Key (reservation:product:1:user:50)
-- ARGV[1]: 홀딩 시간 (초 단위, 예: 300)

local stockKey = KEYS[1]
local reservationKey = KEYS[2]
local ttl = tonumber(ARGV[1])
local token = ARGV[2]

-- 예약 체크(중복 재고 선점 방지)
if redis.call('EXISTS', reservationKey) == 1 then
    return -2 -- "이미 예약 잡으셨습니다."
end

-- 현재 재고 조회
local currentStock = redis.call('GET', stockKey)

if not currentStock or tonumber(currentStock) <= 0 then
    return -1 -- "재고 없음"
end

-- 재고 차감
redis.call('DECR', stockKey)
redis.call('SETEX', reservationKey, ttl, token) -- 10분 뒤 자동 폭파

return 1 -- "예약 성공"
