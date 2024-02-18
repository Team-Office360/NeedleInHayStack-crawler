const DEFAULT_TAG_NAME_EN =
  "video, sharing, camera phone, video phone, free, upload";
const DEFAULT_TAG_NAME_KR = "동영상, 공유, 카메라폰, 동영상폰, 무료, 올리기";
const HTML_ENTRY_URL = "https://www.youtube.com/watch?v=ok-plXXHlWw";
const CSS_ENTRY_URL = "https://www.youtube.com/watch?v=OEV8gMkCHXQ";
const JAVASCRIPT_ENTRY_URL = "https://www.youtube.com/watch?v=W6NZfCO5SIk";
const MORE_BUTTON_SELECTOR = "#expand";
const SHOW_TRANSCRIPT_SELECTOR =
  "#primary-button > ytd-button-renderer > yt-button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill";
const SHOW_MORE_BUTTON_SELECTOR =
  "#button > ytd-button-renderer > yt-button-shape > button";
const LINKS_SELECTOR =
  "#dismissible > div > div.metadata.style-scope.ytd-compact-video-renderer > a";
const TITLE_SELECTOR = "#title > h1 > yt-formatted-string";
const DESCRIPTION_SELECTOR =
  "#description-inline-expander > yt-attributed-string > span > span:nth-child(1)";
const CHANNEL_SELECTOR = "#text > a";
const TRANSCRIPT_SELECTOR =
  "#segments-container > ytd-transcript-segment-renderer yt-formatted-string";
const META_SELECTOR = "meta";

module.exports = {
  DEFAULT_TAG_NAME_EN,
  DEFAULT_TAG_NAME_KR,
  HTML_ENTRY_URL,
  CSS_ENTRY_URL,
  JAVASCRIPT_ENTRY_URL,
  MORE_BUTTON_SELECTOR,
  SHOW_TRANSCRIPT_SELECTOR,
  SHOW_MORE_BUTTON_SELECTOR,
  LINKS_SELECTOR,
  TITLE_SELECTOR,
  DESCRIPTION_SELECTOR,
  CHANNEL_SELECTOR,
  TRANSCRIPT_SELECTOR,
  META_SELECTOR,
};
