-- Migration 0003: Update Catalog Pricing and Monetization Strategy
-- Optimizes profit margins against OEM alternatives and transitions commodity parts to Free STL Only.

-- 1. Subaru HVAC Blend Door Actuator Split Gear (72131-FG000) -> $26.00 (PA12 Nylon)
UPDATE parts 
SET retail_price_cents = 2600 
WHERE oem_part_number = '72131-FG000' OR id = 'part_subaru_blend_door_72131';

-- 2. Bosch / Siemens Washing Machine Drain Filter Grip (00605010) -> $16.50 (PETG Heavy Duty)
UPDATE parts 
SET retail_price_cents = 1650 
WHERE oem_part_number = '00605010' OR id = 'part_bosch_drain_handle_00605010';

-- 3. Toyota Tundra / Sequoia Dash AC Air Vent Louver Tab (55670-0C010) -> $15.00 (Automotive ASA)
UPDATE parts 
SET retail_price_cents = 1500 
WHERE oem_part_number = '55670-0C010' OR id = 'part_toyota_vent_clip_55670';

-- 4. Whirlpool / KitchenAid Dishwasher Lower Rack Wheel (W10195416) -> Free STL Only (Monetization Pivot)
UPDATE parts 
SET is_commercial_allowed = 0, retail_price_cents = 0 
WHERE oem_part_number = 'W10195416' OR id = 'part_whirlpool_wheel_w10195416';
