# Chrome extensions

A folder of Chrome Manifest V3 extensions. Each subdirectory is its own extension. Load one with `chrome://extensions` → Developer mode → Load unpacked, and pick that folder (or its built `extension` / `dist` output when the project has a build step).

## Apps

| Folder | What it is |
|---|---|
| `otaku_tab` | Current anime new-tab page. Schedule, search, and discovery through the AniList API. |
| `focify` | Hides YouTube distractions such as Shorts, the feed, the sidebar, and comments. |
| `tabsy` | Tab cleanup, groups, and save/restore, with a side panel. |
| `slang-tutor` | Highlights slang and idioms and offers a translation UI. TypeScript, tests, and a built `extension` folder. |
| `easy_tabs` | Groups open tabs by site in a side panel. |

## Samples and starters

| Folder | What it is |
|---|---|
| `echo_check` | Small side-panel API demo. |
| `focus_mode` | Chrome documentation sample. |
| `reading_time` | Chrome documentation sample. |
| `quick_api_reference` | Chrome documentation sample. |
| `tabs_manager` | Chrome documentation sample. |
| `hello_world` | Minimal starter. |
| `template_extension` | Scaffold. Its manifest is empty. |

## Archive

`_archive/animeTab` is the older anime new-tab extension (Jikan, then an early AniList pass). `otaku_tab` replaced it.
