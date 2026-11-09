// Ids que ligam cada aba (role="tab") ao seu painel (role="tabpanel").
export const tabId = (prefix: string, id: string) => `${prefix}-aba-${id}`;
export const panelId = (prefix: string, id: string) => `${prefix}-painel-${id}`;
