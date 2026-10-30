# Barebones 3D — OEM Replacement Parts Catalog & Deduplication Index

> **Single Source of Truth for Planning & Part Ingestion**  
> Use this document as the reference manifest for all currently cataloged, engineered, and published OEM replacement parts.  
> **Rule for AI Agents & Engineers:** Before proposing, designing, or ingesting a new replacement part, verify that neither the target OEM part number nor any of its superseded/alternate part numbers appear in this index.

**Catalog Status:** 31 Active Parts Published  
**Last Updated:** 2026-10-30  
**Canonical Web Directory:** [/guides/index.html](https://barebones3d.com/guides/)  
**LLM Endpoint:** [https://barebones3d.com/llms.txt](https://barebones3d.com/llms.txt)

---

## 1. Quick Master Table

| # | OEM Part # | Superseded / Alternate #s | Make / Manufacturer | Title & Description | Material Spec | Status | Price | Slug |
|---|---|---|---|---|---|---|---|---|
| **1** | `8K0898192A` | `8T0919070B`, `8K0919070` | Audi | Audi A4 / A5 / Q5 MMI Central Control Volume Knob Internal D-Shaft | High-Temp Nylon PA12 | Free STL Only | $0.00 | [audi-mmi-volume-knob-shaft-8k0898192a](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/audi-mmi-volume-knob-shaft-8k0898192a/index.html) |
| **2** | `90530948` | `90530948-01`, `RC-100-P`, `385022-03` | Black & Decker | Black & Decker String Trimmer Replacement Spool Cap Cover | PETG Heavy Duty | Free STL Only | $0.00 | [black-decker-trimmer-replacement-spool-cap-90530948](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/black-decker-trimmer-replacement-spool-cap-90530948/index.html) |
| **3** | `51459173463` | `51457138797`, `51459173469` | BMW | BMW 3-Series (E90 / E91 / E92) In-Dash Retractable Cup Holder Internal Catch & Pinion | Automotive ASA | Free STL Only | $0.00 | [bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463/index.html) |
| **4** | `00605010` | `605010`, `00647920`, `647920`, `00602008` | Bosch / Siemens | Bosch / Siemens Washing Machine Drain Pump Filter Repair Grip | PETG Heavy Duty | Free STL Only | $0.00 | [bosch-washing-machine-drain-filter-handle-00605010](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/bosch-washing-machine-drain-filter-handle-00605010/index.html) |
| **5** | `1609202428` | `2610997298`, `2610950041` | Bosch | Bosch GTS1031 / 4100 Table Saw Riving Knife Quick-Release Clamping Cam Lever | Nylon PA12 | Free STL Only | $0.00 | [bosch-table-saw-riving-knife-lever-1609202428](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/bosch-table-saw-riving-knife-lever-1609202428/index.html) |
| **6** | `759944-0010` | `759944-0020`, `789564-0010` | Bose | Bose QuietComfort 35 / 45 Headband Swivel Hinge Joint Replacement | Nylon PA12 | Commercial POD | $20.00 | [bose-quietcomfort-35-45-headband-swivel-hinge-joint-replacement-759944-0010](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/bose-quietcomfort-35-45-headband-swivel-hinge-joint-replacement-759944-0010/index.html) |
| **7** | `310712-04` | `N438341`, `N438342` | DeWalt | DeWalt 20V MAX Lithium-Ion Battery Pack Spring Latch Release Button | Nylon PA12 | Free STL Only | $0.00 | [dewalt-20v-battery-release-latch-button-310712-04](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/dewalt-20v-battery-release-latch-button-310712-04/index.html) |
| **8** | `640510-00` | `5140032-47`, `5140032-48` | DeWalt | DeWalt DWE7491 / DWE7480 Table Saw Rack & Pinion Fence Slide Glide | Self-Lubricating Nylon PA12 | Free STL Only | $0.00 | [dewalt-table-saw-fence-slide-glide-640510-00](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/dewalt-table-saw-fence-slide-glide-640510-00/index.html) |
| **9** | `N087403` | `N142512`, `N058318` | DeWalt | DeWalt DWS779 / DWS780 12-Inch Miter Saw High-Flow Dust Extraction Chute | PETG Heavy Duty | Commercial POD | $25.00 | [dewalt-dws779-dws780-12-inch-miter-saw-high-flow-dust-extraction-chute-n087403](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/dewalt-dws779-dws780-12-inch-miter-saw-high-flow-dust-extraction-chute-n087403/index.html) |
| **10** | `68064949AA` | `68064949`, `68064950AA` | Ram | Dodge Ram 1500 / 2500 HVAC Heater Blend Door Sub-Assembly Gear | Nylon PA12 | Free STL Only | $0.00 | [dodge-ram-hvac-blend-door-gear-68064949aa](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/dodge-ram-hvac-blend-door-gear-68064949aa/index.html) |
| **11** | `969830-01` | `970093-01`, `965660-01` | Dyson | Dyson V10 / V11 Cordless Vacuum Reinforced Heavy-Duty Trigger Switch Lever | Nylon PA12 | Commercial POD | $19.00 | [dyson-v10-v11-cordless-vacuum-reinforced-heavy-duty-trigger-switch-lever-969830-01](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/dyson-v10-v11-cordless-vacuum-reinforced-heavy-duty-trigger-switch-lever-969830-01/index.html) |
| **12** | `FL3Z-1651071-A` | `FL3Z-1651071-B`, `02ESR1201ABK`, `AL3Z-1651071-A` | Ford / Lincoln | Ford F-150 / Super Duty Sunroof Track Slider Lift Arm Repair Kit | Nylon PA12 | Free STL Only | $0.00 | [ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a/index.html) |
| **13** | `WE1M1067` | `WE1M504`, `WE1M507`, `WE1M316` | GE / Hotpoint / Kenmore | GE / Hotpoint Clothes Dryer Front Drum Slide Bearing Glides | PETG Heavy Duty | Free STL Only | $0.00 | [ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067/index.html) |
| **14** | `89018365` | `6844410`, `15-72971`, `52402588` | Chevrolet / GMC / Cadillac | GM Silverado / Tahoe / Suburban HVAC Blend Door Actuator Cam Lever | Nylon PA12 | Free STL Only | $0.00 | [chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365/index.html) |
| **15** | `5FS40DX9AA` | `5FS40TL2AA`, `1AR26BD1AA` | Jeep / Dodge | Jeep Grand Cherokee / Dodge Durango Sun Visor Pivot Support Bracket | Automotive ASA | Commercial POD | $19.50 | [jeep-grand-cherokee-dodge-durango-sun-visor-pivot-support-bracket-5fs40dx9aa](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/jeep-grand-cherokee-dodge-durango-sun-visor-pivot-support-bracket-5fs40dx9aa/index.html) |
| **16** | `5012710AA` | `5012710AB`, `5012710`, `68072190AA` | Jeep | Jeep Grand Cherokee WJ Dual-Zone HVAC Blend Door Actuator Split Gear | Nylon PA12 | Commercial POD | $24.00 | [jeep-wj-grand-cherokee-blend-door-gear-5012710aa](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/jeep-wj-grand-cherokee-blend-door-gear-5012710aa/index.html) |
| **17** | `WP9709231` | `9709231`, `9706529`, `4162897` | KitchenAid | KitchenAid Stand Mixer Sacrificial Nylon Worm Follower Gear | PETG Heavy Duty | Free STL Only | $0.00 | [kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231/index.html) |
| **18** | `122049-9` | `450128-8`, `643852-7` | Makita | Makita 18V LXT Lithium-Ion Battery Terminal Protector Cover | PETG Heavy Duty | Commercial POD | $14.00 | [makita-18v-battery-terminal-protector-cover-122049-9](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/makita-18v-battery-terminal-protector-cover-122049-9/index.html) |
| **19** | `341071-7` | `3410717`, `225007-7` | Makita | Makita 1900B / KP0800K Power Hand Planer Drive Belt Tensioner Retainer | High-Temp Nylon PA12 | Free STL Only | $0.00 | [makita-hand-planer-belt-tensioner-retainer-341071-7](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/makita-hand-planer-belt-tensioner-retainer-341071-7/index.html) |
| **20** | `452205-2` | `451241-5`, `4522052` | Makita | Makita DCL180 / XLC02 18V Cordless Vacuum Dust Capsule Housing Lock Latch | Nylon PA12 | Free STL Only | $0.00 | [makita-cordless-vacuum-dust-capsule-latch-452205-2](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/makita-cordless-vacuum-dust-capsule-latch-452205-2/index.html) |
| **21** | `316060190` | `883-511`, `883511` | Metabo HPT | Metabo HPT / Hitachi Coil Framing Nailer Transparent Safety Trigger Deflector | Impact PETG | Free STL Only | $0.00 | [metabo-hpt-nailer-safety-trigger-deflector-316060190](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/metabo-hpt-nailer-safety-trigger-deflector-316060190/index.html) |
| **22** | `48-11-1850` | `48-11-1828`, `48-11-1865` | Milwaukee | Milwaukee M18 REDLITHIUM Battery Pack Locking Latch & Release Claws | Nylon PA12 | Free STL Only | $0.00 | [milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850/index.html) |
| **23** | `3-255-731-01` | `2-113-132-11`, `2-113-133-11`, `3-255-731-00` | Sony | Sony MDR-7506 / MDR-V6 Professional Headphone Swivel Yoke Hanger Bracket | Nylon PA12 | Commercial POD | $19.00 | [sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01/index.html) |
| **24** | `72131-FG000` | `72131-FG001`, `72131-FG002`, `72131-FG003` | Subaru | Subaru HVAC Blend Door Actuator Split Gear | Nylon PA12 | Free STL Only | $0.00 | [subaru-blend-door-actuator-gear-72131-fg000](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/subaru-blend-door-actuator-gear-72131-fg000/index.html) |
| **25** | `R-653` | `R653`, `SFBD122-01E`, `SFBD12201` | Technics | Technics SL-1200 / SL-1210 MK2 DJ Turntable Pitch Fader Dust Shutter Plate | PETG Heavy Duty | Free STL Only | $0.00 | [technics-sl1200-pitch-fader-dust-shutter-plate-r-653](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/technics-sl1200-pitch-fader-dust-shutter-plate-r-653/index.html) |
| **26** | `87240-04020` | — | Toyota | Toyota Tacoma Heater Control Valve Arm | High-Temp Nylon PA12 | Free STL Only | $0.00 | [toyota-toyota-tacoma-heater-control-valve-arm-87240-04020](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/toyota-toyota-tacoma-heater-control-valve-arm-87240-04020/index.html) |
| **27** | `55670-0C010` | `55670-0C020`, `55680-0C010`, `55660-0C010` | Toyota | Toyota Tundra / Sequoia Dash AC Air Vent Louver Tab | Automotive ASA | Commercial POD | $15.00 | [toyota-tundra-air-vent-louver-tab-55670-0c010](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/toyota-tundra-air-vent-louver-tab-55670-0c010/index.html) |
| **28** | `WA-104` | `WA-104A`, `PLA-12-ANTISKATE` | Pioneer | Vintage Pioneer PL-12D Tonearm Anti-Skate Weight Guide Arm | PETG | Free STL Only | $0.00 | [pioneer-turntable-anti-skate-arm-wa-104](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/pioneer-turntable-anti-skate-arm-wa-104/index.html) |
| **29** | `39886277` | `31265160`, `30742378` | Volvo | Volvo S60 / V60 / XC60 Fuel Filler Door Flap Hinge Bracket | Automotive ASA | Free STL Only | $0.00 | [volvo-fuel-filler-door-hinge-bracket-39886277](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/volvo-fuel-filler-door-hinge-bracket-39886277/index.html) |
| **30** | `W10195416` | `W10195417`, `1872128`, `AH3407039`, `EA3407039`, `PS3407039` | Whirlpool / KitchenAid / Maytag / Kenmore | Whirlpool / KitchenAid Dishwasher Lower Rack Wheel & Axle Assembly | Food-Safe PETG | Free STL Only | $0.00 | [whirlpool-dishwasher-rack-wheel-w10195416](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/whirlpool-dishwasher-rack-wheel-w10195416/index.html) |
| **31** | `W10436250` | `WPW10436250`, `2303043`, `PS3634044` | Whirlpool / Maytag | Whirlpool / Maytag Refrigerator Deli Meat Pan Drawer Slide Roller Wheel | Food-Safe PETG | Free STL Only | $0.00 | [whirlpool-refrigerator-deli-drawer-slide-roller-w10436250](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/guides/whirlpool-refrigerator-deli-drawer-slide-roller-w10436250/index.html) |

---

## 2. Fast Part Number Lookup (All OEMs & Superseded Numbers)

Use this alphabetized list to instantly test whether an OEM or superseded part number already exists in the catalog:

| Part Number | Type | Canonical OEM Part # | Published Guide Slug |
|---|---|---|---|
| `00602008` | Superseded | `00605010` | `bosch-washing-machine-drain-filter-handle-00605010` |
| `00605010` | **Primary OEM** | `00605010` | `bosch-washing-machine-drain-filter-handle-00605010` |
| `00647920` | Superseded | `00605010` | `bosch-washing-machine-drain-filter-handle-00605010` |
| `02ESR1201ABK` | Superseded | `FL3Z-1651071-A` | `ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a` |
| `122049-9` | **Primary OEM** | `122049-9` | `makita-18v-battery-terminal-protector-cover-122049-9` |
| `15-72971` | Superseded | `89018365` | `chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365` |
| `1609202428` | **Primary OEM** | `1609202428` | `bosch-table-saw-riving-knife-lever-1609202428` |
| `1872128` | Superseded | `W10195416` | `whirlpool-dishwasher-rack-wheel-w10195416` |
| `1AR26BD1AA` | Superseded | `5FS40DX9AA` | `jeep-grand-cherokee-dodge-durango-sun-visor-pivot-support-bracket-5fs40dx9aa` |
| `2-113-132-11` | Superseded | `3-255-731-01` | `sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01` |
| `2-113-133-11` | Superseded | `3-255-731-01` | `sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01` |
| `225007-7` | Superseded | `341071-7` | `makita-hand-planer-belt-tensioner-retainer-341071-7` |
| `2303043` | Superseded | `W10436250` | `whirlpool-refrigerator-deli-drawer-slide-roller-w10436250` |
| `2610950041` | Superseded | `1609202428` | `bosch-table-saw-riving-knife-lever-1609202428` |
| `2610997298` | Superseded | `1609202428` | `bosch-table-saw-riving-knife-lever-1609202428` |
| `3-255-731-00` | Superseded | `3-255-731-01` | `sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01` |
| `3-255-731-01` | **Primary OEM** | `3-255-731-01` | `sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01` |
| `30742378` | Superseded | `39886277` | `volvo-fuel-filler-door-hinge-bracket-39886277` |
| `310712-04` | **Primary OEM** | `310712-04` | `dewalt-20v-battery-release-latch-button-310712-04` |
| `31265160` | Superseded | `39886277` | `volvo-fuel-filler-door-hinge-bracket-39886277` |
| `316060190` | **Primary OEM** | `316060190` | `metabo-hpt-nailer-safety-trigger-deflector-316060190` |
| `341071-7` | **Primary OEM** | `341071-7` | `makita-hand-planer-belt-tensioner-retainer-341071-7` |
| `3410717` | Superseded | `341071-7` | `makita-hand-planer-belt-tensioner-retainer-341071-7` |
| `385022-03` | Superseded | `90530948` | `black-decker-trimmer-replacement-spool-cap-90530948` |
| `39886277` | **Primary OEM** | `39886277` | `volvo-fuel-filler-door-hinge-bracket-39886277` |
| `4162897` | Superseded | `WP9709231` | `kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231` |
| `450128-8` | Superseded | `122049-9` | `makita-18v-battery-terminal-protector-cover-122049-9` |
| `451241-5` | Superseded | `452205-2` | `makita-cordless-vacuum-dust-capsule-latch-452205-2` |
| `452205-2` | **Primary OEM** | `452205-2` | `makita-cordless-vacuum-dust-capsule-latch-452205-2` |
| `4522052` | Superseded | `452205-2` | `makita-cordless-vacuum-dust-capsule-latch-452205-2` |
| `48-11-1828` | Superseded | `48-11-1850` | `milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850` |
| `48-11-1850` | **Primary OEM** | `48-11-1850` | `milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850` |
| `48-11-1865` | Superseded | `48-11-1850` | `milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850` |
| `5012710` | Superseded | `5012710AA` | `jeep-wj-grand-cherokee-blend-door-gear-5012710aa` |
| `5012710AA` | **Primary OEM** | `5012710AA` | `jeep-wj-grand-cherokee-blend-door-gear-5012710aa` |
| `5012710AB` | Superseded | `5012710AA` | `jeep-wj-grand-cherokee-blend-door-gear-5012710aa` |
| `5140032-47` | Superseded | `640510-00` | `dewalt-table-saw-fence-slide-glide-640510-00` |
| `5140032-48` | Superseded | `640510-00` | `dewalt-table-saw-fence-slide-glide-640510-00` |
| `51457138797` | Superseded | `51459173463` | `bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463` |
| `51459173463` | **Primary OEM** | `51459173463` | `bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463` |
| `51459173469` | Superseded | `51459173463` | `bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463` |
| `52402588` | Superseded | `89018365` | `chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365` |
| `55660-0C010` | Superseded | `55670-0C010` | `toyota-tundra-air-vent-louver-tab-55670-0c010` |
| `55670-0C010` | **Primary OEM** | `55670-0C010` | `toyota-tundra-air-vent-louver-tab-55670-0c010` |
| `55670-0C020` | Superseded | `55670-0C010` | `toyota-tundra-air-vent-louver-tab-55670-0c010` |
| `55680-0C010` | Superseded | `55670-0C010` | `toyota-tundra-air-vent-louver-tab-55670-0c010` |
| `5FS40DX9AA` | **Primary OEM** | `5FS40DX9AA` | `jeep-grand-cherokee-dodge-durango-sun-visor-pivot-support-bracket-5fs40dx9aa` |
| `5FS40TL2AA` | Superseded | `5FS40DX9AA` | `jeep-grand-cherokee-dodge-durango-sun-visor-pivot-support-bracket-5fs40dx9aa` |
| `605010` | Superseded | `00605010` | `bosch-washing-machine-drain-filter-handle-00605010` |
| `640510-00` | **Primary OEM** | `640510-00` | `dewalt-table-saw-fence-slide-glide-640510-00` |
| `643852-7` | Superseded | `122049-9` | `makita-18v-battery-terminal-protector-cover-122049-9` |
| `647920` | Superseded | `00605010` | `bosch-washing-machine-drain-filter-handle-00605010` |
| `68064949` | Superseded | `68064949AA` | `dodge-ram-hvac-blend-door-gear-68064949aa` |
| `68064949AA` | **Primary OEM** | `68064949AA` | `dodge-ram-hvac-blend-door-gear-68064949aa` |
| `68064950AA` | Superseded | `68064949AA` | `dodge-ram-hvac-blend-door-gear-68064949aa` |
| `68072190AA` | Superseded | `5012710AA` | `jeep-wj-grand-cherokee-blend-door-gear-5012710aa` |
| `6844410` | Superseded | `89018365` | `chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365` |
| `72131-FG000` | **Primary OEM** | `72131-FG000` | `subaru-blend-door-actuator-gear-72131-fg000` |
| `72131-FG001` | Superseded | `72131-FG000` | `subaru-blend-door-actuator-gear-72131-fg000` |
| `72131-FG002` | Superseded | `72131-FG000` | `subaru-blend-door-actuator-gear-72131-fg000` |
| `72131-FG003` | Superseded | `72131-FG000` | `subaru-blend-door-actuator-gear-72131-fg000` |
| `759944-0010` | **Primary OEM** | `759944-0010` | `bose-quietcomfort-35-45-headband-swivel-hinge-joint-replacement-759944-0010` |
| `759944-0020` | Superseded | `759944-0010` | `bose-quietcomfort-35-45-headband-swivel-hinge-joint-replacement-759944-0010` |
| `789564-0010` | Superseded | `759944-0010` | `bose-quietcomfort-35-45-headband-swivel-hinge-joint-replacement-759944-0010` |
| `87240-04020` | **Primary OEM** | `87240-04020` | `toyota-toyota-tacoma-heater-control-valve-arm-87240-04020` |
| `883-511` | Superseded | `316060190` | `metabo-hpt-nailer-safety-trigger-deflector-316060190` |
| `883511` | Superseded | `316060190` | `metabo-hpt-nailer-safety-trigger-deflector-316060190` |
| `89018365` | **Primary OEM** | `89018365` | `chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365` |
| `8K0898192A` | **Primary OEM** | `8K0898192A` | `audi-mmi-volume-knob-shaft-8k0898192a` |
| `8K0919070` | Superseded | `8K0898192A` | `audi-mmi-volume-knob-shaft-8k0898192a` |
| `8T0919070B` | Superseded | `8K0898192A` | `audi-mmi-volume-knob-shaft-8k0898192a` |
| `90530948` | **Primary OEM** | `90530948` | `black-decker-trimmer-replacement-spool-cap-90530948` |
| `90530948-01` | Superseded | `90530948` | `black-decker-trimmer-replacement-spool-cap-90530948` |
| `965660-01` | Superseded | `969830-01` | `dyson-v10-v11-cordless-vacuum-reinforced-heavy-duty-trigger-switch-lever-969830-01` |
| `969830-01` | **Primary OEM** | `969830-01` | `dyson-v10-v11-cordless-vacuum-reinforced-heavy-duty-trigger-switch-lever-969830-01` |
| `970093-01` | Superseded | `969830-01` | `dyson-v10-v11-cordless-vacuum-reinforced-heavy-duty-trigger-switch-lever-969830-01` |
| `9706529` | Superseded | `WP9709231` | `kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231` |
| `9709231` | Superseded | `WP9709231` | `kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231` |
| `AH3407039` | Superseded | `W10195416` | `whirlpool-dishwasher-rack-wheel-w10195416` |
| `AL3Z-1651071-A` | Superseded | `FL3Z-1651071-A` | `ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a` |
| `EA3407039` | Superseded | `W10195416` | `whirlpool-dishwasher-rack-wheel-w10195416` |
| `FL3Z-1651071-A` | **Primary OEM** | `FL3Z-1651071-A` | `ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a` |
| `FL3Z-1651071-B` | Superseded | `FL3Z-1651071-A` | `ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a` |
| `N058318` | Superseded | `N087403` | `dewalt-dws779-dws780-12-inch-miter-saw-high-flow-dust-extraction-chute-n087403` |
| `N087403` | **Primary OEM** | `N087403` | `dewalt-dws779-dws780-12-inch-miter-saw-high-flow-dust-extraction-chute-n087403` |
| `N142512` | Superseded | `N087403` | `dewalt-dws779-dws780-12-inch-miter-saw-high-flow-dust-extraction-chute-n087403` |
| `N438341` | Superseded | `310712-04` | `dewalt-20v-battery-release-latch-button-310712-04` |
| `N438342` | Superseded | `310712-04` | `dewalt-20v-battery-release-latch-button-310712-04` |
| `PLA-12-ANTISKATE` | Superseded | `WA-104` | `pioneer-turntable-anti-skate-arm-wa-104` |
| `PS3407039` | Superseded | `W10195416` | `whirlpool-dishwasher-rack-wheel-w10195416` |
| `PS3634044` | Superseded | `W10436250` | `whirlpool-refrigerator-deli-drawer-slide-roller-w10436250` |
| `R-653` | **Primary OEM** | `R-653` | `technics-sl1200-pitch-fader-dust-shutter-plate-r-653` |
| `R653` | Superseded | `R-653` | `technics-sl1200-pitch-fader-dust-shutter-plate-r-653` |
| `RC-100-P` | Superseded | `90530948` | `black-decker-trimmer-replacement-spool-cap-90530948` |
| `SFBD122-01E` | Superseded | `R-653` | `technics-sl1200-pitch-fader-dust-shutter-plate-r-653` |
| `SFBD12201` | Superseded | `R-653` | `technics-sl1200-pitch-fader-dust-shutter-plate-r-653` |
| `W10195416` | **Primary OEM** | `W10195416` | `whirlpool-dishwasher-rack-wheel-w10195416` |
| `W10195417` | Superseded | `W10195416` | `whirlpool-dishwasher-rack-wheel-w10195416` |
| `W10436250` | **Primary OEM** | `W10436250` | `whirlpool-refrigerator-deli-drawer-slide-roller-w10436250` |
| `WA-104` | **Primary OEM** | `WA-104` | `pioneer-turntable-anti-skate-arm-wa-104` |
| `WA-104A` | Superseded | `WA-104` | `pioneer-turntable-anti-skate-arm-wa-104` |
| `WE1M1067` | **Primary OEM** | `WE1M1067` | `ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067` |
| `WE1M316` | Superseded | `WE1M1067` | `ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067` |
| `WE1M504` | Superseded | `WE1M1067` | `ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067` |
| `WE1M507` | Superseded | `WE1M1067` | `ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067` |
| `WP9709231` | **Primary OEM** | `WP9709231` | `kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231` |
| `WPW10436250` | Superseded | `W10436250` | `whirlpool-refrigerator-deli-drawer-slide-roller-w10436250` |

---

## 3. Machine-Readable JSON Manifest

For automated planning prompts, agents can parse this JSON representation of all 31 active parts:

```json
[
  {
    "oem_part_number": "8K0898192A",
    "supersedes": [
      "8T0919070B",
      "8K0919070"
    ],
    "make": "Audi",
    "title": "Audi A4 / A5 / Q5 MMI Central Control Volume Knob Internal D-Shaft",
    "slug": "audi-mmi-volume-knob-shaft-8k0898192a",
    "material": "High-Temp Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "90530948",
    "supersedes": [
      "90530948-01",
      "RC-100-P",
      "385022-03"
    ],
    "make": "Black & Decker",
    "title": "Black & Decker String Trimmer Replacement Spool Cap Cover",
    "slug": "black-decker-trimmer-replacement-spool-cap-90530948",
    "material": "PETG Heavy Duty",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "51459173463",
    "supersedes": [
      "51457138797",
      "51459173469"
    ],
    "make": "BMW",
    "title": "BMW 3-Series (E90 / E91 / E92) In-Dash Retractable Cup Holder Internal Catch & Pinion",
    "slug": "bmw-3-series-e90-e91-e92-in-dash-retractable-cup-holder-internal-catch-pinion-51459173463",
    "material": "Automotive ASA",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "00605010",
    "supersedes": [
      "605010",
      "00647920",
      "647920",
      "00602008"
    ],
    "make": "Bosch",
    "title": "Bosch / Siemens Washing Machine Drain Pump Filter Repair Grip",
    "slug": "bosch-washing-machine-drain-filter-handle-00605010",
    "material": "PETG Heavy Duty",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "1609202428",
    "supersedes": [
      "2610997298",
      "2610950041"
    ],
    "make": "Bosch",
    "title": "Bosch GTS1031 / 4100 Table Saw Riving Knife Quick-Release Clamping Cam Lever",
    "slug": "bosch-table-saw-riving-knife-lever-1609202428",
    "material": "Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "759944-0010",
    "supersedes": [
      "759944-0020",
      "789564-0010"
    ],
    "make": "Bose",
    "title": "Bose QuietComfort 35 / 45 Headband Swivel Hinge Joint Replacement",
    "slug": "bose-quietcomfort-35-45-headband-swivel-hinge-joint-replacement-759944-0010",
    "material": "Nylon PA12",
    "commercial": true,
    "price_usd": 20
  },
  {
    "oem_part_number": "310712-04",
    "supersedes": [
      "N438341",
      "N438342"
    ],
    "make": "DeWalt",
    "title": "DeWalt 20V MAX Lithium-Ion Battery Pack Spring Latch Release Button",
    "slug": "dewalt-20v-battery-release-latch-button-310712-04",
    "material": "Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "640510-00",
    "supersedes": [
      "5140032-47",
      "5140032-48"
    ],
    "make": "DeWalt",
    "title": "DeWalt DWE7491 / DWE7480 Table Saw Rack & Pinion Fence Slide Glide",
    "slug": "dewalt-table-saw-fence-slide-glide-640510-00",
    "material": "Self-Lubricating Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "N087403",
    "supersedes": [
      "N142512",
      "N058318"
    ],
    "make": "DeWalt",
    "title": "DeWalt DWS779 / DWS780 12-Inch Miter Saw High-Flow Dust Extraction Chute",
    "slug": "dewalt-dws779-dws780-12-inch-miter-saw-high-flow-dust-extraction-chute-n087403",
    "material": "PETG Heavy Duty",
    "commercial": true,
    "price_usd": 25
  },
  {
    "oem_part_number": "68064949AA",
    "supersedes": [
      "68064949",
      "68064950AA"
    ],
    "make": "Ram",
    "title": "Dodge Ram 1500 / 2500 HVAC Heater Blend Door Sub-Assembly Gear",
    "slug": "dodge-ram-hvac-blend-door-gear-68064949aa",
    "material": "Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "969830-01",
    "supersedes": [
      "970093-01",
      "965660-01"
    ],
    "make": "Dyson",
    "title": "Dyson V10 / V11 Cordless Vacuum Reinforced Heavy-Duty Trigger Switch Lever",
    "slug": "dyson-v10-v11-cordless-vacuum-reinforced-heavy-duty-trigger-switch-lever-969830-01",
    "material": "Nylon PA12",
    "commercial": true,
    "price_usd": 19
  },
  {
    "oem_part_number": "FL3Z-1651071-A",
    "supersedes": [
      "FL3Z-1651071-B",
      "02ESR1201ABK",
      "AL3Z-1651071-A"
    ],
    "make": "Ford",
    "title": "Ford F-150 / Super Duty Sunroof Track Slider Lift Arm Repair Kit",
    "slug": "ford-f-150-super-duty-sunroof-track-slider-lift-arm-repair-kit-fl3z-1651071-a",
    "material": "Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "WE1M1067",
    "supersedes": [
      "WE1M504",
      "WE1M507",
      "WE1M316"
    ],
    "make": "GE",
    "title": "GE / Hotpoint Clothes Dryer Front Drum Slide Bearing Glides",
    "slug": "ge-hotpoint-clothes-dryer-front-drum-slide-bearing-glides-we1m1067",
    "material": "PETG Heavy Duty",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "89018365",
    "supersedes": [
      "6844410",
      "15-72971",
      "52402588"
    ],
    "make": "Chevrolet",
    "title": "GM Silverado / Tahoe / Suburban HVAC Blend Door Actuator Cam Lever",
    "slug": "chevrolet-gm-silverado-tahoe-suburban-hvac-blend-door-actuator-cam-lever-89018365",
    "material": "Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "5FS40DX9AA",
    "supersedes": [
      "5FS40TL2AA",
      "1AR26BD1AA"
    ],
    "make": "Jeep",
    "title": "Jeep Grand Cherokee / Dodge Durango Sun Visor Pivot Support Bracket",
    "slug": "jeep-grand-cherokee-dodge-durango-sun-visor-pivot-support-bracket-5fs40dx9aa",
    "material": "Automotive ASA",
    "commercial": true,
    "price_usd": 19.5
  },
  {
    "oem_part_number": "5012710AA",
    "supersedes": [
      "5012710AB",
      "5012710",
      "68072190AA"
    ],
    "make": "Jeep",
    "title": "Jeep Grand Cherokee WJ Dual-Zone HVAC Blend Door Actuator Split Gear",
    "slug": "jeep-wj-grand-cherokee-blend-door-gear-5012710aa",
    "material": "Nylon PA12",
    "commercial": true,
    "price_usd": 24
  },
  {
    "oem_part_number": "WP9709231",
    "supersedes": [
      "9709231",
      "9706529",
      "4162897"
    ],
    "make": "KitchenAid",
    "title": "KitchenAid Stand Mixer Sacrificial Nylon Worm Follower Gear",
    "slug": "kitchenaid-stand-mixer-sacrificial-nylon-worm-follower-gear-wp9709231",
    "material": "PETG Heavy Duty",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "122049-9",
    "supersedes": [
      "450128-8",
      "643852-7"
    ],
    "make": "Makita",
    "title": "Makita 18V LXT Lithium-Ion Battery Terminal Protector Cover",
    "slug": "makita-18v-battery-terminal-protector-cover-122049-9",
    "material": "PETG Heavy Duty",
    "commercial": true,
    "price_usd": 14
  },
  {
    "oem_part_number": "341071-7",
    "supersedes": [
      "3410717",
      "225007-7"
    ],
    "make": "Makita",
    "title": "Makita 1900B / KP0800K Power Hand Planer Drive Belt Tensioner Retainer",
    "slug": "makita-hand-planer-belt-tensioner-retainer-341071-7",
    "material": "High-Temp Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "452205-2",
    "supersedes": [
      "451241-5",
      "4522052"
    ],
    "make": "Makita",
    "title": "Makita DCL180 / XLC02 18V Cordless Vacuum Dust Capsule Housing Lock Latch",
    "slug": "makita-cordless-vacuum-dust-capsule-latch-452205-2",
    "material": "Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "316060190",
    "supersedes": [
      "883-511",
      "883511"
    ],
    "make": "Metabo HPT",
    "title": "Metabo HPT / Hitachi Coil Framing Nailer Transparent Safety Trigger Deflector",
    "slug": "metabo-hpt-nailer-safety-trigger-deflector-316060190",
    "material": "Impact PETG",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "48-11-1850",
    "supersedes": [
      "48-11-1828",
      "48-11-1865"
    ],
    "make": "Milwaukee",
    "title": "Milwaukee M18 REDLITHIUM Battery Pack Locking Latch & Release Claws",
    "slug": "milwaukee-m18-redlithium-battery-pack-locking-latch-release-claws-48-11-1850",
    "material": "Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "3-255-731-01",
    "supersedes": [
      "2-113-132-11",
      "2-113-133-11",
      "3-255-731-00"
    ],
    "make": "Sony",
    "title": "Sony MDR-7506 / MDR-V6 Professional Headphone Swivel Yoke Hanger Bracket",
    "slug": "sony-mdr-7506-headphone-swivel-yoke-hanger-3-255-731-01",
    "material": "Nylon PA12",
    "commercial": true,
    "price_usd": 19
  },
  {
    "oem_part_number": "72131-FG000",
    "supersedes": [
      "72131-FG001",
      "72131-FG002",
      "72131-FG003"
    ],
    "make": "Subaru",
    "title": "Subaru HVAC Blend Door Actuator Split Gear",
    "slug": "subaru-blend-door-actuator-gear-72131-fg000",
    "material": "Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "R-653",
    "supersedes": [
      "R653",
      "SFBD122-01E",
      "SFBD12201"
    ],
    "make": "Technics",
    "title": "Technics SL-1200 / SL-1210 MK2 DJ Turntable Pitch Fader Dust Shutter Plate",
    "slug": "technics-sl1200-pitch-fader-dust-shutter-plate-r-653",
    "material": "PETG Heavy Duty",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "87240-04020",
    "supersedes": [],
    "make": "Toyota",
    "title": "Toyota Tacoma Heater Control Valve Arm",
    "slug": "toyota-toyota-tacoma-heater-control-valve-arm-87240-04020",
    "material": "High-Temp Nylon PA12",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "55670-0C010",
    "supersedes": [
      "55670-0C020",
      "55680-0C010",
      "55660-0C010"
    ],
    "make": "Toyota",
    "title": "Toyota Tundra / Sequoia Dash AC Air Vent Louver Tab",
    "slug": "toyota-tundra-air-vent-louver-tab-55670-0c010",
    "material": "Automotive ASA",
    "commercial": true,
    "price_usd": 15
  },
  {
    "oem_part_number": "WA-104",
    "supersedes": [
      "WA-104A",
      "PLA-12-ANTISKATE"
    ],
    "make": "Pioneer",
    "title": "Vintage Pioneer PL-12D Tonearm Anti-Skate Weight Guide Arm",
    "slug": "pioneer-turntable-anti-skate-arm-wa-104",
    "material": "PETG",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "39886277",
    "supersedes": [
      "31265160",
      "30742378"
    ],
    "make": "Volvo",
    "title": "Volvo S60 / V60 / XC60 Fuel Filler Door Flap Hinge Bracket",
    "slug": "volvo-fuel-filler-door-hinge-bracket-39886277",
    "material": "Automotive ASA",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "W10195416",
    "supersedes": [
      "W10195417",
      "1872128",
      "AH3407039",
      "EA3407039",
      "PS3407039"
    ],
    "make": "Whirlpool",
    "title": "Whirlpool / KitchenAid Dishwasher Lower Rack Wheel & Axle Assembly",
    "slug": "whirlpool-dishwasher-rack-wheel-w10195416",
    "material": "Food-Safe PETG",
    "commercial": false,
    "price_usd": 0
  },
  {
    "oem_part_number": "W10436250",
    "supersedes": [
      "WPW10436250",
      "2303043",
      "PS3634044"
    ],
    "make": "Whirlpool",
    "title": "Whirlpool / Maytag Refrigerator Deli Meat Pan Drawer Slide Roller Wheel",
    "slug": "whirlpool-refrigerator-deli-drawer-slide-roller-w10436250",
    "material": "Food-Safe PETG",
    "commercial": false,
    "price_usd": 0
  }
]
```
