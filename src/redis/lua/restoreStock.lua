local stockKey = KEYS[1]
local reservationKey = KEYS[2]

if redis.call('EXISTS', reservationKey) == 1 then
    redis.call('INCR', stockKey)
    redis.call('DEL', reservationKey)
    return 1
end