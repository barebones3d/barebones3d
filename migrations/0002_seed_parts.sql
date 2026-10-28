-- Seed Parts and Repair Guides
-- Cloudflare D1 Migration: 0002_seed_parts.sql

-- Part 1: Subaru HVAC Blend Door Actuator Gear
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_subaru_blend_door_72131',
  'subaru-blend-door-actuator-gear-72131-fg000',
  'Subaru HVAC Blend Door Actuator Split Gear',
  '72131-FG000',
  '["72131-FG001", "72131-FG002", "72131-FG003"]',
  '[{"make":"Subaru","model":"Impreza","year_start":2008,"year_end":2014},{"make":"Subaru","model":"WRX / STI","year_start":2008,"year_end":2014},{"make":"Subaru","model":"Forester","year_start":2009,"year_end":2013},{"make":"Subaru","model":"XV Crosstrek","year_start":2013,"year_end":2017}]',
  'Nylon PA12',
  1699,
  'parts/subaru-blend-door-gear-72131-fg000.stl',
  'https://www.printables.com/model/subaru-blend-door-gear',
  'CC BY 4.0',
  'Designed by SubieFix & Engineering Archive, distributed under CC BY 4.0.',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_subaru_blend_door',
  'part_subaru_blend_door_72131',
  '[{"name":"Phillips #2 Screwdriver","purpose":"Glove box trim screws"},{"name":"Plastic Trim Pry Tool","purpose":"Lower dash kick panel clips"},{"name":"7mm Hex Socket & Driver","purpose":"Actuator motor mounting bolts"},{"name":"White Lithium Grease","purpose":"Gear teeth lubrication"}]',
  'Moderate',
  '45 mins',
  '[
    {"step_number":1,"title":"Lower Dash & Glovebox Removal","text":"Depress the side damper clips inside the passenger glovebox. Unscrew the two lower pivot screws using a #2 Phillips screwdriver. Gently pull downward to release the assembly without stressing the nylon hinges.","image_url":"/assets/guides/subaru_step1.jpg","tip":"Place screws into an organizer tray to avoid mixing up trim screws with chassis ground screws."},
    {"step_number":2,"title":"Locate HVAC Blend Door Actuator","text":"Look to the left of the cabin air filter cavity on the HVAC climate box. You will see a small black plastic servo motor box secured by three 7mm hex bolts.","image_url":"/assets/guides/subaru_step2.jpg","warning":"Do not force the blend door linkage arm by hand while the motor is plugged in to avoid stripping the interior potentiometer."},
    {"step_number":3,"title":"Unclip Wire Harness & Extract Actuator","text":"Depress the locking tab on the 5-pin wiring connector and extract it. Remove the three 7mm bolts and lift the actuator motor straight outward from the HVAC casing.","image_url":"/assets/guides/subaru_step3.jpg"},
    {"step_number":4,"title":"Open Actuator Case & Swap Split Gear","text":"Pry the four perimeter casing clips with a flat tool. The OEM white nylon spur gear will likely show a hairline fracture along the D-bore shaft. Clean out old dried grease, apply fresh white lithium grease, and press the new Barebones 3D PA12 Nylon gear onto the metal drive shaft.","image_url":"/assets/guides/subaru_step4.jpg","tip":"Nylon PA12 provides self-lubricating qualities and higher shear strength than standard injection-molded POM."},
    {"step_number":5,"title":"Re-indexing & Functional Climate Test","text":"Snap the casing together, re-seat onto the HVAC box spline, reconnect the 5-pin plug, and turn vehicle ignition to ON. Cycle cabin temperature from Cold (60°F) to Hot (85°F) to verify smooth, quiet flap travel before reinstalling the glovebox."}
  ]',
  '[
    {"question":"Why does the OEM Subaru gear fail?","answer":"The OEM gear was molded from brittle unreinforced POM with an undersized wall thickness around the drive D-flat. Cyclic thermal expansion between winter heating and summer A/C causes radial hoop stress cracking."},
    {"question":"Why is Nylon PA12 specified instead of PLA or PETG?","answer":"Automotive under-dash temperatures can exceed 70°C in direct summer sunlight. PLA deforms at 55°C. PA12 Nylon has a heat deflection temperature of over 110°C, high impact resistance, and natural lubricity."},
    {"question":"Does this part require special slicer tolerances?","answer":"The free STL is engineered with a +0.15mm printer tolerance compensation for FDM. If printing on a Bambu or Prusa, slice at 0.12mm layer height and 100% infill."}
  ]'
);

-- Part 2: Whirlpool / KitchenAid Dishwasher Lower Rack Wheel & Axle Clip
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_whirlpool_wheel_w10195416',
  'whirlpool-dishwasher-rack-wheel-w10195416',
  'Whirlpool / KitchenAid Dishwasher Lower Rack Wheel & Axle Assembly',
  'W10195416',
  '["W10195417", "1872128", "AH3407039", "EA3407039", "PS3407039"]',
  '[{"make":"Whirlpool","model":"Gold Series / Quiet Partner","year_start":2005,"year_end":2023},{"make":"KitchenAid","model":"Architect / KUDE / KDTE Series","year_start":2006,"year_end":2024},{"make":"Maytag","model":"MDB / Jetclean Series","year_start":2007,"year_end":2022},{"make":"Kenmore","model":"665 Series Ultra Wash","year_start":2004,"year_end":2021}]',
  'Food-Safe PETG',
  1250,
  'parts/whirlpool-dishwasher-rack-wheel-w10195416.stl',
  'https://www.printables.com/model/dishwasher-wheel-heavy-duty',
  'CC BY 4.0',
  'Engineered by ApplianceRepairLab, distributed under CC BY 4.0.',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_whirlpool_wheel',
  'part_whirlpool_wheel_w10195416',
  '[{"name":"Flathead Screwdriver (small)","purpose":"Release brittle snap retention tab"},{"name":"Dish Soap (few drops)","purpose":"Axle lubrication during press-fit"}]',
  'Beginner',
  '10 mins',
  '[
    {"step_number":1,"title":"Extract Lower Dishwasher Rack","text":"Open the dishwasher door fully, roll the lower rack out, and lift it clear of the tub rails. Place it inverted on a clean kitchen towel.","image_url":"/assets/guides/whirlpool_step1.jpg"},
    {"step_number":2,"title":"Inspect and Remove Broken Snap Retainer","text":"Examine the wheel bracket. The OEM retention tab becomes chalky and brittle from caustic detergent. Gently slide a flat screwdriver behind the tab and push toward the wire frame to unclip.","image_url":"/assets/guides/whirlpool_step2.jpg"},
    {"step_number":3,"title":"Clean Wire Frame Mounting Node","text":"Wipe any calcium or mineral scale off the stainless steel wire rack node with white vinegar or a scouring pad to ensure smooth wheel rotation.","image_url":"/assets/guides/whirlpool_step3.jpg"},
    {"step_number":4,"title":"Snap-fit Heavy-Duty Replacement Assembly","text":"Align the inner axle channel with the rack wire, press firmly until an audible click confirms engagement, then slide the wheel onto the hub. Verify free spinning without wobble.","image_url":"/assets/guides/whirlpool_step4.jpg","tip":"Our replacement features a 40% thicker structural flange to eliminate the common breakage at the detergent boundary layer."}
  ]',
  '[
    {"question":"Can this part withstand the 85°C Sani-Rinse cycle?","answer":"Yes. Our reproduction part is printed from high-temp, detergent-resistant PETG with a glass transition temperature rated safely above dishwasher hot-water cycles."},
    {"question":"Are the chemicals in 3D prints safe for dishwashers?","answer":"Our PETG is virgin food-contact grade polymer and is placed on the lower rack exterior away from food contact surfaces."}
  ]'
);

-- Part 3: Toyota Tundra / Sequoia Air Vent Louver Directional Clip
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_toyota_vent_clip_55670',
  'toyota-tundra-air-vent-louver-tab-55670-0c010',
  'Toyota Tundra / Sequoia Dash AC Air Vent Louver Tab',
  '55670-0C010',
  '["55670-0C020", "55680-0C010", "55660-0C010"]',
  '[{"make":"Toyota","model":"Tundra","year_start":2000,"year_end":2006},{"make":"Toyota","model":"Sequoia","year_start":2001,"year_end":2007}]',
  'Automotive ASA',
  1400,
  'parts/toyota-vent-clip-55670-0c010.stl',
  'https://www.printables.com/model/toyota-tundra-vent-tab-repair',
  'CC BY 4.0',
  'Model by OverlandHardware3D under CC BY 4.0.',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_toyota_vent',
  'part_toyota_vent_clip_55670',
  '[{"name":"Nylon Dash Pry Tool","purpose":"Bezel perimeter release"},{"name":"Needle-Nose Pliers","purpose":"Remove broken rear linkage pin"}]',
  'Easy',
  '15 mins',
  '[
    {"step_number":1,"title":"Protect Dash and Pry Vent Bezel","text":"Apply painter tape along the dashboard perimeter to protect the soft vinyl. Insert a nylon pry tool at the 3 o clock position and pop the retaining spring tabs outward.","image_url":"/assets/guides/toyota_step1.jpg"},
    {"step_number":2,"title":"Extract Broken Linkage Remnants","text":"Fish out the broken OEM plastic fingers from inside the horizontal vent slat. Use needle-nose pliers to make sure the internal vertical sync-bar is unblocked.","image_url":"/assets/guides/toyota_step2.jpg"},
    {"step_number":3,"title":"Slide New ASA Tab Over Center Slat","text":"Position the front grip tab over the central horizontal vane, then press the rear fork into the vertical sync rod until it snaps firmly into the retention notch.","image_url":"/assets/guides/toyota_step3.jpg","tip":"ASA provides exceptional UV and thermal stability under direct sun-baked windshield environments."}
  ]',
  '[
    {"question":"Does Toyota sell this tab separately?","answer":"No. Toyota dealerships only sell the entire dashboard register assembly (OEM #55670-0C010) which retails for upwards of $260.00."},
    {"question":"Will this melt in the hot summer sun?","answer":"No. It is printed in ASA (Acrylonitrile Styrene Acrylate), which withstands temperatures up to 100°C without sagging and contains built-in UV stabilizers."}
  ]'
);

-- Part 4: Bosch / Siemens Washing Machine Drain Pump Filter Grip Handle
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_bosch_drain_handle_00605010',
  'bosch-washing-machine-drain-filter-handle-00605010',
  'Bosch / Siemens Washing Machine Drain Pump Filter Repair Grip',
  '00605010',
  '["605010", "00647920", "647920", "00602008"]',
  '[{"make":"Bosch","model":"Serie 4 / 6 / 8 / Maxx","year_start":2008,"year_end":2024},{"make":"Siemens","model":"iQ300 / iQ500 / iQ700","year_start":2009,"year_end":2024}]',
  'PETG Heavy Duty',
  1350,
  'parts/bosch-drain-filter-handle-00605010.stl',
  'https://www.printables.com/model/bosch-drain-filter-knob-repair',
  'CC BY 4.0',
  'Modeled by EuroApplianceFix under CC BY 4.0.',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_bosch_drain',
  'part_bosch_drain_handle_00605010',
  '[{"name":"Shallow Tray & Old Towel","purpose":"Catch remaining pump water"},{"name":"Small Channel Lock Pliers","purpose":"Twist broken filter core"},{"name":"M4x20mm Stainless Screw (Optional)","purpose":"Reinforced mechanical anchor"}]',
  'Easy',
  '20 mins',
  '[
    {"step_number":1,"title":"Disconnect Power & Open Service Flap","text":"Unplug washing machine. Place towels beneath the lower right circular service flap and flip it downward.","image_url":"/assets/guides/bosch_step1.jpg"},
    {"step_number":2,"title":"Drain Water via Small Bleed Hose","text":"Pull out the small emergency rubber drain hose, remove the plug into your shallow tray, and let all stagnant water drain out.","image_url":"/assets/guides/bosch_step2.jpg"},
    {"step_number":3,"title":"Slide Barebones 3D Heavy-Duty Handle Over Filter Core","text":"Slide the contoured repair cap over the sheared OEM filter stub. The dual internal rib channels lock firmly into the OEM filter ribs, providing 3x the rotational torque.","image_url":"/assets/guides/bosch_step3.jpg"},
    {"step_number":4,"title":"Unscrew Counter-Clockwise and Clear Debris","text":"Grip the ergonomic textured handle and turn counter-clockwise 90 degrees. Remove coins, lint, or hairpins from the impeller cavity, rinse the filter, and screw back into place."}
  ]',
  '[
    {"question":"Why do washing machine filter handles snap off?","answer":"Lint, hair, and hard water scale bind the rubber seal against the plastic pump housing. When users attempt to force it open with pliers, the thin center web shears off."},
    {"question":"Does this replace the whole filter or just the handle?","answer":"This is a slip-on mechanical sleeve that interlocks with the surviving filter core, saving you from purchasing an expensive replacement pump assembly."}
  ]'
);

-- Part 5: Vintage Pioneer Turntable Anti-Skate Counterweight Arm (NON-COMMERCIAL LICENSE DEMONSTRATION)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_pioneer_turntable_wa104',
  'pioneer-turntable-anti-skate-arm-wa-104',
  'Vintage Pioneer PL-12D Tonearm Anti-Skate Weight Guide Arm',
  'WA-104',
  '["WA-104A", "PLA-12-ANTISKATE"]',
  '[{"make":"Pioneer","model":"PL-12D","year_start":1974,"year_end":1977},{"make":"Pioneer","model":"PL-15D","year_start":1974,"year_end":1977},{"make":"Pioneer","model":"PL-112D","year_start":1976,"year_end":1979}]',
  'PETG',
  0,
  'parts/pioneer-turntable-anti-skate-arm-wa-104.stl',
  'https://www.thingiverse.com/thing:pioneer-anti-skate',
  'CC BY-NC 4.0',
  'Original model by AudiophileRestorer under CC BY-NC 4.0 (Non-Commercial).',
  0, -- Enforces Non-Commercial restriction!
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_pioneer_turntable',
  'part_pioneer_turntable_wa104',
  '[{"name":"0.050in Hex Allen Key","purpose":"Gimbal set screw"},{"name":"Nylon Monofilament Line","purpose":"Anti-skate weight string"}]',
  'Easy',
  '15 mins',
  '[
    {"step_number":1,"title":"Inspect Tonearm Pivot Housing","text":"Locate the small horizontal hole at the rear right of the tonearm gimbal bearing. Inspect for remnants of the snapped plastic guide arm.","image_url":"/assets/guides/pioneer_step1.jpg"},
    {"step_number":2,"title":"Install Replacement Guide Wire Arm","text":"Insert the printed guide wire stem into the gimbal receiver. Tighten the side grub screw lightly with an Allen key until snug.","image_url":"/assets/guides/pioneer_step2.jpg"},
    {"step_number":3,"title":"Re-hang Weight and Calibrate Skating Force","text":"Thread monofilament line through the notched guide wire and suspend the brass anti-skate weight according to your cartridge tracking force (typically notch 2 for 1.5g tracking force)."}
  ]',
  '[
    {"question":"Why is this part not available for purchase on Barebones 3D?","answer":"The original designer released this 3D model under a Creative Commons Non-Commercial (CC BY-NC) license. Out of deep respect for open-source creator rights and licensing law, Barebones 3D does not sell commercial reproductions of NC-licensed parts. You can download the STL for free and 3D print it yourself for personal repair."}
  ]'
);
