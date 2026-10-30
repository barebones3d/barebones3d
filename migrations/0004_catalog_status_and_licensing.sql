-- Migration 0004: Catalog Status and Creative Commons Licensing Enforcement
-- Classifies parts into 3 distinct operational states:
-- 1. 'active': Verified CC0 / CC BY models ready for Slant 3D Print-on-Demand and instant download
-- 2. 'affiliate_only': Commodity mass injection-molded parts or personal-use designs (is_commercial_allowed = 0, retail_price_cents = 0)
-- 3. 'cad_waitlist': High-margin unmodeled parts undergoing CAD engineering validation (is_commercial_allowed = 0, retail_price_cents = 0)

-- Step 1: Add status column to parts table
ALTER TABLE parts ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);

-- ============================================================================
-- Step 2: Update Existing Parts Classification & Real Numeric Source URLs
-- ============================================================================

-- ACTIVE PARTS (Verified CC0 / CC BY with authentic repository URLs)
UPDATE parts SET
  status = 'active',
  is_commercial_allowed = 1,
  license_type = 'CC BY 4.0',
  attribution_text = 'Designed by ZeroKnowledgeYT on Thingiverse under CC BY 4.0',
  original_source_url = 'https://www.thingiverse.com/thing:4585860'
WHERE oem_part_number = '759944-0010';

UPDATE parts SET
  status = 'active',
  is_commercial_allowed = 1,
  license_type = 'CC BY 4.0',
  attribution_text = 'Designed by Ergo Cogito on Printables under CC BY 4.0',
  original_source_url = 'https://www.printables.com/model/1199500-dyson-v10-v11-power-button-trigger-fix-new-design'
WHERE oem_part_number = '969830-01';

UPDATE parts SET
  status = 'active',
  is_commercial_allowed = 1,
  license_type = 'CC BY 4.0',
  attribution_text = 'Modeled by James Green on Printables under CC BY 4.0',
  original_source_url = 'https://www.printables.com/model/845129-dewalt-dws780-miter-saw-dust-port-adapter-to-dxv0-3'
WHERE oem_part_number = 'N087403';

UPDATE parts SET
  status = 'active',
  is_commercial_allowed = 1,
  license_type = 'CC BY 4.0',
  attribution_text = 'Model by merk420 on Thingiverse under CC BY 4.0',
  original_source_url = 'https://www.thingiverse.com/thing:4218653'
WHERE oem_part_number = '55670-0C010';

UPDATE parts SET
  status = 'active',
  is_commercial_allowed = 1,
  license_type = 'CC BY 4.0',
  attribution_text = 'Designed by EarSee on Thingiverse under CC BY 4.0',
  original_source_url = 'https://www.thingiverse.com/thing:3111425'
WHERE oem_part_number = '5FS40DX9AA';

-- AFFILIATE ONLY PARTS (Commodity mass-production or free personal use)
UPDATE parts SET
  status = 'affiliate_only',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  license_type = 'CC BY 4.0',
  attribution_text = 'Modeled by aflockofseacows on Thingiverse under CC BY 4.0',
  original_source_url = 'https://www.thingiverse.com/thing:3863488'
WHERE oem_part_number = 'WA-104';

UPDATE parts SET
  status = 'affiliate_only',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  license_type = 'Public Domain',
  attribution_text = 'Designed by Wild1z2 on Thingiverse, released to Public Domain',
  original_source_url = 'https://www.thingiverse.com/thing:5334213'
WHERE oem_part_number = 'W10195416';

UPDATE parts SET
  status = 'affiliate_only',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  license_type = 'CC BY 4.0',
  attribution_text = 'Designed by jhon614 on Thingiverse under CC BY 4.0',
  original_source_url = 'https://www.thingiverse.com/thing:6687440'
WHERE oem_part_number = 'WP9709231';

UPDATE parts SET
  status = 'affiliate_only',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  license_type = 'Public Domain',
  attribution_text = 'OEM replacement specification. Multi-pack recommended.',
  original_source_url = 'https://barebones3d.com/guides/bosch-washing-machine-drain-filter-handle-00605010/'
WHERE oem_part_number = '00605010';

UPDATE parts SET
  status = 'affiliate_only',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  license_type = 'Public Domain',
  attribution_text = 'OEM replacement specification. Multi-pack recommended.',
  original_source_url = 'https://barebones3d.com/guides/ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067/'
WHERE oem_part_number = 'WE1M1067';

-- CAD WAITLIST PARTS (SEO alive, zero synthetic URLs, internal domain routes)
UPDATE parts SET
  status = 'cad_waitlist',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  attribution_text = 'Barebones 3D Engineering Lab CAD under development.',
  original_source_url = 'https://barebones3d.com/guides/ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a/#cad-waitlist'
WHERE oem_part_number = 'FL3Z-1651071-A';

UPDATE parts SET
  status = 'cad_waitlist',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  attribution_text = 'Barebones 3D Engineering Lab CAD under development.',
  original_source_url = 'https://barebones3d.com/guides/chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365/#cad-waitlist'
WHERE oem_part_number = '89018365';

UPDATE parts SET
  status = 'cad_waitlist',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  attribution_text = 'Barebones 3D Engineering Lab CAD under development.',
  original_source_url = 'https://barebones3d.com/guides/bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463/#cad-waitlist'
WHERE oem_part_number = '51459173463';

UPDATE parts SET
  status = 'cad_waitlist',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  attribution_text = 'Barebones 3D Engineering Lab CAD under development.',
  original_source_url = 'https://barebones3d.com/guides/toyota-toyota-tacoma-heater-control-valve-arm-87240-04020/#cad-waitlist'
WHERE oem_part_number = '87240-04020';

UPDATE parts SET
  status = 'cad_waitlist',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  attribution_text = 'Barebones 3D Engineering Lab CAD under development.',
  original_source_url = 'https://barebones3d.com/guides/subaru-blend-door-actuator-gear-72131-fg000/#cad-waitlist'
WHERE oem_part_number = '72131-FG000';

UPDATE parts SET
  status = 'cad_waitlist',
  is_commercial_allowed = 0,
  retail_price_cents = 0,
  attribution_text = 'Barebones 3D Engineering Lab CAD under development.',
  original_source_url = 'https://barebones3d.com/guides/milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850/#cad-waitlist'
WHERE oem_part_number = '48-11-1850';

-- ============================================================================
-- Step 3: Insert New Active Parts (Verified CC0 / CC BY models)
-- ============================================================================

-- Active Part 1: Jeep Grand Cherokee WJ Blend Door Gear (5012710AA - Vojata, CC0)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_jeep_wj_blend_door_5012710aa',
  'jeep-wj-grand-cherokee-blend-door-gear-5012710aa',
  'Jeep Grand Cherokee WJ Dual-Zone HVAC Blend Door Actuator Split Gear',
  '5012710AA',
  '["5012710AB", "5012710", "68072190AA"]',
  '[{"make":"Jeep","model":"Grand Cherokee WJ","year_start":1999,"year_end":2004}]',
  'Nylon PA12',
  2400,
  'parts/jeep-wj-grand-cherokee-blend-door-gear-5012710aa.stl',
  'https://www.printables.com/model/838965-grand-cherokee-blend-door-actuator-gear',
  'CC0 1.0',
  'Modeled by Vojata, dedicated to the Public Domain under CC0 1.0.',
  1,
  1,
  'active'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_jeep_wj_blend_door_5012710aa',
  'part_jeep_wj_blend_door_5012710aa',
  '[{"name":"Torx T20 Driver","purpose":"Lower dash kick panel fasteners","amazon_search_keyword":"Torx T20 screwdriver automotive"},{"name":"8mm Socket \u0026 Ratchet","purpose":"HVAC blend door actuator motor bolts","amazon_search_keyword":"8mm socket ratchet set"},{"name":"White Lithium Grease","purpose":"Actuator drive gear lubrication","amazon_search_keyword":"white lithium grease automotive"}]',
  'Moderate',
  '45 mins',
  '[{"step_number":1,"title":"Passenger Lower Glovebox Removal","text":"Drop the passenger glovebox compartment by releasing the side retaining tether and pivoting downward off the lower hinge hooks.","action_type":"extract"},{"step_number":2,"title":"Extract Blend Door Actuator Motor","text":"Locate the black actuator housing on the bottom-right HVAC box. Remove the two 8mm hex bolts and disconnect the wire harness connector.","action_type":"pry"},{"step_number":3,"title":"Inspect Cracked OEM Drive Gear","text":"Pry the actuator clamshell cover open. Remove the cracked OEM drive spur gear from the D-shaft output pin.","action_type":"clean"},{"step_number":4,"title":"Install Calibrated Nylon PA12 Reproduction","text":"Clean old grease, apply fresh white lithium grease, and press the reinforced Nylon PA12 replacement gear onto the drive spline.","action_type":"install"},{"step_number":5,"title":"Re-indexing and Climate Sweep Test","text":"Reconnect wiring harness, key ignition to ON, and cycle temperature from Cold to Full Hot to verify full 90-degree flap stroke.","action_type":"test"}]',
  '[{"question":"Why does the OEM Jeep WJ gear crack?","answer":"The factory injection-molded nylon gear uses thin web walls adjacent to the D-flat shaft interface. Motor stall torque at end-stops combined with summer dashboard heat cycles causes catastrophic hoop stress cracking."},{"question":"How does the +0.15mm tolerance compensation help?","answer":"The D-bore is pre-widened by exactly +0.15mm to guarantee a snug hand press-fit over the motor steel shaft without binding."}]'
);

-- Active Part 2: Makita 18V Battery Terminal Cover (122049-9 - hormigaazul, CC BY 4.0)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_makita_battery_cover_122049_9',
  'makita-18v-battery-terminal-protector-cover-122049-9',
  'Makita 18V LXT Lithium-Ion Battery Terminal Protector Cover',
  '122049-9',
  '["450128-8", "643852-7"]',
  '[{"make":"Makita","model":"18V LXT BL1815 / BL1830 / BL1840 / BL1850 / BL1860"}]',
  'PETG Heavy Duty',
  1400,
  'parts/makita-18v-battery-terminal-protector-cover-122049-9.stl',
  'https://www.thingiverse.com/thing:1625902',
  'CC BY 4.0',
  'Designed by hormigaazul on Thingiverse under CC BY 4.0.',
  1,
  1,
  'active'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_makita_battery_cover_122049_9',
  'part_makita_battery_cover_122049_9',
  '[{"name":"Direct Snap Tool","purpose":"No tools required for terminal slide clip"}]',
  'Beginner',
  '1 min',
  '[{"step_number":1,"title":"Inspect Terminal Rails","text":"Ensure the metal terminal contact blades of your Makita LXT 18V battery pack are clean and free of metal filings or conductive debris.","action_type":"clean"},{"step_number":2,"title":"Slide Protector Cover into Retention Grooves","text":"Align the dual guide rails of the printed cover with the battery slide channels. Push firmly forward until the mechanical latch engages with a solid click.","action_type":"install"}]',
  '[{"question":"Why is a terminal protector essential for Makita 18V batteries?","answer":"Makita 18V LXT battery terminal blades are exposed during transport in toolboxes and trucks. Accidental shorting against loose fasteners or keys can damage the internal protection PCB or cause a fire."}]'
);

-- Active Part 3: Sony MDR-7506 Headphone Swivel Yoke (3-255-731-01 - SwitchAudio, CC BY 4.0)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_sony_mdr7506_yoke_3_255_731_01',
  'sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01',
  'Sony MDR-7506 / MDR-V6 Professional Headphone Swivel Yoke Hanger Bracket',
  '3-255-731-01',
  '["2-113-132-11", "2-113-133-11", "3-255-731-00"]',
  '[{"make":"Sony","model":"MDR-7506 Professional"},{"make":"Sony","model":"MDR-V6 Studio Monitor"},{"make":"Sony","model":"MDR-7504"}]',
  'Nylon PA12',
  1900,
  'parts/sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01.stl',
  'https://www.thingiverse.com/thing:1052163',
  'CC BY 4.0',
  'Designed by SwitchAudio / thinkyhead on Thingiverse under CC BY 4.0.',
  1,
  1,
  'active'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_sony_mdr7506_yoke_3_255_731_01',
  'part_sony_mdr7506_yoke_3_255_731_01',
  '[{"name":"Phillips #00 Precision Screwdriver","purpose":"Unscrew headband pivot screws","amazon_search_keyword":"Phillips #00 precision screwdriver electronics"},{"name":"Precision Tweezers","purpose":"Route internal ear cup wiring","amazon_search_keyword":"anti-static precision tweezers electronics"}]',
  'Moderate',
  '20 mins',
  '[{"step_number":1,"title":"Remove Hinge Retaining Screws","text":"Using a Phillips #00 screwdriver, extract the two micro-fasteners securing the cracked outer plastic hinge slider cap to the metal headband strip.","action_type":"extract"},{"step_number":2,"title":"Carefully Unthread Audio Cable","text":"Gently guide the audio interconnect wire through the internal wire pass-through channel of the broken OEM yoke bracket without pulling on solder joints.","action_type":"pry"},{"step_number":3,"title":"Seat Replacement Nylon PA12 Yoke","text":"Thread the audio wire through the reinforced replacement yoke and snap the pivot gimbal pin into the ear cup retention socket.","action_type":"install"},{"step_number":4,"title":"Reinstall Fasteners and Check Articulation","text":"Re-affix the outer slider cap and tighten screws snugly until firm. Confirm free 180-degree folding articulation and smooth swivel.","action_type":"test"}]',
  '[{"question":"Why do Sony MDR-7506 yokes break?","answer":"The factory plastic brackets are molded from brittle unreinforced polycarbonate that suffers fatigue cracking around the pivot pin stress concentrations after repeated folding in gig bags."}]'
);

-- ============================================================================
-- Step 4: Insert New Affiliate Only Parts (Commodity Replacements)
-- ============================================================================

-- Affiliate Part 1: Black & Decker Trimmer Spool Cap (90530948)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_black_decker_spool_cap_90530948',
  'black-decker-trimmer-replacement-spool-cap-90530948',
  'Black & Decker String Trimmer Replacement Spool Cap Cover',
  '90530948',
  '["90530948-01", "RC-100-P", "385022-03"]',
  '[{"make":"Black & Decker","model":"GH400 / GH500 / GH600 / LST120 / LST220 / NST2018 String Trimmers"}]',
  'PETG Heavy Duty',
  0,
  'parts/black-decker-trimmer-replacement-spool-cap-90530948.stl',
  'https://barebones3d.com/guides/black-decker-trimmer-replacement-spool-cap-90530948/',
  'Public Domain',
  'OEM replacement specification. Commodity multi-pack recommended on Amazon.',
  0,
  1,
  'affiliate_only'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_black_decker_spool_cap_90530948',
  'part_black_decker_spool_cap_90530948',
  '[{"name":"Flathead Screwdriver","purpose":"Depress locking tabs on worn spool head"}]',
  'Beginner',
  '5 mins',
  '[{"step_number":1,"title":"Depress Side Release Tabs","text":"Squeeze the two dual release tabs on the sides of the spool housing to pop off the worn or ground-down cap cover.","action_type":"extract"},{"step_number":2,"title":"Inspect Internal Feed Spring","text":"Ensure the internal steel compression spring is seated properly inside the central spindle channel.","action_type":"clean"},{"step_number":3,"title":"Snap Replacement Cap On","text":"Press the replacement cap down over the string spool until both side retention claws click solidly into place.","action_type":"install"}]',
  '[{"question":"Why is this marked as Commodity Affiliate?","answer":"Spool caps wear down from constant ground friction. Mass-produced 4-packs and 6-packs with included replacement springs are available on Amazon for $8–$11, making custom 3D printing uneconomical."}]'
);

-- Affiliate Part 2: Whirlpool Deli Drawer Roller (W10436250)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_whirlpool_deli_roller_w10436250',
  'whirlpool-refrigerator-deli-drawer-slide-roller-w10436250',
  'Whirlpool / Maytag Refrigerator Deli Meat Pan Drawer Slide Roller Wheel',
  'W10436250',
  '["WPW10436250", "2303043", "PS3634044"]',
  '[{"make":"Whirlpool","model":"French Door / Side-by-Side Refrigerators"},{"make":"Maytag","model":"MFI / MFD Series"}]',
  'Food-Safe PETG',
  0,
  'parts/whirlpool-refrigerator-deli-drawer-slide-roller-w10436250.stl',
  'https://barebones3d.com/guides/whirlpool-refrigerator-deli-drawer-slide-roller-w10436250/',
  'Public Domain',
  'OEM replacement specification. Multi-pack commodity sourcing recommended.',
  0,
  1,
  'affiliate_only'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_whirlpool_deli_roller_w10436250',
  'part_whirlpool_deli_roller_w10436250',
  '[{"name":"Small Flathead Screwdriver","purpose":"Unclip axle retaining tab"}]',
  'Beginner',
  '10 mins',
  '[{"step_number":1,"title":"Remove Deli Drawer Pan","text":"Slide the deli meat pan all the way out and lift upward at a 30-degree angle to clear the front stop catches.","action_type":"extract"},{"step_number":2,"title":"Extract Sheared Roller Wheel","text":"Pry the plastic axle pin with a small flathead tool and pop the broken roller wheel out of the drawer guide bracket.","action_type":"pry"},{"step_number":3,"title":"Install New Roller and Axle","text":"Press the replacement roller wheel over the axle pin and push into the mounting hole until the clip snaps flush.","action_type":"install"}]',
  '[{"question":"Why is this part recommended on Amazon?","answer":"4-pack replacement kits including both left and right rollers with axle pins are widely stocked on Amazon for under $10."}]'
);

-- ============================================================================
-- Step 5: Insert New CAD Waitlist Parts (High-Margin Engineering Models)
-- ============================================================================

-- Waitlist 1: Dodge Ram Blend Door Gear (68064949AA)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_dodge_ram_blend_door_68064949aa',
  'dodge-ram-hvac-blend-door-gear-68064949aa',
  'Dodge Ram 1500 / 2500 HVAC Heater Blend Door Sub-Assembly Gear',
  '68064949AA',
  '["68064949", "68064950AA"]',
  '[{"make":"Ram","model":"1500 / 2500 / 3500","year_start":2009,"year_end":2018},{"make":"Ram","model":"1500 Classic","year_start":2019,"year_end":2023}]',
  'Nylon PA12',
  0,
  'parts/dodge-ram-hvac-blend-door-gear-68064949aa.stl',
  'https://barebones3d.com/guides/dodge-ram-hvac-blend-door-gear-68064949aa/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_dodge_ram_blend_door_68064949aa',
  'part_dodge_ram_blend_door_68064949aa',
  '[{"name":"Torx T20 Driver","purpose":"Lower kick panel screws"},{"name":"8mm Socket Driver","purpose":"Actuator casing bolts"}]',
  'Moderate',
  '45 mins',
  '[{"step_number":1,"title":"Lower Passenger Dash Panel","text":"Unscrew three Torx T20 fasteners along the lower edge of the glovebox frame and drop the hush panel.","action_type":"extract"},{"step_number":2,"title":"Actuator Access & Gear Inspection","text":"Unplug the harness connector and back out the 8mm bolts to reveal the fractured OEM white plastic drive gear.","action_type":"clean"}]',
  '[{"question":"When will this part ship?","answer":"Our engineering lab is finalizing FDM/SLS print tolerances on the D-shaft keyed gear. Enter your email to be notified when the first batch is ready."}]'
);

-- Waitlist 2: Volvo Fuel Door Hinge (39886277)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_volvo_fuel_door_39886277',
  'volvo-fuel-filler-door-hinge-bracket-39886277',
  'Volvo S60 / V60 / XC60 Fuel Filler Door Flap Hinge Bracket',
  '39886277',
  '["31265160", "30742378"]',
  '[{"make":"Volvo","model":"S60 / V60","year_start":2011,"year_end":2018},{"make":"Volvo","model":"XC60","year_start":2010,"year_end":2017}]',
  'Automotive ASA',
  0,
  'parts/volvo-fuel-filler-door-hinge-bracket-39886277.stl',
  'https://barebones3d.com/guides/volvo-fuel-filler-door-hinge-bracket-39886277/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_volvo_fuel_door_39886277',
  'part_volvo_fuel_door_39886277',
  '[{"name":"Torx T25 Driver","purpose":"Quarter-panel hinge mount screws"}]',
  'Easy',
  '20 mins',
  '[{"step_number":1,"title":"Release Fuel Door Latch","text":"Open fuel filler door and unclip the plastic body hinge bracket from the steel quarter panel pocket.","action_type":"extract"}]',
  '[{"question":"Why does the OEM Volvo hinge fail?","answer":"The plastic spring hook snaps from repeated fuel door opening and winter freezing stress."}]'
);

-- Waitlist 3: Audi Volume Knob Shaft (8K0898192A)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_audi_volume_knob_8k0898192a',
  'audi-mmi-volume-knob-shaft-8k0898192a',
  'Audi A4 / A5 / Q5 MMI Central Control Volume Knob Internal D-Shaft',
  '8K0898192A',
  '["8T0919070B", "8K0919070"]',
  '[{"make":"Audi","model":"A4 B8","year_start":2009,"year_end":2016},{"make":"Audi","model":"A5 / S5","year_start":2008,"year_end":2017},{"make":"Audi","model":"Q5","year_start":2009,"year_end":2017}]',
  'High-Temp Nylon PA12',
  0,
  'parts/audi-mmi-volume-knob-shaft-8k0898192a.stl',
  'https://barebones3d.com/guides/audi-mmi-volume-knob-shaft-8k0898192a/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_audi_volume_knob_8k0898192a',
  'part_audi_volume_knob_8k0898192a',
  '[{"name":"Plastic Trim Tool","purpose":"MMI console surround pry tool"}]',
  'Moderate',
  '30 mins',
  '[{"step_number":1,"title":"Extract Center Console MMI Control Panel","text":"Pry the aluminum/wood center console trim with a nylon pry tool to expose the volume rotary encoder.","action_type":"pry"}]',
  '[{"question":"Why did the volume knob spin freely?","answer":"The internal hollow plastic D-shaft fractures under torsional shear when pressed downward to mute."}]'
);

-- Waitlist 4: DeWalt 20V Battery Button (310712-04)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_dewalt_battery_button_310712_04',
  'dewalt-20v-battery-release-latch-button-310712-04',
  'DeWalt 20V MAX Lithium-Ion Battery Pack Spring Latch Release Button',
  '310712-04',
  '["N438341", "N438342"]',
  '[{"make":"DeWalt","model":"20V MAX DCB200 / DCB201 / DCB203 / DCB204 / DCB205 Battery Packs"}]',
  'Nylon PA12',
  0,
  'parts/dewalt-20v-battery-release-latch-button-310712-04.stl',
  'https://barebones3d.com/guides/dewalt-20v-battery-release-latch-button-310712-04/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_dewalt_battery_button_310712_04',
  'part_dewalt_battery_button_310712_04',
  '[{"name":"Security Torx T10","purpose":"Battery pack casing security screws"}]',
  'Moderate',
  '15 mins',
  '[{"step_number":1,"title":"Disassemble Battery Upper Shell","text":"Remove five security Torx T10 screws from the bottom of the battery shell to access the latch spring guide.","action_type":"extract"}]',
  '[{"question":"When will the DeWalt button release?","answer":"CAD modeling and drop-impact testing are underway. Join the waitlist for instant availability alerts."}]'
);

-- Waitlist 5: DeWalt Table Saw Fence Glide (640510-00)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_dewalt_fence_glide_640510_00',
  'dewalt-table-saw-fence-slide-glide-640510-00',
  'DeWalt DWE7491 / DWE7480 Table Saw Rack & Pinion Fence Slide Glide',
  '640510-00',
  '["5140032-47", "5140032-48"]',
  '[{"make":"DeWalt","model":"DWE7491RS Table Saw"},{"make":"DeWalt","model":"DWE7480 Table Saw"},{"make":"DeWalt","model":"DW745 Table Saw"}]',
  'Self-Lubricating Nylon PA12',
  0,
  'parts/dewalt-table-saw-fence-slide-glide-640510-00.stl',
  'https://barebones3d.com/guides/dewalt-table-saw-fence-slide-glide-640510-00/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_dewalt_fence_glide_640510_00',
  'part_dewalt_fence_glide_640510_00',
  '[{"name":"Hex Key 4mm","purpose":"Fence locking clamp fasteners"}]',
  'Easy',
  '15 mins',
  '[{"step_number":1,"title":"Remove Fence Carrier Assembly","text":"Back out the two 4mm hex bolts securing the rear slide bracket to the extruded aluminum rack tube.","action_type":"extract"}]',
  '[{"question":"Why is self-lubricating Nylon PA12 specified?","answer":"Low friction coefficient prevents fence sticking and guarantees smooth 0.5mm micro-adjustments."}]'
);

-- Waitlist 6: Bosch Riving Knife Lever (1609202428)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_bosch_knife_lever_1609202428',
  'bosch-table-saw-riving-knife-lever-1609202428',
  'Bosch GTS1031 / 4100 Table Saw Riving Knife Quick-Release Clamping Cam Lever',
  '1609202428',
  '["2610997298", "2610950041"]',
  '[{"make":"Bosch","model":"GTS1031 Table Saw"},{"make":"Bosch","model":"4100 Table Saw"},{"make":"Bosch","model":"4000 Table Saw"}]',
  'Nylon PA12',
  0,
  'parts/bosch-table-saw-riving-knife-lever-1609202428.stl',
  'https://barebones3d.com/guides/bosch-table-saw-riving-knife-lever-1609202428/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_bosch_knife_lever_1609202428',
  'part_bosch_knife_lever_1609202428',
  '[{"name":"10mm Wrench","purpose":"Cam lever center pivot shoulder nut"}]',
  'Easy',
  '10 mins',
  '[{"step_number":1,"title":"Remove Throat Plate","text":"Lift the zero-clearance throat plate and unscrew the center shoulder bolt securing the broken red cam lever.","action_type":"extract"}]',
  '[{"question":"Why does the OEM lever fail?","answer":"High clamping force on the steel riving knife blade snaps the plastic lever handle over time."}]'
);

-- Waitlist 7: Metabo Nailer Trigger Shield (316060190)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_metabo_trigger_shield_316060190',
  'metabo-hpt-nailer-safety-trigger-deflector-316060190',
  'Metabo HPT / Hitachi Coil Framing Nailer Transparent Safety Trigger Deflector',
  '316060190',
  '["883-511", "883511"]',
  '[{"make":"Metabo HPT","model":"Hitachi / Metabo HPT NV83A2 / NV83A3 / NV83A5 Coil Framing Nailers"}]',
  'Impact PETG',
  0,
  'parts/metabo-hpt-nailer-safety-trigger-deflector-316060190.stl',
  'https://barebones3d.com/guides/metabo-hpt-nailer-safety-trigger-deflector-316060190/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_metabo_trigger_shield_316060190',
  'part_metabo_trigger_shield_316060190',
  '[{"name":"Roll Pin Punch 3mm","purpose":"Trigger safety bracket pivot roll pin"}]',
  'Moderate',
  '15 mins',
  '[{"step_number":1,"title":"Drive Out Trigger Roll Pin","text":"Use a 3mm punch to tap out the spring-loaded roll pin holding the chipped deflector shield.","action_type":"extract"}]',
  '[{"question":"Why is Impact PETG used?","answer":"High flexural modulus absorbs repeated jobsite ricochets without shattering."}]'
);

-- Waitlist 8: Makita Vacuum Housing Latch (452205-2)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_makita_vacuum_latch_452205_2',
  'makita-cordless-vacuum-dust-capsule-latch-452205-2',
  'Makita DCL180 / XLC02 18V Cordless Vacuum Dust Capsule Housing Lock Latch',
  '452205-2',
  '["451241-5", "4522052"]',
  '[{"make":"Makita","model":"DCL180"},{"make":"Makita","model":"DCL181F"},{"make":"Makita","model":"XLC02Z 18V Cordless Vacuums"}]',
  'Nylon PA12',
  0,
  'parts/makita-cordless-vacuum-dust-capsule-latch-452205-2.stl',
  'https://barebones3d.com/guides/makita-cordless-vacuum-dust-capsule-latch-452205-2/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_makita_vacuum_latch_452205_2',
  'part_makita_vacuum_latch_452205_2',
  '[{"name":"Small Pick Tool","purpose":"Housing pivot spring engagement"}]',
  'Easy',
  '10 mins',
  '[{"step_number":1,"title":"Unhook Pivot Return Spring","text":"Use a small pick to release the wire torsion spring from the broken latch pivot ear.","action_type":"pry"}]',
  '[{"question":"When will this part ship?","answer":"Engineering validation of the snap-fit retention barb is underway."}]'
);

-- Waitlist 9: Makita Planer Belt Retainer (341071-7)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_makita_planer_retainer_341071_7',
  'makita-hand-planer-belt-tensioner-retainer-341071-7',
  'Makita 1900B / KP0800K Power Hand Planer Drive Belt Tensioner Retainer',
  '341071-7',
  '["3410717", "225007-7"]',
  '[{"make":"Makita","model":"1900B Hand Planer"},{"make":"Makita","model":"1902"},{"make":"Makita","model":"KP0800K"}]',
  'High-Temp Nylon PA12',
  0,
  'parts/makita-hand-planer-belt-tensioner-retainer-341071-7.stl',
  'https://barebones3d.com/guides/makita-hand-planer-belt-tensioner-retainer-341071-7/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_makita_planer_retainer_341071_7',
  'part_makita_planer_retainer_341071_7',
  '[{"name":"Phillips #2 Screwdriver","purpose":"Drive belt shroud cover screws"}]',
  'Easy',
  '15 mins',
  '[{"step_number":1,"title":"Remove Belt Protective Shroud","text":"Remove two screws on the side motor casing to access the cogged timing belt and tensioner guide.","action_type":"extract"}]',
  '[{"question":"Why is High-Temp Nylon required?","answer":"Motor drive pulleys run at 16,000 RPM, creating localized frictional heat."}]'
);

-- Waitlist 10: Technics Pitch Fader Plate (R-653)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active, status
) VALUES (
  'part_technics_pitch_plate_r653',
  'technics-sl1200-pitch-fader-dust-shutter-plate-r-653',
  'Technics SL-1200 / SL-1210 MK2 DJ Turntable Pitch Fader Dust Shutter Plate',
  'R-653',
  '["R653", "SFBD122-01E", "SFBD12201"]',
  '[{"make":"Technics","model":"SL-1200MK2"},{"make":"Technics","model":"SL-1210MK2"},{"make":"Technics","model":"SL-1200M3D"},{"make":"Technics","model":"SL-1200MK5"}]',
  'PETG Heavy Duty',
  0,
  'parts/technics-sl1200-pitch-fader-dust-shutter-plate-r-653.stl',
  'https://barebones3d.com/guides/technics-sl1200-pitch-fader-dust-shutter-plate-r-653/#cad-waitlist',
  'Proprietary Spec',
  'Barebones 3D Engineering Lab CAD under development.',
  0,
  1,
  'cad_waitlist'
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_technics_pitch_plate_r653',
  'part_technics_pitch_plate_r653',
  '[{"name":"Phillips #1 Screwdriver","purpose":"Top plate pitch assembly bracket screws"}]',
  'Moderate',
  '25 mins',
  '[{"step_number":1,"title":"Remove Platter and Top Faceplate","text":"Lift the aluminum platter off the center spindle, unbolt the outer chassis cover, and expose the pitch potentiometer.","action_type":"extract"}]',
  '[{"question":"What does the shutter plate do?","answer":"It seals the slider slot against club dust, smoke residue, and liquid spills, preventing pitch drift."}]'
);
