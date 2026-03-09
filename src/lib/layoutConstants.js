export const NAV_BAR_BASE_HEIGHT = '7rem'
export const SAFE_AREA_BOTTOM = 'env(safe-area-inset-bottom)'
export const NAV_HEIGHT_CSS_VAR = '--app-nav-height'
export const DEFAULT_NAV_HEIGHT = `calc(${NAV_BAR_BASE_HEIGHT} + ${SAFE_AREA_BOTTOM})`
export const BOTTOM_SAFE_PADDING = `var(${NAV_HEIGHT_CSS_VAR}, ${DEFAULT_NAV_HEIGHT})`
