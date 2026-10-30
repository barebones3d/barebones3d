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
  2600,
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
  0,
  'parts/whirlpool-dishwasher-rack-wheel-w10195416.stl',
  'https://www.printables.com/model/dishwasher-wheel-heavy-duty',
  'CC BY 4.0',
  'Engineered by ApplianceRepairLab, distributed under CC BY 4.0.',
  0, -- Free STL Only (Monetization Pivot: uncompetitive against commodity injection-molded 8-packs)
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
  1500,
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
  1650,
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

-- [JSON INGESTION] Toyota Tacoma Heater Control Valve Arm (OEM #87240-04020)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_toyota_toyota_tacoma_heater_control_valv',
  'toyota-toyota-tacoma-heater-control-valve-arm-87240-04020',
  'Toyota Tacoma Heater Control Valve Arm',
  '87240-04020',
  '[]',
  '[{"make":"Toyota","model":"Tacoma","year_start":1995,"year_end":2004},{"make":"Toyota","model":"4Runner","year_start":1996,"year_end":2002}]',
  'High-Temp Nylon PA12',
  1850,
  'parts/toyota-toyota-tacoma-heater-control-valve-arm-87240-04020.stl',
  'https://www.printables.com/model/sample-heater-valve-arm.stl',
  'CC BY 4.0',
  'Engineered for Toyota OEM restoration. Distributed under CC BY 4.0.',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_toyota_toyota_tacoma_heater_control_val',
  'part_toyota_toyota_tacoma_heater_control_valv',
  '[{"name":"10mm Socket Wrench","purpose":"Firewall bracket mounting bolts","amazon_search_keyword":"10mm socket wrench"},{"name":"Hose Pinch Pliers","purpose":"Clamp heater core coolant hoses","amazon_search_keyword":"coolant hose pinch-off pliers"},{"name":"Needle-Nose Pliers","purpose":"Cable retention spring clip","amazon_search_keyword":"needle-nose pliers"}]',
  'Moderate',
  '35 mins',
  '[{"step_number":1,"title":"Coolant Hose Clamping","text":"Clamp the inlet and outlet 5/8 inch coolant lines near the firewall to avoid draining the engine cooling system.","warning":"Ensure engine is cold before handling pressurized cooling hoses.","action_type":"extract"},{"step_number":2,"title":"Bowden Cable Release","text":"Pry open the cable retention clip with needle nose pliers and slide the loop off the fractured OEM actuator arm pin.","tip":"Mark cable jacket position with paint marker for zero-drift alignment.","action_type":"pry"},{"step_number":3,"title":"Valve Spindle Inspection","text":"Wipe the brass valve spindle clean with rubbing alcohol. Confirm free 90-degree rotary movement without binding.","action_type":"clean"},{"step_number":4,"title":"Reproduction Arm Installation","text":"Press-fit the reinforced Nylon PA12 replacement arm over the keyed brass shaft until it bottoms flush against the collar.","tip":"The calibrated +0.15mm printer tolerance guarantees a snug press-fit without wobble.","action_type":"install"},{"step_number":5,"title":"Operational Cable Verification","text":"Cycle temperature selector knob inside the cab across full Cold-to-Hot range. Confirm full 90-degree valve sweep.","action_type":"test"}]',
  '[{"question":"Why choose this reinforced 3D printed High-Temp Nylon PA12 reproduction over brittle factory plastic?","answer":"Factory OEM plastic degrades from thermal stress and UV fatigue. Our reproduction is 100% solid filled in industrial-grade High-Temp Nylon PA12 with calibrated tolerances (+0.15mm) to permanently eliminate brittle failure points."},{"question":"How does the +0.15mm printer tolerance compensation affect installation?","answer":"Internal bores and snap channels are widened by exactly +0.15mm to eliminate elephant-foot seam binding, allowing a direct hand press-fit without filing or drilling."}]'
);

-- [JSON INGESTION] Ford F-150 / Super Duty Sunroof Track Slider Lift Arm Repair Kit (OEM #FL3Z-1651071-A)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_ford_f_150_super_duty_sunroof_track_slid',
  'ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a',
  'Ford F-150 / Super Duty Sunroof Track Slider Lift Arm Repair Kit',
  'FL3Z-1651071-A',
  '["FL3Z-1651071-B","02ESR1201ABK","AL3Z-1651071-A"]',
  '[{"make":"Ford","model":"F-150","year_start":2015,"year_end":2020},{"make":"Ford","model":"F-250 / F-350 / F-450 Super Duty","year_start":2017,"year_end":2022},{"make":"Ford","model":"Expedition","year_start":2018,"year_end":2021},{"make":"Lincoln","model":"Navigator","year_start":2018,"year_end":2021}]',
  'Nylon PA12',
  3800,
  'parts/ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a.stl',
  'https://www.printables.com/model/ford-f150-sunroof-track-repair-kit',
  'CC BY 4.0',
  'Designed by Barebones 3D Engineering Lab under CC BY 4.0',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_ford_f_150_super_duty_sunroof_track_sli',
  'part_ford_f_150_super_duty_sunroof_track_slid',
  '[{"name":"Torx T25 Precision Screwdriver","purpose":"Unbolt front and rear sunroof glass panel retaining shoulder screws","amazon_search_keyword":"Torx T25 screwdriver precision automotive"},{"name":"Non-Marring Nylon Trim Pry Tool","purpose":"Unclip side rubber accordion bellows without tearing silicone weatherstripping","amazon_search_keyword":"automotive interior trim removal tool kit"},{"name":"Long Reach Needle-Nose Pliers","purpose":"Extract shattered OEM plastic slider fragments from lower aluminum track channel","amazon_search_keyword":"long reach needle nose pliers 11 inch"},{"name":"Synthetic Fluoropolymer / Silicone Grease","purpose":"Coat sliding surfaces and aluminum channels to prevent friction wear","amazon_search_keyword":"Krytox GPL 205 synthetic fluoropolymer grease automotive"}]',
  'Moderate',
  '50 mins',
  '[{"step_number":1,"title":"Unclip Interior Rubber Accordion Bellows","text":"Lower the sunshade fully and place the sunroof into partial vent position if operational. Working from the vehicle interior, wedge a non-marring nylon pry tool beneath the top lip of the rubber accordion boot on each side of the moving glass panel. Carefully peel down the three retaining push-tabs to expose the internal metal glass cradle and mounting hardware.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid1\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid1)\"/><text x=\"40\" y=\"50\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"14\" font-weight=\"bold\">STEP 01 // OEM FL3Z-1651071-A // ACCORDION BELLOWS RELEASE</text><rect x=\"180\" y=\"120\" width=\"440\" height=\"35\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/><path d=\"M 200 155 Q 220 220 260 270 Q 300 220 320 155\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/><path d=\"M 500 260 L 530 200 L 515 190 L 485 250 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1\"/><path d=\"M 515 190 L 505 170 L 495 175 L 505 195 Z\" fill=\"#f59e0b\"/><path d=\"M 470 200 L 440 215 M 440 215 L 450 195 M 440 215 L 460 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/><circle cx=\"240\" cy=\"155\" r=\"5\" fill=\"#4ade80\"/><circle cx=\"380\" cy=\"155\" r=\"5\" fill=\"#4ade80\"/><circle cx=\"520\" cy=\"155\" r=\"5\" fill=\"#4ade80\"/></svg>"},{"step_number":2,"title":"Remove Torx T25 Fasteners and Lift Glass Panel","text":"Using a magnetic Torx T25 driver, remove the two forward and two rear shoulder screws securing the glass bracket to the mechanical slider arms. Support the glass center with one hand while backing out the final fastener. Lift the glass panel straight up and out through the roof aperture and place it onto a clean, padded surface.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid2\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid2)\"/><text x=\"40\" y=\"50\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"14\" font-weight=\"bold\">STEP 02 // OEM FL3Z-1651071-A // TORX T25 FASTENER EXTRACTION</text><rect x=\"160\" y=\"160\" width=\"480\" height=\"25\" rx=\"3\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/><rect x=\"220\" y=\"185\" width=\"60\" height=\"70\" fill=\"rgba(6, 182, 212, 0.18)\" stroke=\"#38bdf8\" stroke-width=\"2\"/><rect x=\"520\" y=\"185\" width=\"60\" height=\"70\" fill=\"rgba(6, 182, 212, 0.18)\" stroke=\"#38bdf8\" stroke-width=\"2\"/><line x=\"250\" y=\"320\" x=\"250\" y=\"260\" stroke=\"#f59e0b\" stroke-width=\"6\" stroke-linecap=\"round\"/><rect x=\"242\" y=\"320\" width=\"16\" height=\"45\" rx=\"2\" fill=\"#f59e0b\"/><path d=\"M 400 140 L 400 90 M 400 90 L 385 105 M 400 90 L 415 105\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"250\" cy=\"225\" r=\"7\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2\"/><circle cx=\"550\" cy=\"225\" r=\"7\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2\"/></svg>"},{"step_number":3,"title":"Clear Shattered OEM Plastic Debris from Track Channels","text":"Inspect the extruded aluminum guide rails for broken fragments of the brittle OEM lift arms. Using long reach needle-nose pliers, extract all sheared pivot ears, guide teeth, and retaining clips from the cable carrier channel. Thoroughly vacuum both track channels to ensure no residual plastic grit remains to bind the motor drive cables.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid3\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid3)\"/><text x=\"40\" y=\"50\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"14\" font-weight=\"bold\">STEP 03 // OEM FL3Z-1651071-A // DEBRIS EXTRACTION</text><path d=\"M 140 260 L 660 260 L 660 300 L 140 300 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/><path d=\"M 320 250 L 345 220 L 375 240 L 350 270 Z\" fill=\"rgba(239, 68, 68, 0.2)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/><path d=\"M 460 140 L 380 220 L 365 210 L 445 130 Z\" fill=\"#f59e0b\"/><path d=\"M 380 220 L 350 235 L 365 210 Z\" fill=\"#f59e0b\"/><path d=\"M 370 190 Q 340 140 300 130\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/><polyline points=\"305,120 295,130 310,138\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/></svg>"},{"step_number":4,"title":"Install Replacement Nylon PA12 Lift Arm Assembly","text":"Apply a liberal coating of synthetic fluoropolymer grease into the guide grooves and pivot pins of the replacement Nylon PA12 arm. Angle the forward guide block into the upper aluminum rail slot, then swing the rear pivot downward to interface with the cable drive carriage. Press downward firmly until the retention snap-tab engages the lower carrier with an audible click.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid4\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid4)\"/><text x=\"40\" y=\"50\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"14\" font-weight=\"bold\">STEP 04 // OEM FL3Z-1651071-A // NYLON PA12 ARM INSTALLATION</text><path d=\"M 160 280 L 640 280 L 640 310 L 160 310 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/><path d=\"M 260 210 L 480 180 L 510 240 L 470 270 L 290 270 Z\" fill=\"rgba(6, 182, 212, 0.25)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/><circle cx=\"300\" cy=\"240\" r=\"8\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/><circle cx=\"480\" cy=\"225\" r=\"8\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/><path d=\"M 380 130 L 380 165 M 370 155 L 380 165 L 390 155\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><text x=\"400\" y=\"155\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP-FIT LOCK</text></svg>"},{"step_number":5,"title":"Remount Glass Panel, Align Seams & Calibrate Motor","text":"Lower the glass panel back onto the lift arms and thread the four T25 Torx screws in finger-tight. Align the front glass edge flush to 1mm below the front roofline, and the rear edge flush to 1mm above the sheet metal to eliminate wind noise, then torque screws to 4.5 Nm. Snap the accordion boots back on. Turn ignition ON, hold the sunroof TILT switch for 10 seconds until the glass cycles down and up to calibrate motor anti-pinch limits.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid5\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid5)\"/><text x=\"40\" y=\"50\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"14\" font-weight=\"bold\">STEP 05 // OEM FL3Z-1651071-A // ALIGNMENT & RECALIBRATION</text><rect x=\"150\" y=\"170\" width=\"500\" height=\"28\" rx=\"3\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/><path d=\"M 120 180 L 150 180 M 650 180 L 680 180\" stroke=\"#38bdf8\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M 250 250 L 250 210 M 240 220 L 250 210 L 260 220\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/><path d=\"M 550 250 L 550 210 M 540 220 L 550 210 L 560 220\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/><circle cx=\"400\" cy=\"280\" r=\"26\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2\"/><path d=\"M 400 262 L 400 280 L 412 280\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2\" stroke-linecap=\"round\"/><text x=\"345\" y=\"330\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">HOLD 10s TO RECALIBRATE</text></svg>"}]',
  '[{"question":"Why did the original Ford factory lift arms crack?","answer":"The factory OEM arms were injection-molded from unreinforced POM/PBT that degrades from heat cycling and UV exposure through the glass. Once the factory track grease collects dust and thickens, the motor drive cable exerts excessive shear force on the brittle lift cam, snapping the guide pin collar."},{"question":"Why is Nylon PA12 required instead of standard PLA or PETG?","answer":"Vehicle cabins parked in direct sunlight reach interior ceiling temperatures between 65°C and 80°C. Standard PLA softens at 55°C, while PETG creeps under spring tension. Industrial Nylon PA12 maintains structural integrity past 140°C and provides natural self-lubricating surface lubricity."},{"question":"Do I need to drop the headliner to perform this repair?","answer":"No. Dealerships charge $1,800 to $2,500 because they drop the headliner to replace the entire 60001 track assembly. Our drop-in replacement arms install from the roof opening once the four T25 glass shoulder bolts and accordion bellows are removed."}]'
);

-- [JSON INGESTION] Jeep Grand Cherokee / Dodge Durango Sun Visor Pivot Support Bracket (OEM #5FS40DX9AA)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_jeep_grand_cherokee_dodge_durango_sun_vi',
  'jeep-grand-cherokee-dodge-durango-sun-visor-pivot-support-bracket-5fs40dx9aa',
  'Jeep Grand Cherokee / Dodge Durango Sun Visor Pivot Support Bracket',
  '5FS40DX9AA',
  '["5FS40TL2AA","1AR26BD1AA"]',
  '[{"make":"Jeep","model":"Grand Cherokee WK2","year_start":2011,"year_end":2022},{"make":"Dodge","model":"Durango","year_start":2011,"year_end":2023}]',
  'Automotive ASA',
  1950,
  'parts/jeep-grand-cherokee-dodge-durango-sun-visor-pivot-support-bracket-5fs40dx9aa.stl',
  'https://www.printables.com/model/jeep-wk2-sun-visor-bracket-repair',
  'CC BY 4.0',
  'Designed by Barebones 3D Engineering Lab under CC BY 4.0',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_jeep_grand_cherokee_dodge_durango_sun_v',
  'part_jeep_grand_cherokee_dodge_durango_sun_vi',
  '[{"name":"Torx T20 Driver","purpose":"Loosen headliner visor mount screw","amazon_search_keyword":"Torx T20 screwdriver automotive"},{"name":"Nylon Trim Pry Tool","purpose":"Pry open plastic screw concealment cap","amazon_search_keyword":"automotive trim removal tool kit"}]',
  'Easy',
  '15 mins',
  '[{"step_number":1,"title":"Pop Concealment Trim Cap","text":"Use a thin nylon pry wedge to flip open the rectangular hinge screw cover on the headliner.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM 5FS40DX9AA // TRIM CAP POP</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Extract OEM Pivot Screw","text":"Remove the single Torx T20 fastener securing the fractured visor bracket elbow to the inner roof roof bow.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM 5FS40DX9AA // FASTENER REMOVAL</text>\n            <rect x=\"200\" y=\"160\" width=\"400\" height=\"120\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <line x=\"320\" y=\"320\" x=\"320\" y=\"240\" stroke=\"#f59e0b\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <rect x=\"312\" y=\"320\" width=\"16\" height=\"40\" rx=\"2\" fill=\"#f59e0b\"/>\n            <path d=\"M 400 130 L 400 80 M 385 95 L 400 80 L 415 95\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <circle cx=\"480\" cy=\"220\" r=\"8\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/>\n        </svg>"},{"step_number":3,"title":"Slide Off Broken Collar","text":"Slide the split OEM plastic bracket sleeve off the visor metal pivot rod.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM 5FS40DX9AA // COLLAR REMOVAL</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":4,"title":"Install Reinforced ASA Bracket","text":"Slide the UV-resistant Automotive ASA bracket over the rod and tighten T20 screw to 2.5 Nm.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM 5FS40DX9AA // ASA INSTALL</text>\n            <rect x=\"180\" y=\"220\" width=\"440\" height=\"60\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <rect x=\"340\" y=\"160\" width=\"120\" height=\"70\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/>\n            <circle cx=\"400\" cy=\"195\" r=\"10\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 110 L 400 145 M 390 135 L 400 145 L 410 135\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <text x=\"420\" y=\"135\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP ALIGN</text>\n        </svg>"}]',
  '[{"question":"Why use ASA instead of PLA?","answer":"Headliners reach over 75°C in direct sun. Standard PLA deforms at 55°C, while Automotive ASA resists 100°C."},{"question":"Does this require cutting visor wiring?","answer":"No. The bracket features a precision slip-channel to clear the vanity mirror wiring harness."}]'
);

-- [JSON INGESTION] BMW 3-Series (E90 / E91 / E92) In-Dash Retractable Cup Holder Internal Catch & Pinion (OEM #51459173463)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_bmw_3_series_e90_e91_e92_in_dash_retract',
  'bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463',
  'BMW 3-Series (E90 / E91 / E92) In-Dash Retractable Cup Holder Internal Catch & Pinion',
  '51459173463',
  '["51457138797","51459173469"]',
  '[{"make":"BMW","model":"328i / 335i / M3 Sedan E90","year_start":2006,"year_end":2011},{"make":"BMW","model":"328i / 335i / M3 Coupe E92","year_start":2007,"year_end":2013},{"make":"BMW","model":"3-Series Touring E91","year_start":2006,"year_end":2012}]',
  'Automotive ASA',
  1900,
  'parts/bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463.stl',
  'https://www.printables.com/model/bmw-e90-cup-holder-gear-latch',
  'CC BY 4.0',
  'Designed by Barebones 3D Engineering Lab under CC BY 4.0',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_bmw_3_series_e90_e91_e92_in_dash_retrac',
  'part_bmw_3_series_e90_e91_e92_in_dash_retract',
  '[{"name":"Phillips #1 Screwdriver","purpose":"Remove dash cartridge mounting screws","amazon_search_keyword":"Phillips #1 precision screwdriver"},{"name":"Plastic Trim Tool","purpose":"Pry loose dash decorative wood/aluminum strip","amazon_search_keyword":"interior trim removal tool"}]',
  'Easy',
  '20 mins',
  '[{"step_number":1,"title":"Pry Passenger Dash Trim Strip","text":"Gently unclip the horizontal passenger dashboard trim bezel to expose the two cupholder faceplate screws.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM 51459173463 // BEZEL UNCLIP</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Extract Cupholder Cartridge","text":"Remove the two PH1 screws and slide the entire rectangular cassette forward out of the dashboard housing.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM 51459173463 // CASSETTE SLIDE</text>\n            <rect x=\"200\" y=\"160\" width=\"400\" height=\"120\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <line x=\"320\" y=\"320\" x=\"320\" y=\"240\" stroke=\"#f59e0b\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <rect x=\"312\" y=\"320\" width=\"16\" height=\"40\" rx=\"2\" fill=\"#f59e0b\"/>\n            <path d=\"M 400 130 L 400 80 M 385 95 L 400 80 L 415 95\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <circle cx=\"480\" cy=\"220\" r=\"8\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/>\n        </svg>"},{"step_number":3,"title":"Replace Sheared Heart-Cam Pawl","text":"Pop open the cassette side plate and replace the broken spring-loaded heart-cam latch and pinion.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM 51459173463 // PAWL REPLACEMENT</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":4,"title":"Reassemble & Test Push-Push Latch","text":"Snap side plate shut, slide cassette back into dashboard cavity, tighten screws, and reinstall dash trim.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM 51459173463 // REASSEMBLY</text>\n            <rect x=\"180\" y=\"170\" width=\"440\" height=\"120\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <circle cx=\"400\" cy=\"230\" r=\"30\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 210 L 400 230 L 415 230\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <path d=\"M 260 230 L 290 230 M 280 220 L 290 230 L 280 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <path d=\"M 540 230 L 510 230 M 520 220 L 510 230 L 520 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <text x=\"330\" y=\"295\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">TEST / CALIBRATE</text>\n        </svg>"}]',
  '[{"question":"Why did the cup holder fail to pop out?","answer":"The factory molded heart-cam follower tooth wears down or shears off, failing to catch the retraction detent."},{"question":"Is driver side and passenger side identical?","answer":"The internal latch pawl is universally mirrored, fitting both left and right dashboard cassettes."}]'
);

-- [JSON INGESTION] GM Silverado / Tahoe / Suburban HVAC Blend Door Actuator Cam Lever (OEM #89018365)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_chevrolet_gm_silverado_tahoe_suburban_hv',
  'chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365',
  'GM Silverado / Tahoe / Suburban HVAC Blend Door Actuator Cam Lever',
  '89018365',
  '["6844410","15-72971","52402588"]',
  '[{"make":"Chevrolet","model":"Silverado 1500 / 2500 / 3500","year_start":1999,"year_end":2013},{"make":"Chevrolet","model":"Tahoe / Suburban","year_start":2000,"year_end":2014},{"make":"GMC","model":"Sierra / Yukon","year_start":1999,"year_end":2013},{"make":"Cadillac","model":"Escalade","year_start":2002,"year_end":2014}]',
  'Nylon PA12',
  2200,
  'parts/chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365.stl',
  'https://www.printables.com/model/gm-silverado-blend-door-lever',
  'CC BY 4.0',
  'Designed by Barebones 3D Engineering Lab under CC BY 4.0',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_chevrolet_gm_silverado_tahoe_suburban_h',
  'part_chevrolet_gm_silverado_tahoe_suburban_hv',
  '[{"name":"7/32 inch (5.5mm) Socket & Ratchet","purpose":"Remove actuator mounting screws under dash","amazon_search_keyword":"5.5mm socket 7/32 quarter inch ratchet"},{"name":"Right Angle Ratchet Driver","purpose":"Access tight lower dash clearance","amazon_search_keyword":"right angle ratcheting screwdriver low profile"}]',
  'Moderate',
  '40 mins',
  '[{"step_number":1,"title":"Drop Lower Passenger Footwell Cover","text":"Remove the three plastic trim retainers and swing the lower insulator panel down to expose the HVAC airbox.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM 89018365 // FOOTWELL COVER DROP</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Unbolt Blend Door Actuator","text":"Disconnect electrical connector and remove the two 5.5mm screws securing the blend door actuator.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM 89018365 // ACTUATOR UNBOLT</text>\n            <rect x=\"200\" y=\"160\" width=\"400\" height=\"120\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <line x=\"320\" y=\"320\" x=\"320\" y=\"240\" stroke=\"#f59e0b\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <rect x=\"312\" y=\"320\" width=\"16\" height=\"40\" rx=\"2\" fill=\"#f59e0b\"/>\n            <path d=\"M 400 130 L 400 80 M 385 95 L 400 80 L 415 95\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <circle cx=\"480\" cy=\"220\" r=\"8\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/>\n        </svg>"},{"step_number":3,"title":"Inspect & Extract Split D-Bore Cam","text":"Pull the cracked factory cam lever off the fluted blend door shaft and inspect splines for debris.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM 89018365 // CAM EXTRACTION</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":4,"title":"Press Fit Reinforced Nylon PA12 Cam","text":"Align keyway and press the reinforced Nylon PA12 cam firmly over the fluted blend door axle.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM 89018365 // PRESS FIT INSTALL</text>\n            <rect x=\"180\" y=\"220\" width=\"440\" height=\"60\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <rect x=\"340\" y=\"160\" width=\"120\" height=\"70\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/>\n            <circle cx=\"400\" cy=\"195\" r=\"10\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 110 L 400 145 M 390 135 L 400 145 L 410 135\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <text x=\"420\" y=\"135\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP ALIGN</text>\n        </svg>"},{"step_number":5,"title":"Reinstall Actuator & Run HVAC Re-learn","text":"Torque screws, plug harness, pull HVAC fuse for 60s, then start engine and allow auto-calibration.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 05 // OEM 89018365 // HVAC RE-LEARN</text>\n            <rect x=\"180\" y=\"170\" width=\"440\" height=\"120\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <circle cx=\"400\" cy=\"230\" r=\"30\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 210 L 400 230 L 415 230\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <path d=\"M 260 230 L 290 230 M 280 220 L 290 230 L 280 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <path d=\"M 540 230 L 510 230 M 520 220 L 510 230 L 520 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <text x=\"330\" y=\"295\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">TEST / CALIBRATE</text>\n        </svg>"}]',
  '[{"question":"Why does the blend door continuously click?","answer":"The split D-bore slips on the fluted metal shaft; the motor senses no resistance and keeps rotating indefinitely."},{"question":"Does this require pulling the entire dashboard?","answer":"No. Dealerships book 6+ hours dashboard removal, but this lever presses on from the footwell."}]'
);

-- [JSON INGESTION] Dyson V10 / V11 Cordless Vacuum Reinforced Heavy-Duty Trigger Switch Lever (OEM #969830-01)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_dyson_v10_v11_cordless_vacuum_reinforced',
  'dyson-v10-v11-cordless-vacuum-reinforced-heavy-duty-trigger-switch-lever-969830-01',
  'Dyson V10 / V11 Cordless Vacuum Reinforced Heavy-Duty Trigger Switch Lever',
  '969830-01',
  '["970093-01","965660-01"]',
  '[{"make":"Dyson","model":"V10 Absolute / Animal / Motorhead (SV12)"},{"make":"Dyson","model":"V11 Torque Drive / Animal / Outsize (SV14 / SV15)"}]',
  'Nylon PA12',
  1900,
  'parts/dyson-v10-v11-cordless-vacuum-reinforced-heavy-duty-trigger-switch-lever-969830-01.stl',
  'https://www.printables.com/model/dyson-v10-v11-reinforced-trigger',
  'CC BY 4.0',
  'Designed by Barebones 3D Engineering Lab under CC BY 4.0',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_dyson_v10_v11_cordless_vacuum_reinforce',
  'part_dyson_v10_v11_cordless_vacuum_reinforced',
  '[{"name":"Torx T8 Precision Screwdriver","purpose":"Disassemble vacuum handle shell screws","amazon_search_keyword":"Torx T8 precision screwdriver long shaft"},{"name":"Small Slotted Screwdriver","purpose":"Release inner battery terminal lock tabs","amazon_search_keyword":"miniature slotted precision screwdriver"}]',
  'Moderate',
  '35 mins',
  '[{"step_number":1,"title":"Remove Dust Bin and Battery Pack","text":"Slide off dust canister and remove the 3 Torx T8 screws holding the lithium battery pack into the handle.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM 969830-01 // BATTERY REMOVAL</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Separate Motor Body Clamshell","text":"Back out internal T8 fasteners along the handle backbone and gently separate the handle housing halves.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM 969830-01 // CLAMSHELL SPLIT</text>\n            <rect x=\"200\" y=\"160\" width=\"400\" height=\"120\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <line x=\"320\" y=\"320\" x=\"320\" y=\"240\" stroke=\"#f59e0b\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <rect x=\"312\" y=\"320\" width=\"16\" height=\"40\" rx=\"2\" fill=\"#f59e0b\"/>\n            <path d=\"M 400 130 L 400 80 M 385 95 L 400 80 L 415 95\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <circle cx=\"480\" cy=\"220\" r=\"8\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/>\n        </svg>"},{"step_number":3,"title":"Extract Sheared Trigger Lever","text":"Slide out the broken red trigger piece where the thin internal structural rib snapped off.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM 969830-01 // TRIGGER EXTRACTION</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":4,"title":"Seat Reinforced Nylon PA12 Trigger","text":"Position the solid-reinforced PA12 trigger over the microswitch push-rod and verify spring tension.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM 969830-01 // NYLON TRIGGER INSTALL</text>\n            <rect x=\"180\" y=\"220\" width=\"440\" height=\"60\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <rect x=\"340\" y=\"160\" width=\"120\" height=\"70\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/>\n            <circle cx=\"400\" cy=\"195\" r=\"10\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 110 L 400 145 M 390 135 L 400 145 L 410 135\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <text x=\"420\" y=\"135\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP ALIGN</text>\n        </svg>"},{"step_number":5,"title":"Reassemble Handle & Function Check","text":"Rejoin clamshell halves, torque T8 screws, reinstall battery pack, and confirm responsive motor trigger action.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 05 // OEM 969830-01 // FUNCTION CHECK</text>\n            <rect x=\"180\" y=\"170\" width=\"440\" height=\"120\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <circle cx=\"400\" cy=\"230\" r=\"30\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 210 L 400 230 L 415 230\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <path d=\"M 260 230 L 290 230 M 280 220 L 290 230 L 280 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <path d=\"M 540 230 L 510 230 M 520 220 L 510 230 L 520 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <text x=\"330\" y=\"295\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">TEST / CALIBRATE</text>\n        </svg>"}]',
  '[{"question":"Why do factory Dyson triggers always fail?","answer":"The OEM trigger features a 0.8mm plastic load-bearing rib that experiences cyclic fatigue with every pull."},{"question":"How is the 3D printed model reinforced?","answer":"Our model fills the hollow structural cavity to 2.4mm solid cross-section in indestructible SLS Nylon PA12."}]'
);

-- [JSON INGESTION] KitchenAid Stand Mixer Sacrificial Nylon Worm Follower Gear (OEM #WP9709231)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_kitchenaid_stand_mixer_sacrificial_nylon',
  'kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231',
  'KitchenAid Stand Mixer Sacrificial Nylon Worm Follower Gear',
  'WP9709231',
  '["9709231","9706529","4162897"]',
  '[{"make":"KitchenAid","model":"Artisan 5-Quart (KSM150)"},{"make":"KitchenAid","model":"Classic 4.5-Quart (K45SS)"},{"make":"KitchenAid","model":"Ultra Power Series (KSM90)"}]',
  'PETG Heavy Duty',
  0,
  'parts/kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231.stl',
  'https://www.printables.com/model/kitchenaid-mixer-worm-gear-9709231',
  'Public Domain',
  'Public Domain OEM Reverse Engineered Geometry',
  0,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_kitchenaid_stand_mixer_sacrificial_nylo',
  'part_kitchenaid_stand_mixer_sacrificial_nylon',
  '[{"name":"Flathead Screwdriver","purpose":"Remove chrome trim band screws","amazon_search_keyword":"flat blade screwdriver set"},{"name":"1/8 inch Pin Punch & Hammer","purpose":"Drive out planetary planetary bevel drive roll pin","amazon_search_keyword":"1/8 inch roll pin punch set"},{"name":"Food Grade Gear Grease","purpose":"Pack transmission gearbox","amazon_search_keyword":"food grade NSF H1 grease stand mixer"}]',
  'Moderate',
  '45 mins',
  '[{"step_number":1,"title":"Remove Trim Band and Planetary Pin","text":"Unscrew decorative chrome belly band and use 1/8 inch punch to drive out planetary lock pin.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM WP9709231 // PIN PUNCH OUT</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Open Upper Gear Housing","text":"Remove four housing screws and separate top motor housing to expose the transmission gear box.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM WP9709231 // HOUSING SPLIT</text>\n            <rect x=\"200\" y=\"160\" width=\"400\" height=\"120\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <line x=\"320\" y=\"320\" x=\"320\" y=\"240\" stroke=\"#f59e0b\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <rect x=\"312\" y=\"320\" width=\"16\" height=\"40\" rx=\"2\" fill=\"#f59e0b\"/>\n            <path d=\"M 400 130 L 400 80 M 385 95 L 400 80 L 415 95\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <circle cx=\"480\" cy=\"220\" r=\"8\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/>\n        </svg>"},{"step_number":3,"title":"Extract Stripped Nylon Gear","text":"Slide off the bronze washer and lift out the stripped sacrificial nylon follower gear.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM WP9709231 // GEAR EXTRACTION</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":4,"title":"Repack Grease & Install New Gear","text":"Pack gear teeth with NSF food-grade grease and seat replacement worm gear over drive tower.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM WP9709231 // GEAR & GREASE INSTALL</text>\n            <rect x=\"180\" y=\"220\" width=\"440\" height=\"60\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <rect x=\"340\" y=\"160\" width=\"120\" height=\"70\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/>\n            <circle cx=\"400\" cy=\"195\" r=\"10\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 110 L 400 145 M 390 135 L 400 145 L 410 135\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <text x=\"420\" y=\"135\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP ALIGN</text>\n        </svg>"},{"step_number":5,"title":"Realign Planetary & Fasten Casing","text":"Rejoin housing, reinsert and stake roll pin, and run mixer on speed 1 for 2 minutes to distribute grease.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 05 // OEM WP9709231 // PLANETARY STAKE</text>\n            <rect x=\"180\" y=\"170\" width=\"440\" height=\"120\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <circle cx=\"400\" cy=\"230\" r=\"30\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 210 L 400 230 L 415 230\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <path d=\"M 260 230 L 290 230 M 280 220 L 290 230 L 280 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <path d=\"M 540 230 L 510 230 M 520 220 L 510 230 L 520 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <text x=\"330\" y=\"295\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">TEST / CALIBRATE</text>\n        </svg>"}]',
  '[{"question":"Why is this gear intentionally made of nylon?","answer":"It acts as a mechanical fuse. If dough hooks jam, the gear strips to protect the costly electric drive motor."},{"question":"Why choose the Amazon kit over custom 3D printing?","answer":"Injection-molded replacement gears packaged with NSF food-grade grease are available on Amazon for under $10."}]'
);

-- [JSON INGESTION] GE / Hotpoint Clothes Dryer Front Drum Slide Bearing Glides (OEM #WE1M1067)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_ge_hotpoint_clothes_dryer_front_drum_sli',
  'ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067',
  'GE / Hotpoint Clothes Dryer Front Drum Slide Bearing Glides',
  'WE1M1067',
  '["WE1M504","WE1M507","WE1M316"]',
  '[{"make":"GE","model":"Profile Front Load / Top Load Dryers"},{"make":"Hotpoint","model":"Electric and Gas Dryers"},{"make":"Kenmore","model":"362/363 Series Dryers"}]',
  'PETG Heavy Duty',
  0,
  'parts/ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067.stl',
  'https://www.printables.com/model/ge-dryer-drum-glide-bearing-we1m1067',
  'Public Domain',
  'Public Domain OEM Replacement Spec',
  0,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_ge_hotpoint_clothes_dryer_front_drum_sl',
  'part_ge_hotpoint_clothes_dryer_front_drum_sli',
  '[{"name":"1/4 inch Nut Driver","purpose":"Remove top panel and front bulkhead screws","amazon_search_keyword":"1/4 inch magnetic nut driver"},{"name":"Putty Knife","purpose":"Depress spring clips securing dryer top cover","amazon_search_keyword":"flexible putty knife"}]',
  'Easy',
  '30 mins',
  '[{"step_number":1,"title":"Release Top Panel Latches","text":"Insert putty knife between front panel and top lid to release the dual internal spring retention latches.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM WE1M1067 // TOP LATCH RELEASE</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Disconnect Door Switch & Bulkhead","text":"Unplug door safety interlock wiring harness and remove 1/4 inch screws securing front bearing bulkhead.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM WE1M1067 // BULKHEAD REMOVAL</text>\n            <rect x=\"200\" y=\"160\" width=\"400\" height=\"120\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <line x=\"320\" y=\"320\" x=\"320\" y=\"240\" stroke=\"#f59e0b\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <rect x=\"312\" y=\"320\" width=\"16\" height=\"40\" rx=\"2\" fill=\"#f59e0b\"/>\n            <path d=\"M 400 130 L 400 80 M 385 95 L 400 80 L 415 95\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <circle cx=\"480\" cy=\"220\" r=\"8\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/>\n        </svg>"},{"step_number":3,"title":"Pry Out Worn Slide Shoes","text":"Pop out worn Teflon/nylon slide glides from their retention slots in the upper half-circle bearing bracket.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM WE1M1067 // SLIDE SHOE REMOVAL</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":4,"title":"Snap In New Glides & Felt Seal","text":"Snap new white/green slides into place and align the felt seal cushion along the outer rim.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM WE1M1067 // GLIDES SNAP IN</text>\n            <rect x=\"180\" y=\"220\" width=\"440\" height=\"60\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <rect x=\"340\" y=\"160\" width=\"120\" height=\"70\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/>\n            <circle cx=\"400\" cy=\"195\" r=\"10\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 110 L 400 145 M 390 135 L 400 145 L 410 135\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <text x=\"420\" y=\"135\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP ALIGN</text>\n        </svg>"},{"step_number":5,"title":"Reassemble Bulkhead & Spin Test","text":"Remount front panel, reconnect door sensor, lower top lid, and spin drum by hand to verify silent rotation.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 05 // OEM WE1M1067 // DRUM SPIN TEST</text>\n            <rect x=\"180\" y=\"170\" width=\"440\" height=\"120\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <circle cx=\"400\" cy=\"230\" r=\"30\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 210 L 400 230 L 415 230\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <path d=\"M 260 230 L 290 230 M 280 220 L 290 230 L 280 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <path d=\"M 540 230 L 510 230 M 520 220 L 510 230 L 520 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <text x=\"330\" y=\"295\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">TEST / CALIBRATE</text>\n        </svg>"}]',
  '[{"question":"What causes the loud screeching during dryer cycles?","answer":"When the plastic glides wear through, the metal drum lip grinds directly on the stationary bulkhead."},{"question":"Should I print these or buy the Amazon multipack?","answer":"Amazon sells 4-packs with replacement felt and adhesive for under $8, making commercial POD uneconomical."}]'
);

-- [JSON INGESTION] Milwaukee M18 REDLITHIUM Battery Pack Locking Latch & Release Claws (OEM #48-11-1850)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_milwaukee_m18_redlithium_battery_pack_lo',
  'milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850',
  'Milwaukee M18 REDLITHIUM Battery Pack Locking Latch & Release Claws',
  '48-11-1850',
  '["48-11-1828","48-11-1865"]',
  '[{"make":"Milwaukee","model":"M18 Compact 2.0Ah / 3.0Ah"},{"make":"Milwaukee","model":"M18 XC 4.0Ah / 5.0Ah / 6.0Ah"},{"make":"Milwaukee","model":"M18 High Output 6.0Ah / 8.0Ah / 12.0Ah"}]',
  'Nylon PA12',
  1950,
  'parts/milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850.stl',
  'https://www.printables.com/model/milwaukee-m18-battery-latch-repair',
  'CC BY 4.0',
  'Designed by Barebones 3D Engineering Lab under CC BY 4.0',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_milwaukee_m18_redlithium_battery_pack_l',
  'part_milwaukee_m18_redlithium_battery_pack_lo',
  '[{"name":"Torx T10 Security Screwdriver","purpose":"Remove tamper-proof case bottom screws","amazon_search_keyword":"Torx T10 security tamper proof screwdriver"},{"name":"Tweezers / Pick Tool","purpose":"Seat latch compression coil springs","amazon_search_keyword":"precision pick and hook set"}]',
  'Easy',
  '20 mins',
  '[{"step_number":1,"title":"Extract Tamper-Proof T10 Screws","text":"Remove the 4 Torx T10 security screws located in the recessed corners of the battery bottom casing.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM 48-11-1850 // T10 FASTENER EXTRACT</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Separate Lower Battery Casing","text":"Lift top collar assembly slightly to expose the dual compression spring pockets without disturbing cells.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM 48-11-1850 // CASING SEPARATION</text>\n            <rect x=\"200\" y=\"160\" width=\"400\" height=\"120\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <line x=\"320\" y=\"320\" x=\"320\" y=\"240\" stroke=\"#f59e0b\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <rect x=\"312\" y=\"320\" width=\"16\" height=\"40\" rx=\"2\" fill=\"#f59e0b\"/>\n            <path d=\"M 400 130 L 400 80 M 385 95 L 400 80 L 415 95\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <circle cx=\"480\" cy=\"220\" r=\"8\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/>\n        </svg>"},{"step_number":3,"title":"Remove Sheared Latch Ears","text":"Extract cracked latch bodies and retrieve original steel return springs from the side slide channels.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM 48-11-1850 // LATCH REMOVAL</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":4,"title":"Slide In Nylon PA12 Latch Arms","text":"Slide new solid Nylon PA12 latches into the guide rails and seat return springs onto alignment studs.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM 48-11-1850 // NYLON LATCH INSTALL</text>\n            <rect x=\"180\" y=\"220\" width=\"440\" height=\"60\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <rect x=\"340\" y=\"160\" width=\"120\" height=\"70\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/>\n            <circle cx=\"400\" cy=\"195\" r=\"10\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 110 L 400 145 M 390 135 L 400 145 L 410 135\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <text x=\"420\" y=\"135\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP ALIGN</text>\n        </svg>"},{"step_number":5,"title":"Fasten Case & Test Tool Retention","text":"Reassemble housing, torque T10 screws to 1.8 Nm, and click battery into an M18 tool to test retention lock.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 05 // OEM 48-11-1850 // RETENTION TEST</text>\n            <rect x=\"180\" y=\"170\" width=\"440\" height=\"120\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <circle cx=\"400\" cy=\"230\" r=\"30\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 210 L 400 230 L 415 230\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <path d=\"M 260 230 L 290 230 M 280 220 L 290 230 L 280 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <path d=\"M 540 230 L 510 230 M 520 220 L 510 230 L 520 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <text x=\"330\" y=\"295\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">TEST / CALIBRATE</text>\n        </svg>"}]',
  '[{"question":"Can I replace latches without touching the internal lithium cells?","answer":"Yes. The latches reside in an isolated side perimeter channel; internal cell connections remain untouched."},{"question":"Why is Nylon PA12 necessary for power tool latches?","answer":"Power tools endure repeated high-vibration shocks and job site drops that will instantly fracture standard PLA or resin."}]'
);

-- [JSON INGESTION] DeWalt DWS779 / DWS780 12-Inch Miter Saw High-Flow Dust Extraction Chute (OEM #N087403)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_dewalt_dws779_dws780_12_inch_miter_saw_h',
  'dewalt-dws779-dws780-12-inch-miter-saw-high-flow-dust-extraction-chute-n087403',
  'DeWalt DWS779 / DWS780 12-Inch Miter Saw High-Flow Dust Extraction Chute',
  'N087403',
  '["N142512","N058318"]',
  '[{"make":"DeWalt","model":"DWS779 12-Inch Sliding Compound Miter Saw"},{"make":"DeWalt","model":"DWS780 12-Inch Double Bevel Sliding Compound Miter Saw"},{"make":"DeWalt","model":"DWS782 12-Inch Sliding Miter Saw"}]',
  'PETG Heavy Duty',
  2500,
  'parts/dewalt-dws779-dws780-12-inch-miter-saw-high-flow-dust-extraction-chute-n087403.stl',
  'https://www.printables.com/model/dewalt-dws779-dws780-dust-chute-upgrade',
  'CC BY 4.0',
  'Designed by Barebones 3D Engineering Lab under CC BY 4.0',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_dewalt_dws779_dws780_12_inch_miter_saw_',
  'part_dewalt_dws779_dws780_12_inch_miter_saw_h',
  '[{"name":"Torx T20 Driver","purpose":"Remove rear factory chute retaining bracket screws","amazon_search_keyword":"Torx T20 screwdriver automotive"},{"name":"Shop Vacuum Hose (1-7/8 or 2-1/2 in)","purpose":"Connect to high-flow extraction port","amazon_search_keyword":"shop vac hose adapter universal"}]',
  'Easy',
  '15 mins',
  '[{"step_number":1,"title":"Unbolt OEM Rubber Dust Funnel","text":"Remove two T20 Torx screws securing the factory rubber dust funnel to the rear aluminum swing arm.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM N087403 // OEM CHUTE REMOVAL</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Clear Sawdust Accumulation","text":"Brush away compacted sawdust and pitch resin from the blade guard rear exhaust trajectory.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM N087403 // EXHAUST CLEARANCE</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":3,"title":"Mount Enlarged Throat PETG Chute","text":"Position the wide-mouth heavy-duty PETG collector onto the pivot boss and torque screws to 3 Nm.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM N087403 // PETG CHUTE INSTALL</text>\n            <rect x=\"180\" y=\"220\" width=\"440\" height=\"60\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <rect x=\"340\" y=\"160\" width=\"120\" height=\"70\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/>\n            <circle cx=\"400\" cy=\"195\" r=\"10\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 110 L 400 145 M 390 135 L 400 145 L 410 135\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <text x=\"420\" y=\"135\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP ALIGN</text>\n        </svg>"},{"step_number":4,"title":"Check Blade Travel & Connect Vac Hose","text":"Perform a complete bevel and slide pass to verify zero blade clearance interference, then connect shop vac.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM N087403 // TRAVEL CLEARANCE CHECK</text>\n            <rect x=\"180\" y=\"170\" width=\"440\" height=\"120\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <circle cx=\"400\" cy=\"230\" r=\"30\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 210 L 400 230 L 415 230\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <path d=\"M 260 230 L 290 230 M 280 220 L 290 230 L 280 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <path d=\"M 540 230 L 510 230 M 520 220 L 510 230 L 520 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <text x=\"330\" y=\"295\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">TEST / CALIBRATE</text>\n        </svg>"}]',
  '[{"question":"How much does this improve dust collection efficiency?","answer":"The oversized aerodynamic throat captures over 85% of sawdust compared to under 35% with the OEM rubber chute."},{"question":"Will this collide with the saw blade at full 45-degree bevel?","answer":"No. The model includes an engineered bevel relief notch that preserves full 49-degree dual-bevel travel."}]'
);

-- [JSON INGESTION] Bose QuietComfort 35 / 45 Headband Swivel Hinge Joint Replacement (OEM #759944-0010)
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  'part_bose_quietcomfort_35_45_headband_swivel_',
  'bose-quietcomfort-35-45-headband-swivel-hinge-joint-replacement-759944-0010',
  'Bose QuietComfort 35 / 45 Headband Swivel Hinge Joint Replacement',
  '759944-0010',
  '["759944-0020","789564-0010"]',
  '[{"make":"Bose","model":"QuietComfort 35 Series I (QC35 I)"},{"make":"Bose","model":"QuietComfort 35 Series II (QC35 II)"},{"make":"Bose","model":"QuietComfort 45 (QC45)"}]',
  'Nylon PA12',
  2000,
  'parts/bose-quietcomfort-35-45-headband-swivel-hinge-joint-replacement-759944-0010.stl',
  'https://www.printables.com/model/bose-qc35-hinge-swivel-repair',
  'CC BY 4.0',
  'Designed by Barebones 3D Engineering Lab under CC BY 4.0',
  1,
  1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  'guide_bose_quietcomfort_35_45_headband_swivel',
  'part_bose_quietcomfort_35_45_headband_swivel_',
  '[{"name":"Torx T6 Precision Screwdriver","purpose":"Remove micro hinge pivot clamp screws","amazon_search_keyword":"Torx T6 precision screwdriver magnetic"},{"name":"Fine Curved Tweezers","purpose":"Guide delicate audio ribbon wiring through hinge slot","amazon_search_keyword":"precision curved electronic tweezers"}]',
  'Moderate',
  '30 mins',
  '[{"step_number":1,"title":"Remove Inner Hinge Cover Screws","text":"Unscrew the two Torx T6 micro screws on the inner headband hinge clamp to expose audio wiring.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 01 // OEM 759944-0010 // T6 SCREWS REMOVAL</text>\n            <rect x=\"220\" y=\"140\" width=\"360\" height=\"160\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 180 220 L 260 180 L 240 160 L 160 200 Z\" fill=\"#f59e0b\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n            <path d=\"M 230 240 L 270 210 M 270 210 L 255 210 M 270 210 L 265 225\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <circle cx=\"400\" cy=\"220\" r=\"18\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4,4\"/>\n        </svg>"},{"step_number":2,"title":"Unhook Swivel Ear-Cup Arm","text":"Carefully slide the cracked outer swivel knuckle off the steel headband slider arm without pinching the wire.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 02 // OEM 759944-0010 // KNUCKLE SEPARATION</text>\n            <rect x=\"200\" y=\"160\" width=\"400\" height=\"120\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <line x=\"320\" y=\"320\" x=\"320\" y=\"240\" stroke=\"#f59e0b\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <rect x=\"312\" y=\"320\" width=\"16\" height=\"40\" rx=\"2\" fill=\"#f59e0b\"/>\n            <path d=\"M 400 130 L 400 80 M 385 95 L 400 80 L 415 95\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <circle cx=\"480\" cy=\"220\" r=\"8\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/>\n        </svg>"},{"step_number":3,"title":"Thread Audio Wire Through New Hinge","text":"Using tweezers, guide the audio wire harness safely through the internal slot of the Nylon PA12 hinge.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 03 // OEM 759944-0010 // WIRE THREADING</text>\n            <path d=\"M 160 250 L 640 250 L 640 280 L 160 280 Z\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <path d=\"M 360 220 L 400 190 L 430 210 L 390 240 Z\" fill=\"rgba(239, 68, 68, 0.25)\" stroke=\"#ef4444\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/>\n            <path d=\"M 470 150 L 410 205 L 395 195 L 455 140 Z\" fill=\"#f59e0b\"/>\n            <path d=\"M 350 180 Q 320 130 280 120\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\" stroke-dasharray=\"4,3\"/>\n            <polyline points=\"285,110 275,120 290,128\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2\"/>\n        </svg>"},{"step_number":4,"title":"Snap Hinge Knuckle & Tighten Screws","text":"Seat the hinge knuckle into the slider track and torque the two T6 screws snugly until flush.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 04 // OEM 759944-0010 // HINGE SEAT & TIGHTEN</text>\n            <rect x=\"180\" y=\"220\" width=\"440\" height=\"60\" rx=\"4\" fill=\"rgba(6, 182, 212, 0.12)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <rect x=\"340\" y=\"160\" width=\"120\" height=\"70\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/>\n            <circle cx=\"400\" cy=\"195\" r=\"10\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 110 L 400 145 M 390 135 L 400 145 L 410 135\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n            <text x=\"420\" y=\"135\" fill=\"#4ade80\" font-family=\"monospace\" font-size=\"12\" font-weight=\"bold\">SNAP ALIGN</text>\n        </svg>"},{"step_number":5,"title":"Verify Fold & Audio Continuity","text":"Fold earcup 90 degrees flat into storage orientation and power on headset to verify stereo audio channels.","svg_code":"<svg viewBox=\"0 0 800 450\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"800\" height=\"450\" fill=\"#0a0f1d\"/><defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.05)\" stroke-width=\"1\"/></pattern></defs><rect width=\"800\" height=\"450\" fill=\"url(#grid)\"/><text x=\"40\" y=\"45\" fill=\"#38bdf8\" font-family=\"monospace\" font-size=\"13\" font-weight=\"bold\">STEP 05 // OEM 759944-0010 // FOLDING & AUDIO CHECK</text>\n            <rect x=\"180\" y=\"170\" width=\"440\" height=\"120\" rx=\"6\" fill=\"rgba(6, 182, 212, 0.15)\" stroke=\"#38bdf8\" stroke-width=\"2\"/>\n            <circle cx=\"400\" cy=\"230\" r=\"30\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\"/>\n            <path d=\"M 400 210 L 400 230 L 415 230\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n            <path d=\"M 260 230 L 290 230 M 280 220 L 290 230 L 280 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <path d=\"M 540 230 L 510 230 M 520 220 L 510 230 L 520 240\" fill=\"none\" stroke=\"#4ade80\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n            <text x=\"330\" y=\"295\" fill=\"#f59e0b\" font-family=\"monospace\" font-size=\"11\" font-weight=\"bold\">TEST / CALIBRATE</text>\n        </svg>"}]',
  '[{"question":"Do I need to desolder any audio wires?","answer":"No. The hinge is engineered with a slotted wire passthrough channel that eliminates desoldering completely."},{"question":"Why is SLS Nylon PA12 required instead of resin?","answer":"Resin becomes brittle and snaps under the torsional flexing of the headband. Nylon PA12 provides flex fatigue resistance."}]'
);
